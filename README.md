# Chained Bounties
Buy and sell with cryptocurrencies.
## What do we do
 Dappzon is decentralized markeplace platform that leverages ethereum Blockchain technology, to enable shop owners, buyers to buy and sell any product using cryptocurrencies and ERC20 tokens of their choice. 


## How to use the platform 
Our process is simple:

 1. This dapp is a deployed instance of a Store factory contract. An admin approves a store owner.

 2. The approved store owner can create multiple store contracts from our platform. These stores are separate contracts that has their own dedicated addresses generated upon creating.

 3. The store owner can then setup an ERC20 token they accept.

 4. The store owner can also add products to their shop

 5. The buyer then nagivates to our dapp with their metamask already installed, then browse to stores opened. The buyer can choose to browse a particular store then see the products in the store.

 6. The buyer can then select an item and place order for it buy paying with Ether or ERC20 token (If one is setup up buy store owner).

 7. The store owner backend listens to events on new orders from their admin dashboard and see a list of all orders and can update the orders statuses accordingly.
 
Join me in a walk around the platform in this demo video:


## Project Setup
> Alert: only techies are allowed after this point

To setup this project in a local environment you need to have:
- Node v10.19.0
- npm
- Truffle 
- git
- Metamask extension

To play with this project you have the following networks and two front-end servers to choose from:
-	Local development network with front-end served by a local server
-	Rinkeby network with front-end served by a local server
-	Rinkeby network with front-end served by netlify

 The logical order is to setup the network -> connect Metamask -> serve client 
1.	Local development network:
```sh
        $ git clone https://github.com/Anthler/dappzon.git
        $ cd chained-bounties
        $ npm install
        $ truffle develop
        $ compile
        $ migrate
        $ test
        Connect Metamask to a funded account on the localhost network
```
2.	**Rinkeby** network: 
```
        Just connect Metamask to a funded account on the Rinkeby network
```
3.	Front-end served by a local server:
```sh
        $ cd client
        $ npm install
        $ npm start
```

>Note on networks: As mentioned the contract is deployed on Rinkeby, so if you also setup your local network with truffle develop like above, it's all up to Metamask on which network you are interacting with.

**Ropsten** Contract is also deployed on Ropsten testnet, you can play with it using Remix IDE. Check the deployment address at deployed_addresses.txt.
