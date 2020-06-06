pragma solidity ^0.6.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DCTCoin is ERC20 {
    address payable public admin;
    constructor() ERC20("Decent Coin", "DCT") public {
        admin = msg.sender;
        _mint(admin, 1000000000000000000000);
    }

    function mint(uint _amount) public{
        _mint(msg.sender, _amount);
    }
}