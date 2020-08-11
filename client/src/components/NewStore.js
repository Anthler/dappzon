import React, { Component } from "react";
import { loadWeb3, loadBlockchainData } from "../utils/init";
import { Label, Form, Input,Button, FormGroup, Col } from "reactstrap";

const deployed_rinkeby_address = "0x8aCee4b809B0001296bAD17dbF50f0E699058479";

class NewStore extends Component{

    state = {
        currentUser: '',
        description: '',
        beneficiary: '',
        name: '',
        successful: false,
        web3: null,
        contract: null,
    }

    async componentDidMount(){
        try {
            let web3, contract, currentUser;
            loadWeb3();
            contract = await loadBlockchainData()
            web3 = window.web3;
            currentUser = await web3.currentProvider.selectedAddress
            this.setState({contract,web3,currentUser})
  
          } catch (error) {
            console.log(error.message)
          }
    }

    handleSubmit = async (event) => {
        const {beneficiary, name, contract, description, currentUser} = this.state;
        event.preventDefault();
        const tx = await contract.methods.createNewStore(beneficiary, name, description).send({from: currentUser});
        if(tx){
            alert('successfully created new store' )
        }
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    render() {
        return(
            <div className="container" >
                <div className="container">
                    <div className="row">
                        <div className="col col-md-5 offset-4">
                            <h3> Create A New Store</h3>
                        </div>    
                    </div>
                </div>
            <div className="row row-content">
                <div className="col-12">
                    
                </div>
                    <div className="col-12 col-md-9">
                        <Form onSubmit={this.handleSubmit}>
                            <FormGroup row>
                                <Label htmlFor="name" md={2}>Name</Label>
                                <Col md={9}>
                                    <Input type="text"  
                                        id="name" 
                                        name="name" 
                                        placeholder="Name of store"
                                        value={this.state.name}
                                        onChange={this.handleInputChange} 
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label htmlFor="beneficiary" md={2}>Beneficiary</Label>
                                <Col md={9}>
                                    <Input type="text"  
                                        id="beneficiary" 
                                        name="beneficiary" 
                                        placeholder="Enter a beneficiary address"
                                        value={this.state.beneficiary}
                                        onChange={this.handleInputChange} 
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label htmlFor="description" md={2}>Description</Label>
                                <Col md={10}>
                                    <Input type="textarea" 
                                        rows="6" 
                                        id="description" 
                                        name="description" 
                                        placeholder="Description"
                                        value={this.state.description}
                                        onChange={this.handleInputChange} 
                                    />

                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col md={{size:10, offset:2}}>
                                    <Button type="submit" color="primary" >Submit</Button>
                                </Col>
                            </FormGroup>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
    
}

export default NewStore;