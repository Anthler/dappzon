const Store = artifacts.require('Store');
const {expectEvent, expectRevert, BN} = require('@openzeppelin/test-helpers');

contract("Store", (accounts) => {

    let store;
    let storeOwner = accounts[0];
    let name = "name1";
    let beneficiary = accounts[1];
    let description = "description1";


    beforeEach(async () =>{
        store = await Store().new(accounts[1], name, description, {gas: 6700000});
    })

    describe("Initialization", () => { 

        it("Test for successful deployment", async () => {
            const storeContract = await Store.deployed();
            assert(storeContract, "Contract deployment was not successful")
        })

        it("Tests for store contract name", async () => {
            const actualName = await store.name();
            assert.equal( actualName, name, "store's name should be same as name1")
        })

        it("Tests for stores's description", async () => {
            const desc = await store.description();
            assert.equal(desc, "description1", "store's description should be equal to description1")
        })

        it("Tests for store's beneficiary account", async () => {
            const actualBeneficiary = await store.beneficiary();
            assert.equal(actualBeneficiary, accounts[1], "Store's beneficiary should be same as " + accounts[1])
        })

        it("Tests for store's status", async () => {
            const status = await store.isOpen();
            assert.equal(status, true, "store status should be opened")
        })

        it("Tests for store owner", async () => {
            const owner = await store.owner();
            assert.equal(owner, storeOwner, "store owner must be same as account " + accounts[0]);
        })

        it("Tests for product count", async () => {
            const productCount = await store.productCount();
            assert.equal(productCount, 0, "store's products count should be zero after deployment")
        })

        it("Tests for store's orders count", async () => {
            const ordersCount = await store.ordersCount();
            assert.equal(ordersCount, 0, "store orders count should be 0 after deployment")
        })
    })
})