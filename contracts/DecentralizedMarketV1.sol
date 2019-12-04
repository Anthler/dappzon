pragma solidity 0.5.12;

contract DecentalizedMarketV1{

    address payable owner;
    uint public storesCount;

    mapping(address => uint) public ownerStoresCount;

    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isStoreOwner;
    mapping(uint => bool) public isStore;
    mapping(address => uint[]) public ownerStores;
    mapping(uint => Store) allStores;
    mapping(uint => uint) public storeProductCount;

    event AdminCreated(address admin);
    event StoreCreated(uint storeId, address storeOwner);
    event ProductPurchased(uint productId, address buyer);
    event ProductAdded(uint productId);
    event ProductPriceUpdated( uint newPrice);
    event ProductRemoved(uint productId);
    event AuctionCreated(uint productId);

    struct Product{
        uint id;
        string description;
        uint price;
        uint quantity;
    }

    struct Store{
        uint id;
        string name;
        string description;
        address payable owner;
        mapping(uint => Product) products;
        uint balance;
        uint productSales;
        bool open;
    }

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

    function createNewStore(string memory _name, string memory _description) public onlyStoreOwners() returns(bool){
        //require(isStoreOwner[msg.sender], "You must be an approved store owner");
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

    function getStoreFullDetails(uint storeId) 
        public 
        view 
        onlyValidOwner(storeId)
        returns
        (
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

    function getStoreSomeDetails(uint storeId) 
        public 
        view 
        returns
        (
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

    function closeStore(uint storeId) public onlyValidOwner(storeId) returns(bool){
       require(allStores[storeId].open, "Store must be opened to be closed");
       Store storage store = allStores[storeId];
       if(allStores[storeId].balance > 0)
           msg.sender.transfer(allStores[storeId].balance);
        store.open = false;
    }

    function closeStoreByAdmin(uint storeId) public onlyAdmins returns(bool){
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
    

    function getStoreOwner(uint storeId) public view returns(address){
        return allStores[storeId].owner;
    }

    function addProduct(uint storeId, string memory desc, uint _price, uint _quantity) public onlyValidOwner(storeId) returns(uint){
        Store storage store = allStores[storeId];
        uint productId = storeProductCount[storeId];
        store.products[productId] = Product({
            id: productId,
            description: desc,
            price: _price,
            quantity:_quantity  
        });
        storeProductCount[storeId] += _quantity;
        emit ProductAdded(productId);
        return productId;
    }

    function updateProductPrice(uint storeId, uint productId, uint newPrice) public onlyValidOwner(storeId){
        Product storage product = allStores[storeId].products[productId];
        product.price = newPrice;
        emit ProductPriceUpdated(newPrice);
    }

    function getProduct(uint storeId, uint productId) public view returns(uint _id, string memory _description, uint _price, uint _quantity){
         Product memory product = allStores[storeId].products[productId];
          _id = product.id;
         _description = product.description;
         _price = product.price;
         _quantity = product.quantity;

    }

    function buyProduct(uint storeId, uint productId, uint quantity) public payable returns(bool){
        require(allStores[storeId].products[productId].quantity >= quantity, "Not enough in stock");
        uint amountToBePaid = allStores[storeId].products[productId].price * quantity;
        require(msg.value >= amountToBePaid, "Not enough ether provided");
        Product storage product = allStores[storeId].products[productId];
        product.quantity -= quantity;
        allStores[storeId].productSales += quantity;
        allStores[storeId].balance += amountToBePaid;
        storeProductCount[storeId] -= quantity;
        emit ProductPurchased(productId, msg.sender);
        return true;
    }

    
    function withdrawAllStoreBalance(uint storeId) public payable onlyValidOwner(storeId){
        require(allStores[storeId].owner == msg.sender, "You must be the store owner");
        Store storage store = allStores[storeId];
        require(store.balance <= address(this).balance, "Not enough funds");
        store.balance = 0;
        msg.sender.transfer(store.balance); 
    }

    function withdrawSomeBalance(uint storeId, uint amount) public payable onlyValidOwner(storeId){
        require(amount <= address(this).balance, "Not enough funds");
        require(allStores[storeId].balance >= amount, "You cannot withdraw more than your balance");
        Store storage store = allStores[storeId];
        store.balance -= amount;
        msg.sender.transfer(amount);
    }

    function getStoreBalance(uint storeId) public view onlyValidOwner(storeId) returns(uint){
        return allStores[storeId].balance;
    }

    function getContractBalance() public view onlyOwner returns(uint){
        return address(this).balance;
    }


    function getOwnerStores( address ownerAddress) public view onlyOwner returns(uint[] memory){
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


//need modifiers
    //onlyOwner
    //onlyStoreOwners
    //OnlyAdmins
    //whenStoreIsOpen
    //paidEnough
    //validCaller


//Auction a paticular product
//charge a fee from store owners and buyers
//Accept ERC-20 tokens for purchases
//Make owner multi signature wallet

