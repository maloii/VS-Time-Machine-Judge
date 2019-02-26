'use strict';
import React from 'react';
import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {AccountEditIcon, AccountPlusIcon} from "mdi-react";
import client from "../../client";
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import stompClient from "../../websocket_listener";
import LapsTable from "./laps_table";


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

    refreshListGroups() {
        client({
            method: 'GET',
            path: this.props.round._links.groups.href
        }).then(groups => {
            this.setState({groups: groups.entity._embedded.groups});
            const selectedGroup = groups.entity._embedded.groups.filter(function (group) {
                return group.selected;
            });
            if (selectedGroup.length > 0) this.loadSelectGroup(selectedGroup[0]);

        });
    }
    componentDidMount() {
        this.refreshListGroups();
        this.stomp = stompClient.register([
            {route: '/topic/newGroup', callback: this.refreshListGroups},
            {route: '/topic/updateGroup', callback: this.refreshListGroups},
            {route: '/topic/deleteGroup', callback: this.refreshListGroups},
            {route: '/topic/updateRound', callback: this.refreshListGroups}
        ]);
    }
    componentWillUnmount(){
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }
    render(){

        // let columns = [];
        // this.state.sportsmen.map(sportsman=>{
        //     columns = [...columns, {dataField:sportsman._links.self.href, text:sportsman.firstName+' '+sportsman.lastName}];
        // });
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

        // const products = [];
        // let tableSportsmen = <></>;
        // if(columns.length > 0){ tableSportsmen =
        //     <>
        //
        //         <BootstrapTable
        //             keyField="id"
        //             data={products}
        //             columns={columns}
        //             cellEdit={cellEditFactory({mode: 'click'})}
        //             rowEvents={this.rowEvents}
        //         />
        //     </>
        // }

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
                        <Container fluid>
                            <Row>
                                <Col className="text-right py-md-2">
                                    <Button color="danger">STOP</Button>{' '}
                                    <Button color="success">START</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <LapsTable sportsmen={this.state.sportsmen}/>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
        );
    }

}

export default Groups;