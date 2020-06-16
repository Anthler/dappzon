var StoreFactory = artifacts.require("./StoreFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(StoreFactory, {gas: 6700000});
};
