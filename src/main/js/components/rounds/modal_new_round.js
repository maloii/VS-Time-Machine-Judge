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
            url: null
        }


        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.toggleEditShow = this.toggleEditShow.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    toggle() {
        this.setState({
            modalRound: !this.state.modalRound
        });
    }

    toggleShow() {
        this.setState({
            modalRound: !this.state.modalRound,
            sportsman: {},
            url: null,
            srcPhoto: null,
            tags: []
        });
    }

    toggleEditShow(url) {

    }
    handleSave() {
        const newRound = {
            name: ReactDOM.findDOMNode(this.refs['name']).value.trim(),
            typeRound: ReactDOM.findDOMNode(this.refs['typeRound']).value.trim(),
            typeGenerateRound: ReactDOM.findDOMNode(this.refs['autoGenerate']).value.trim(),
            countSportsmen: ReactDOM.findDOMNode(this.refs['countSportsmen']).value.trim(),
            sort: this.props.maxSortRound+1,
            selected: true,
            competition: Global.competition._links.competition.href
        };
        follow(client, Settings.root, ['rounds']).then(response => {
            return client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newRound,
                headers: {'Content-Type': 'application/json'}
            })
        });
        this.toggle();
    }
    handleUpdate() {

    }
    handleDelete(){

    }

    render(){
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New round';
        if (this.state.url !== null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleUDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit round';

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
                                           ref="typeRound">
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
                                <Label for="autoGenerate" sm={4}>Auto generate</Label>
                                <Col sm={8}>
                                    <Input
                                        type="select"
                                        name="autoGenerate"
                                        id="autoGenerate"
                                        ref="autoGenerate">
                                        <option value="NONE">NONE</option>
                                        <option value="RANDOM">RANDOM</option>
                                        <option value="COPY_BEFORE_ROUND">COPY BEFORE ROUND</option>
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FormGroup row>
                                <Label for="countSportsmen" sm={4}>Count sportsmen in group</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        name="countSportsmen"
                                        id="countSportsmen"
                                        ref="countSportsmen"
                                        defaultValue="4"
                                    />
                                </Col>
                            </FormGroup>
                        </Col>
                    </Row>
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