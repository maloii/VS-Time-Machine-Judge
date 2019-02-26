'use strict';
import React from 'react';
import {Button, Col, Container, Row} from "reactstrap";
import {AsyncPanel, DragTab, DragTabList, ExtraButton, Panel, PanelList, Tabs} from 'react-tabtab';
import {AccountEditIcon, AccountPlusIcon} from "mdi-react";
import * as customStyle from 'react-tabtab/lib/themes/bootstrap';
import {arrayMove} from 'react-sortable-hoc';
import ModalNewRound from './rounds/modal_new_round'
import stompClient from "../websocket_listener";
import client from "../client";
import Global from "../global";
import eventClient from "../event_client";
import Groups from './rounds/groups';


class Rounds extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeIndex: 0,
            tabs:[]
        }
        this.selectCompetition = this.selectCompetition.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleTabSequenceChange = this.handleTabSequenceChange.bind(this);
        this.handleExtraButton = this.handleExtraButton.bind(this);

        this.refreshListRound = this.refreshListRound.bind(this);


        this.dialogRound = React.createRef();
    }


    handleEdit = ({type, index}) =>{
        this.setState((state) => {
            let {tabs, activeIndex} = state;
            if (type === 'delete') {
                if(confirm('Do you really want to delete the record?')) {
                    client({method: 'DELETE', path: tabs[index].url});
                }
            }
            return {tabs, activeIndex};
        });
    }

    handleTabChange(index) {
        this.setState({activeIndex: index});
    }

    handleExtraButton(e){
        this.dialogRound.current.toggleShow();
    }

    handleTabSequenceChange({oldIndex, newIndex}) {
        const {tabs} = this.state;
        const updateTabs = arrayMove(tabs, oldIndex, newIndex);
        this.setState({tabs: updateTabs, activeIndex: newIndex});
    }

    refreshListRound() {
        if (Global.competition !== null) {
            client({
                method: 'GET',
                path: Global.competition._links.rounds.href
            }).then(rounds => {
                let tabs = [];
                let activeIndex = 0;
                rounds.entity._embedded.rounds.map((round, index) => {
                    if(round.selected) activeIndex = index;
                    tabs  = [...tabs, {title: round.name, content: round, url: round._links.self.href}];
                });
                this.setState({tabs: tabs, activeIndex: activeIndex})
            });
        }
    }
    componentDidMount() {
        this.refreshListRound();
        stompClient.register([
            {route: '/topic/newRound', callback: this.refreshListRound},
            {route: '/topic/updateRound', callback: this.refreshListRound},
            {route: '/topic/deleteRound', callback: this.refreshListRound}
        ]);
    }
    componentWillMount() {
        eventClient.on('SELECT_COMPETITION', this.selectCompetition);
    }

    componentWillUnmount() {
        eventClient.removeEventListener('SELECT_COMPETITION', this.selectCompetition);
    }
    selectCompetition({competition}) {
        this.setState({
            competition: Global.competition
        });
        this.refreshListRound();
    }

    render(){
        const {tabs, activeIndex} = this.state;

        const tabTemplate = [];
        const panelTemplate = [];
        tabs.forEach((tab, i) => {
            const closable = tabs.length > 1;
            tabTemplate.push(<DragTab key={i} closable={closable}>{tab.title}</DragTab>);
            panelTemplate.push(<Panel key={i}><Groups round={tab.content} /></Panel>);
        })
        return(
            <Container fluid>
                <Row>
                    <Col id="rootTabs">
                        <ModalNewRound ref={this.dialogRound} />
                        <Tabs activeIndex={activeIndex}
                              onTabEdit={this.handleEdit}
                              onTabChange={this.handleTabChange}
                              onTabSequenceChange={this.handleTabSequenceChange}
                              customStyle={customStyle}
                              showArrowButton="auto"
                              showModalButton={2}
                              ExtraButton={
                                  <Button color="primary" onClick={this.handleExtraButton}
                                          style={{
                                              float:'right',
                                              marginTop:'5px',
                                              marginLeft:'12px'
                                          }}>
                                      <AccountPlusIcon/> Add new round
                                  </Button>
                              }>
                            <DragTabList>
                                {tabTemplate}
                            </DragTabList>
                            <PanelList>
                                {panelTemplate}
                            </PanelList>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        );
    }
}
export default Rounds;