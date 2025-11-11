// SPDX-License-Identifier: MIT
pragma solidity >0.8.20;


contract Faucet {
    address public admin;
    uint256 public claimAmount = 0.5 ether;
    uint256 public cooldownTime; // seconds between claims
    uint256 decimal = 1000000000;
    uint256 minAmount = 1 ether ;
    uint256 maxAmount = 100 ether;


    struct ClaimDetails {
        address user;
        uint256 amount;
        uint256 time;
    }

    ClaimDetails[] public claimHistory;
    mapping ( address => uint256) public lastClaimTime;

    event Claimed(address indexed user, uint256 amount, uint256 time);
    event Funded(address indexed admin, uint256 amount);

    constructor( uint256 _cooldownTime) {
        admin = msg.sender;
        cooldownTime = _cooldownTime;
    }

    modifier _onlyAdmin() {
        require(msg.sender == admin, "Only admin can called this function");
        _;
    }

    // Allow admin to fund the contract
    function fundFaucet() external payable _onlyAdmin {
        require(msg.value > minAmount && msg.value <= maxAmount, "Amount must be between 1 and 100 ETH");
        emit Funded(msg.sender, msg.value);
    }

    // User Claim ETH
    function claimToken() payable external {
        require(address(this).balance >= claimAmount, "Insufficient balance to claim token");
        uint256 nextClaimTime = lastClaimTime[msg.sender] + cooldownTime;
        require(block.timestamp >= nextClaimTime, "With for next claim");

        lastClaimTime[msg.sender] = block.timestamp;
        
        payable(msg.sender).transfer(claimAmount);

        // store claim details in array
        ClaimDetails memory claimDetails = ClaimDetails(msg.sender , claimAmount , block.timestamp);
        claimHistory.push(claimDetails);

        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }

    // Get Total Claimers
    function getClaimCount() public view returns (uint256) {
        return claimHistory.length;
    }

    // Withdraw remining ETH (admin only)
    function withdrawETH() payable external _onlyAdmin {
        require(msg.value <= address(this).balance , "Insufficient balance");
        payable(admin).transfer(msg.value);
    }

}