'use strict';
import React from 'react';
import {WindowMaximizeIcon} from "mdi-react";
import stompClient from "../../websocket_listener";
import VSConsole from './vs_console';


class VSStatusField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lastCli:'',
            lastNumberTransponder:''
        }
        this.showConsole = this.showConsole.bind(this);
        this.refresConsoleLog = this.refresConsoleLog.bind(this);
        this.clearLastNumberTransponder = this.clearLastNumberTransponder.bind(this);

        this.dialogConsole = React.createRef();
    }

    clearLastNumberTransponder(){
        this.setState({
            lastNumberTransponder:''
        });
    }
    refresConsoleLog(parameters) {
        let lastNumberTransponder = this.state.lastNumberTransponder;
        let cliStr = parameters.body;
        if(cliStr.indexOf('lap')>=0){
            let cliStrArr = cliStr.split(':');
            if(cliStrArr.length > 1){
                let cliStrArrData =  cliStrArr[1].split(',');
                if(cliStrArrData.length > 2){
                    lastNumberTransponder = ' -=['+cliStrArrData[2]+']=-';
                    setTimeout(this.clearLastNumberTransponder, 3000);
                }
            }
        }
        this.dialogConsole.current.addLog(parameters.body);
        this.setState({
            lastCli: parameters.body,
            lastNumberTransponder:lastNumberTransponder
        });
    }
    componentDidMount() {
        this.stomp = stompClient.register([
            {route: '/topic/vsConsoleLog', callback: this.refresConsoleLog}

        ]);
    }
    componentWillUnmount(){
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }
    showConsole(){
        this.dialogConsole.current.toggle();
    }

    render(){

        return(
            <div>
                <VSConsole ref={this.dialogConsole} />
                <WindowMaximizeIcon onClick={this.showConsole}
                                    style={{cursor:'pointer'}} />
                <span style={{minWidth:'200px !important'}}>{this.state.lastCli}</span>|
                <span>{this.state.lastNumberTransponder}</span>
            </div>
        );
    }
}

export default VSStatusField;