const StoreFactory = artifacts.require("./StoreFactory.sol");
const Store = artifacts.require("./Store.sol");
const DCTCoin = artifacts.require("./DCTCoin.sol");

module.exports = async function(deployer, _network, accounts) {

  const [account1, account2, account3, account4, account5, _] = accounts
  await Promise.all(
    [DCTCoin, StoreFactory].map(contract => deployer.deploy(contract, {gas: 6700000}))
   )
   const [dctcoin, storeFactory] = await Promise.all(
     [DCTCoin, StoreFactory].map(contract => contract.deployed())
   )

   const amount = web3.utils.toWei('1000');
   await Promise.all(
     [dctcoin.mint(amount, {from:account2}),
     dctcoin.mint(amount, {from:account3}),
     dctcoin.mint(amount, {from:account4}),
     dctcoin.mint(amount, {from:account5})]
   )
    await storeFactory.addAdmins(account2)
    await storeFactory.addStoreOwner(account3, {from: account2})
    await storeFactory.createNewStore(account3, "Crypto Swags", "We sell all crypto swags", {from:account3})
   const storeAdd = await storeFactory.getAllStores()
   const storeAt = await Store.at(storeAdd[0])
   await storeAt.updateTokenAddress(dctcoin.address, {from: account3})
   const amountApproved = web3.utils.toWei('100');

   await Promise.all([
    dctcoin.approve(storeAt.address, amountApproved, {from: account2}),
    dctcoin.approve(storeAt.address, amountApproved, {from: account3}),
    dctcoin.approve(storeAt.address, amountApproved, {from: account4}),
    dctcoin.approve(storeAt.address, amountApproved, {from: account5})
   ])
  }



