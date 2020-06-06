import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import Store from "../contracts/Store.json";
import { loadWeb3, loadBlockchainData } from "../utils/init";
import { Card, Button, CardHeader, CardFooter, CardBody,CardTitle, CardText } from 'reactstrap';
import { Link } from "react-router-dom";

class Home extends Component{

    state = {
        stores: [],
        loading: false,
        contract: null,
        currentUser: '',
    }

    componentDidMount = async () => {
        let web3, contract;
        try{
            this.setState({loading: true})
            loadWeb3();
            contract = await loadBlockchainData()
            web3 = window.web3;
            const currentUser = await web3.currentProvider.selectedAddress
            const stores = this.props.stores
            console.log(stores)
            this.setState({web3,contract,web3, stores, currentUser, loading: false})
  
          } catch (error) {
            console.log(error.message)
          }
    }

    render = () => {
        if(this.state.loading){
            return(
            <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h2> Loading . . .  </h2>
                        </div>    
                    </div>
            </div>
            )
        }else if(!this.props.stores.length > 0){
            return (
                <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h2> No stores stores exists yet </h2>
                        </div>    
                    </div>
                </div>
            ) 
        }else{
            return (
                <div className="container">
                    <div className="row text-center mb-4">
                        <div className="col-md-6 offset-3">
                            <h2>Stores Opened</h2>
                        </div>
                    </div>
                    <div className="row"> 
                        {   
                        this.props.stores.map(store => {
                            return (<RenderStoreCards key={store} address={this.state.address} store={store} />)
                        })
                        }
                    </div>
                </div>
            )
        }
    }
}

class RenderStoreCards extends Component{

    state = {
        name: '',
        description: '',
        currentUser: '',
        beneficiary: '',
        contract: '',
        web3: '',
        address: '',
    }
    
    componentDidMount = async () => {
        let instance, currentUser, web3, name,address, description;
        loadWeb3();
        web3 = window.web3;
        currentUser = await web3.currentProvider.selectedAddress
        instance = new web3.eth.Contract(
        Store.abi,
        this.props.store
        );
        name = await instance.methods.name().call();
        address = await instance.options.address
        description = await instance.methods.description().call();
        this.setState({contract: instance,name, address, description, currentUser,web3 })
        console.log(instance)
    }

    render = () => {

        const {name, description} = this.state;

            return(
                <div className="col-md-5 mr-2">
                    <Card>
                        <CardHeader tag="h4">{name}</CardHeader>
                        <CardBody>
                        <CardTitle>{description}</CardTitle>
                        {/* <CardText>With  a natural lead-in to additional content.</CardText> */}
                        <Link to={`/stores/${this.state.address}`}> 
                            <Button  color="primary"> 
                                Explore Store
                            </Button> 
                        </Link>
                        </CardBody>
                    </Card>
                </div>
            )
    }
}

export default Home;