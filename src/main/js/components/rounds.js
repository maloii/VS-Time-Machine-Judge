'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Col, Container, DropdownItem, DropdownMenu, Row, ListGroup, ListGroupItem} from "reactstrap";
import {Tabs, DragTabList, DragTab, PanelList, Panel, ExtraButton} from 'react-tabtab';
import {AccountEditIcon, AccountPlusIcon, PlusIcon} from "mdi-react";
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import * as customStyle from 'react-tabtab/lib/themes/bootstrap';
import {FaPlus} from 'react-icons/fa';
import {arrayMove} from 'react-sortable-hoc';
import ModalNewRound from './rounds/modal_new_round'
import stompClient from "../websocket_listener";
import client from "../client";
import Settings from "../settings";
import Global from "../global";
import eventClient from "../event_client";

let contextTrigger = null;





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
        this.handleEdit = this.handleEdit.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.editRow = this.editRow.bind(this);

        this.refreshListRound = this.refreshListRound.bind(this);


        this.dialogRound = React.createRef();
    }

    deleteRow(e){
        console.log('deleteRow');
    }


    editRow(e){
        console.log('editRow');
        console.log(e.data);
    }

    handleEdit = ({type, index}) =>{
        this.setState((state) => {
            let {tabs, activeIndex} = state;
            if (type === 'delete') {
                if(confirm('Do you really want to delete the record?')) {
                    client({method: 'DELETE', path: tabs[index].url});
                }
            }
            // if (index - 1 >= 0) {
            //     activeIndex = index - 1;
            // } else {
            //     activeIndex = 0;
            // }
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

    rowEvents = {
        onContextMenu:(e, row, rowIndex) =>{
            if(contextTrigger) {
                e.data = row;
                contextTrigger.handleContextClick(e );
            }
        }
    };

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
                    tabs  = [...tabs, {title: round.name, content: round._links.self.href, url: round._links.self.href}];
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

        const columns = [{
            dataField: 'id',
            text: 'Product ID'
        }, {
            dataField: 'name',
            text: 'Product Name'
        }, {
            dataField: 'price',
            text: 'Product Price'
        }, {
            dataField: 'buttons',
            text: '',
            editable: false,
            formatter: (cellContent, row) => (
                <AccountEditIcon style={{cursor:'pointer'}} onClick={()=>this.editRow({data:row})} />
            )
        }];

        const products = [{
            "id":1,
            "link":1,
            "name":"test1",
            "price":101
        }, {
            "id":2,
            "link":2,
            "name":"test1",
            "price":101
        }

        ];

        const {tabs, activeIndex} = this.state;

        const tabTemplate = [];
        const panelTemplate = [];
        tabs.forEach((tab, i) => {
            const closable = tabs.length > 1;
            tabTemplate.push(<DragTab key={i} closable={closable}>{tab.title}</DragTab>);
            panelTemplate.push(<Panel key={i}>{tab.content}</Panel>);
        })

        console.log(tabs);
        console.log(activeIndex);
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
                <Row>
                    <Col md={2} className="text-center">
                        <Button color="primary" style={{marginBottom: '10px' }} onClick={this.handleExtraButton}>
                            <AccountPlusIcon/> Add new group
                        </Button>
                        <ListGroup>
                            <ListGroupItem action>Group 1</ListGroupItem>
                            <ListGroupItem action>Group 2</ListGroupItem>
                            <ListGroupItem action>Group 3</ListGroupItem>
                            <ListGroupItem action active>Group 4</ListGroupItem>
                            <ListGroupItem action>Group 5</ListGroupItem>
                            <ListGroupItem action>Group 6</ListGroupItem>
                            <ListGroupItem action>Group 7</ListGroupItem>
                            <ListGroupItem action>Group 8</ListGroupItem>
                            <ListGroupItem action>Group 9</ListGroupItem>
                            <ListGroupItem action>Group 10</ListGroupItem>
                        </ListGroup>
                    </Col>
                    <Col className="d-flex pt-3" md={10}>

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
                            data={ products }
                            columns={ columns }
                            cellEdit={ cellEditFactory({ mode: 'click' }) }
                            rowEvents={this.rowEvents}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}
export default Rounds;