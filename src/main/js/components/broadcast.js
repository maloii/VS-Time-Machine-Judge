'use strict';
import React from "react";
import {Col, Container, Row, ListGroupItem, Button, ListGroup, Alert} from "reactstrap";
import Global from "../global";
import client from "../client";
import stompClient from "../websocket_listener";
import eventClient from "../event_client";
import ModalNewBroadcast from "./broadcast/modal_new_broadcast";
import {PlaylistEditIcon} from "mdi-react";

class Broadcast extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            broadcasts:[],
            competition: Global.competition,
            mainScreenBroadcast:{}
        }

        this.loadDataMainScreenBroadcast = this.loadDataMainScreenBroadcast.bind(this);
        this.handleSelectBroadcast = this.handleSelectBroadcast.bind(this);
        this.refreshListBroadcast = this.refreshListBroadcast.bind(this);
        this.selectCompetition = this.selectCompetition.bind(this);
        this.showNewBroadcast = this.showNewBroadcast.bind(this);
        this.showEditBroadcast = this.showEditBroadcast.bind(this);

        this.dialogBroadcast = React.createRef();
    }

    showNewBroadcast(){
        this.dialogBroadcast.current.toggleShow();
    }
    showEditBroadcast(url){
        this.dialogBroadcast.current.toggleShow(url);
    }

    loadDataMainScreenBroadcast() {
        client({
            method: 'GET',
            path: Global.competition._links.self.href
        }).then(competition => {
            Global.competition = competition.entity;
            client({
                method: 'GET',
                path: Global.competition._links.mainScreenBroadcast.href
            }).then(mainScreenBroadcast => {
                this.setState({
                    competition: Global.competition,
                    mainScreenBroadcast: mainScreenBroadcast.entity
                });
            },(error)=>{
                this.setState({
                    competition: Global.competition,
                    mainScreenBroadcast: {}
                });
            });
        });
    }

    handleSelectBroadcast(broadcast){
        if(broadcast) {
            client({
                method: 'PUT',
                path: Global.competition._links.mainScreenBroadcast.href,
                entity: broadcast._links.self.href,
                headers: {
                    'Accept': 'text/uri-list',
                    'Content-Type': 'text/uri-list'
                }
            }).then(() => {
                this.loadDataMainScreenBroadcast();
            })
        }else{
            client({method: 'DELETE',
                    path: Global.competition._links.mainScreenBroadcast.href
            }).then(() => {
                this.loadDataMainScreenBroadcast();
            })
        }



    }
    refreshListBroadcast(){
        if (Global.competition !== null) {
            client({
                method: 'GET',
                path: Global.competition._links.broadcasts.href
            }).then(broadcasts => {
                client({
                    method: 'GET',
                    path: Global.competition._links.mainScreenBroadcast.href
                }).then(mainScreenBroadcast => {
                        this.setState({
                            broadcasts:broadcasts.entity._embedded.broadcasts,
                            mainScreenBroadcast: mainScreenBroadcast.entity
                        });
                    },(error)=>{
                        this.setState({
                            broadcasts:broadcasts.entity._embedded.broadcasts,
                            mainScreenBroadcast: {}
                        });
                });
            });
        }
    }

    selectCompetition({competition}) {
        this.setState({
            competition: Global.competition
        });
        this.refreshListBroadcast();
    }
    componentDidMount() {
        this.refreshListBroadcast();
        this.stomp = stompClient.register([
            {route: '/topic/newBroadcast', callback: this.refreshListBroadcast},
            {route: '/topic/updateBroadcast', callback: this.refreshListBroadcast},
            {route: '/topic/deleteBroadcast', callback: this.refreshListBroadcast}
        ]);
    }
    componentWillMount() {
        eventClient.on('SELECT_COMPETITION', this.selectCompetition);
    }

    componentWillUnmount() {
        eventClient.removeEventListener('SELECT_COMPETITION', this.selectCompetition);
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }
    render(){
        if (this.state.competition === null) {
            return (
                <Container>
                    <Alert color="primary">
                        Create and select a competition!
                    </Alert>
                </Container>
            )
        } else {
            return (
                <>
                    <ModalNewBroadcast ref={this.dialogBroadcast}/>
                    <Container fluid>
                        <Row>
                            <Col className="d-flex">
                                <Button color="primary" className="ml-auto" onClick={this.showNewBroadcast}>
                                    Add new screen
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="pt-3">
                                <ListGroup style={{flexDirection: 'row'}} className="list_broadcast">
                                    {this.state.broadcasts.map(broadcast => {
                                        return <ListGroupItem
                                            key={broadcast._links.self.href}
                                            tag="button"
                                            onClick={() => this.handleSelectBroadcast(broadcast)}
                                            action
                                            active={broadcast.id===this.state.mainScreenBroadcast.id}>
                                            <PlaylistEditIcon
                                                style={{float:'right', cursor:'pointer'}}
                                                onClick={() => this.showEditBroadcast(broadcast._links.self.href)}/>
                                            {broadcast.name}
                                        </ListGroupItem>
                                    })}
                                    <ListGroupItem
                                        key="hide"
                                        tag="button"
                                        onClick={() => this.handleSelectBroadcast()}
                                        action
                                        active={!this.state.mainScreenBroadcast.id}>
                                        HIDE
                                    </ListGroupItem>
                                </ListGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <br />
                                <br />
                                <br />
                                <ul>
                                    <li>
                                        <a href="/screen/main.html">Main broadcast screen</a>
                                    </li>
                                    <li>
                                        <a href="/screen/current-group-grid.html">Grid current group screen</a>
                                    </li>
                                    {this.state.broadcasts.map(broadcast => {
                                        return  <li key={broadcast.id}>
                                                    <a href={'/screen/main.html?url='+broadcast._links.self.href}>{broadcast.name}</a>
                                                </li>
                                    })}
                                </ul>
                            </Col>
                        </Row>
                    </Container>
                </>
            )
        }
    }
}
export default Broadcast;