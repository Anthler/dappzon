import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import Store from "../contracts/Store.json";
import { loadWeb3, loadBlockchainData } from "../utils/init";
import { Link } from "react-router-dom";
import { Card, Modal, CardText, Button, CardHeader, CardImg, CardFooter, Label, Form, Input, FormGroup, Col,
    CardBody,CardTitle, CardTextModal, ModalHeader, ModalBody  } from 'reactstrap';
const deployed_rinkeby_address = "0x8aCee4b809B0001296bAD17dbF50f0E699058479";

class StoreDetails extends Component{

    state = {
        contract: null,
        loading: false,
        currentUser: '',
        description: '',
        name: '',
        price: 0,
        products: [],
        web3: null,
        isModalOpen: false,
        address: '',
        quantity: '',
        currency: '',
        productId: null,
        total: null,
    }

    componentDidMount = async () => {
        let instance, currentUser, web3, price, name,address, description, products;
        loadWeb3();
        web3 = window.web3;
        currentUser = await web3.currentProvider.selectedAddress
        instance = new web3.eth.Contract(
        Store.abi,
        this.props.address
        );
        name = await instance.methods.name().call();
        const owner = await instance.methods.owner().call();
        address = await instance.options.address
        description = await instance.methods.description().call();
        products = await instance.methods.getProductsCollection().call();
        this.setState({contract: instance,name, address, products, description, currentUser,web3 })
    }

    toggleModal = (product) => {
        this.setState({isModalOpen: !this.state.isModalOpen, price:product.price, productId:product.id})
    }

    handleModalSubmit = async (e) =>{
        const {productId, price, quantity, currentUser} = this.state;
       e.preventDefault();
       this.setState({isModalOpen:false})
       const total = window.web3.utils.toBN(this.state.price*this.state.quantity)
       if(this.state.currency === "DTC"){
           console.log("DTC")
           try {
               const tx = await this.state.contract.methods.payWithDCTCoin(productId, quantity).send({from: currentUser});
                if(tx){
                    alert('Successfull')
                }else{
                    alert("Transaction failed")
                }
           } catch (error) {
               console.log(error)
           }
       }else{
           console.log("ETH")
           try {
               const tx = await this.state.contract.methods.payProductWithEther(productId, quantity).send({from:currentUser, value:total})
                if(tx){ 
                    console.log("Successfull")
                }else{
                    alert("Transaction failed")
                }
           } catch (error) {
               console.log(error)
           }
       }
    }

    handleInputChange = (event) => {
        
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
        console.log(this.state.quantity)
    }

    render(){
        return(
            <div className="container">
                <div className="row">
                    <div className="col-md-5 mb-5 offset-4">
                        <h2> {this.state.name} </h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-5 mb-5 offset-4">
                    </div>
                </div>
                

                <div className="row">
                    {
                        this.state.products.map( product => {
                            return (
                                <div key={product} className="col-md-5 mr-2">
                                    <Card>
                                        <CardHeader tag="h4">{product.description}</CardHeader>
                                        <CardImg top width="100%" src={product.imageUrl} alt={product.name} />
                                        <CardBody>
                                        <CardTitle><strong>Stock: </strong>{product.quantity}</CardTitle>
                                        <CardText><strong> Price:</strong> {this.state.web3.utils.fromWei(product.price, 'ether')} <strong>ETH</strong></CardText>
                                        {/* <CardText>With  a natural lead-in to additional content.</CardText> */}
                                            <Button color="primary" className="btn btn-block" onClick={() => this.toggleModal(product)}>Buy Now</Button>
                                        </CardBody>
                                    </Card>
                                </div>
                            )
                        })
                    }
                </div>

                <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal} >
                    <ModalHeader>Order Product</ModalHeader>
                    <ModalBody>
                        <p><strong><span style={{color: "#565454"}}> Your Current Address: </span></strong> <span style={{color: "green"}}> {this.state.currentUser} </span></p>
                        <p><strong><span style={{color: "#565454"}}> Contract Address:</span></strong><span style={{color: "green"}}> {this.state.address} </span></p>
                        <p><strong><span style={{color: "#565454"}}> Order Total ETH:</span></strong> <span style={{color: "green"}}>{ this.state.isModalOpen ? window.web3.utils.fromWei(window.web3.utils.toBN(this.state.price * this.state.quantity), "ether") : null}</span></p>
                        <Form onSubmit={this.handleModalSubmit} >
                            <FormGroup>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input name="quantity"
                                    type="text" 
                                    id="quantity"
                                    placeholder="Enter product stock quantity"
                                     onChange={this.handleInputChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="currency">Payment With</Label>
                                <Input name="currency"
                                    type="select" 
                                    id="currency"
                                    onChange={this.handleInputChange}
                                >
                                    <option> ETH </option>
                                    <option> DTC </option>
                                </Input>
                            </FormGroup>
                            
                            <Button className="btn btn-small btn-success">Submit</Button>
                        </Form>
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}

export default StoreDetails;