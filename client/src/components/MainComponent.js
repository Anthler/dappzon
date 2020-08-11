import React, { Component } from "react";
import StoreFactory from "../contracts/StoreFactory.json";
import { Route, Switch, Redirect } from "react-router-dom";
import MetamaskAlert from "./MetamaskAlert";
import Header from "./HeaderComponent";
import Home from "./HomeComponent";
import NewStore from "./NewStore";
import StoreOwner from "./StoreOwnerComponent";
import SuperAdmin from "./SuperAdminComponent";
import Orders from "./OrdersComponent";
import StoreDetails from "./StoreDetails";
import { loadWeb3 } from "../utils/init";

const deployed_rinkeby_address = "0x8aCee4b809B0001296bAD17dbF50f0E699058479";

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
  }
}

export default Main;
