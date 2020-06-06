import React, { Component } from "react";
import getWeb3 from "../utils/getWeb3";
import Store from "../contracts/Store.json";
import { loadWeb3 } from "../utils/init";
import { Table } from "reactstrap";

class Orders extends Component{

    state = {
        contract: null,
        orders: [],
        loading: null,
        web3: null,
        account: ''
    }

    componentDidMount = async () => {
        let web3, account,instance;
        loadWeb3();
        web3 = window.web3;
        account = await web3.currentProvider.selectedAddress
        instance = new window.web3.eth.Contract(
        Store.abi,this.props.address)
        const ordersCount = await instance.methods.ordersCount().call();
        let orders = [];
        for(let i = 1; i <= ordersCount; i++){
            const order = await instance.methods.orders(i).call();
            orders.push(order);
        }
        this.setState({orders}) 
    }

    render(){
        return(
            <div className="container">
                <div className="row mb-5">
                    <div className="col-md-5 offset-4">
                        <h2>Orders</h2>
                    </div>
                </div>

                <div className="row">
                    <Table>
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Product ID</th>
                            <th>Quantity</th>
                            <th>ETH Amount</th>
                            <th>Date</th>
                            <th>Status</th>

                            </tr>
                        </thead>
                        <tbody>
                        {
                            
                            this.state.orders.map(order => {
                                const d = new Date(Number(order.datePurchased)*1000);
                                const toDate = d.getDate();
                                const toMonth = d.getMonth();
                                const toYear = d.getFullYear();
                                const orderedAt = toDate + ' / '+ toMonth + ' / ' + toYear
                                
                                return(
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.productId}</td>
                                        <td>{order.productQuantity}</td>
                                        <td>{window.web3.utils.fromWei(order.amountPaid)}</td>
                                        <td>{ orderedAt }</td>
                                        <td style={{color: 'green'}}>{
                                            Number(order.status) === 0 ? 'Recieved'
                                            : Number(order.status) === 1 ? 'Processing'
                                            : Number(order.status) === 2 ? 'Delivered'
                                            : Number(order.status) === 3 ? 'Cancelled': 'Unknown'
                                        }</td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }
}

export default Orders;