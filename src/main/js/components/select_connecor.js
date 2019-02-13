'use strict';

import React from "react";
import client from "../client";
import ReactDOM from "react-dom";
import {
    Button,
    Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader
} from "reactstrap";
import stompClient from "../websocket_listener";


let isConnect = false;

class DialogWlanConnect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalWlanConnect: false
        };
        this.handleConnect = this.handleConnect.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    handleConnect() {
        client({
            method: 'POST',
            path: '/api/hardware/connect',
            entity: {
                type: 'WLAN',
                subnet: ReactDOM.findDOMNode(this.refs['subnet']).value.trim(),
                potr_receive: ReactDOM.findDOMNode(this.refs['potr_receive']).value.trim(),
                potr_send: ReactDOM.findDOMNode(this.refs['potr_send']).value.trim(),
            },
            headers: {'Content-Type': 'application/json'}
        }).done(response => {
            isConnect = response.entity.status === 'STATUS_OK';
            console.log(response);
        });
        this.toggle();

    }

    toggle() {
        this.setState({
            modalWlanConnect: !this.state.modalWlanConnect
        });
    }

    render() {
        return (
            <Modal isOpen={this.state.modalWlanConnect} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>Settings WLAN connection</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup row>
                            <Label for="subnet" sm={3}
                                   style={{maxWidth: 110 + 'px', paddingRight: 0 + '0px'}}>Subnet:</Label>
                            <Col sm={5}>
                                <InputGroup>
                                    <Input name="subnet" ref="subnet" className="text-right" placeholder="subnet"
                                           defaultValue="192.168.1"/>
                                    <InputGroupAddon addonType="append">.255</InputGroupAddon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="potr_receive" md={3} style={{maxWidth: 110 + 'px', paddingRight: 0 + '0px'}}>Port
                                receive:</Label>
                            <Col sm={3}>
                                <Input type="text" name="potr_receive" className="text-center" ref="potr_receive"
                                       placeholder="Port to" defaultValue="8888"/>
                            </Col>
                            <Label for="potr_send" md={3} style={{maxWidth: 95 + 'px', paddingRight: 0 + '0px'}}>Port
                                send:</Label>
                            <Col sm={3}>
                                <Input type="text" name="potr_send" className="text-center" ref="potr_send"
                                       placeholder="Port to" defaultValue="8889"/>
                            </Col>
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.toggle}>
                        Close
                    </Button>
                    <Button color="primary" onClick={this.handleConnect}>
                        Connect
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}


class Select_connecor extends React.Component {
    constructor(props) {
        super(props);
        this.dialogWlanConnect = React.createRef();
        this.state = {
            listComPorts: [],
            btnDropConnector: false,
            statusConnect: isConnect,
            consoleLineFooter: ''

        };

        this.onSelectComPort = this.onSelectComPort.bind(this);
        this.refresListComPorts = this.refresListComPorts.bind(this);
        Select_connecor.refresConsoleLog = Select_connecor.refresConsoleLog.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.vsConnectStatus = this.vsConnectStatus.bind(this);
    }


    refresListComPorts() {
        client({method: 'GET', path: '/api/hardware/list_com_ports'}).done(response => {
            isConnect = (response.entity.status === 'STATUS_CONNECT');
            this.setState({
                listComPorts: response.entity.list,
                statusConnect: isConnect
            });

            console.log(response);
        });
    }

     static refresConsoleLog(parameters) {
         document.getElementById('status_footer_field').innerText = parameters.body;
    }

    vsConnectStatus(message) {
        isConnect = (message.body === 'STATUS_CONNECT');
        this.setState({statusConnect: isConnect});
    }

    componentDidMount() {
        this.refresListComPorts();
        stompClient.register([
            {route: '/topic/updateListComPorts', callback: this.refresListComPorts},
            {route: '/topic/vsConsoleLog', callback: Select_connecor.refresConsoleLog},
            {route: '/topic/vsConnectStatus', callback: this.vsConnectStatus}

        ]);
    }

    onSelectComPort(e) {
        if (e.currentTarget.textContent === "WLAN") {
            this.dialogWlanConnect.current.toggle();
        } else {
            client({
                method: 'POST',
                path: '/api/hardware/connect',
                entity: {
                    type: 'COM_PORT',
                    port: e.currentTarget.textContent
                },
                headers: {'Content-Type': 'application/json'}
            }).done(response => {
                isConnect = (response.entity.status === 'STATUS_OK');
                this.setState({statusConnect: isConnect});
            });
        }

    }

    onDisconnect() {
        client({
            method: 'POST',
            path: '/api/hardware/disconnect',
            headers: {'Content-Type': 'application/json'}
        }).done(response => {
            isConnect = !(response.entity.status === 'STATUS_OK');
            this.setState({statusConnect: isConnect});
        });
    }

    render() {
        const items = this.state.listComPorts.map(port =>
            <DropdownItem id={port} key={port} onClick={this.onSelectComPort}>{port}</DropdownItem>);

        const connect = <>
            <DialogWlanConnect ref={this.dialogWlanConnect}/>
            <Dropdown className="py-2" size="sm" direction="up" isOpen={this.state.btnDropConnector} toggle={() => {
                this.setState({btnDropConnector: !this.state.btnDropConnector});
            }}>
                <DropdownToggle color="danger" caret>
                    Select a connection method
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem header>Network</DropdownItem>
                    <DropdownItem id="WLAN" key="WLAN" onClick={this.onSelectComPort}>WLAN</DropdownItem>
                    <DropdownItem divider/>
                    <DropdownItem header>USB</DropdownItem>
                    {items}
                </DropdownMenu>
            </Dropdown>
        </>;
        const disconnect = <>
            <Button outline color="primary" size="sm" style={{marginTop: 8 + 'px'}}
                    onClick={this.onDisconnect}>Disconnect</Button>
        </>;

        return (this.state.statusConnect ? disconnect : connect);
    };
}


export default Select_connecor;