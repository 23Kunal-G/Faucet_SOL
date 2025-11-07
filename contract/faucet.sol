// SPDX-License-Identifier: MIT
pragma solidity >0.8.20;


contract Faucet {
    address public admin;
    uint256 public claimAmount;
    uint256 public cooldownTime; // seconds between claims


    struct ClaimDetails {
        address user;
        uint256 amount;
        uint256 time;
    }

    ClaimDetails[] public claimHistory;
    mapping ( address => uint256) public lastClaimTime;

    event Claimed(address indexed user, uint256 amount, uint256 time);
    event Funded(address indexed admin, uint256 amount);

    constructor( uint256 _claimAmount, uint256 _cooldownTime) {
        admin = msg.sender;
        claimAmount = _claimAmount;
        cooldownTime = _cooldownTime;
    }

    modifier _onlyAdmin() {
        require(msg.sender == admin, "Only admin can called this function");
        _;
    }

    // Allow admin to fund the contract
    function fundFaucet() external _onlyAdmin {
        require(msg.value > 0 && msg.value <= 100, "Amount must be between 1 and 100 ETH");
        emit Funded(msg.sender, msg.value);
    }

    // User Claim ETH
    function claimToken() external {
        require(address(this).balance >= claimAmount, "Insufficient balance to claim token");
        let nextClaimTime = lastClaimTime[msg.sender] + cooldownTime;
        require(block.timestamp >= nextClaimTime, "With for next claim");

        lastClaimTime[msg.sender] = block.timestamp;
        
        payable(msg.sender).transfer(claimAmount);

        let claimDetails = ClaimDetails(msg.sender , claimAmount , block.timestamp);
        claimHistory.push(claimDetails);

        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }

    // Get Total Claimers
    function getClaimCount() public view returns (uint256) {
        return claimHistory.length();
    }

    // Withdraw remining ETH (admin only)
    function withdrawETH(uint256 amount) external _onlyAdmin {
        require(amount <= address(this).balance , "Insufficient balance");
        payable(admin).transfer(amount);
    }

}