var DCTCoin = artifacts.require("./DCTCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(DCTCoin);
};
