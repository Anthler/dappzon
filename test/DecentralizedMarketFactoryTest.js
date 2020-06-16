const Store = artifacts.require('Store');
const StoreFactory = artifacts.require('StoreFactory');
const {expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

contract("StoreFactory", (accounts) => {

    let store;
    let storeFactory;
    let superAdmin;
    let storesCount;

    before(async () => {
        storeFactory = await StoreFactory.new(); 
    })

    describe("Contract initialization", () => {
        it("Test for successful deployment", async () => {
            const factory = StoreFactory.deployed();
            assert(factory, "Contract deployment was not successful")
        })

        it("Tests for stores count", async  () => {
            storesCount = await storeFactory.storesCount();
            assert.equal(storesCount, 0, "Stores count must be equal to zero");
        })

        it("Tests for stores collection length", async () => {
            const storesCollection = await storeFactory.getAllStores();
            assert.equal(storesCollection.length, 0, "Stores collection must be zero initially")
        })
    })


    describe("Test for functions", async () => {

        const beneficiary = accounts[2];
        const name = "Richard's shop";
        const description = "Richard shop description";

        describe("Tests for createNewStore function", () => {
            it("Creates a new store with non store owner account", async () => {
                await expectRevert.unspecified(storeFactory.createNewStore(beneficiary, name, description, {from: accounts[0]}));
            })

            it("Tests for access controls with wrong accounts", async () => {
                await expectRevert.unspecified(storeFactory.addStoreOwner(accounts[5], {from: accounts[2]}));
            })

            it("Test for access control with correct account", async () => {
                await storeFactory.addStoreOwner(accounts[2], {from: accounts[0]})
                const status = await storeFactory.isApprovedStoreOwner(accounts[2], {from: accounts[0]})
                assert.equal(status, true, `Account ${accounts[2]} must be an approved store owner`)
            })

            it("Creates new store", async () => {
                //await storeFactory.addStoreOwner(accounts[2], {from: accounts[0]})
                const tx = await storeFactory.createNewStore(beneficiary, name, description, {from:accounts[2]} )
                assert.equal(tx.receipt.status, true, "Store should be created by approved store owner")
            })

            describe("Created store details", async () => {
                let store;
                before(async () => {
                    const storeAddr = await storeFactory.getStore(0, {from: accounts[0]});
                    store = await Store.at(storeAddr);
                })

                it("Tests for store name", async () => {
                const storeName = await store.name();
                assert.equal(storeName, name, `Store name must be same as ${name}`)
                })

                it("Tests for store's beneficiary", async () => {
                const storeBeneficiary = await store.beneficiary();
                assert.equal(storeBeneficiary, beneficiary, `Store name must be same as ${beneficiary}`)
                })

                it("Tests for store's description", async () => {
                const storeDescription = await store.description();
                assert.equal(storeDescription, description, `Store name must be same as ${description}`)
                })

                it("Tests for store's owner", async () => {
                const owner = await store.owner();
                assert.equal(owner, accounts[2], `Store name must be same as ${accounts[2]}`)
                })

                it("Tests for store's status", async () => {
                const status = await store.isOpen();
                assert.equal(status, true, `Store name must be true`)
                })
            })

            it("Stores count", async () => {
                const countBefore = await storeFactory.storesCount();
                const tx = await storeFactory.createNewStore(beneficiary, name, description, {from:accounts[2]} )
                const countAfter = await storeFactory.storesCount();
                assert.equal(countAfter - countBefore, 1, "Stores count must be equal to 2")
            })

            // it("Emits StoreCreated event", async () => {
            //     const tx = await storeFactory.createNewStore(beneficiary, name, description, {from:accounts[2]} )
            //     expectEvent(tx, "OwnershipTransferred", {from: accounts[2]})
            // })

            // it("Tests for StoreCreated event with correct account", async () => {
            //     const reciept = await storeFactory.createNewStore(beneficiary, name, description, {from:accounts[2]} )
            //     assert.equal(reciept, true, "Store should be created by approved store owner")
            //     expectEvent()
            // })

            // add store owner by supper admin
            // create store by an approved store owner
            //

        })
    })
})