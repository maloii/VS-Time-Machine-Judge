'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import SideBar from './components/sidebar'
import Select_connecor from './components/select_connecor'
import 'bootstrap/dist/css/bootstrap.css';
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavLink} from "reactstrap";
import {LogoutIcon, SettingsOutlineIcon} from 'mdi-react';
import SelectCompetition from './components/select_competition';
import VSStatusField from './components/vs/vs_status_field';
import Global from './global'
import ModalSettings from './components/settings/modal_settings';
import MainScreenBroadcast from './components/broadcast/main_screen_broadcast';
import CurrentGroupGridBroadcast from './components/broadcast/current_group_grid_broadcast';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedInJadge: this.props.loggedInJadge,
            isOpen: false
        }

        this.toggle = this.toggle.bind(this);
        this.setCompetition = this.setCompetition.bind(this);
        this.showSettings = this.showSettings.bind(this);

        this.dialogSettings = React.createRef();
    }
    showSettings(){
        this.dialogSettings.current.toggleShow();
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
    componentDidMount() {
        Global.loggedInJadge = this.state.loggedInJadge;
    }


    render() {
        let height = window.innerHeight-130;
        return (
            <div>
                <ModalSettings ref={this.dialogSettings} />
                <Navbar color="light"  light expand="md" className="shadow">
                    <NavbarBrand href="/" className="mr-auto">VS Time Machine Judge</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <SelectCompetition />
                            <NavLink href="javascript:void(0)" onClick={this.showSettings}><SettingsOutlineIcon/></NavLink>
                            <NavLink href="/logout"><LogoutIcon/></NavLink>
                        </Nav>
                    </Collapse>
                </Navbar>
                <SideBar idContainer="mainContainer" loggedInJadge={this.state.loggedInJadge}/>
                <div id="mainContainer" className="mainContainer" style={{height:height, minHeight:height, overflowY: 'auto'}}>
                </div>
            </div>
        );
    }
}
if(document.getElementById('react')) {
    ReactDOM.render(
        <App loggedInJadge={document.getElementById('judge_name').value}/>,
        document.getElementById('react')
    );
}
if(document.getElementById('status_footer_field')) {
    ReactDOM.render(
        <VSStatusField/>,
        document.getElementById('status_footer_field')
    );
}
if(document.getElementById('button_footer_field')) {
    ReactDOM.render(
        <Select_connecor/>,
        document.getElementById('button_footer_field')
    );
}
if(document.getElementById('main_screen')) {
    ReactDOM.render(
        <MainScreenBroadcast/>,
        document.getElementById('main_screen')
    );
}
if(document.getElementById('current_group_grid_screen')) {
    ReactDOM.render(
        <CurrentGroupGridBroadcast/>,
        document.getElementById('current_group_grid_screen')
    );
}
