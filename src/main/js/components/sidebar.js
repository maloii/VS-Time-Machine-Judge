'use strict';
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AccountGroupIcon, AnimationIcon, SettingsIcon, VideoVintageIcon } from 'mdi-react'

import './side_bar_menu.css'
import Sportsmen from './sportsmen'
import Rounds from './rounds'
import Reports from './reports'
import Broadcast from './broadcast'

class SideBar extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            loggedInJadge: this.props.loggedInJadge
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount () {
        let hash = window.location.hash;
        if (hash.indexOf('#') >= 0) {
            this.handleSelect(hash.substring(1));
        } else {
            this.handleSelect('sportsmans');
            window.location = '#sportsmans';
        }
    }

    handleSelect (idMenu) {
        const { store } = this.props;
        let mainContainer = document.getElementById(this.props.idContainer);
        if (idMenu === 'sportsmans') {
            ReactDOM.render(
                <Provider store={store}>
                    <Sportsmen loggedInJadge={this.state.loggedInJadge} />
                </Provider>,
                mainContainer);
        } else if (idMenu === 'rounds') {
            ReactDOM.render(
                <Provider store={store}>
                    <Rounds loggedInJadge={this.state.loggedInJadge} />
                </Provider>,
                mainContainer);
        } else if (idMenu === 'reports') {
            ReactDOM.render(
                <Provider store={store}>
                    <Reports />
                </Provider>,
                mainContainer);
        } else if (idMenu === 'broadcast') {
            ReactDOM.render(
                <Provider store={store}>
                    <Broadcast />
                </Provider>,
                mainContainer);
        }
    }

    render () {
        return (<>
                <nav id="menuVertical" >
                    <ul>
                        <li onClick={this.handleSelect.bind(null, 'sportsmans')} id="sportsmans">
                            <a href="#sportsmans" ><div className="img_n"><AccountGroupIcon/></div><span>Sportsmans</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, 'rounds')} id="rounds">
                            <a href="#rounds" ><div className="img_n"><AnimationIcon /></div><span>Rounds</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, 'reports')} id="reports">
                            <a href="#reports" ><div className="img_n"><SettingsIcon /></div><span>Reports</span></a>
                        </li>
                        <li onClick={this.handleSelect.bind(null, 'broadcast')} id="broadcast">
                            <a href="#broadcast" ><div className="img_n"><VideoVintageIcon /></div><span>Broadcast</span></a>
                        </li>
                    </ul>
                </nav>
                <div className="menu" />
            </>
        );
    }
}

export default SideBar;
