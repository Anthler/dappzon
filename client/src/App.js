import React, { Component } from "react";
import getWeb3 from "./utils/getWeb3";
import {loadWeb3, loadBlockchainData} from "./utils/getWeb3";
import StoreFactory from "./contracts/StoreFactory.json";
import Main from "./components/MainComponent";
import { BrowserRouter} from "react-router-dom";

import "./App.css";

class App extends Component {

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StoreFactory.networks[networkId];
      const instance = new web3.eth.Contract(
        StoreFactory.abi,
        deployedNetwork && deployedNetwork.address,
      );

      //await instance.methods.getMyStores().call()
        // .on('error', err=> console.log(err.message))
        // .on('data', data=> console.log(data))
      //console.log(myStores);

    } catch (error) {

    }
  };

  render() {
    return (
        <BrowserRouter>
        <div className="App">
          <Main />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
