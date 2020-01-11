pragma solidity 0.5.12;

import "./StoreContract.sol";

contract DecentralizedMarketFactory{

    event StoreCreated(uint storeId, address indexed marketplaceAddress);

    address payable superAdmin;

    uint public storesCount;
    mapping(uint => Store) public stores;

    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isApprovedStoreOwner;
    mapping (address => Store[]) public ownerStores;

    modifier onlyAdmins(){
        require(isAdmin[msg.sender], "You are not an admin");
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
        uint storeId = storesCount;
        Store store = new Store(_beneficiary, _name, _description);
        stores[storeId] = store;
        ownerStores[msg.sender].push(store);
        storesCount += 1;
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

    function getAllStores() public view returns(Store[] memory allStores){
        uint size = storesCount - 1 ;
        allStores = new Store[](size);
        for(uint i = 0; i <= size; i++ ){
            allStores[i] = stores[i];
        }
    }

    function getOwnerStoresCount(address owner) public view returns(uint _storesCount){
        _storesCount = ownerStores[owner].length; 
    }

    function getOwnerStores(address _owner) public view returns(Store[] memory stores){
        require(isApprovedStoreOwner[_owner], "This address is not a store owner");
        uint count = getOwnerStoresCount(_owner) - 1;
        for(uint i = 0; i <= count; i++){
            stores[i] = ownerStores[_owner][i];
        } 
    }

}