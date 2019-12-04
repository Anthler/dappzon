pragma solidity 0.5.12;

contract Store{

    address storeOwner;
    uint public productCount;

    mapping(uint => Product) public products;

    string name;
    string description;

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

    modifier onlyStoreOwner(){
        require(storeOwner == msg.sender, "Only store owners can perform this action");
        _;
    }

    modifier validProduct(uint productId){
        require(productId < productCount, "Product with this id does not exist");
        _;
    }

    function() external{ revert();}

    constructor(string memory _name, string memory _description) public{
        storeOwner = tx.origin;
        name = _name;
        description = _description;
    }

    function getProducts(uint productId) public view returns(uint _id, string memory _description, uint _price, uint _quantity){
         Product memory product = products[productId];
         _id = product.id;
         _description = product.description;
         _price = product.price;
         _quantity = product.quantity;
    }

    function addProduct(string memory desc, uint price, uint quantity) public onlyStoreOwner returns(uint){
        uint productId = productCount;
        products[productId] = Product({
            id: productId,
            description: desc,
            price: price,
            quantity: quantity
        });
        productCount+1;
        emit ProductAdded(productId);
        return productId;
    }

    function updateProductPrice(uint productId, uint newPrice) public onlyStoreOwner validProduct(productId){
        Product storage product = products[productId];
        product.price = newPrice;
        emit ProductPriceUpdated(newPrice);
    }

    function buyProduct( uint productId, uint quantity) public payable validProduct(productId) returns(bool){
        require(msg.value >= products[productId].price * quantity, "Not enough ether provided");
        Product storage product = products[productId];
        address payable contractAddr = address(uint160(address(this)));
        product.quantity -= quantity;
        contractAddr.transfer(msg.value);
        emit ProductPurchased(productId, msg.sender);
        return true;
    }

    function withdrawBalance() public payable onlyStoreOwner{
        msg.sender.transfer(address(this).balance);
    }

    function getStoreAddress() public view returns(address){ return address(this); }

    function getStoreOwner() public view returns(address){
        return storeOwner;
    }

    function getStoreDescription() public view returns(string memory){
        return description;
    }
}

contract DecentalizedMarket{

    address payable owner;

    uint public storesCount;

    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isStoreOwner;
    mapping(address => bool) public isStore;
    mapping(address => address[]) public ownerStores;
    mapping(address => uint) public ownerStoresCount;
    mapping(uint => address) allStores;

    event AdminCreated(address admin);
    event StoreCreated(address storeAddress, address storeOwner);

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

    function addStoreOwners( address _storeOwner) public onlyAdmins returns(bool){
        require(!isStoreOwner[_storeOwner], " This address is already a store owner");
        isStoreOwner[_storeOwner] = true;
        return true;
    }

    function removeStoreOwners(address storeOwner) public onlyAdmins returns( bool){
        require(isStoreOwner[storeOwner], "This user is not a store owner");
        isStoreOwner[storeOwner] = false;
        return true;
    }

    function createNewStore(string memory _name, string memory _description) public onlyStoreOwners returns(address){
        uint storeId = storesCount;
        require(isStoreOwner[msg.sender], "You must be an approved store owner");
        Store newStore = new Store(_name, _description);
        ownerStores[msg.sender].push(address(newStore));
        allStores[storeId] = address(newStore);
        storesCount+1;
        emit StoreCreated(address(newStore), msg.sender);
        return address(newStore);
    }

    function getOwnerStores( address ownerAddress) public view onlyOwner returns(address[] memory){
        return ownerStores[ownerAddress];
    } 

    function getContractAddress() public view returns(address) {
        return address(this);
    }

    function getOwnerStoresCount( address _storeOwner) public view returns(uint){
        return ownerStoresCount[_storeOwner];
    }
}
