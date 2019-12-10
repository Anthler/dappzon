pragma solidity 0.5.12;

contract DecentalizedMarketV1{

    address payable owner;
    uint public storesCount;
    uint public auctionsCount;

    mapping(address => uint) public ownerStoresCount;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isStoreOwner;
    mapping(uint => bool) public isStore;
    mapping(address => uint[]) public ownerStores;
    mapping(uint => Store) allStores;
    mapping(uint => uint) public storeProductCount;

    struct Product{
        uint id;
        uint storeId;
        string description;
        uint price;
        uint quantity;
        mapping(address => uint) buyers;
    }

    struct Store{
        uint id;
        string name;
        string description;
        address payable owner;
        uint auctionsCount;
        mapping(uint => Product) products;
        mapping(uint => Auction) auctions;
        uint balance;
        uint productSales;
        bool open;
    }

    struct Bid{
        uint id;
        uint auctionId;
        uint amount;
        address payable sender;
    }

    struct Auction{

        uint id;
        uint storeId;
        uint bidsCount;
        uint productId;
        uint minimumBidAmount;
        uint currentHighestAmount;
        bool finalized;
        address payable createdBy;
        address payable highestBidder;
        uint validUntil;
        mapping(uint => Bid) bids;
    }

    event AdminCreated(address admin);
    event StoreCreated(uint storeId, address storeOwner);
    event ProductPurchased(uint productId, address buyer);
    event ProductAdded(uint productId);
    event ProductPriceUpdated( uint newPrice);
    event ProductRemoved(uint productId);
    event AuctionCreated(uint auctionId);

    modifier onlyOwner(){
        require(msg.sender == owner, "You do not have permission to perform this action");
        _;
    }

    modifier onlyAdmins(){
        require(isAdmin[msg.sender], "You do not have permission to perform this action");
        _;
    }

    modifier onlyStoreOwners(){
        require(isStoreOwner[msg.sender], "Only store owners can perform this action");
        _;
    }

    modifier verifyCaller (address _address) {

    require (msg.sender == _address);
     _;
    }

  modifier paidEnough(uint _price, uint _quantity) { 

    require(msg.value >= _price * _quantity);
     _;
    }
  modifier checkValue(uint storeId, uint productId, uint _price) {
    _;
    uint _price = allStores[storeId].products[productId].price;
    uint amountToRefund = msg.value - _price;
    msg.sender.transfer(amountToRefund);
  }
    // modifier validProduct(uintuint productId){
    //     require(productId < productCount, "Product with this id does not exist");
    //     _;
    // }

    modifier whenStoreIsOpen(uint storeId){
        require(allStores[storeId].open, "Store is currently closed");
        _;
    }

    modifier onlyValidOwner(uint storeId){
        require(allStores[storeId].owner == msg.sender);
        _;
    }

    constructor() public {owner = msg.sender;}

    function() external { revert(); }

    function addAdmins(address _address) public onlyOwner {
        require(!isAdmin[_address], "This address is already an admin");
        isAdmin[_address] = true;
        emit AdminCreated(_address);
    }

    function removeAdmins(address _admin) public onlyOwner returns( bool) {
        require(isAdmin[_admin], "Address is not a store owner");
        isAdmin[_admin] = false;
        return true;
    }

    function addStoreOwners( address _storeOwner) public onlyAdmins() returns(bool){
        require(!isStoreOwner[_storeOwner], " This address is already a store owner");
        isStoreOwner[_storeOwner] = true;
        return true;
    }

    function removeStoreOwners(address storeOwner) public onlyAdmins() returns( bool){
        require(isStoreOwner[storeOwner], "This user is not a store owner");
        isStoreOwner[storeOwner] = false;
        return true;
    }

    function createNewStore(
        string memory _name, 
        string memory _description
    )   
        public 
        onlyStoreOwners() 
        returns(bool)
        {
        uint storeId = storesCount;
        Store storage store = allStores[storeId];
        store.id = storeId;
        store.name = _name;
        store.description = _description;
        store.owner = msg.sender;
        store.balance = 0;
        store.productSales = 0;
        store.open = true;
        ownerStores[msg.sender].push(storeId);
        storesCount +=1;
        ownerStoresCount[msg.sender] +=1;
        emit StoreCreated(storeId, msg.sender);
        return true;
    }

    function closeStore(uint storeId) 
        public 
        onlyValidOwner(storeId) 
        returns(bool)
    {
       require(allStores[storeId].open, "Store must be opened to be closed");
       Store storage store = allStores[storeId];
       if(allStores[storeId].balance > 0)
           msg.sender.transfer(allStores[storeId].balance);
        store.open = false;
    }

    function closeStoreByAdmin(uint storeId) 
        public 
        onlyAdmins 
        returns(bool)
    {
       require(allStores[storeId].open, "Only store owner can access");
       Store storage store = allStores[storeId];
       if(allStores[storeId].balance > 0)
            allStores[storeId].owner.transfer(allStores[storeId].balance);
        store.open = false;
    }

    function openStore(uint storeId) public onlyValidOwner(storeId) returns(bool){
       require(allStores[storeId].owner == msg.sender, "Only store owner can access");
       require(allStores[storeId].open, "Only store owner can access");
       Store storage store = allStores[storeId];
       store.open = true;
    }

    function addProduct(
        uint storeId, 
        string memory desc, 
        uint _price, 
        uint _quantity
    )   public 
        onlyValidOwner(storeId) 
        returns(uint)
    {
        Store storage store = allStores[storeId];
        uint productId = storeProductCount[storeId];
         Product storage product = store.products[productId];
            product.id =  productId;
            product.description =  desc;
            product.price =  _price;
            product.quantity = _quantity;
        storeProductCount[storeId] += _quantity;
        emit ProductAdded(productId);
        return productId;
    }

    function getStoreSomeDetails(uint storeId) 
        public 
        view 
        returns(
            string memory name,
            string memory description,
            address storeOwner
        )
    {
            require(allStores[storeId].owner == msg.sender, "Only store owner can access");
            Store memory store = allStores[storeId];
            name = store.name;
            description = store.description;
            storeOwner = store.owner;
    }

    function updateProductPrice(
        uint storeId, 
        uint productId, 
        uint newPrice
    ) 
        public 
        onlyValidOwner(storeId)
    {
        Product storage product = allStores[storeId].products[productId];
        product.price = newPrice;
        emit ProductPriceUpdated(newPrice);
    }

    function buyProduct(
        uint storeId, 
        uint productId, 
        uint quantity
    )   public 
        payable
        paidEnough(allStores[storeId].products[productId].price, quantity)
        checkValue(storeId, productId, allStores[storeId].products[productId].price) 
        returns(bool)
    {
        require(allStores[storeId].products[productId].quantity > 0 && allStores[storeId].products[productId].quantity >= quantity, "Not enough in stock");
        Product storage product = allStores[storeId].products[productId];
        product.quantity -= quantity;
        allStores[storeId].productSales += quantity;
        allStores[storeId].balance += allStores[storeId].products[productId].price * quantity ;
        storeProductCount[storeId] -= quantity;
        product.buyers[msg.sender] += quantity;
        emit ProductPurchased(productId, msg.sender);
        return true;
    }

    function getStoreOwner(uint storeId) public view returns(address){
        return allStores[storeId].owner;
    }

    
    function withdrawAllStoreBalance(uint storeId) 
        public 
        payable 
        onlyValidOwner(storeId)
    {
        require(allStores[storeId].owner == msg.sender, "You must be the store owner");
        Store storage store = allStores[storeId];
        require(store.balance <= address(this).balance, "Not enough funds");
        store.balance = 0;
        msg.sender.transfer(store.balance); 
    }

    function withdrawSomeBalance(uint storeId, uint amount) 
        public 
        payable 
        onlyValidOwner(storeId)
    {
        require(amount <= address(this).balance, "Not enough funds");
        require(allStores[storeId].balance >= amount, "You cannot withdraw more than your balance");
        Store storage store = allStores[storeId];
        store.balance -= amount;
        msg.sender.transfer(amount);
    }

    function createNewAuction(
        uint storeId, 
        uint productId, 
        uint target, 
        uint minimumAmount,
        uint validUntil
    ) 
        public 
        onlyValidOwner(storeId)
    {
        require(allStores[storeId].products[productId].quantity > 0);
        uint auctionId = allStores[storeId].auctionsCount;
        Store storage store = allStores[storeId];
        Product storage product = store.products[productId];
        Auction storage auction = store.auctions[auctionId];
        auction.id = auctionId;
        auction.bidsCount = 0;
        auction.productId = productId;
        auction.minimumBidAmount = minimumAmount;
        auction.currentHighestAmount = 0;
        auction.createdBy = msg.sender;
        auction.finalized = false;
        auction.validUntil = validUntil;
        allStores[storeId].auctionsCount += 1;
        emit AuctionCreated(auctionId);
    }

    function finalizeAuction(uint storeId, uint auctionId) 
        public 
        payable 
        onlyValidOwner(storeId) 
    {
        require(now > allStores[storeId].auctions[auctionId].validUntil, "You can only finalize after valid perio");
        require(!allStores[storeId].auctions[auctionId].finalized, "Already finalized");
        Auction storage auction = allStores[storeId].auctions[auctionId];
        allStores[storeId].products[auction.productId].quantity -= 1;
        auction.finalized = true;
        msg.sender.transfer(auction.currentHighestAmount);
    }

    function bidOnAuction(
        uint storeId, 
        uint auctionId, 
        uint amount
    ) 
        public 
        payable 
        returns(uint bidId)
    {
        require(msg.value >= amount && amount > allStores[storeId].auctions[auctionId].currentHighestAmount, "You must provide some ether");
        require(!allStores[storeId].auctions[auctionId].finalized, "Auction already finalized");
        uint bidId = allStores[storeId].auctions[auctionId].bidsCount;
        uint lastBidAmount = allStores[storeId].auctions[auctionId].currentHighestAmount;
        address payable lastHighestBidder = allStores[storeId].auctions[auctionId].highestBidder;
        Bid storage bid = allStores[storeId].auctions[auctionId].bids[bidId];
        bid.id = bidId;
        bid.amount = amount;
        bid.auctionId = auctionId;
        bid.sender = msg.sender;
        allStores[storeId].auctions[auctionId].highestBidder = msg.sender;
        lastHighestBidder.transfer(lastBidAmount);  
    }

    function getAuctionDetails(uint storeId, uint auctionId)
        public
        view
        returns(
        uint id,
        uint bidsCount,
        uint productId,
        uint minimumBidAmount,
        uint currentHighestAmount,
        bool finalized,
        address createdBy,
        address highestBidder,
        uint validUntil
    )
    {
        Auction storage auction = allStores[storeId].auctions[auctionId];

        id = auction.id;
        //storeId = auction.storeId;
        bidsCount = auction.bidsCount ;
        productId = auction.productId ;
        minimumBidAmount = auction.minimumBidAmount ;
        currentHighestAmount = auction.currentHighestAmount;
        finalized = auction.finalized;
        createdBy = auction.createdBy;
        highestBidder = auction.highestBidder;
        validUntil = auction.validUntil;
    }

    function getBidDetails(uint storeId, uint auctionId, uint bidId)
        public
        view
        returns(uint id, 
        uint _auctionId, 
        uint amount,
        address sender
    )
    {
        Bid storage bid = allStores[storeId].auctions[auctionId].bids[bidId];
        id = bid.id;
        _auctionId = bid.auctionId;
        amount = bid.amount;
        sender = bid.sender;
    }

    function getStoreFullDetails(uint storeId) 
        public 
        view 
        onlyValidOwner(storeId)
        returns(
            string memory name,
            string memory description,
            address storeOwner,
            uint balance,
            uint productSales,
            bool open
        )
    {
            require(allStores[storeId].owner == msg.sender, "Only store owner can access");
            Store memory store = allStores[storeId];
            name = store.name;
            description = store.description;
            storeOwner = store.owner;
            balance = store.balance;
            productSales = store.productSales;
            open = store.open;
    }

    function getProduct(uint storeId, uint productId)
        public 
        view 
        returns(
            uint _id, 
            string memory _description, 
            uint _price, 
            uint _quantity
        )
    {
         Product memory product = allStores[storeId].products[productId];
          _id = product.id;
         _description = product.description;
         _price = product.price;
         _quantity = product.quantity;

    }

    function getBuyerQuantity(uint storeId, uint productId, address buyer)
        public
        view
        returns(uint)
    {
        return allStores[storeId].products[productId].buyers[buyer];
    }

    function getStoreBalance(uint storeId) public view onlyValidOwner(storeId) returns(uint){
        return allStores[storeId].balance;
    }

    function getContractBalance() public view onlyOwner returns(uint){
        return address(this).balance;
    }


    function getOwnerStores( address ownerAddress) 
        public 
        view  
        returns(uint[] memory)
    {
        return ownerStores[ownerAddress];
    } 

    function getOwnerStores() public view onlyOwner returns(uint[] memory){
        return ownerStores[msg.sender];
    } 

    function getContractAddress() public view returns(address) {
        return address(this);
    }

    function getOwnerStoresCount(address _storeOwner) public view returns(uint){
        return ownerStoresCount[_storeOwner];
    }

    function getStoresCount() public view returns(uint){
        return storesCount;
    }
}