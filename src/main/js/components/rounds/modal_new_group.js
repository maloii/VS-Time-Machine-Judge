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



class ModalNewGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sportsmen:[],
            group:{},
            selected:[],
            invalidName: false,
            url: null
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.refreshTableSportsmen = this.refreshTableSportsmen.bind(this);
    }

    toggle() {
        this.setState({
            modalGroup: !this.state.modalGroup,
            invalidName: false,
        });
    }

    toggleShow(group) {
        if(group == null) {
            this.refreshTableSportsmen();
            this.setState({
                modalGroup: !this.state.modalGroup,
                group: {name: 'Group ' + (this.props.groups.length + 1)},
                invalidName: false,
                selected:[]
            });
        }else{
            this.setState({
                modalGroup: !this.state.modalGroup,
                group: group,
                invalidName: false,
                selected:[]
            });
        }
    }

    handleOnSelect = (row, isSelect) => {
        if (isSelect) {
            this.setState(() => ({
                selected: [...this.state.selected, row.id]
            }));
        } else {
            this.setState(() => ({
                selected: this.state.selected.filter(x => x !== row.id)
            }));
        }
    }

    handleOnSelectAll = (isSelect, rows) => {
        const ids = rows.map(r => r.id);
        if (isSelect) {
            this.setState(() => ({
                selected: ids
            }));
        } else {
            this.setState(() => ({
                selected: []
            }));
        }
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

    handleSave() {
        let name = ReactDOM.findDOMNode(this.refs['name']);
        if(name.value.trim() === '') {
            this.setState({
                invalidName: true
            })
            return;
        }
        const newGroup = {
            name: name.value.trim(),
            sort: this.props.groups.length,
            selected: false,
            competition: Global.competition._links.competition.href,
            round:this.props.round._links.self.href
        };
        follow(client, Settings.root, ['groups']).then(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newGroup,
                headers: {'Content-Type': 'application/json'}
            }).then(group=>{
                follow(client, Settings.root, ['groupSportsmen']).then(responseGroupSportsmen => {
                    this.state.selected.map(i=>{
                        let sportsman = this.state.sportsmen.filter(sportsman=>{return sportsman.id===i});
                        if(sportsman.length > 0) {
                            const groupSportsmen = {
                                sort: i,
                                sportsman: sportsman[0]._links.self.href,
                                group: group.entity._links.self.href
                            };
                            client({
                                method: 'POST',
                                path: responseGroupSportsmen.entity._links.self.href,
                                entity: groupSportsmen,
                                headers: {'Content-Type': 'application/json'}
                            })
                        }
                    })
                });
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
        var copyGroup = Object.assign({}, this.state.group);
        copyGroup.name = name.value.trim();
        client({
            method: 'PUT',
            path: this.state.group._links.self.href,
            entity: copyGroup,
            headers: {'Content-Type': 'application/json'}
        }).done(response=>this.toggle())
    }
    handleDelete(){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: this.state.group._links.self.href}).done(response=>this.toggle())
        }
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

        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            selected: this.state.selected,
            style: { backgroundColor: '#c8e6c9' },
            onSelect: this.handleOnSelect,
            onSelectAll: this.handleOnSelectAll
        };

        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New group';
        if (this.state.group.id != null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit group';

        }
        let table = '';
        if(this.state.group.id == null) {
            table = <Row>
                        <Col>
                            <FormGroup>
                                <Label for="selectSportsmen">Select sportsmen:</Label>
                                <BootstrapTable
                                    keyField='id'
                                    data={this.state.sportsmen}
                                    columns={columns}
                                    selectRow={selectRowProp}/>
                            </FormGroup>
                        </Col>
                    </Row>
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
                                            invalid={this.state.invalidName}
                                            type="text"
                                            name="name"
                                            id="name"
                                            ref="name"
                                            defaultValue={this.state.group.name}/>
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                        {table}
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