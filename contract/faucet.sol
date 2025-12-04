// SPDX-License-Identifier: MIT
pragma solidity >0.8.20;

contract Faucet {
    address public admin;
    uint256 public claimAmount;
    uint256 public cooldownTime; // seconds between claims
    uint256 minAmount = 1 ether;
    uint256 maxAmount = 100 ether;

    struct ClaimDetails {
        address user;
        uint256 totalClaimAmount;
        uint256 ClaimAmount;
        uint256 lastTime;
        bool isExists;
    }

    ClaimDetails[] public claimHistory;
    mapping(address => uint256) public lastClaimTime;
    mapping(address => ClaimDetails) public claimHistoryByUser;

    event Claimed(address indexed user, uint256 claimAmount, uint256 lastTime);
    event Funded(address indexed admin, uint256 amount);

    constructor(uint256 _claimAmount, uint256 _cooldownTime) {
        admin = msg.sender;
        claimAmount = _claimAmount * 1e18;
        cooldownTime = _cooldownTime;
    }

    modifier _onlyAdmin() {
        require(msg.sender == admin, "Only admin can called this function");
        _;
    }

    // Allow admin to fund the contract
    function fundFaucet() external payable _onlyAdmin {
        require(
            msg.value > minAmount && msg.value <= maxAmount,
            "Amount must be between 1 and 100 ETH"
        );
        emit Funded(msg.sender, msg.value);
    }

    // Change Claim amount
    function chnageClaimAmount(uint256 _claimAmount) public _onlyAdmin {
        require(_claimAmount > 0, "Claim Amount must be getter than 0");
        claimAmount = _claimAmount * 1e18;
    }

    // User Claim ETH
    function claimToken() external payable {
        require(
            address(this).balance >= claimAmount,
            "Insufficient balance to claim token"
        );
        uint256 nextClaimTime = lastClaimTime[msg.sender] + cooldownTime;
        require(block.timestamp >= nextClaimTime, "With for next claim");

        if (claimHistoryByUser[msg.sender].isExists) {
            claimHistoryByUser[msg.sender].totalClaimAmount += claimAmount;
            claimHistoryByUser[msg.sender].ClaimAmount = claimAmount;
            claimHistoryByUser[msg.sender].lastTime = block.timestamp;
        } else {
            // store claim details in array
            ClaimDetails memory claimDetails = ClaimDetails(
                msg.sender,
                claimAmount,
                claimAmount,
                block.timestamp,
                true
            );
            claimHistoryByUser[msg.sender] = claimDetails;
        }

        lastClaimTime[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(claimAmount);

        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }

    // Get Total Claimers
    function getClaimCount() public view returns (uint256) {
        return claimHistory.length;
    }

    // Withdraw remining ETH (admin only)
    function withdrawETH() external payable _onlyAdmin {
        require(msg.value <= address(this).balance, "Insufficient balance");
        payable(admin).transfer(msg.value);
    }

    // User Claim Details
    function getClaimDetailsByUser(address user) public view returns (ClaimDetails memory) {
        return claimHistoryByUser[user];
    }
}
