const DMCoinToken = artifacts.require("DMCoinToken");

module.exports = function(deployer) {
  deployer.deploy(DMCoinToken);
};

