const Store = artifacts.require("Store");
const DMCoinToken = artifacts.require("DMCoinToken");
const DecentralizedMarketFactory = artifacts.require("DecentralizedMarketFactory");

const {       
    expectEvent, 
    expectRevert, 
  } = require('@openzeppelin/test-helpers');

contract("DecentralizedMarketFactory", (accounts) => {

    const superAdmin = accounts[0];
    const admin_1 = accounts[1];
    const admin_2 = accounts[2];
    const store_owner_1 = accounts[3];
    const store_owner_2 = accounts[4];
    
    const name = "Store number one";
    const description = "My brand new store";
    const beneficiary = accounts[5];
    let factory;
    let tokenContract;

    beforeEach(async () => {
        factory = await DecentralizedMarketFactory.new();
        tokenContract = await DMCoinToken.new();
        assert(factory, "Factory contract not deployed")
    });

    it("Test for deployment", async () => {
        factory = await DecentralizedMarketFactory.deployed();
    })

    describe(" Functions" , () => {

        describe(" addAdmins() ", () => {

            it(" Tests for access controls", async () => {
                await expectRevert.unspecified( factory.addAdmins(admin_1, {from: accounts[9]}))
            });

            it(" Tests for admin role", async () => {
                await factory.addAdmins(admin_1, {from: superAdmin})
                const status = await factory.isAdmin(admin_1)
                assert.equal(true,status )
            });

            it("Fails on adding already admin account", async () => {
                await factory.addAdmins(admin_2, {from: superAdmin});
                await expectRevert.unspecified(  factory.addAdmins(admin_2, {from: superAdmin}))
            })
        })

        describe(" removeAdmins() ", () => {

            it("Acess controls ", async () => {
                await expectRevert.unspecified(factory.removeAdmins(admin_1, {from: accounts[9]}))
            });

            it("Fails on non admin account", async () => {
                await expectRevert.unspecified(factory.removeAdmins(admin_1, {from: superAdmin}))
            });

            it("Tests for Removes address from admins", async () => {
                await factory.addAdmins(admin_1, {from: superAdmin});
                await factory.removeAdmins(admin_1, {from: superAdmin});
                const status = await factory.isAdmin(admin_1)
                assert.equal(false, status, "account admin status shoud be false")
            });
        })

        describe(" addStoreOwners() ", () => {

            beforeEach(async () => {
                await factory.addAdmins(admin_1, {from: superAdmin});
                await factory.addAdmins(admin_2, {from: superAdmin});
            });

            it("Tests for acccess controls", async () => {
                await expectRevert.unspecified( factory.addStoreOwner(store_owner_1, {from: superAdmin}))
            })

            it("Tests for store owner add", async () => {
                await factory.addStoreOwner(store_owner_1, {from: admin_1})
                const status = await factory.isApprovedStoreOwner(store_owner_1)
                assert.equal(true, status, "Account store owner status shoud be true");
            })

            it("Tests for already approved store owners", async () => {
                await factory.addStoreOwner(store_owner_2, {from: admin_1})
                await expectRevert.unspecified(factory.addStoreOwner(store_owner_2, {from: admin_1}))
            })
        });

        describe(" removeStoreOwner ", () => {

            beforeEach(async () => {
                await factory.addAdmins(admin_1, {from: superAdmin});
                await factory.addAdmins(admin_2, {from: superAdmin});
                await factory.addStoreOwner(store_owner_1, {from: admin_1})
            });

            it("Tests for acccess controls", async () => {
                await expectRevert.unspecified( factory.removeStoreOwner(store_owner_1, {from: superAdmin}))
            })

            it("Tests for non store owner address", async () => {
                await expectRevert.unspecified( factory.removeStoreOwner(store_owner_2, {from: admin_1}))
            })

            it(" Removes store owner", async () => {
                await factory.removeStoreOwner(store_owner_1, {from: admin_1})
                const status = await factory.isApprovedStoreOwner(store_owner_1);
                assert.equal(false, status);
            })
        })

        describe(" createStore() ", () => {

            beforeEach(async () => {
                await factory.addAdmins(admin_1, {from: superAdmin});
                await factory.addAdmins(admin_2, {from: superAdmin});
                await factory.addStoreOwner(store_owner_1, {from: admin_1})
                await factory.addStoreOwner(store_owner_2, {from: admin_2}) 
            })

            it("Tests stores count increment", async () => {
                await factory.createNewStore(beneficiary, name, description,tokenContract.address, {from: store_owner_1});
                const storesCount = await factory.storesCount();
                assert.equal(1, storesCount, `storesCount must be equal to 1`)
            })

            it("Tests for owner stores count", async () => {
                await factory.createNewStore(beneficiary, name, description, tokenContract.address, {from: store_owner_1});
                const ownerStoresCount = await factory.getOwnerStoresCount(store_owner_1);
                assert.equal(1, ownerStoresCount, `storesCount must be equal to 1`)
            })
        })
    })
})