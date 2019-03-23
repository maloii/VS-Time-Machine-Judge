'use strict';

import React from "react";
import {
    Button,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import ReactDOM from "react-dom";
import client from "../../client";
import Global from "../../global";
import follow from "../../follow";
import Settings from "../../settings";


class ModalNewBroadcast extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            invalidName: false,
            url: null,
            reports:[],
            reportUrl:'',
            broadcast: {
                typeBroadcast: 'REPORT_BROADCAST_FULL',
            }
        }

        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleTypeBroadcast = this.handleTypeBroadcast.bind(this);

    }
    toggle() {
        this.setState({
            modalBroadcast: !this.state.modalBroadcast
        });
    }
    toggleShow(url) {
        if (Global.competition !== null) {
            client({
                method: 'GET',
                path: Global.competition._links.reports.href
            }).then(reports => {
                if (url != null) {
                    client({
                        method: 'GET',
                        path: url
                    }).then(broadcast => {
                        if(broadcast.entity.typeBroadcast === 'REPORT_BROADCAST_FULL' ||
                            broadcast.entity.typeBroadcast === 'REPORT_BROADCAST_SHORT'){
                            client({
                                method: 'GET',
                                path: broadcast.entity._links.report.href
                            }).then(reports => {
                                this.setState({
                                    reportUrl:reports.entity._links.self.href
                                });
                            });
                        }
                        this.setState({
                            reports:reports.entity._embedded.reports,
                            broadcast: broadcast.entity,
                            modalBroadcast: !this.state.modalBroadcast,
                            url:url
                        });
                    });
                }else{

                    this.setState({
                        reports:reports.entity._embedded.reports,
                        modalBroadcast: !this.state.modalBroadcast,
                        invalidName: false,
                        url:url,
                        broadcast: {
                            typeBroadcast: 'REPORT_BROADCAST_FULL'
                        }
                    });

                }
            });
        }

    }

    handleTypeBroadcast(){
        let broadcast = Object.assign({}, this.state.broadcast);
        broadcast.typeBroadcast = ReactDOM.findDOMNode(this.refs['typeBroadcast']).value.trim();
        this.setState({
            broadcast: broadcast
        });
    }

    handleSave() {
        let name = ReactDOM.findDOMNode(this.refs['name']);
        if(name.value.trim() === '') {
            this.setState({
                invalidName: true
            });
            return;
        }

        const newBroadcast = {
            name: name.value.trim(),
            typeBroadcast: ReactDOM.findDOMNode(this.refs['typeBroadcast']).value.trim(),
            competition: Global.competition._links.competition.href
        };
        if(this.refs['report']){
            newBroadcast.report = ReactDOM.findDOMNode(this.refs['report']).value.trim()
        }

        follow(client, Settings.root, ['broadcasts']).then(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newBroadcast,
                headers: {'Content-Type': 'application/json'}
            })
        });
        this.toggle();
    }
    handleUpdate(){
        let name = ReactDOM.findDOMNode(this.refs['name']);
        if(name.value.trim() === '') {
            this.setState({
                invalidName: true
            });
            return;
        }
        var copyBroadcast = Object.assign({}, this.state.broadcast);
        copyBroadcast.name = name.value.trim();

        if(this.refs['report']){
            copyBroadcast.report = ReactDOM.findDOMNode(this.refs['report']).value.trim()
        }
        client({
            method: 'PUT',
            path: this.state.broadcast._links.self.href,
            entity: copyBroadcast,
            headers: {'Content-Type': 'application/json'}
        }).then(()=>{
            if(this.refs['report']) {
                client({
                    method: 'PUT',
                    path: this.state.broadcast._links.report.href,
                    entity: copyBroadcast.report,
                    headers: {
                        'Accept': 'text/uri-list',
                        'Content-Type': 'text/uri-list'
                    }
                }).then(() => {
                    this.toggle();
                })
            }else{
                this.toggle();
            }
        })
    }
    handleDelete(){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: this.state.broadcast._links.self.href}).done(response=>this.toggle())
        }
    }
    render(){
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New screen';
        if (this.state.broadcast.id != null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit screen';
        }
        let params = [];
        if(this.state.broadcast.typeBroadcast === 'REPORT_BROADCAST_FULL' ||
            this.state.broadcast.typeBroadcast === 'REPORT_BROADCAST_SHORT'){
            let reports = [];
            this.state.reports.map(report=>{
                reports.push(<option key={report._links.self.href} value={report._links.self.href}>{report.name}</option>)
            })
            params.push(<Row key="report">
                <Col>
                    <FormGroup row>
                        <Label for="report" sm={4}>Report</Label>
                        <Col sm={8}>
                            <Input type="select"
                                   key={'report'+this.state.reportUrl}
                                   name="report"
                                   id="report"
                                   ref="report"
                                   defaultValue={this.state.reportUrl}>
                                {reports}
                            </Input>
                        </Col>
                    </FormGroup>
                </Col>
            </Row>);

        }
        return(<Modal isOpen={this.state.modalBroadcast} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>{header}</ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col>
                            <FormGroup row>
                                <Label for="name" sm={4}>Name</Label>
                                <Col sm={8}>
                                    <Input
                                        invalid={this.state.invalidName}
                                        type="text"
                                        name="name"
                                        id="name"
                                        ref="name"
                                        defaultValue={this.state.broadcast.name}/>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup row>
                                <Label for="typeRound" sm={4}>Type report</Label>
                                <Col sm={8}>
                                    <Input type="select"
                                           name="typeBroadcast"
                                           id="typeBroadcast"
                                           ref="typeBroadcast"
                                           onChange={this.handleTypeBroadcast}
                                           defaultValue={this.state.broadcast.typeBroadcast}>
                                        <option value="REPORT_BROADCAST_FULL">REPORT BROADCAST FULL</option>
                                        <option value="REPORT_BROADCAST_SHORT">REPORT BROADCAST SHORT</option>
                                        <option value="CURRENT_GROUP_PRESENT">CURRENT GROUP PRESENT</option>
                                        <option value="CURRENT_GROUP_TELEMETRY">CURRENT GROUP TELEMETRY</option>
                                        {/*<option value="CURRENT_SPORTSMAN_PRESENT">CURRENT SPORTSMAN PRESENT</option>*/}
                                        {/*<option value="CURRENT_SPORTSMAN_TELEMETRY">CURRENT SPORTSMAN TELEMETRY</option>*/}
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    {params}
                </Container>
            </ModalBody>
            <ModalFooter>
                {deleteButton}
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
                {submit}
            </ModalFooter>
        </Modal>)
    }
}

export default ModalNewBroadcast;