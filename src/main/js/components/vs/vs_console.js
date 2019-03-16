'use strict';
import React from 'react';
import ReactDOM from "react-dom";


class VSConsole extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            consoleLog:[]
        }
        this.toggle = this.toggle.bind(this);
        this.addLog = this.addLog.bind(this);
    }

    toggle() {
        this.setState({
            consoleShow: !this.state.consoleShow
        });
    }
    addLog(log){
        var copyConsoleLog = Object.assign([], this.state.consoleLog);

        if(copyConsoleLog.length > 100){
            copyConsoleLog.shift();
        }
        copyConsoleLog.push(log);
        this.setState({
            consoleLog:copyConsoleLog
        })
        var consoleDiv = ReactDOM.findDOMNode(this.componentRefConsole);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
    render() {
        let console = [];
        this.state.consoleLog.map(log=>{
            console.push(<div>{log}</div>)
            });

        return (
            <div className="console modal-content"
                 style={{position: 'absolute',
                        width: '500px',
                        display:(this.state.consoleShow?'block':'none')}}>
                <div ref={el => (this.componentRefConsole = el)} className="console_data">
                {console}
                </div>
            </div>
        );
    }
}
export default VSConsole;
