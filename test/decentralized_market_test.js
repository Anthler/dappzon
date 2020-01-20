const Store = artifacts.require("Store"); 
const DMCoinToken = artifacts.require("DMCoinToken");
const {
    BN,
    balance,          
    expectEvent, 
    expectRevert, 
  } = require('@openzeppelin/test-helpers');

contract("Store Contract", (accounts) => {

    let store;
    let tokenContract;
    const name = "Original Store";
    const description = "original description";
    const owner = accounts[0];
    const secondAccount = accounts[1];
    const beneficiary = accounts[2];

    beforeEach(async () => {
        tokenContract = await DMCoinToken.new();
        store = await Store.new(beneficiary, name, description, tokenContract.address);
    })

    describe("initialize contract", () => {

        it("Test the owner address", async () =>{
            const actualOwner = await store.storeOwner();
            assert.equal(actualOwner, owner, "Owner account should match actual owner account");
        });

        it("Test the store's description", async () =>{
            const actualDescription = await store.description();
            assert.equal(description, actualDescription, "Stores's description should match actual description")
        });

        it(" Test beneficiary account", async () => {
            const actualBeneficiary = await store.beneficiary();
            assert.equal(actualBeneficiary, beneficiary, "Beneficiary address should match")
        });

        it("Tests for isOpen", async () => {
            const opened = await store.isOpen();
            assert.equal(opened,true, "Shop must be opened after contract is initialized");
        })
    })

    describe("addProduct()", async () => {
        
        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const imageUrl = "google.com.img"

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity, imageUrl, {from: owner});
        })

        describe("Tests access controls", () => {

            it("Throws an error for non owner account", async ()=>{
                try {
                    await store.addProduct(productDesc, quantity, price,imageUrl, {from: accounts[2]})
                    assert.fail("addProduct is retricted to only owner");
                } catch (err) {
                    const expectedError = "Ownable: caller is not the owner";
                    const reason = err.reason;
                    assert.equal(expectedError, reason, "Reason must match expected error");
                }
            })
        })

        it("increases product count", async () => {
            const productCount = await store.productCount({from:owner});
            assert.equal(1, productCount, "product count must be 1");
        });

        it("Tests for product description", async () => {
            const product = await store.products(0);
            assert.equal(product.description, productDesc, "product descriptions should be same");
        });

        it("Tests for product quantity", async () =>{
            const product = await store.products(0);
            assert.equal(product.quantity, quantity, "Qunatity must be equal to 10");
        })

        it("Tests for product quantity", async () =>{
            const product = await store.products(0);
            assert.equal(product.imageUrl, imageUrl, "Qunatity must be equal to 10");
        })

        it("Tests for product price", async () => {
            const product = await store.products(0, {from: owner})
            assert.equal(product.price, price, "product price must be equal to 20");
        });

        it("Emits ProductAdded event", async () => {
            const tx = await store.addProduct(productDesc, price, quantity,imageUrl,{from: owner})
            const expectedEvent = "ProductAdded";
            const eventLogged = tx.logs[0].event;
            assert.equal(eventLogged, expectedEvent, `Event must match ${expectedEvent}`);
        })
    });

    describe("updateProductPrice()", () => {

        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const newPrice = 30;
        const imageUrl = "google.com.img"

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity,imageUrl, {from: owner});
        });

        describe("Tests access controls", () => {

            it("Throws an error for non owner account", async ()=>{
                try {
                    await store.updateProductPrice(0, newPrice, {from: accounts[2]})
                    assert.fail("addProduct is retricted to only owner");
                } catch (err) {
                    const expectedError = "Ownable: caller is not the owner";
                    const reason = err.reason;
                    assert.equal(expectedError, reason, "Reason must match expected error");
                }
            })
        })

        it("Sets product new price", async () => {
            const product = await store.products(0);
            assert.equal(product.price, price, "Product price must be equal to 20")
            await store.updateProductPrice(0, newPrice, {from: owner});
            const productUpdated = await store.products(0);
            assert.equal(productUpdated.price, newPrice, "Product price must be equa to 30");
        }); 
    })

    describe(" buyProduct() ", () =>{

        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const value = web3.utils.toWei('0.500')
        const imageUrl = "google.com.img";

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity,imageUrl, {from: owner});
        });

        it("Test for product quantity decrease by quantity bought", async () => {
            const productBefore = await store.products(0);
            await store.buyProduct(0, 5, {from: accounts[5], value:value});
            const productAfter = await store.products(0);
            assert.equal(productAfter.quantity, productBefore.quantity - 5, "quantity must be 5");
        });

        it("Tests for insufficient eth", async () =>{
            try {
                await store.buyProduct(0,5, {from: accounts[5], value: web3.utils.toWei('0.000000000000000001')})
                assert.fail("should only pass when eth provided is equal to sum of quantity amount")
            } catch (err) {
                const expectedError = "Not enough ether provided";
                const reason = err.reason;
                console.log(reason);
                assert.equal(expectedError, reason, "Reason must match expected error");
            }
        })

        it("Tests for contract balance after purchase", async () => {
            const contractBalance = await web3.eth.getBalance(store.address);
            await store.buyProduct(0, 5, {from: accounts[5], value:value});
            const newBalance = await web3.eth.getBalance(store.address);
            assert.equal(100, newBalance - contractBalance, "Balance must be equal to 500")
        });

        it("Emits ProductPurchased event", async () => {
            const tx = await store.buyProduct(0, 5, {from: accounts[5], value:value}); 
            expectedEvent = "ProductPurchased";
            const actualEvent = tx.logs[0].event;
            assert.equal(expectedEvent, actualEvent, "Should emit ProductPurchased event")
        })

    });

    describe(" auctionProduct() ", () => {
      
        const value = web3.utils.toWei('0.900')

        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const imageUrl = "google.com.img";

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity, imageUrl, {from: owner});
        });

        describe("Access controls", () => {

            it("Throws an error for non owner account", async ()=>{
                try {
                    await store.auctionProduct(0, 1111111113443333, {from: accounts[5]})
                    assert.fail("addProduct is retricted to only owner");
                } catch (err) {
                    const expectedError = "Ownable: caller is not the owner";
                    const reason = err.reason;
                    assert.equal(expectedError, reason, "Reason must match expected error");
                }
            })
        })

        it("Tests for invalid productId", async () => {
            try {
                await store.auctionProduct(10, 1111111113443333)
                assert.fail("addProduct is retricted to only owner");
            } catch (err) {
                const expectedError = "Invalid product ID";
                const reason = err.reason;
                assert.equal(expectedError, reason, "Reason must match expected error");
            }
        });

        it("Tests for out of stock product", async () => {
            try {
                await store.buyProduct(0,10, {from: owner, value:value});
                await store.auctionProduct(0,1111112233434444,{from: owner})
                assert.fail("product out of stock cannot be auctioned");
            } catch (err) {
                const expectedError = "Not enough stock";
                const reason = err.reason;
                assert.equal(expectedError, reason, "Reason must match expected error");
            }

        });

        it("Tests for auctions count increment", async () => {
            const auctionsCountBefore = await store.auctionsCount();
            await store.auctionProduct(0,1111112233434444,{from: owner})
            const auctionsCountAfter = await store.auctionsCount();
            assert.equal(1, auctionsCountAfter - auctionsCountBefore, "Auctions count should be equal to 1");
        });
    });

    describe(" bid() ", () => {

        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const imageUrl = "google.com.img";

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity, imageUrl, {from: owner} );
            await store.auctionProduct(0, 11211235634);
            await store.bid(0, new BN(100), {from: accounts[5], value: new BN(100)} )
        });

        it("Tests for bids count increment", async () => {
            const auction = await store.auctions(0)
            assert.equal(1,auction.bidsCount, "Bids count must be exactly one");
        });

        it("Tests for bid amount", async () => {
            const auction = await store.auctions(0)
            assert.equal(100,auction.highestBid, "Highest bid must be equal to 100");
        });

        it("Tests for validity period", async () => {
            const auction = await store.auctions(0)
            assert.equal(11211235634, auction.validUntil, "Highest bid must be equal to 100");
        })

        it("Tests for amount less than highest bid", async () => {
            await expectRevert.unspecified(store.bid(0, 50, {from: accounts[6], value: 50}))
        });

        it("Test for refund last highest bidder", async () => {
            const balanceBefore = new BN( await balance.current(accounts[5]))
            const auction = await store.auctions(0);
            await store.bid(0, new BN(150), {from: accounts[6], value: new BN(150)})
            const balanceAfter = new BN( await balance.current(accounts[5]));
            const expectedBal = balanceBefore.add(new BN(auction.highestBid))
            assert.equal(balanceAfter.toString(), expectedBal.toString(), `${balanceAfter} ${expectedBal}`)
        })

        it("Test for new highest bidder", async () => {
            await store.bid(0, new BN(150), {from: accounts[6], value: new BN(150)})
            const auction = await store.auctions(0);
            assert.equal(auction.highestBidder, accounts[6], `Highest bidder ${auction.highestBidder} must be same as account ${accounts[6]} `)
        })
    });

    describe(" getProduct() ", () => {

        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const imageUrl = "google.com.img"

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity,imageUrl, {from: owner});
        });

        it("Tests for product ID", async () => {
            const product =  await store.getProduct(0)
            assert.equal(0, product._id, "Product id should be equal to 0")
        })

        it("Tests for product description", async () => {
            const product =  await store.getProduct(0)
            assert.equal(productDesc, product._description, `product description should match ${productDesc}`)
        })

        it("Tests for product price", async () => {
            const product =  await store.getProduct(0)
            assert.equal(price, product._price, `product price should be ${price}`)
        });

        it("Tests for product quantity", async () => {
            const product =  await store.getProduct(0)
            assert.equal(quantity, product._quantity, `product description should be ${quantity}`)
        });
    });

    describe(" withdrawBalance() ", () => {

        const productDesc = "My number 1 product";
        const quantity = 10;
        const price = 20;
        const imageUrl = "google.com.img";

        beforeEach( async () =>{
            await store.addProduct(productDesc, price, quantity,imageUrl, {from: owner});
            await store.buyProduct(0, 5,  {from: accounts[5], value: new BN(100)});
        });

        it("Tests for non-owner account", async () =>{
            await expectRevert.unspecified( store.withdrawBalance({from:accounts[5] }))
        });

        it("Tests for beneficiary balance", async () =>{
            const beneficiaryCurrentBalance = new BN(await balance.current(beneficiary));
            const storeBalance =  new BN(await balance.current(store.address));
            await store.withdrawBalance({from: owner})
            const beneficiaryBalanceAfter = new BN(await balance.current(beneficiary));
            const expectedBal = beneficiaryCurrentBalance.add(storeBalance)
            assert.equal(beneficiaryBalanceAfter.toString(), expectedBal.toString(), `expected balace ${expectedBal} shoud be equal to ${beneficiaryBalanceAfter}`);
        });
    })

    describe(" getStoreAddress() ", () => {

        it("Tests store address", async () =>{
           const address =  await store.getStoreAddress()
           assert.equal(address, store.address, `Store address ${store.address} must match ${address}`)
        })
    })
})