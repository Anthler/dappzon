pragma solidity 0.5.12;

import "./DecentCoinToken.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract Store is Ownable {

    string public name;
    string public description;
    bool public isOpen;

    address payable public storeOwner;
    address payable public beneficiary;

    uint public productCount;
    mapping(uint => Product) public products;

    mapping(uint => Auction) public auctions;
    uint public auctionsCount;

    DMCoinToken tokenContract;

    event ProductPurchased(uint productId, address buyer);
    event ProductAdded(uint productId);
    event ProductPriceUpdated( uint newPrice);
    event ProductRemoved(uint productId);
    event AuctionCreated(uint productId);
    event BidCreated(uint bidId);
    event AuctionEnded(address highestBidder, uint auctionId, uint highestBid);

    struct Product{
        uint id;
        string description;
        uint price;
        uint quantity;
        string imageUrl;
        uint sales;
        address[] buyers;
    }

    struct Auction{
        uint productId;
        uint highestBid;
        address payable highestBidder;
        bool finalized;
        uint validUntil;
        uint bidsCount;
        mapping(uint => Bid) bids;
    }

    struct Bid{
        uint auctionId;
        uint amount;
        address payable bidder;
    }

    modifier validProduct(uint productId){
        require(productId < productCount, "Invalid product ID");
        _;
    }

    modifier checkValue(uint _productId, uint _quantity) {
    _;
    uint _price = products[_productId].price * _quantity;
    uint amountToRefund = msg.value - _price;
    msg.sender.transfer(amountToRefund);
  }


    function() external{ revert();}

    constructor(
        address payable _beneficiary,
        string memory _name,
        string memory _description,
        address _tokenAddress
    ) 
    public
    {
        storeOwner = tx.origin;
        _transferOwnership(storeOwner);
        name = _name;
        description = _description;
        beneficiary = _beneficiary;
        isOpen = true;
        tokenContract = DMCoinToken(_tokenAddress);
    }

    function updateTokenAddress(address _tokenAddress) public onlyOwner(){
        require(_tokenAddress != address(0), "Token contract address must be a valid address");
        tokenContract = DMCoinToken(_tokenAddress);
    }

    function getProduct(uint productId) 
        public 
        view 
        returns(
            uint _id, 
            string memory _description, 
            uint _price, 
            uint _quantity,
            string memory _imageUrl
        )
    {
         Product memory product = products[productId];
         _id = product.id;
         _description = product.description;
         _price = product.price;
         _quantity = product.quantity;
         _imageUrl = product.imageUrl;
    }

    function payWithDMCoinToken(uint _productId, uint _quantity) public{
        uint price = products[_productId].price;
        require(tokenContract.transferFrom(msg.sender, address(this),price *_quantity), "You must approve balance to this store address");
        products[_productId].quantity -=1;
        products[_productId].sales += 1;
        products[_productId].buyers.push(msg.sender);
        emit ProductPurchased(_productId, msg.sender);
    }

    function addProduct(
        string memory desc, 
        uint price, 
        uint quantity,
        string memory _imageUrl
    ) 
        public 
        onlyOwner 
    {
        uint productId = productCount;
        Product storage product = products[productId];
        product.id = productId;
        product.description = desc;
        product.price = price;
        product.quantity = quantity;
        product.imageUrl = _imageUrl;
        product.sales = 0;
        productCount += 1;
        emit ProductAdded(productId);
    }

    function updateProductPrice(
        uint productId, 
        uint newPrice
    ) 
        public 
        onlyOwner 
        validProduct(productId)
    {
        Product storage product = products[productId];
        product.price = newPrice;
        emit ProductPriceUpdated(newPrice);
    }

    function buyProduct( 
        uint productId, 
        uint quantity
    )   public 
        payable 
        validProduct(productId)
        checkValue(productId, quantity) 
    {
        require(msg.value >= products[productId].price * quantity, "Not enough ether provided");
        Product storage product = products[productId];
        product.quantity -= quantity;
        product.buyers.push(msg.sender);
        product.sales += 1;
        emit ProductPurchased(productId, msg.sender);
    }

    function getProductBuyers(uint productId) public view returns(address[] memory){
        return products[productId].buyers;
    }

    function auctionProduct(
        uint productId,
        uint _validUntil
    )  
        public 
        onlyOwner
        validProduct(productId)
    {
        require(products[productId].quantity > 0, "Not enough stock");
        uint auctionId = auctionsCount;
        auctions[auctionId] = Auction({
            productId: productId, 
            highestBid:0, 
            highestBidder: address(0),
            validUntil: _validUntil,
            finalized: false,
            bidsCount: 0
        });
        products[productId].quantity -= 1;
        auctionsCount++;
    }

    function bid(uint auctionId, uint amount) public payable{
        require(msg.value >= amount, "You must provide ether equal to amount specified");
        require(!auctions[auctionId].finalized, "You cannot bid on finalized auctions");
        require(now <= auctions[auctionId].validUntil, "You cannot bid on auction");
        require(amount > auctions[auctionId].highestBid, "You must provide ether more than current highest bidder" );
        require(msg.sender != address(0), "Please provide a valid address" );

        uint bidId = auctions[auctionId].bidsCount;
        auctions[auctionId].bids[bidId] = Bid({auctionId: auctionId, amount: amount, bidder: msg.sender});
        if(auctions[auctionId].highestBid > 0 && auctions[auctionId].highestBidder != address(0)) {
            auctions[auctionId].highestBidder.transfer(auctions[auctionId].highestBid);
        }
        auctions[auctionId].highestBidder = msg.sender;
        auctions[auctionId].highestBid = amount;
        auctions[auctionId].bidsCount += 1;

        uint amountToRefund = msg.value - amount;
        if(amountToRefund > 0) msg.sender.transfer(amountToRefund);
        emit BidCreated(bidId);
    }

    function finalizeAuction(uint _auctionId) public payable onlyOwner{
        require(_auctionId < auctionsCount, "Invalid auction ID");
        require(now > auctions[_auctionId].validUntil, "Auction can only finalize after validity period");
        require(!auctions[_auctionId].finalized, "auction not finalized");
        auctions[_auctionId].finalized = true;
        products[auctions[_auctionId].productId].sales += 1; 
        emit AuctionEnded(auctions[_auctionId].highestBidder, _auctionId, auctions[_auctionId].highestBid);
    }

    function withdrawBalance() public payable onlyOwner{
        beneficiary.transfer(address(this).balance);
    }

    function getStoreAddress() public view returns(address){ return address(this); }
}

