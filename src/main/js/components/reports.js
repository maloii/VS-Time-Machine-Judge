'use strict';


import React from "react";
import eventClient from "../event_client";
import Global from "../global";
import {Alert, Button, Col, Container, Row, Table} from "reactstrap";
import {AccountPlusIcon, PlaylistEditIcon, DeleteForeverIcon} from "mdi-react";
import ModalNewReport from "./reports/modal_new_report";
import ModalPrintReport from "./reports/modal_print_report"
import client from "../client";
import stompClient from "../websocket_listener";

class Reports extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            reports:[],
            competition: Global.competition
        }

        this.refreshListReports = this.refreshListReports.bind(this);
        this.selectCompetition = this.selectCompetition.bind(this);
        this.modalPrintReport = this.modalPrintReport.bind(this);
        this.showNewReport = this.showNewReport.bind(this);
        this.changeReport = this.changeReport.bind(this);
        this.deleteReport = this.deleteReport.bind(this);

        this.dialogReport = React.createRef();
        this.dialogPrintReport = React.createRef();
    }

    modalPrintReport(report){
        this.dialogPrintReport.current.toggleShow(report);
    }
    showNewReport() {
        this.dialogReport.current.toggleShow();
    }
    changeReport(url){
        this.dialogReport.current.toggleShow(url);
    }
    deleteReport(url){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: url});
        }
    }
    refreshListReports(){
        if (Global.competition !== null) {
            client({
                method: 'GET',
                path: Global.competition._links.reports.href
            }).then(reports => {

                this.setState({
                    reports:reports.entity._embedded.reports
                });
            });
        }
    }
    selectCompetition({competition}) {
        this.setState({
            competition: Global.competition
        });
        this.refreshListReports();
    }
    componentDidMount() {
        this.refreshListReports();
        this.stomp = stompClient.register([
            {route: '/topic/newReport', callback: this.refreshListReports},
            {route: '/topic/updateReport', callback: this.refreshListReports},
            {route: '/topic/deleteReport', callback: this.refreshListReports}
        ]);
    }
    componentWillMount() {
        eventClient.on('SELECT_COMPETITION', this.selectCompetition);
    }

    componentWillUnmount() {
        eventClient.removeEventListener('SELECT_COMPETITION', this.selectCompetition);
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }

    render(){
        if (this.state.competition === null) {
            return (
                <Container>
                    <Alert color="primary">
                        Create and select a competition!
                    </Alert>
                </Container>
            )
        } else {
            let lapsTable = [];
            this.state.reports.map(report => {
                lapsTable.push(<tr key={report.id}>
                    <td>
                        <Button color="link" onClick={() => this.modalPrintReport(report)}>{report.name}</Button>
                    </td>
                    <td style={{width: '50px'}}>
                        <PlaylistEditIcon
                            onClick={() => this.changeReport(report._links.self.href)}
                            style={{cursor: 'pointer'}}/></td>
                    <td style={{width: '50px'}}>
                        <DeleteForeverIcon
                            onClick={() => this.deleteReport(report._links.self.href)}
                            style={{cursor: 'pointer'}}/></td>
                </tr>)
            })
            return (
                <>
                    <ModalPrintReport ref={this.dialogPrintReport}/>
                    <ModalNewReport ref={this.dialogReport}/>
                    <Container fluid>
                        <Row>
                            <Col className="d-flex">
                                <Button color="primary" className="ml-auto" onClick={this.showNewReport}>
                                    Add new report
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex pt-3">
                                <Table bordered striped hover>
                                    <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th style={{width: '50px'}}></th>
                                        <th style={{width: '50px'}}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {lapsTable}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </Container>
                </>
            );
        }
    }
}

export default Reports;