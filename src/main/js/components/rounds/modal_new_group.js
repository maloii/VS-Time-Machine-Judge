'use strict';
import React from 'react';
import ReactDOM from "react-dom";
import {
    Button,
    Col,
    Container,
    FormGroup, Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Table
} from "reactstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Global from "../../global";
import follow from "../../follow";
import client from "../../client";
import Settings from "../../settings";


const selectRowProp = {
    mode: 'checkbox',
    clickToSelect: true,
    style: { backgroundColor: '#c8e6c9' }
};

class ModalNewGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            group: {},
            sportsmen:[],
            url: null
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.toggleEditShow = this.toggleEditShow.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.refreshTableSportsmen = this.refreshTableSportsmen.bind(this);
    }

    toggle() {
        this.setState({
            modalGroup: !this.state.modalGroup
        });
    }

    toggleShow() {
        this.refreshTableSportsmen();
        this.setState({
            modalGroup: !this.state.modalGroup
        });
    }

    refreshTableSportsmen(){
        if (Global.competition !== null) {
            client({
                method: 'GET',
                path: Global.competition._links.sportsmen.href
            }).then(sportsmen => {
                this.setState({
                    sportsmen: sportsmen.entity._embedded.sportsmen.filter(s=>{return s.selected})
                });
            });
        }
    }

    toggleEditShow(url) {

    }
    handleSave() {
        // const newRound = {
        //     name: ReactDOM.findDOMNode(this.refs['name']).value.trim(),
        //     typeRound: ReactDOM.findDOMNode(this.refs['typeRound']).value.trim(),
        //     typeGenerateRound: ReactDOM.findDOMNode(this.refs['autoGenerate']).value.trim(),
        //     countSportsmen: ReactDOM.findDOMNode(this.refs['countSportsmen']).value.trim(),
        //     sort: this.props.maxSortRound+1,
        //     selected: true,
        //     competition: Global.competition._links.competition.href
        // };
        // follow(client, Settings.root, ['rounds']).then(response => {
        //     return client({
        //         method: 'POST',
        //         path: response.entity._links.self.href,
        //         entity: newRound,
        //         headers: {'Content-Type': 'application/json'}
        //     })
        // });
        this.toggle();
    }
    handleUpdate() {

    }
    handleDelete(){

    }

    render(){
        const columns = [{
            dataField: 'firstName',
            text: 'First Name',
            sort: true
        }, {
            dataField: 'lastName',
            text: 'Last Name',
            sort: true
        }, {
            dataField: 'nick',
            text: 'Nick(OSD)',
            sort: true
        }];
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New group';
        if (this.state.url !== null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit group';

        }
        return(
            <Modal isOpen={this.state.modalGroup} toggle={this.toggle}>
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
                                            defaultValue={this.state.group.name}/>
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Label for="selectSportsmen">Select sportsmen:</Label>
                                <BootstrapTable
                                    keyField='id'
                                    data={this.state.sportsmen}
                                    columns={ columns }
                                    selectRow={ selectRowProp } />
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
            </Modal>
        );
    }
}
export default ModalNewGroup;