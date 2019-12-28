pragma solidity 0.5.12;

import "./DecentCoinToken.sol";

contract Store{

    string name;
    string description;
    bool isOpen;

    address payable storeOwner;
    address payable public beneficiary;

    uint public productCount;
    mapping(uint => Product) public products;

    mapping(uint => Auction) auctions;
    uint public auctionsCount;

    //DecentCoinToken token;

    event ProductPurchased(uint productId, address buyer);
    event ProductAdded(uint productId);
    event ProductPriceUpdated( uint newPrice);
    event ProductRemoved(uint productId);
    event AuctionCreated(uint productId);
    event BidCreated(uint bidId);

    struct Product{
        uint id;
        string description;
        uint price;
        uint quantity;
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

    modifier onlyOwner(){
        require(storeOwner == msg.sender, "Only store owners can perform this action");
        _;
    }

    modifier validProduct(uint productId){
        require(productId < productCount, "Product with this id does not exist");
        _;
    }


    function() external{ revert();}

    constructor(
        address payable _beneficiary,
        string memory _name,
        string memory _description
        //address _tokenAddress
    ) 
    public
    {
        storeOwner = tx.origin;
        name = _name;
        description = _description;
        beneficiary = _beneficiary;
        isOpen = true;
        //token = DecentCoinToken(_tokenAddress);
    }

    function getProducts(uint productId) 
        public 
        view 
        returns(
            uint _id, 
            string memory _description, 
            uint _price, 
            uint _quantity
        )
    {
         Product memory product = products[productId];
         _id = product.id;
         _description = product.description;
         _price = product.price;
         _quantity = product.quantity;
    }

    function addProduct(
        string memory desc, 
        uint price, 
        uint quantity
    ) 
        public 
        onlyOwner 
        returns(uint)
    {
        uint productId = productCount;
        products[productId] = Product({
            id: productId,
            description: desc,
            price: price,
            quantity: quantity
        });
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

    // check for paid enough
    function buyProduct( 
        uint productId, 
        uint quantity
    )   public 
        payable 
        validProduct(productId) 
    {
        require(msg.value >= products[productId].price * quantity, "Not enough ether provided");
        Product storage product = products[productId];
        product.quantity -= quantity;
        emit ProductPurchased(productId, msg.sender);
    }

    function auctionProduct(
        uint productId,
        uint _validUntil
    )  
        public 
        onlyOwner
    {
        require(productId < productCount, " Invalid product ID");
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
        auctionsCount++;
    }

    //check for paid enough // meaning we must accept value argument in function
    function bid(uint auctionId) public payable{
        require(!auctions[auctionId].finalized, "You cannot bid on finalized auctions");
        require(now <= auctions[auctionId].validUntil, "You cannot bid on auction");
        require(msg.value > auctions[auctionId].highestBid, "You must provide ether more than current highest bidder" );
        require(msg.sender != address(0), "Please provide a valid address" );
        auctions[auctionId].highestBidder = msg.sender;
        uint bidId = auctions[auctionId].bidsCount;
        auctions[auctionId].bids[bidId] = Bid({auctionId: auctionId, amount: msg.value, bidder: msg.sender});
        if(auctions[auctionId].highestBid > 0 && auctions[auctionId].highestBidder != address(0)) {
            auctions[auctionId].highestBidder.transfer(auctions[auctionId].highestBid);
        }
        auctions[auctionId].highestBidder = msg.sender;
        auctions[auctionId].highestBid = msg.value;
        auctions[auctionId].bidsCount += 1;
        emit BidCreated(bidId);
    }

    function withdrawBalance() public payable onlyOwner{
        beneficiary.transfer(address(this).balance);
    }

    function getStoreAddress() public view returns(address){ return address(this); }
}

