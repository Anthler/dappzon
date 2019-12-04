const DecentalizedMarketV1 = artifacts.require("Migrations");

module.exports = function(deployer) {
  deployer.deploy(DecentalizedMarketV1);
};
