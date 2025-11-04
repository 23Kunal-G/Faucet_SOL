// SPDX-License-Identifier: MIT
pragma solidity >0.8.20;

interface IERCSEPOLIA20 {
    function transfer (address recipent, uint256 amount ) external returns (bool);
    function blanceOf (address account) external view returns (uint256);
}

contract Faucet {
    address public admin;
    IERCSEPOLIA20 public token;
    uint256 public claimAmount;

    struct ClaimDetails {
        address user;
        uint256 amount;
        uint256 time;
    }

    ClaimDetails[] public claimHistory;
    mapping ( address => uint256) public lastClaimTime;

}