'use strict';
import React from 'react';
import {Alert, Button, Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap";
import {PlusIcon, ContentCopyIcon, FilePdfIcon} from "mdi-react";
import client from "../../client";
import stompClient from "../../websocket_listener";
import LapsTable from "./laps_table";
import Settings from "../../settings"
import ModalNewGroup from  "./modal_new_group"
import ModalNewSportsmenToGroup from "./modal_add_sportsmen_to_group"
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import Global from "../../global";
import ReactDOM from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TimePanel from "./time_panel";

let contextTrigger = null;



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

        this.handleSearchTransponders = this.handleSearchTransponders.bind(this);
        this.toggleShowNewGroup = this.toggleShowNewGroup.bind(this);
        this.copyGpoupsToBuffer = this.copyGpoupsToBuffer.bind(this);
        this.addGroupSportsmen = this.addGroupSportsmen.bind(this);
        this.handleStartRace = this.handleStartRace.bind(this);
        this.handleStopRace = this.handleStopRace.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.generatePdf = this.generatePdf.bind(this);
        this.editGroup = this.editGroup.bind(this);
        this.startRace = this.startRace.bind(this);

        this.tableLaps = React.createRef();
        this.dialogGroup = React.createRef();
        this.dialogAddSportsmenToGroup = React.createRef();
    }

    generatePdf(){
        function toDataUrl(src, callback, outputFormat) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = this.naturalHeight;
                canvas.width = this.naturalWidth;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL);
                canvas = null;
            };
            img.src = src;
            if (img.complete || img.complete === undefined) {
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
                img.src = src;
            }
        }

        var nameFile = (this.props.round.name+"-"+this.state.group.name).split(" ").join("_");
        var quotes = ReactDOM.findDOMNode(this.tableLaps.current);
        var headerName = document.getElementById("header_name");
        headerName.innerText = this.props.round.name+" - "+this.state.group.name;

        var HTML_Width = quotes.getBoundingClientRect().width;
        var HTML_Height = quotes.getBoundingClientRect().height;
        var top_left_margin = 50;
        var PDF_Width = HTML_Width+(top_left_margin*2);
        var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
        var canvas_image_width = HTML_Width;
        var canvas_image_height = HTML_Height;

        var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;


        let nameGroup = this.state.group.name;
        html2canvas(quotes,{allowTaint:true}).then(function(canvas) {
            canvas.getContext('2d');

            console.log(canvas.height+"  "+canvas.width);


            var imgData = canvas.toDataURL("image/jpeg", 1.0);
            var pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
            //pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);
            pdf.addImage(imgData, 'JPG', top_left_margin, (top_left_margin+50),canvas_image_width,(canvas_image_height-30));

            toDataUrl('/images/horizontal.jpg', function(footerLogo) {
                if(totalPDFPages == 0) {
                    pdf.addImage(footerLogo, 'JPG', ((PDF_Width/2)-100), (PDF_Height - 50));
                }
                let srcLogo = Settings.defaultReportLogo;
                if(Global.competition.logo) srcLogo = Global.competition.logo;

                toDataUrl(srcLogo, function(topLogo) {

                    pdf.addImage(topLogo, 'JPG', top_left_margin, top_left_margin);
                    for (var i = 1; i <= totalPDFPages; i++) {
                        pdf.addPage(PDF_Width, PDF_Height);
                        pdf.addImage(imgData, 'JPG', top_left_margin, -((PDF_Height-70)*i)+(top_left_margin+50),canvas_image_width,(canvas_image_height-30));
                        if(totalPDFPages == i) {
                            pdf.addImage(footerLogo, 'JPG', ((PDF_Width / 2) - 100), (PDF_Height - 50));
                        }
                    }
                    pdf.save(nameFile+".pdf");
                    headerName.innerText = "";
                },'JPG');
            },'JPG');
        });
        // function copyImage(url){
        //     var img=document.createElement('img');
        //     img.src=url;
        //     document.body.appendChild(img);
        //     var r = document.createRange();
        //     r.setStartBefore(img);
        //     r.setEndAfter(img);
        //     r.selectNode(img);
        //     var sel = window.getSelection();
        //     sel.addRange(r);
        //     document.execCommand('Copy');
        // }
    }
    sendRaceCommand(command){
        if(this.state.group != null) {
            client({
                method: 'GET',
                path: Settings.raceApiRoot + '/status',

            }).then(response => {
                this.setState({
                    statusRace: response.entity.message
                });
                if(this.tableLaps.current)this.tableLaps.current.setStatusRace(response.entity.message);
                if (response.entity.message === 'STOP') {
                    client({
                        method: 'POST',
                        path: Settings.raceApiRoot + '/'+command,
                        entity: this.state.group,
                        headers: {'Content-Type': 'application/json'}
                    }).then(response => {
                        if(this.tableLaps.current)this.tableLaps.current.setStatusRace(response.entity.message);
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

    handleStartRace(){

        if(Global.isConnectHardware){
            this.startRace();
        }else{
            if(confirm("No connection to VS Time Machine! Is it all equal to running a race?")){
                this.startRace();
            }
        }




    }
    startRace(){
        if(this.state.group != null ) {
            client({
                method: 'GET',
                path: this.state.group._links.self.href
            }).then(g => {
                client({
                    method: 'GET',
                    path: g.entity._links.laps.href
                }).then(lapsResponse => {
                    if(lapsResponse.entity._embedded.laps.length == 0 || confirm('If you start the race again, the old data will be deleted!')){
                        this.sendRaceCommand('start');
                    }
                });
            });

        }
    }
    handleSearchTransponders(){
        if(Global.isConnectHardware) {
            this.sendRaceCommand('search');
        }else{
            alert('No connection to the timing system!');
        }
    }

    handleStopRace(){
        let groupsportsmen = [];
        if(this.tableLaps.current.getResalts()){
            let sportsmen = this.tableLaps.current.getResalts();
            this.tableLaps.current.getResalts().map(sportsman=>{
                if(sportsman.groupSportsmanId) {
                    groupsportsmen.push({
                        id: sportsman.groupSportsmanId,
                        position: sportsman.pos
                    })
                }

            })
        }
        client({
            method: 'POST',
            path: Settings.raceApiRoot+'/stop',
            entity:groupsportsmen,
            headers: {'Content-Type': 'application/json'}
        }).then(response=>{
            if(this.tableLaps.current)this.tableLaps.current.setStatusRace(response.entity.message);
            this.setState({
                statusRace:response.entity.message
            });
        });
    }

    toggleShowNewGroup(){
        this.dialogGroup.current.toggleShow();
    }
    copyGpoupsToBuffer(){
        const buff = [];
        this.state.groups.map(group=>{
            buff.push('-='+group.name+'=-');
            group._embedded.groupSportsmen.map((groupSportsmen, indx)=>{
                let color = {};
                let channel = {};
                switch (indx) {
                    case 0:
                        color = Global.competition.color1;
                        channel = Global.competition.channel1;
                        break;
                    case 1:
                        color = Global.competition.color2;
                        channel = Global.competition.channel2;
                        break;
                    case 2:
                        color = Global.competition.color3;
                        channel = Global.competition.channel3;
                        break;
                    case 3:
                        color = Global.competition.color4;
                        channel = Global.competition.channel4;
                        break;
                    case 4:
                        color = Global.competition.color5;
                        channel = Global.competition.channel5;
                        break;
                    case 5:
                        color = Global.competition.color6;
                        channel = Global.competition.channel6;
                        break;
                    case 6:
                        color = Global.competition.color7;
                        channel = Global.competition.channel7;
                        break;
                    case 7:
                        color = Global.competition.color8;
                        channel = Global.competition.channel8;
                        break;
                }
                buff.push((indx+1)+'. ' + channel + ' - '+color+' - '+groupSportsmen.sportsman.firstName +' '+ groupSportsmen.sportsman.lastName+ (groupSportsmen.sportsman.nick?'['+groupSportsmen.sportsman.nick+']':''));
            })
        });
        navigator.clipboard.writeText(buff.join('\n'))
            .then(() => {
               alert('Group data copied to clipboard!');
            })
            .catch(err => {
                alert('Error! Failed to copy data to clipboard!');
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
            client({method: 'DELETE', path: this.contextSelectedGroupData._links.self.href}).then(response=>{
                if(this.contextSelectedGroupData.selected){
                    this.setState({
                        groupSportsmen:[],
                        group: null
                    })

                }

            });
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
            if(this.tableLaps.current)this.tableLaps.current.setStatusRace(response.entity.message);
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
    transponderHasBeenFound(transponder){
        console.log(transponder);
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

            {route: '/topic/newLap', callback: this.refreshListGroups},
            {route: '/topic/updateLap', callback: this.refreshListGroups},
            {route: '/topic/deleteLap', callback: this.refreshListGroups},

            {route: '/topic/newSportsman', callback: this.refreshListGroups},
            {route: '/topic/updateSportsman', callback: this.refreshListGroups},
            {route: '/topic/deleteSportsman', callback: this.refreshListGroups},
            {route: '/topic/newTransponder', callback: this.refreshListGroups},
            {route: '/topic/deleteTransponder', callback: this.refreshListGroups},


            {route: '/topic/updateStatusRace', callback: this.refreshListGroups}


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
        const disabledStop = false;//(this.state.statusRace === 'STOP')? true:false;
        const disabledStart = (this.state.statusRace === 'STOP' || this.state.statusRace === 'SEARCH')? false:true;
        const disabledSearch = (this.state.statusRace === 'STOP')? false:true;
        const searchButton = (Global.isConnectHardware? [<Button key="search_button" color="primary" disabled={disabledSearch} onClick={this.handleSearchTransponders} >SEARCH</Button>]:[]);
        const lapsTable = (this.state.group == null)?[
            <Container key="alert">
                <Alert color="primary">
                    Create or select a group!
                </Alert>
            </Container>
        ]:[
            <Container fluid key="laps_table">
                <Row style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex:999}}>
                    <Col md={5} className="text-left py-md-2">
                        {searchButton}
                        {'  '}
                        <Button color="info" onClick={this.generatePdf}>
                            <FilePdfIcon /> Pdf
                        </Button>
                    </Col>
                    <Col md={2} className="text-center  py-md-2">
                        <TimePanel />
                    </Col>
                    <Col className="text-right py-md-2" md={5}>
                        <Button color="danger" disabled={disabledStop} onClick={this.handleStopRace} >STOP</Button>{'  '}
                        <Button color="success" disabled={disabledStart} onClick={this.handleStartRace} >START</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <LapsTable ref={this.tableLaps} groupSportsmen={this.state.groupSportsmen} group={this.state.group} round={this.props.round}/>
                    </Col>
                </Row>
            </Container>];
        return(
            <Container fluid>
                <Row>
                    <Col className="text-center" style={{maxWidth:'200px', minWidth:'200px'}}>
                        <ModalNewGroup ref={this.dialogGroup} groups={this.state.groups} round={this.props.round} />
                        <ModalNewSportsmenToGroup ref={this.dialogAddSportsmenToGroup} round={this.props.round} />
                        <Row>
                            <Col md={6}>
                                <Button color="primary" outline style={{marginBottom: '10px'}} onClick={this.copyGpoupsToBuffer}>
                                    <ContentCopyIcon />
                                </Button>
                            </Col>
                            <Col md={6}>
                                <Button color="primary" style={{marginBottom: '10px'}} onClick={this.toggleShowNewGroup}>
                                    <PlusIcon />
                                </Button>
                            </Col>
                        </Row>
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
                        {lapsTable}
                    </Col>
                </Row>
            </Container>
        );
    }

}

export default Groups;