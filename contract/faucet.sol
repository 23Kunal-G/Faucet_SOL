// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Faucet {
    // State
    address public admin;
    address public pendingAdmin;

    uint256 public claimAmount;
    uint256 public cooldownTime;

    uint256 public minFundAmount = 1 ether;
    uint256 public maxFundAmount = 100 ether;

    // Structs
    struct ClaimDetails {
        address user;
        uint256 totalClaimAmount;
        uint256 lastClaimAmount;
        uint256 lastTime;
        bool    isExists;
    }

    // Storage 
    ClaimDetails[] public claimHistory;
    mapping(address => ClaimDetails) public claimHistoryByUser;

    // Events
    event Claimed(address indexed user, uint256 amount, uint256 time);
    event Funded(address indexed funder, uint256 amount);
    event AdminTransferInitiated(address indexed currentAdmin, address indexed pendingAdmin);
    event AdminTransferAccepted(address indexed newAdmin);
    event ClaimAmountChanged(uint256 oldAmount, uint256 newAmount);
    event FundLimitsChanged(uint256 minAmount, uint256 maxAmount);
    event Withdrawn(address indexed admin, uint256 amount);

    // Custom errors
    error OnlyAdmin();
    error OnlyPendingAdmin();
    error TooSoon(uint256 nextClaimAt);
    error InsufficientFaucetBalance();
    error InvalidAmount();
    error FundOutOfRange(uint256 min, uint256 max);
    error TransferFailed();
    error ZeroCooldown();

    // Modifiers
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    // Constructor
    constructor(uint256 _claimAmountEther, uint256 _cooldownTime) {
        if (_cooldownTime == 0) revert ZeroCooldown();

        admin        = msg.sender;
        claimAmount  = _claimAmountEther * 1e18;
        cooldownTime = _cooldownTime;
    }

    // Admin: fund

    /// @notice Fund the faucet. Must send between minFundAmount and maxFundAmount.
    function fundFaucet() external payable onlyAdmin {
        if (msg.value < minFundAmount || msg.value > maxFundAmount)
            revert FundOutOfRange(minFundAmount, maxFundAmount);
        emit Funded(msg.sender, msg.value);
    }

    // Admin: configuration

    /// @notice Change the amount sent to each claimer (in whole ETH units).
    function changeClaimAmount(uint256 _claimAmountEther) external onlyAdmin {
        if (_claimAmountEther == 0) revert InvalidAmount();
        uint256 old = claimAmount;
        claimAmount = _claimAmountEther * 1e18;
        emit ClaimAmountChanged(old, claimAmount);
    }

    /// @notice Update funding floor and ceiling.
    function setFundLimits(uint256 _minEther, uint256 _maxEther) external onlyAdmin {
        if (_minEther == 0 || _maxEther <= _minEther) revert InvalidAmount();
        minFundAmount = _minEther * 1e18;
        maxFundAmount = _maxEther * 1e18;
        emit FundLimitsChanged(minFundAmount, maxFundAmount);
    }

    // Admin: ownership transfer (two-step)

    /// @notice Step 1 — nominate a new admin.
    function transferAdmin(address _newAdmin) external onlyAdmin {
        if (_newAdmin == address(0)) revert InvalidAmount();
        pendingAdmin = _newAdmin;
        emit AdminTransferInitiated(admin, _newAdmin);
    }

    /// @notice Step 2 — new admin accepts ownership.
    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) revert OnlyPendingAdmin();
        admin        = pendingAdmin;
        pendingAdmin = address(0);
        emit AdminTransferAccepted(admin);
    }

    // Admin: withdraw

    /// @notice Withdraw all remaining ETH from the faucet.
    function withdrawETH() external onlyAdmin {
        uint256 bal = address(this).balance;
        if (bal == 0) revert InsufficientFaucetBalance();
        _safeTransfer(admin, bal);
        emit Withdrawn(admin, bal);
    }

    // User: claim

    /// @notice Claim ETH from the faucet (once per cooldown period).
    function claimToken() external {
        if (address(this).balance < claimAmount) revert InsufficientFaucetBalance();

        uint256 nextClaimTime = claimHistoryByUser[msg.sender].lastTime + cooldownTime;
        if (block.timestamp < nextClaimTime) revert TooSoon(nextClaimTime);

        // Update claim history
        if (claimHistoryByUser[msg.sender].isExists) {
            claimHistoryByUser[msg.sender].totalClaimAmount += claimAmount;
            claimHistoryByUser[msg.sender].lastClaimAmount   = claimAmount;
            claimHistoryByUser[msg.sender].lastTime          = block.timestamp;
        } else {
            ClaimDetails memory details = ClaimDetails({
                user:             msg.sender,
                totalClaimAmount: claimAmount,
                lastClaimAmount:  claimAmount,
                lastTime:         block.timestamp,
                isExists:         true
            });
            claimHistoryByUser[msg.sender] = details;
            claimHistory.push(details);          // ← populate the history array
        }

        _safeTransfer(msg.sender, claimAmount);
        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }

    // Views

    /// @notice Total number of unique claimers.
    function getClaimCount() public view returns (uint256) {
        return claimHistory.length;
    }

    /// @notice Claim details for a specific user.
    function getClaimDetailsByUser(address user)
        public
        view
        returns (ClaimDetails memory)
    {
        return claimHistoryByUser[user];
    }

    /// @notice Seconds remaining before a user can claim again (0 = can claim now).
    function timeUntilNextClaim(address user) public view returns (uint256) {
        uint256 nextClaimTime = claimHistoryByUser[user].lastTime + cooldownTime;
        if (block.timestamp >= nextClaimTime) return 0;
        return nextClaimTime - block.timestamp;
    }

    // Internal helpers 

    function _safeTransfer(address to, uint256 amount) internal {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    // Receive 

    /// @dev Accept direct ETH sends (e.g. from a script or multisig).
    receive() external payable {}
}
