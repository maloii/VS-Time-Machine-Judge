'use strict';
import React from 'react';
import {
    Button,
    Col,
    Container,
    FormGroup,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import Global from "../../global";
import client from "../../client";
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import follow from "../../follow";
import Settings from "../../settings";


class ModalNewSportsmenToGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sportsmen:[],
            group:{},
            selected:[]
        }

        this.refreshTableSportsmen = this.refreshTableSportsmen.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            modalAddSportsmenToGroup: !this.state.modalAddSportsmenToGroup
        });
    }

    refreshTableSportsmen(groupSportsmen){
        if (Global.competition !== null) {
            client({
                method: 'GET',
                path: Global.competition._links.sportsmen.href
            }).then(sportsmen => {

                let arrSportsmen = sportsmen.entity._embedded.sportsmen.filter(s=>{return s.selected});

                groupSportsmen.map(gs=>{
                    arrSportsmen = arrSportsmen.filter(s=>{return s.id!==gs.sportsman.id});
                })

                this.setState({
                    sportsmen: arrSportsmen
                });
            });
        }
    }

    toggleShow(group) {
        if(group != null) {
            client({
                method: 'GET',
                path: group._links.groupSportsmen.href
            }).then(sportsmen=>{
                this.refreshTableSportsmen(sportsmen.entity._embedded.groupSportsmen);

                this.setState({
                    modalAddSportsmenToGroup: !this.state.modalAddSportsmenToGroup,
                    group:group,
                    selected:[]
                });
            })


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
    handleSave() {
        follow(client, Settings.root, ['groupSportsmen']).then(responseGroupSportsmen => {
            this.state.selected.map(i=>{
                let sportsman = this.state.sportsmen.filter(sportsman=>{return sportsman.id===i});
                if(sportsman.length > 0) {
                    const groupSportsmen = {
                        sort: i,
                        sportsman: sportsman[0]._links.self.href,
                        group: this.state.group._links.self.href
                    };
                    client({
                        method: 'POST',
                        path: responseGroupSportsmen.entity._links.self.href,
                        entity: groupSportsmen,
                        headers: {'Content-Type': 'application/json'}
                    });
                }
            })
        });

        this.toggle();
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

        return(
            <Modal isOpen={this.state.modalAddSportsmenToGroup} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>Add new sportsmen to group</ModalHeader>
                <ModalBody>
                    <Container fluid>
                        <Row>
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
                    </Container>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.toggle}>
                        Close
                    </Button>
                    <Button color="primary" onClick={this.handleSave}>
                        Save
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
export default ModalNewSportsmenToGroup;