'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {AccountGroupIcon, AnimationIcon, SettingsIcon} from "mdi-react";

import './side_bar_menu.css';
import {Container} from "reactstrap";
import Sportsmen from "./sportsmen";
import Rounds from "./rounds";
import Reports from "./reports";


class SideBar extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loggedInJadge: this.props.loggedInJadge
        }
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        let hash = window.location.hash;
        if(hash.indexOf("#")>=0) {
            this.handleSelect(hash.substring(1));
        }else{
            this.handleSelect("sportsmans");
            window.location = "#sportsmans"
        }
    }

    handleSelect(idMenu) {
        let mainContainer = document.getElementById(this.props.idContainer);
        if(idMenu === 'sportsmans'){
            ReactDOM.render(
                <Sportsmen loggedInJadge={this.state.loggedInJadge} />,
                mainContainer);
        }else if(idMenu === 'rounds'){
            ReactDOM.render(
                <Rounds loggedInJadge={this.state.loggedInJadge} />,
                mainContainer);
        }else if(idMenu === 'reports'){
            ReactDOM.render(
                <Reports />,
                mainContainer);
        }
    }

    render() {
        return (<>
                <nav id="menuVertical" >
                    <ul>
                        <li onClick={this.handleSelect.bind(null, "sportsmans")} id="sportsmans">
                            <a href="#sportsmans" ><div className="img_n"><AccountGroupIcon/></div><span>Sportsmans</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, "rounds")} id="rounds">
                            <a href="#rounds" ><div className="img_n"><AnimationIcon /></div><span>Rounds</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, "reports")} id="reports">
                            <a href="#reports" ><div className="img_n"><SettingsIcon /></div><span>Reports</span></a>
                        </li>
                    </ul>
                </nav>
                <div className="menu" />
            </>
        );
    }
}

export default SideBar;