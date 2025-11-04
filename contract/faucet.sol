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

    event Claimed(address indexed user, uint256 amount, uint256 time);
    event Funded(address indexed admin, uint256 amount);

    constructor(address _tokenAddress, uint256 _claimAmount) {
        admin = msg.sender;
        token = IERCSEPOLIA20(_tokenAddress);
        claimAmount = _claimAmount;
    }

    modifier _onlyAdmin() {
        require(msg.sender == admin, "Only admin can called this function");
        _;
    }

    function fundFaucet(uint256 amount) external _onlyAdmin {
        bool success = token.transfer(address(this), amount);
        require(success, "Funding faild");
        emit Funded(msg.sender, amount);
    }

    // function claimToken() external {
    //     require(condition);
    // }

}