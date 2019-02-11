'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {AccountGroupIcon, AnimationIcon, SettingsIcon} from "mdi-react";
import Pilots from './pilots'

import './sideBarMenu.css';
import Container from "reactstrap/es/Container";

class SideBar extends React.Component {

    constructor(props){
        super(props);

        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        let hash = window.location.hash;
        if(hash.indexOf("#")>=0) {
            this.handleSelect(hash.substring(1));
        }else{
            this.handleSelect("pilots");
            window.location = "#pilots"
        }
    }

    handleSelect(idMenu) {
        let mainContainer = document.getElementById(this.props.idContainer);
        if(idMenu === 'pilots'){
            ReactDOM.render(
                <Container>
                    <Pilots />
                </Container>,
                mainContainer);
        }else if(idMenu === 'rounds'){
            ReactDOM.render(
                <Container>
                    Rounds
                </Container>,
                mainContainer);
        }else if(idMenu === 'settings'){
            ReactDOM.render(
                <Container>
                    Settings
                </Container>,
                mainContainer);
        }
    }

    render() {
        return (<>
                <nav id="menuVertical" >
                    <ul>
                        <li onClick={this.handleSelect.bind(null, "pilots")} id="pilots">
                            <a href="#pilots" ><div className="img_n"><AccountGroupIcon/></div><span>Pilots</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, "rounds")} id="rounds">
                            <a href="#rounds" ><div className="img_n"><AnimationIcon /></div><span>Rounds</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, "settings")} id="settings">
                            <a href="#settings" ><div className="img_n"><SettingsIcon /></div><span>Settings</span></a>
                        </li>
                    </ul>
                </nav>
                <div className="menu" />
            </>
        );
    }
}

export default SideBar;