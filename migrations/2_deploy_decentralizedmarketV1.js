const DecentalizedMarketV1 = artifacts.require("DecentalizedMarketV1");

module.exports = function(deployer) {
  deployer.deploy(DecentalizedMarketV1);
};
