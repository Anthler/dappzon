import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import StoreFactory from "../contracts/StoreFactory.json";
import Store from "../contracts/Store.json";
import { loadWeb3, loadBlockchainData } from "../utils/init";
import { Label, Form, Input,Button, Modal, ModalHeader, ModalBody, FormGroup, Col } from "reactstrap";

class SuperAdmin extends Component{

    state = {
        superAdmin: '',
        contract: null,
        newAdmin: '',
        newStoreOwner: '',
        owner: '',
        admin: '',
        isAddAdminModalOpen: false,
        isAddOwnerModalOpen: false
    }

    componentDidMount = async () => {
      loadWeb3()
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StoreFactory.networks[networkId];
      const instance = new web3.eth.Contract(
                StoreFactory.abi,deployedNetwork && deployedNetwork.address
            )
      this.setState({contract:instance, web3, superAdmin:accounts[0]})
    }

    toggleAddAdminModal = () => {
        this.setState({isAddAdminModalOpen: !this.state.isAddAdminModalOpen})
    }

    toggleAddOwner = () => {
        this.setState({isAddOwnerModalOpen: !this.state.isAddOwnerModalOpen})
    }

    handleAddAdminModalSubmit = async (e) =>{
        this.toggleAddAdminModal()
        e.preventDefault();
        const tx = await this.state.contract.methods.addAdmins(this.newAdmin.value).send({from:this.state.superAdmin})
        if(tx){
            window.location.reload()
        }
        
    }

    handleAddOwnerModalSubmit = async (e) =>{
        this.toggleAddOwner()
        e.preventDefault();
        const tx = await this.state.contract.methods.addStoreOwner(this.newStoreOwner.value).send({from:this.state.superAdmin})
        if(tx){
            window.location.reload()
        }
        
    }

    render(){
        return(
            <div className="container">
                <div className="row mb-5">
                    <div className="col-md-3" >
                        <Button onClick={this.toggleAddAdminModal} type="button" color="primary" >New Admin</Button> 
                    </div>
                    <div className="col-md-3" >
                        <Button onClick={this.toggleAddOwner} type="button" color="primary" >Add Store Owner</Button>
                    </div>
                </div>

               <Modal isOpen={this.state.isAddAdminModalOpen} toggle={this.toggleAddAdminModal} >
                    <ModalHeader>Add Admin</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleAddAdminModalSubmit} >
                            <FormGroup>
                                <Label htmlFor="storeOwner">Admin Address</Label>
                                <Input name="newAdmin"
                                    type="text" 
                                    id="newAdmin"
                                    placeholder="Provide new admin's address"
                                    innerRef={(input) => this.newAdmin = input}
                                />
                            </FormGroup>
                            <Button className="btn btn-small btn-success">Submit</Button>
                        </Form>
                    </ModalBody>
                </Modal>
                <Modal isOpen={this.state.isAddOwnerModalOpen} toggle={this.toggleAddOwner} >
                    <ModalHeader>Add Store Owner</ModalHeader>
                    <ModalBody>
                        <Form onSubmit={this.handleAddOwnerModalSubmit} >
                            <FormGroup>
                                <Label htmlFor="newStoreOwner">Store Owner Address</Label>
                                <Input name="newStoreOwner"
                                    type="text" 
                                    id="newStoreOwner"
                                    placeholder="Provide new store owner's address"
                                    innerRef={(input) => this.newStoreOwner = input}
                                />
                            </FormGroup>
                            <Button className="btn btn-small btn-success">Submit</Button>
                        </Form>
                    </ModalBody>
                </Modal>

            </div>
        );
     }
}

export default SuperAdmin;