const DecentralizedMarketFactory = artifacts.require("DecentralizedMarketFactory");

module.exports = function(deployer) {
  deployer.deploy(DecentralizedMarketFactory);
};
