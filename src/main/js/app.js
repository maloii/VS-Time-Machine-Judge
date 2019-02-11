'use strict';
import React from 'react';
//import moment from 'moment';
import ReactDOM from 'react-dom';
import SideBar from './components/sidebar'
import SelectConnecor from './components/selectconnecor'
import 'bootstrap/dist/css/bootstrap.css';
import { Navbar, NavbarBrand} from "reactstrap";
import {LogoutIcon} from 'mdi-react';


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedInJadge: this.props.loggedInJadge,
        }
    }



    render() {
        return (
            <div>
                <Navbar color="light" light className="shadow">
                    <NavbarBrand href="/" className="mr-auto">VS Time Machine Judge</NavbarBrand>
                    <a href="/logout"><LogoutIcon/></a>
                </Navbar>
                <SideBar idContainer="mainContainer"/>
                <div id="mainContainer" className="mainContainer">
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App loggedInJadge={document.getElementById('judge_name').value}/>,
    document.getElementById('react')
);
ReactDOM.render(
    <SelectConnecor/>,
    document.getElementById('button_footer_field')
);