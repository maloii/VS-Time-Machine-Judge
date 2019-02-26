'use strict';
import React from 'react';
import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {AccountEditIcon, AccountPlusIcon} from "mdi-react";
import client from "../../client";
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import stompClient from "../../websocket_listener";


let contextTrigger = null;

class Groups  extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groups: [],
            sportsmen: []
        }
        this.refreshListGroups = this.refreshListGroups.bind(this);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.loadSelectGroup = this.loadSelectGroup.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.editRow = this.editRow.bind(this);
    }

    handleSelectGroup(group){
        group.selected = true;
        client({
            method: 'PUT',
            path: group._links.self.href,
            entity: group,
            headers: {'Content-Type': 'application/json'}
        });
    }
    loadSelectGroup(group){
        client({
            method: 'GET',
            path: group._links.sportsmen.href
        }).then(sportsmen => {
            this.setState({sportsmen:sportsmen.entity._embedded.sportsmen})
        });
    }

    deleteRow(e){
        console.log('deleteRow');
    }


    editRow(e){
        console.log('editRow');
        console.log(e.data);
    }


    rowEvents = {
        onContextMenu:(e, row, rowIndex) =>{
            if(contextTrigger) {
                e.data = row;
                contextTrigger.handleContextClick(e );
            }
        }
    };

    refreshListGroups() {
        client({
            method: 'GET',
            path: this.props.round._links.groups.href
        }).then(groups => {
            this.setState({groups:groups.entity._embedded.groups});
            const selectedGroup = groups.entity._embedded.groups.filter(function(group) {
                return group.selected;
            });
            if(selectedGroup.length >0)this.loadSelectGroup(selectedGroup[0]);

        });
    }
    componentDidMount() {
        this.refreshListGroups();
        stompClient.register([
            {route: '/topic/newGroup', callback: this.refreshListGroups},
            {route: '/topic/updateGroup', callback: this.refreshListGroups},
            {route: '/topic/deleteGroup', callback: this.refreshListGroups}
        ]);
    }
    render(){

        let columns = [];
        this.state.sportsmen.map(sportsman=>{
            columns = [...columns, {dataField:sportsman._links.self.href, text:sportsman.firstName+' '+sportsman.lastName}];
        });
        // const columns = [{
        //     dataField: 'id',
        //     text: 'Product ID'
        // }, {
        //     dataField: 'name',
        //     text: 'Product Name'
        // }, {
        //     dataField: 'price',
        //     text: 'Product Price'
        // }, {
        //     dataField: 'buttons',
        //     text: '',
        //     editable: false,
        //     formatter: (cellContent, row) => (
        //         <AccountEditIcon style={{cursor:'pointer'}} onClick={()=>this.editRow({data:row})} />
        //     )
        // }];

        const products = [];
        let tableSportsmen = <></>;
        if(columns.length > 0){ tableSportsmen =
            <>
                <ContextMenuTrigger id="some_unique_identifier" ref={c => contextTrigger = c}>
                    <div></div>
                </ContextMenuTrigger>

                <ContextMenu id="some_unique_identifier">
                <MenuItem onClick={this.editRow}>
                Edit
                </MenuItem>
                <MenuItem onClick={this.deleteRow}>
                    Delete
                </MenuItem>
                </ContextMenu>
                <BootstrapTable
                    keyField="id"
                    data={products}
                    columns={columns}
                    cellEdit={cellEditFactory({mode: 'click'})}
                    rowEvents={this.rowEvents}
                />
            </>
        }

        return(
            <Container fluid>
                <Row>
                    <Col md={2} className="text-center">
                        <Button color="primary" style={{marginBottom: '10px' }} onClick={this.handleExtraButton}>
                            <AccountPlusIcon/> Add new group
                        </Button>
                        <ListGroup>
                            {this.state.groups.map(group=>{
                                return <ListGroupItem
                                    key={group._links.self.href}
                                    tag="button"
                                    onClick={()=>this.handleSelectGroup(group)}
                                    action
                                    active={group.selected}
                                    >{group.name}</ListGroupItem>
                            })}
                        </ListGroup>
                    </Col>
                    <Col md={10}>
                        {tableSportsmen}
                    </Col>
                </Row>
            </Container>
        );
    }

}

export default Groups;