import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import StoreFactory from "../contracts/StoreFactory.json";
import Store from "../contracts/Store.json";
import { loadWeb3, loadBlockchainData } from "../utils/init";
import { Label, Form, Input, FormGroup, Col, Table, Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";

const deployed_rinkeby_address = "0x8aCee4b809B0001296bAD17dbF50f0E699058479";

class StoreOwner extends Component{

    state = {
        stores: [],
        contract: null,
        currentUser: '',
        loading: '',
        isStoreOwner: false,
        web3: null

    }

    componentDidMount = async () => {
        try {
            this.setState({loading: true})
            let web3, instance, currentUser, stores;
            loadWeb3();
            instance = await loadBlockchainData()
            web3 = window.web3;
            currentUser = await web3.currentProvider.selectedAddress
            const isOwner = await instance.methods.getIsApprovedStoreOwner().call({from: currentUser})
            this.setState({isOwner: isOwner})
            if(isOwner){
              stores = await instance.methods.getMyStores().call({from: currentUser})
              this.setState({stores: stores, isOwner:true})
            }
            this.setState({contract:instance,web3,currentUser,loading: false});
          } catch (error) {
            console.log(error)
          }
    }

    render(){
        if(this.state.loading){
            return(
                <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h2>Loading . . . </h2>
                        </div>    
                    </div>
                </div>
            )
        }
        else if(!this.state.isOwner){
            return(
                <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h2> You are not an approved store owner. You need to contact the admin </h2>
                        </div>    
                    </div>
                </div>
            )
        }else if(this.state.isOwner && !this.state.stores.length > 0){
            return(
                <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h2> You have no store yet.</h2>
                        </div>    
                    </div>
                    <br /> <br />
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <Link to="/newstore">
                                <Button className="btn btn-block" color="success">New Store</Button> 
                            </Link>
                        </div>    
                    </div>
                </div>
            )
        }else{
            return(
            <div className="container">
                <div className="row">
                    <div className="col-md-5 offset-4 mb-4">
                        <h2>All Your Stores</h2>
                    </div>
                </div>

                <div className="row">
                    <Table>
                      <thead>
                        <tr>
                        <th>Name</th>
                        <th>Orders Count</th>
                        <th>Product Count</th>
                        <th>Status</th>

                        </tr>
                    </thead>
                    <tbody>
                       {
                          this.state.stores.map( store => {
                              return(<RenderStoresTable key={store} store ={store}/>)
                          }) 
                       }
                    </tbody>
                    </Table>
                </div>
            </div>
        )
        }
    }
}

class RenderStoresTable extends Component{

    state = {
        constract: null,
        name: '',
        description: '',
        ordersCount: null,
        productCount: null,
        status: null,
        isOpen: false,
        loading: false,
        isModalOpen: false,
        storeOwner: '',
        address: '',
        isDtcModalOpen: false,
        
    }

    async componentDidMount(){
        loadWeb3()
        this.setState({loading: true})
        const instance = new window.web3.eth.Contract(Store.abi,this.props.store);
        const web3 = window.web3;
        const storeOwner = await web3.currentProvider.selectedAddress
        const address = instance.options.address;;
        const name = await instance.methods.name().call();
        const description = await instance.methods.description().call();
        const ordersCount = await instance.methods.ordersCount().call();
        const productCount = await instance.methods.productCount().call();
        const isOpen = await instance.methods.isOpen().call();
        this.setState({contract:instance,address, storeOwner,productCount, ordersCount, loading: false, isOpen, description, name})
    }

    toggleModal = () => {
        this.setState({isModalOpen: !this.state.isModalOpen})
    }

    toggleDtcModal = () => {
        this.setState({isDtcModalOpen: !this.state.isDtcModalOpen})
    }

    handleDtcModalSubmit = async (e) =>{
        this.toggleDtcModal()
        e.preventDefault();
        const tx = await this.state.contract.methods.updateTokenAddress(this.tokenAddress.value).send({from:this.state.storeOwner})
        if(tx){
            window.location.reload()
        }
        
    }

    handleModalSubmit = async (e) =>{
        this.toggleModal()
        e.preventDefault();
        const tx = await this.state.contract.methods.addProduct(this.description.value ,this.description.value, window.web3.utils.toWei((this.price.value)), this.quantity.value, this.imageUrl.value).send({from:this.state.storeOwner})
        if(tx){
            window.location.reload()
        }
        
    }

    render(){
        if(this.state.loading){
            return(
                <div className=""> Loading ... </div>
            )
        }
        return(
            <>
                <tr>
                    <td> {this.state.name} </td>
                    <td> {this.state.ordersCount} </td>
                    <td> {this.state.productCount} </td>
                    <td> {this.state.isOpen ? "Open" : "Closed" } </td>
                    <td><Button onClick={this.toggleModal} color="primary"> Add Product </Button></td>
                    <td>
                        {
                            this.state.ordersCount > 0 ? 
                            <Link to={`/mystores/${this.state.address}/orders`}><Button color="primary"> View Orders </Button></Link> : 
                            <Button className="disabled" color="primary">View Orders </Button> 
                        }
                    </td>
                    <td><Button onClick={this.toggleDtcModal} color="primary"> Set ERC20 Token </Button></td> 
                </tr>

                <Modal isOpen={this.state.isModalOpen} toggle={this.toggleModal} >
                    <ModalHeader>Add Product</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleModalSubmit} >
                            <FormGroup>
                                <Label htmlFor="name">Name</Label>
                                <Input name="name"
                                    type="text" 
                                    id="name"
                                    placeholder="Enter price Name of product"
                                    innerRef={(input) => this.name = input}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="price">Price</Label>
                                <Input name="price"
                                    type="text" 
                                    id="price"
                                    placeholder="Enter price for product"
                                    innerRef={(input) => this.price = input}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input name="quantity"
                                    type="text" 
                                    id="quantity"
                                    placeholder="Enter product stock quantity"
                                    innerRef={(input) => this.quantity = input}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="imageUrl">Image Url</Label>
                                <Input name="imageUrl"
                                    type="text" 
                                    id="imageUrl"
                                    placeholder="Provide image url for product"
                                    innerRef={(input) => this.imageUrl = input}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="description">Description </Label>
                                <Input name="description"
                                    type="textarea"
                                    rows="5" 
                                    id="description"
                                    placeholder="Product Description"
                                    innerRef={(input) => this.description = input}
                                />
                            </FormGroup>
                            
                            <Button className="btn btn-small btn-success">Submit</Button>
                        </Form>
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.isDtcModalOpen} toggle={this.toggleDtcModal} >
                    <ModalHeader>SET ERC20 TOKEN ADDDRESS FOR PAYMENTS</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleDtcModalSubmit} >
                            <FormGroup>
                                <Label htmlFor="tokenAddress">TOKEN ADDDRESS</Label>
                                <Input name="tokenAddress"
                                    type="text" 
                                    id="tokenAddress"
                                    placeholder="Enter token address"
                                    innerRef={(input) => this.tokenAddress = input}
                                />
                            </FormGroup>
                            <Button className="btn btn-small btn-success">Submit</Button>
                        </Form>
                    </ModalBody>
                </Modal>
            </>
        )
    }
}

export default StoreOwner;