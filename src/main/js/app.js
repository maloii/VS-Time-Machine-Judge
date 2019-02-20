'use strict';
import React from 'react';
//import moment from 'moment';
import ReactDOM from 'react-dom';
import SideBar from './components/sidebar'
import Select_connecor from './components/select_connecor'
import 'bootstrap/dist/css/bootstrap.css';
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavLink} from "reactstrap";
import {LogoutIcon} from 'mdi-react';
import SelectCompetition from "./components/select_competition";


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedInJadge: this.props.loggedInJadge,
            isOpen: false
        }

        this.appRef = React.createRef();
        this.toggle = this.toggle.bind(this);
        this.setCompetition = this.setCompetition.bind(this);
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    setCompetition(competition){
        this.setState({
            competition: competition
        });
    }


    render() {
        return (
            <div>
                <Navbar color="light"  light expand="md" className="shadow">
                    <NavbarBrand href="/" className="mr-auto">VS Time Machine Judge</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <SelectCompetition />
                            <NavLink href="/logout"><LogoutIcon/></NavLink>
                        </Nav>
                    </Collapse>
                </Navbar>
                <SideBar idContainer="mainContainer" loggedInJadge={this.state.loggedInJadge}/>
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
    <Select_connecor/>,
    document.getElementById('button_footer_field')
);