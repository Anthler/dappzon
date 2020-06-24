pragma solidity 0.6.3;

import "./StoreContract.sol";

contract StoreFactory{

    event StoreCreated(uint storeId, address indexed marketplaceAddress);

    address payable superAdmin;

    uint public storesCount;
    mapping(uint => Store) public stores;
    Store[] public storesCollection;

    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isApprovedStoreOwner;
    mapping (address => Store[]) public ownerStores;

    modifier onlyAdmins(){
        require(isAdmin[msg.sender] || msg.sender == superAdmin, "You are not an admin");
        _;
    }

    modifier onlyApprovedStoreOwners(){
        require(isApprovedStoreOwner[msg.sender], "You are not an approved store owner");
        _;
    }

    modifier onlySuperAdmin(){
        require(msg.sender == superAdmin);
        _;
    }

    constructor() public {
        superAdmin = msg.sender;
    }


    function createNewStore(
        address payable _beneficiary, 
        string memory _name ,
        string memory _description
    )
    public
    onlyApprovedStoreOwners
    {
        uint storeId = storesCount++;
        Store store = new Store(_beneficiary, _name, _description);
        stores[storeId] = store;
        ownerStores[msg.sender].push(store);
        storesCollection.push(store);
        emit StoreCreated(storeId, address(store));
    }

    function addAdmins(address _admin) public onlySuperAdmin{
        require(!isAdmin[_admin], "Address already an admin");
        isAdmin[_admin] = true;
    }

    function removeAdmins(address _admin) public onlySuperAdmin{
        require(isAdmin[_admin], "Address not already an admin");
        isAdmin[_admin] = false;
    }
    
    function addStoreOwner(address payable _owner) public onlyAdmins{
        require(!isApprovedStoreOwner[_owner], "Account already an approved store owner");
        isApprovedStoreOwner[_owner] = true;
    }

    function removeStoreOwner(address payable _owner) public onlyAdmins{
        require(isApprovedStoreOwner[_owner], "Account not an approved store owner");
        isApprovedStoreOwner[_owner] = false;
    }

    function getStore(uint storeId) public view returns(Store){
        return stores[storeId];
    }

    function getAllStores() public view returns(Store[] memory _allStores){
        _allStores = storesCollection;
    }

    function getOwnerStoresCount(address owner) public view returns(uint _storesCount){
        _storesCount = ownerStores[owner].length; 
    }

    function getOwnerStores(address _owner) public view returns(Store[] memory _ownerStores){
        _ownerStores = ownerStores[_owner];
    }

    function getMyStores() public view returns(Store[] memory _myStores){
        _myStores = ownerStores[msg.sender];
    }

    function getIsApprovedStoreOwner() public view returns(bool){
        return isApprovedStoreOwner[msg.sender];
    }

}