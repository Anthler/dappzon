pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract DMCoinToken is ERC20 {

    using SafeMath for uint256;

    string public name = "DMCoin";
    string public symbol = "DMOIN";
    uint public decimals = 18;
}