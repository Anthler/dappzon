import StoreFactory from "../contracts/StoreFactory.json";
import Web3 from "web3";

export async function loadBlockchainData(){
      const web3 = window.web3
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StoreFactory.networks[networkId];
      return new web3.eth.Contract(
        StoreFactory.abi,
        deployedNetwork && deployedNetwork.address
      );
  }

export async function loadWeb3(){
      if(window.ethereum){
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
      }
      else if (window.web3){
         window.web3 = new Web3(window.web3.currentProvider);
      }
      else{
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
        window.web3  = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
      }
  }