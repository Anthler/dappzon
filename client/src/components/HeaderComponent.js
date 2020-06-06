import React, {Component  } from "react";
import {Navbar, Nav, NavbarToggler, NavItem, Collapse, Jumbotron,} from "reactstrap";
import { NavLink } from "react-router-dom";

class Header extends Component{

    state = {
        navbarIsOpen: false,
    }

    toggleNavbar = () => {
        this.setState({navbarIsOpen: !this.state.navbarIsOpen} )
    }

    render(){
        return(
            <React.Fragment>
                <Navbar dark expand="md">
                    <div className="container">
                        <NavbarToggler onClick={this.toggleNavbar} />
                        <Collapse navbar isOpen={this.state.navbarIsOpen}>
                        <Nav navbar >
                            <NavItem>
                                <NavLink className="nav-link" to="/home">
                                    Home
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/mybounties" >
                                    Stores
                                </NavLink>
                            </NavItem>
                            <NavItem>
                            </NavItem>

                            <NavItem>
                                <NavLink className="nav-link" to="/newstore" >
                                    New Store
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink className="nav-link" to="/mystores" >
                                    My Stores
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/admin" >
                                    Admin
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                    </div>
                </Navbar>
                <Jumbotron>
                    <div className="container" >
                        <div className="row row-header">
                            <div className="col-12 col-sm-6">
                                <h2 style={{color: "#5e5d5d"}}>DAPPY MALL</h2>
                                <p style={{color: "#775dba"}}>Shop From Your Favorite Shops Online With ERC20 Tokens & Ether</p>
                                {/* <p style={{color: "#565454"}}>By Any Product From Any Shop Using ERC20 Tokens and Ether</p> */}
                            </div>
                        </div>
                    </div>
                </Jumbotron>
                
            </React.Fragment>
        )
    }
}

export default Header;