'use strict';
import React from 'react';
import ReactDOM from "react-dom";
import {Label, Input, Row, Col, Container, Button} from "reactstrap";


class VSConsole extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            consoleLog:[],
            showPing: false
        }
        this.toggle = this.toggle.bind(this);
        this.addLog = this.addLog.bind(this);
        this.clear = this.clear.bind(this);
        this.checkShowPing = this.checkShowPing.bind(this);
    }

    clear(){
        this.setState({
            consoleLog:[]
        })
    }
    checkShowPing(){
        this.setState({
            showPing: ReactDOM.findDOMNode(this.refs['show_ping']).checked
        });
    }
    toggle() {
        this.setState({
            consoleShow: !this.state.consoleShow
        });
    }
    addLog(log){
        if(!this.state.showPing &&  log.indexOf('ping')>=0) return;

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
        this.state.consoleLog.map((log, indx)=>{

            let color = (log.indexOf('<<==')>=0)?'#85b5c7':'#4cd656';
            console.push(<div key={indx} style={{color:color}}>{log}</div>)
            });

        return (
            <div className="console modal-content"
                 style={{position: 'absolute',
                        width: '500px',
                        display:(this.state.consoleShow?'block':'none')}}>
                <div ref={el => (this.componentRefConsole = el)} className="console_data">
                {console}
                </div>
                <Container fluid>
                    <Row>
                        <Col sm={6} style={{paddingLeft: '20px'}}>
                            <Label check>
                                <Input type="checkbox"
                                       ref="show_ping"
                                       onChange={this.checkShowPing}
                                       defaultChecked={this.state.showPing}/>{' '}Show ping
                            </Label>
                        </Col>
                        <Col className="d-flex" sm={6}>
                            <Button color="primary"  className="ml-auto" onClick={this.clear}>
                                Clear
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
export default VSConsole;
