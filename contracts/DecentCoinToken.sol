pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DecentCoinToken is ERC20 {

    string public name = "DecentCoin";
    string public symbol = "DECOIN";
    uint public decimals = 18;
    //uint public totalSupply = "1000000";
}