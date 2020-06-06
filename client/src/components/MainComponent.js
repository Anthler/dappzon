import React, { Component } from "react";
import StoreFactory from "../contracts/StoreFactory.json";
import { BrowserRouter} from "react-router-dom";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";

import Web3 from "web3";
import MetamaskAlert from "./MetamaskAlert";
import Header from "./HeaderComponent";
import Home from "./HomeComponent";
import NewStore from "./NewStore";
import StoreOwner from "./StoreOwnerComponent";
import SuperAdmin from "./SuperAdminComponent";
import Orders from "./OrdersComponent";
import StoreDetails from "./StoreDetails";
import { loadWeb3, loadBlockchainData } from "../utils/init";
import getWeb3 from "../utils/getWeb3";

class Main extends Component {
  state = { 
    web3: null, 
    account: '', 
    instance: null, 
    metamaskInstalled: false,
    loading: false,
    stores: [], 
  };

  componentDidMount = async () => {
    try {
      let instance, account, web3;
      const metamaskInstalled = typeof(window.web3) !== 'undefined' ;
      this.setState({metamaskInstalled});

      if(metamaskInstalled){
          loadWeb3();
          web3 = window.web3;
          account = await web3.currentProvider.selectedAddress
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = StoreFactory.networks[networkId];
          instance = new web3.eth.Contract(
          StoreFactory.abi,deployedNetwork && deployedNetwork.address
        )
      }
      const stores = await instance.methods.getAllStores().call()
      this.setState({instance, web3: window.web3,account, stores})
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  render() {
    
    if (!this.state.metamaskInstalled) {
      return (<MetamaskAlert />)
    }

    const SelectedStore = ({match}) =>{
      return(
        <StoreDetails store={this.state.stores.filter((address) => address === match.params.address)[0]} 
          address={match.params.address}/>
      )
    }

    const SelectedStoreOrders = ({match}) =>{
      return(
        <Orders store={this.state.stores.filter((address) => address === match.params.address)[0]} 
          address={match.params.address}/>
      )
    }
    return (
      <div className="">
        <Header />
        <Switch>
            <Route path="/home" component={ () => <Home stores = {this.state.stores} />} />
            <Route path="/newstore" exact component={NewStore} />
            <Route exact path="/mystores" component={StoreOwner} />
            <Route path="/admin" component={SuperAdmin} />
            <Route path="/mystores/:address/orders" component={SelectedStoreOrders} />
            <Route exact path="/stores/:address" component={SelectedStore} />
            <Redirect to="/home" />
        </Switch>
      </div>
    );
   // }
  }
}

export default Main;
