'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {
    Button,
    Card, CardBody,
    CardImg,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import {WithContext as ReactTags} from "../react_tags/ReactTags";
import Global from "../../global";
import follow from "../../follow";
import client from "../../client";
import Settings from "../../settings";


class ModalNewRound extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            round: {},
            rounds:[],
            invalidName: false,
            url: null
        }


        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.toggleEditShow = this.toggleEditShow.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.toggleAutoGenerate = this.toggleAutoGenerate.bind(this);
        this.toggleTypeRace = this.toggleTypeRace.bind(this);
    }
    toggle() {
        this.setState({
            modalRound: !this.state.modalRound,
            invalidName: false
        });
    }

    toggleShow() {
        client({
            method: 'GET',
            path: Global.competition._links.rounds.href
        }).then(rounds => {
            this.setState({
                modalRound: !this.state.modalRound,
                round: {
                    typeRace: 'FIXED_COUNT_LAPS',
                    typeGenerateRound: 'NONE',
                    countLap: 5,
                    maxTimeRace: 180,
                    countSportsmen: 4,
                    fromRoundCopy:0
                },
                rounds:rounds.entity._embedded.rounds.sort((a, b)=>b.sort - a.sort),
                invalidName: false,
                url: null
            });
        });
    }

    toggleEditShow(url) {
        client({
            method: 'GET',
            path: url
        }).then(round=>{
            this.setState({
                round:round.entity,
                modalRound: !this.state.modalRound,
                invalidName: false,
                url: url
            });

        })
    }
    toggleTypeRace(){
        let round = Object.assign({}, this.state.round);
        round.typeRace = ReactDOM.findDOMNode(this.refs['typeRace']).value.trim();
        this.setState({
            round:round
        });
    }
    toggleAutoGenerate(){
        let round = Object.assign({}, this.state.round);
        round.typeGenerateRound = ReactDOM.findDOMNode(this.refs['autoGenerate']).value.trim();
        this.setState({
            round:round
        });
    }
    handleSave() {
        let name = ReactDOM.findDOMNode(this.refs['name']);
        if(name.value.trim() === '') {
            this.setState({
                invalidName: true
            })
            return;
        }
        var copyRound = Object.assign({}, this.state.round);

        copyRound.name = name.value.trim();
        copyRound.typeRound = ReactDOM.findDOMNode(this.refs['typeRound']).value.trim();
        copyRound.typeGenerateRound = ReactDOM.findDOMNode(this.refs['autoGenerate']).value.trim();
        copyRound.sort = this.props.maxSortRound+1;
        copyRound.selected = true;
        copyRound.competition = Global.competition._links.competition.href;

        copyRound.typeRace = ReactDOM.findDOMNode(this.refs['typeRace']).value.trim();
        if(this.refs['countLap'])
            copyRound.countLap = ReactDOM.findDOMNode(this.refs['countLap']).value.trim();
        if(this.refs['maxTimeRace'])
            copyRound.maxTimeRace = ReactDOM.findDOMNode(this.refs['maxTimeRace']).value.trim();
        if(this.refs['countSportsmen'])
            copyRound.countSportsmen = ReactDOM.findDOMNode(this.refs['countSportsmen']).value.trim();
        if(this.refs['fromRoundCopy'])
            copyRound.fromRoundCopy = ReactDOM.findDOMNode(this.refs['fromRoundCopy']).value.trim();

        follow(client, Settings.root, ['rounds']).then(response => {
            return client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: copyRound,
                headers: {'Content-Type': 'application/json'}
            })
        });
        this.toggle();
    }
    handleUpdate() {
        let name = ReactDOM.findDOMNode(this.refs['name']);
        if(name.value.trim() === '') {
            this.setState({
                invalidName: true
            })
            return;
        }
        var copyRound = Object.assign({}, this.state.round);
        copyRound.name = name.value.trim();
        copyRound.typeRound = ReactDOM.findDOMNode(this.refs['typeRound']).value.trim();
        copyRound.typeRace = ReactDOM.findDOMNode(this.refs['typeRace']).value.trim();
        if(this.refs['countLap'])
            copyRound.countLap = ReactDOM.findDOMNode(this.refs['countLap']).value.trim();
        if(this.refs['maxTimeRace'])
            copyRound.maxTimeRace = ReactDOM.findDOMNode(this.refs['maxTimeRace']).value.trim();

        client({
            method: 'PUT',
            path: this.state.url,
            entity: copyRound,
            headers: {'Content-Type': 'application/json'}
        }).done(response=>this.toggle())
    }
    handleDelete(){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: this.state.url}).done(response=>this.toggle())
        }
    }

    render(){
        let autoGenerate = [];
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New round';
        let countInGroup = 4;


        let rowCountLaps = <Row key="rowCountLaps">
                                <Col>
                                    <FormGroup row>
                                        <Label for="name" sm={4}>Count laps</Label>
                                        <Col sm={8}>
                                            <Input
                                                type="number"
                                                name="countLap"
                                                id="countLap"
                                                ref="countLap"
                                                defaultValue={this.state.round.countLap}/>
                                        </Col>
                                    </FormGroup>
                                </Col>
                            </Row>;
        let rowMaxTimeRace = <Row key="rowMaxTimeRace">
                                <Col>
                                    <FormGroup row>
                                        <Label for="name" sm={4}>{this.state.round.typeRace === 'FIXED_COUNT_LAPS'?'Max time race':'Time race'}(sec)</Label>
                                        <Col sm={8}>
                                            <Input
                                                type="number"
                                                name="maxTimeRace"
                                                id="maxTimeRace"
                                                ref="maxTimeRace"
                                                defaultValue={this.state.round.maxTimeRace}/>
                                        </Col>
                                    </FormGroup>
                                </Col>
                            </Row>;
        if(this.state.round.typeRace === 'FIXED_COUNT_LAPS'){
            autoGenerate.push(rowCountLaps);
        }
        autoGenerate.push(rowMaxTimeRace);

        if (this.state.url !== null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit round';
            countInGroup = this.state.round.countSportsmen;

        }else{
            autoGenerate.push(
                <Row key="autoGenerate">
                    <Col>
                        <FormGroup row>
                            <Label for="autoGenerate" sm={4}>Auto generate</Label>
                            <Col sm={8}>
                                <Input
                                    type="select"
                                    name="autoGenerate"
                                    id="autoGenerate"
                                    ref="autoGenerate"
                                    onChange={this.toggleAutoGenerate}
                                    defaultValue={this.state.round.typeGenerateRound}>
                                    <option value="NONE">NONE</option>
                                    <option value="RANDOM">RANDOM</option>
                                    <option value="COPY_BEFORE_ROUND">COPY BEFORE ROUND</option>
                                    <option value="EVERY_WITH_EVERY">EVERY WITH EVERY(only for 16 sportsmen)</option>

                                </Input>
                            </Col>
                        </FormGroup>
                    </Col>
                </Row>);

            if(this.state.round.typeGenerateRound === 'RANDOM'){
                autoGenerate.push(
                    <Row key="randomCopy">
                        <Col>
                            <FormGroup row>
                                <Label for="countSportsmen" sm={4}>Count sportsmen in group</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        name="countSportsmen"
                                        id="countSportsmen"
                                        ref="countSportsmen"
                                        defaultValue={countInGroup}
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>);
            }else if(this.state.round.typeGenerateRound === 'COPY_BEFORE_ROUND'){

                let listRounds = [];
                this.state.rounds.map(round=>{
                    listRounds.push(<option value={round.id} key={round._links.self.href}>{round.name}</option>)
                })
                autoGenerate.push(
                    <Row key="copyBeforeRound">
                        <Col>
                            <FormGroup row>
                                <Label for="countSportsmen" sm={4}>Which round to copy from</Label>
                                <Col sm={8}>
                                    <Input
                                        type="select"
                                        name="fromRoundCopy"
                                        id="fromRoundCopy"
                                        ref="fromRoundCopy">
                                        {listRounds}
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>);
            }
        }

        return (<Modal isOpen={this.state.modalRound} toggle={this.toggle}>
            <ModalHeader toggle={this.toggleShow}>{header}</ModalHeader>
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
                                        defaultValue={this.state.round.name}/>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup row>
                                <Label for="typeRound" sm={4}>Type round</Label>
                                <Col sm={8}>
                                    <Input type="select"
                                           name="typeRound"
                                           id="typeRound"
                                           ref="typeRound"
                                           defaultValue={this.state.round.typeRound}>
                                        <option value="PRACTICE">PRACTICE</option>
                                        <option value="QUALIFICATION">QUALIFICATION</option>
                                        <option value="RACE">RACE</option>
                                        <option value="FINAL">FINAL</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup row>
                                <Label for="typeRound" sm={4}>Type race</Label>
                                <Col sm={8}>
                                    <Input type="select"
                                           name="typeRace"
                                           id="typeRace"
                                           ref="typeRace"
                                           onChange={this.toggleTypeRace}
                                           defaultValue={this.state.round.typeRace}>
                                        <option value="FIXED_COUNT_LAPS">FIXED COUNT LAPS</option>
                                        <option value="FIXED_TIME">FIXED TIME</option>
                                        <option value="FIXED_TIME_AND_ONE_LAP_AFTER">FIXED TIME AND ONE LAP AFTER</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>

                    {autoGenerate}
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

export default ModalNewRound;