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
import Global from "../../global";
import follow from "../../follow";
import client from "../../client";
import Settings from "../../settings";

class ModalNewReport extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            invalidName: false,
            url: null,
            report: {
                typeReport: 'BEST_LAP',
                parametrs:{}
            }
        }

        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleTypeRound = this.handleTypeRound.bind(this);

    }

    toggle() {
        this.setState({
            modalReport: !this.state.modalReport
        });
    }
    handleTypeRound(){
        let report = Object.assign({}, this.state.report);
        report.typeReport = ReactDOM.findDOMNode(this.refs['typeReport']).value.trim();
        this.setState({
            report: report
        });
    }
    toggleShow(url) {
        if (url != null) {
            client({
                method: 'GET',
                path: url
            }).then(report => {
                this.setState({
                    report: report.entity,
                    modalReport: !this.state.modalReport
                });
            });
        }else{
            this.setState({
                modalReport: !this.state.modalReport,
                invalidName: false,
                report: {
                    typeReport: 'BEST_LAP',
                    parametrs:{}
                }
            });
        }

    }

    handleSave() {
        let parametrs = {};
        let name = ReactDOM.findDOMNode(this.refs['name']);
        if(name.value.trim() === '') {
            this.setState({
                invalidName: true
            });
            return;
        }
        if(this.refs['TYPE_ROUND']){
            parametrs.TYPE_ROUND = ReactDOM.findDOMNode(this.refs['TYPE_ROUND']).value.trim()
        }
        if(this.refs['COUNT_LAP']){
            parametrs.COUNT_LAP = ReactDOM.findDOMNode(this.refs['COUNT_LAP']).value.trim()
        }
        if(this.refs['SUM_ROUNDS']){
            parametrs.SUM_ROUNDS = ReactDOM.findDOMNode(this.refs['SUM_ROUNDS']).value.trim()
        }
        if(this.refs['NOT_COUNTED_ROUNDS']){
            parametrs.NOT_COUNTED_ROUNDS = ReactDOM.findDOMNode(this.refs['NOT_COUNTED_ROUNDS']).value.trim()
        }

        const newReport = {
            name: name.value.trim(),
            typeReport: ReactDOM.findDOMNode(this.refs['typeReport']).value.trim(),
            parametrs: parametrs,
            competition: Global.competition._links.competition.href
        };
        follow(client, Settings.root, ['reports']).then(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newReport,
                headers: {'Content-Type': 'application/json'}
            }).then(round=>{
                console.log(round);
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
        var copyReport = Object.assign({}, this.state.report);
        copyReport.name = name.value.trim();
        if(this.refs['TYPE_ROUND']){
            copyReport.parametrs.TYPE_ROUND = ReactDOM.findDOMNode(this.refs['TYPE_ROUND']).value.trim()
        }
        if(this.refs['COUNT_LAP']){
            copyReport.parametrs.COUNT_LAP = ReactDOM.findDOMNode(this.refs['COUNT_LAP']).value.trim()
        }
        if(this.refs['SUM_ROUNDS']){
            copyReport.parametrs.SUM_ROUNDS = ReactDOM.findDOMNode(this.refs['SUM_ROUNDS']).value.trim()
        }
        if(this.refs['NOT_COUNTED_ROUNDS']){
            copyReport.parametrs.NOT_COUNTED_ROUNDS = ReactDOM.findDOMNode(this.refs['NOT_COUNTED_ROUNDS']).value.trim()
        }
        client({
            method: 'PUT',
            path: this.state.report._links.self.href,
            entity: copyReport,
            headers: {'Content-Type': 'application/json'}
        }).done(response=>this.toggle())
    }
    render(){
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New report';
        if (this.state.report.id != null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit report';
        }
        let params = [];
        let typeRounds = <Row key="TYPE_ROUND">
                            <Col>
                                <FormGroup row>
                                    <Label for="TYPE_ROUND" sm={4}>Type round</Label>
                                    <Col sm={8}>
                                        <Input type="select"
                                               name="TYPE_ROUND"
                                               id="TYPE_ROUND"
                                               ref="TYPE_ROUND"
                                               defaultValue={this.state.report.parametrs.TYPE_ROUND}>
                                            <option value="PRACTICE">PRACTICE</option>
                                            <option value="QUALIFICATION">QUALIFICATION</option>
                                            <option value="ALL">ALL</option>
                                        </Input>
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>;
        if(this.state.report.typeReport === 'BEST_LAP'){
            params.push(typeRounds);
            params.push(<Row key="COUNT_LAP">
                            <Col>
                                <FormGroup row>
                                    <Label for="COUNT_LAP" sm={4}>Number of laps in a row</Label>
                                    <Col sm={8}>
                                        <Input type="select"
                                               name="COUNT_LAP"
                                               id="COUNT_LAP"
                                               ref="COUNT_LAP"
                                               defaultValue={this.state.report.parametrs.COUNT_LAP}>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </Input>
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>);
            params.push(<Row key="SUM_ROUNDS">
                <Col>
                    <FormGroup row>
                        <Label for="SUM_ROUNDS" sm={4}>Sum of the best results from rounds</Label>
                        <Col sm={8}>
                            <Input type="select"
                                   name="SUM_ROUNDS"
                                   id="SUM_ROUNDS"
                                   ref="SUM_ROUNDS"
                                   defaultValue={this.state.report.parametrs.SUM_ROUNDS}>
                                <option value="NONE">NONE</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </Input>
                        </Col>
                    </FormGroup>
                </Col>
            </Row>);
        }else if(this.state.report.typeReport === 'COUNT_LAPS'){
            params.push(typeRounds);
            params.push(<Row key="NOT_COUNTED_ROUNDS">
                <Col>
                    <FormGroup row>
                        <Label for="NOT_COUNTED_ROUNDS" sm={4}>Number of failed rounds not counted</Label>
                        <Col sm={8}>
                            <Input type="select"
                                   name="NOT_COUNTED_ROUNDS"
                                   id="NOT_COUNTED_ROUNDS"
                                   ref="NOT_COUNTED_ROUNDS"
                                   defaultValue={this.state.report.parametrs.NOT_COUNTED_ROUNDS}>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </Input>
                        </Col>
                    </FormGroup>
                </Col>
            </Row>);
        }

        return(<Modal isOpen={this.state.modalReport} toggle={this.toggle}>
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
                                        defaultValue={this.state.report.name}/>
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
                                           name="typeReport"
                                           id="typeReport"
                                           ref="typeReport"
                                           onChange={this.handleTypeRound}
                                           defaultValue={this.state.report.typeReport}>
                                        <option value="BEST_LAP">BEST LAP</option>
                                        <option value="COUNT_LAPS">COUNT LAPS</option>
                                        {/*<option value="COUNT_SCORE">COUNT SCORE</option>*/}
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
        </Modal>);
    }
}

export default ModalNewReport;