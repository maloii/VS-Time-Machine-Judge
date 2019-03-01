'use strict';
import React from 'react';
import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {AccountPlusIcon} from "mdi-react";
import client from "../../client";
import stompClient from "../../websocket_listener";
import LapsTable from "./laps_table";
import Settings from "../../settings"


String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours !== "00"?hours+':':'')+minutes+':'+seconds;
}

class Groups  extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            group: null,
            groups: [],
            sportsmen: [],
            timeRace:'0',
            statusRace:'STOP'
        }
        this.refreshListGroups = this.refreshListGroups.bind(this);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.loadSelectGroup = this.loadSelectGroup.bind(this);
        this.refreshTimeRace = this.refreshTimeRace.bind(this);

        this.handleStartRace = this.handleStartRace.bind(this);
        this.handleStopRace = this.handleStopRace.bind(this);
        this.handleSearchTransponders = this.handleSearchTransponders.bind(this);

    }


    handleStartRace(){
        if(this.state.group != null) {
            client({
                method: 'GET',
                path: Settings.raceApiRoot + '/status',

            }).then(response => {
                this.setState({
                    statusRace: response.entity.message
                });
                if (response.entity.message === 'STOP') {
                    client({
                        method: 'POST',
                        path: Settings.raceApiRoot + '/start',
                        entity: this.state.group,
                        headers: {'Content-Type': 'application/json'}
                    }).then(response => {
                        this.setState({
                            statusRace: response.entity.message
                        });
                    });
                }
            });
        }else{
           alert('Mistake! The group is not selected.');
        }
    }
    handleStopRace(){
        client({
            method: 'GET',
            path: Settings.raceApiRoot+'/stop',
        }).then(response=>{
            this.setState({
                statusRace:response.entity.message
            });
        });
    }
    handleSearchTransponders(){

    }

    handleSelectGroup(group){
        group.selected = true;
        client({
            method: 'PUT',
            path: group._links.self.href,
            entity: group,
            headers: {'Content-Type': 'application/json'}
        });
        this.setState({group:group})
    }
    loadSelectGroup(group, groups){
        client({
            method: 'GET',
            path: group._links.sportsmen.href
        }).then(sportsmen => {
            this.setState({
                sportsmen:sportsmen.entity._embedded.sportsmen,
                group:group,
                groups:groups.entity._embedded.groups
            })
        });
    }

    refreshListGroups() {
        client({
            method: 'GET',
            path: Settings.raceApiRoot+'/status',
        }).then(response=> {
            this.setState({
                statusRace: response.entity.message
            });
        });
        client({
            method: 'GET',
            path: this.props.round._links.groups.href
        }).then(groups => {
            const selectedGroup = groups.entity._embedded.groups.filter(function (group) {
                return group.selected;
            });
            if (selectedGroup.length > 0){
                this.loadSelectGroup(selectedGroup[0], groups);
            }else{
                this.setState({groups: groups.entity._embedded.groups});
            }

        });

    }
    refreshTimeRace(time){
        this.setState({
            timeRace:time.body
        });
    }
    componentDidMount() {
        this.refreshListGroups();
        this.stomp = stompClient.register([
            {route: '/topic/newGroup', callback: this.refreshListGroups},
            {route: '/topic/updateGroup', callback: this.refreshListGroups},
            {route: '/topic/deleteGroup', callback: this.refreshListGroups},
            {route: '/topic/updateRound', callback: this.refreshListGroups},
            {route: '/topic/reportTimeRace', callback: this.refreshTimeRace}
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
        //         <AccountEditIcon style={{cursor:'pointer'}} onClick={()=>this.editToOutOfScore({data:row})} />
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

        const disabledStop = (this.state.statusRace === 'STOP')? true:false;
        const disabledStart = (this.state.statusRace === 'STOP')? false:true;
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
                                <Col md={2}>
                                    <span>{this.state.timeRace.toHHMMSS()}</span>
                                </Col>
                                <Col className="text-right py-md-2" md={10}>
                                    <Button color="danger" disabled={disabledStop} onClick={this.handleStopRace} >STOP</Button>{'  '}
                                    <Button color="success" disabled={disabledStart} onClick={this.handleStartRace} >START</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <LapsTable sportsmen={this.state.sportsmen} group={this.state.group}/>
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