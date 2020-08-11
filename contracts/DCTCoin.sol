pragma solidity ^0.6.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DCTCoin is ERC20 {
    address payable public admin;
    constructor() ERC20("Decent Coin", "DCT") public {
        admin = msg.sender;
    }

    function mint(uint _amount) public{
        _mint(msg.sender, _amount);
    }
}