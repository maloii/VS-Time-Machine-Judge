'use strict';
import React from 'react';
import {Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {AccountPlusIcon} from "mdi-react";
import client from "../../client";
import stompClient from "../../websocket_listener";
import LapsTable from "./laps_table";
import Settings from "../../settings"
import ModalNewGroup from  "./modal_new_group"
import ModalNewSportsmenToGroup from "./modal_add_sportsmen_to_group"
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";

let contextTrigger = null;

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
            groupSportsmen: [],
            timeRace:'0',
            statusRace:'STOP'
        }
        this.refreshListGroups = this.refreshListGroups.bind(this);
        this.handleSelectGroup = this.handleSelectGroup.bind(this);
        this.loadSelectGroup = this.loadSelectGroup.bind(this);
        this.refreshTimeRace = this.refreshTimeRace.bind(this);

        this.handleSearchTransponders = this.handleSearchTransponders.bind(this);
        this.toggleShowNewGroup = this.toggleShowNewGroup.bind(this);
        this.addGroupSportsmen = this.addGroupSportsmen.bind(this);
        this.handleStartRace = this.handleStartRace.bind(this);
        this.handleStopRace = this.handleStopRace.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.editGroup = this.editGroup.bind(this);
        this.dialogGroup = React.createRef();
        this.dialogAddSportsmenToGroup = React.createRef();

        this.contextSelectedGroupData = null;
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
    toggleShowNewGroup(){
        this.dialogGroup.current.toggleShow();
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
        client({
            method: 'GET',
            path: Settings.raceApiRoot+'/search',
        }).then(response=>{
            this.setState({
                statusRace:response.entity.message
            });
        });
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
    rowGroupEvents(e, group){
        if(contextTrigger) {
            this.contextSelectedGroupData = group;
            contextTrigger.handleContextClick(e);
        }
    }
    addGroupSportsmen(e){
        this.dialogAddSportsmenToGroup.current.toggleShow(this.contextSelectedGroupData);
    }
    editGroup(e){
        this.dialogGroup.current.toggleShow(this.contextSelectedGroupData);
    }
    deleteGroup(){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: this.contextSelectedGroupData._links.self.href});
        }
    }

    loadSelectGroup(group, groups){
        client({
            method: 'GET',
            path: group._links.groupSportsmen.href
        }).then(groupSportsmen => {
            this.setState({
                groupSportsmen:groupSportsmen.entity._embedded.groupSportsmen,
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
            {route: '/topic/newGroupSportsman', callback: this.refreshListGroups},
            {route: '/topic/deleteGroupSportsman', callback: this.refreshListGroups},
            {route: '/topic/updateGroupSportsman', callback: this.refreshListGroups},


            {route: '/topic/newSportsman', callback: this.refreshListGroups},
            {route: '/topic/updateSportsman', callback: this.refreshListGroups},
            {route: '/topic/deleteSportsman', callback: this.refreshListGroups},
            {route: '/topic/newTransponder', callback: this.refreshListGroups},
            {route: '/topic/deleteTransponder', callback: this.refreshListGroups},

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
        const disabledStop = (this.state.statusRace === 'STOP')? true:false;
        const disabledStart = (this.state.statusRace === 'STOP' || this.state.statusRace === 'SEARCH')? false:true;
        return(
            <Container fluid>
                <Row>
                    <Col className="text-center" style={{maxWidth:'200px', minWidth:'200px'}}>
                        <ModalNewGroup ref={this.dialogGroup} groups={this.state.groups} round={this.props.round} />
                        <ModalNewSportsmenToGroup ref={this.dialogAddSportsmenToGroup} round={this.props.round} />
                        <Button color="primary" style={{marginBottom: '10px', whiteSpace: 'nowrap'}} onClick={this.toggleShowNewGroup}>
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
                                    onContextMenu={(e) => this.rowGroupEvents(e, group)}
                                    >{group.name}</ListGroupItem>

                            })}
                        </ListGroup>
                        <ContextMenuTrigger id={'context_menu_group'}  ref={c => contextTrigger = c} >
                            <div></div>
                        </ContextMenuTrigger>
                        <ContextMenu id={'context_menu_group'}>
                            <MenuItem onClick={this.editGroup}>
                                Edit
                            </MenuItem>
                            <MenuItem onClick={this.addGroupSportsmen}>
                                Add spotrsmen
                            </MenuItem>
                            <MenuItem onClick={this.deleteGroup}>
                                Delete
                            </MenuItem>
                        </ContextMenu>
                    </Col>
                    <Col>
                        <Container fluid>
                            <Row style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex:999}}>
                                <Col md={5} className="text-left py-md-2">
                                    <Button color="primary" disabled={disabledStart} onClick={this.handleSearchTransponders} >SEARCH</Button>
                                </Col>
                                <Col md={2} className="text-center  py-md-2">
                                    <span className="timer text-monospace">{this.state.timeRace.toHHMMSS()}</span>
                                </Col>
                                <Col className="text-right py-md-2" md={5}>
                                    <Button color="danger" disabled={disabledStop} onClick={this.handleStopRace} >STOP</Button>{'  '}
                                    <Button color="success" disabled={disabledStart} onClick={this.handleStartRace} >START</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <LapsTable groupSportsmen={this.state.groupSportsmen} group={this.state.group}/>
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