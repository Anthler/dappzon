pragma solidity ^0.6.3;
pragma experimental ABIEncoderV2;

//import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IERC20 {
    
    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value) external returns(bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);
    
    function totalSupply() external view returns (uint256);
    
    function balanceOf(address who) external view returns (uint256);
    
    function allowance(address owner, address spender) external view returns (uint256);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Store is Ownable, Pausable{

    using SafeMath for uint256;

    string public name;
    string public description;
    bool public isOpen;

    address payable public beneficiary;

    uint public productCount;
    mapping(uint => Product) public products;
    Product[] public productsCollection;

    uint public ordersCount;
    mapping(uint => Order) public orders;

    mapping(address => Order[]) public customerOrders;

    address public tokenContract;

    enum OrderStatus{ Recieved, Proccessing, Delivered, Cancelled}

    event ProductPurchased(uint productId, address buyer);
    event ProductAdded(uint productId);
    event ProductPriceUpdated( uint newPrice);
    event ProductRemoved(uint productId);

    struct Product{
        uint id;
        string name;
        string description;
        uint price;
        uint quantity;
        string imageUrl;
        uint sales;
        address[] buyers;
        uint[] orders;
    }

    struct Order{
        uint id;
        uint productId;
        uint amountPaid;
        uint productQuantity;
        uint datePurchased;
        address payable buyer;
        OrderStatus status;
    }

    modifier validProduct(uint productId){
        require(productId <= productCount, "Invalid product ID");
        _;
    }

    modifier enoughStock(uint productId, uint quantity){
        require(products[productId].quantity >= quantity, "Not enough stock");
        _;
    }

    fallback() external{ 
        revert();
    }

    constructor(
        address payable _beneficiary,
        string memory _name,
        string memory _description
    ) 
    public
    {
        transferOwnership(tx.origin);
        name = _name;
        description = _description;
        beneficiary = _beneficiary;
        isOpen = true;
    }

    function getProduct(uint productId) 
        public 
        view
        validProduct(productId) 
        returns(
            uint _id, 
            string memory _description, 
            uint _price, 
            uint _quantity,
            string memory _imageUrl,
            uint[] memory _orders
        )
    {
         Product memory product = products[productId];
         _id = product.id;
         _description = product.description;
         _price = product.price;
         _quantity = product.quantity;
         _imageUrl = product.imageUrl;
         _orders = product.orders;
    }

    function payWithDCTCoin(uint _productId, uint _quantity) 
        public 
        payable
        whenNotPaused() 
        validProduct(_productId)
        enoughStock(_productId, _quantity)
        {
        require(_quantity > 0 && _productId > 0, "You must atleast purchase one item");
        uint amount = products[_productId].price * _quantity;
        require(IERC20(tokenContract).allowance(msg.sender, address(this)) >= amount, "Please approve the amount of tokens to this contract address");
        IERC20(tokenContract).transferFrom(msg.sender, address(this), amount);
        ordersCount++;
        Order storage order = orders[ordersCount];
        order.id = ordersCount;
        order.productId = _productId;
        order.amountPaid = amount;
        order.datePurchased = now;
        order.status = OrderStatus.Recieved;
        products[_productId].quantity -=_quantity;
        products[_productId].sales +=_quantity;
        products[_productId].orders.push(order.id);
        customerOrders[msg.sender].push(order);
        products[_productId].buyers.push(msg.sender);
        emit ProductPurchased(_productId, msg.sender);
    }

    function updateTokenAddress(address _tokenAddress) public onlyOwner(){
        require(_tokenAddress != address(0), "Token contract address must be a valid address");
        require(_tokenAddress != address(tokenContract), "This address is the same as existing address");
        tokenContract = _tokenAddress;
    }

    function addProduct(
        string memory name,
        string memory desc, 
        uint price, 
        uint quantity,
        string memory _imageUrl
    ) 
        public 
        onlyOwner()
        whenNotPaused() 
    {
        // bytes memory tempName = bytes(name);
        // bytes memory tempDesc = bytes(desc);
        // require(tempDesc.length > 0, "Description cannot be empty");
        // require(tempName.length > 0, "name must be a valid string");
        // require(quantity > 0, "Quantity must be greater than zero");
        // require(price > 0, "Price must be greater than zero");
        productCount++;
        uint productId = productCount;
        Product storage product = products[productId];
        product.id = productId;
        product.name = name;
        product.description = desc;
        product.price = price;
        product.quantity = quantity;
        product.imageUrl = _imageUrl;
        product.sales = 0;
        productsCollection.push(product);
        emit ProductAdded(productId);
    }

    function getProductsCollection() public view returns(Product[] memory _products){
        _products = productsCollection;
    }

    function payProductWithEther( 
        uint productId, 
        uint quantity
    )   public 
        payable 
        whenNotPaused()
        validProduct(productId)
        enoughStock(productId, quantity)
    {   
        require( quantity > 0 && productId > 0, "You must provide a valid product id or quantity");
        require(msg.value >= products[productId].price * quantity, "Not enough ether provided");
        Product storage product = products[productId];
        uint amountToPay = products[productId].price * quantity;
        uint amountToRefund =  msg.value - amountToPay;
        ordersCount++;
        Order storage order = orders[ordersCount];
        order.id = ordersCount;
        order.productId = productId;
        order.amountPaid = amountToPay;
        order.datePurchased = now;
        order.buyer = msg.sender;
        order.productQuantity = quantity;
        order.status = OrderStatus.Recieved;
        product.quantity -= quantity;
        product.buyers.push(msg.sender);
        product.orders.push(order.id);
        customerOrders[msg.sender].push(order);
        product.sales += quantity;
        for(uint i = 0; i < productsCollection.length; i++){
            if(productsCollection[i].id == productId){
                productsCollection[i] = product;
            }
        }
        if(amountToRefund > 0){
            msg.sender.transfer(amountToRefund);
        }
        emit ProductPurchased(productId, msg.sender);
    }

    function cancelOrderAndRefund(uint id) public onlyOwner() whenNotPaused() returns(bool){
        require(id > 0 , "Order id invalid");
        require(orders[id].status != OrderStatus.Delivered, "Delivered orders cned be processed");
        Order storage order = orders[id];
        order.status = OrderStatus.Cancelled;
        products[order.productId].quantity.add(order.productQuantity);
        order.buyer.transfer(order.amountPaid);
        return true;
    }

    function withdrawBalance() public payable onlyOwner() whenNotPaused()  {
        beneficiary.transfer(address(this).balance);
    }
}

