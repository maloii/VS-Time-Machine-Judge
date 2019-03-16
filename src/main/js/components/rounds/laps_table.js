'use strict';
import React from 'react';
import {Button, Table, Tooltip} from "reactstrap";
import {WindowCloseIcon, MenuIcon, ClipboardCheckOutlineIcon} from "mdi-react";
import stompClient from "../../websocket_listener";
import client from "../../client";
import Global from "../../global"
import Settings from "../../settings"
import {Badge, ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import ModalListAllLaps from "./modal_list_all_laps";
import ReactDOM from "react-dom";
import ModalSportsman from "../sportsman/modal_new_sportsman";


Number.prototype.toHHMMSSMSSS = function () {
    var minus = false;
    var sec_num = parseInt(this, 10);
    if(sec_num < 0) minus = true;
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor((sec_num/1000) / 3600);
    var minutes = Math.floor(((sec_num/1000) - (hours * 3600)) / 60);
    var seconds = Math.floor((sec_num/1000) - (hours * 3600) - (minutes * 60));
    var miliseconds = sec_num%1000;

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (miliseconds < 10) {miliseconds = "00"+miliseconds;}
    if (miliseconds < 100 && miliseconds >= 10) {miliseconds = "0"+miliseconds;}
    var res = (minus?'-':'')+(hours !== "00"?hours+':':'')+minutes+':'+seconds+'.'+miliseconds;
    return res;
}

Number.prototype.toClearHHMMSSMSSS = function () {
    var minus = false;
    var sec_num = parseInt(this, 10);
    if(sec_num < 0) minus = true;
    sec_num = Math.abs(sec_num);
    var hours   = Math.floor((sec_num/1000) / 3600);
    var minutes = Math.floor(((sec_num/1000) - (hours * 3600)) / 60);
    var seconds = Math.floor((sec_num/1000) - (hours * 3600) - (minutes * 60));
    var miliseconds = sec_num%1000;

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (miliseconds < 10) {miliseconds = "00"+miliseconds;}
    if (miliseconds < 100 && miliseconds >= 10) {miliseconds = "0"+miliseconds;}
    var res = (minus?'-':'')+(hours !== "00"?hours+':':'')+(minutes !== "00"?minutes+":":"")+seconds+'.'+miliseconds;
    return res;
}

let contextTrigger = null;
class LapsTable  extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            groupSportsmen: this.props.groupSportsmen,
            laps:[],
            group:{},
            tooltipOpen: false
        }
        this.showEditSportsman = this.showEditSportsman.bind(this);
        this.refreshTableLaps = this.refreshTableLaps.bind(this);
        this.editToOutOfScore = this.editToOutOfScore.bind(this);
        this.contextMenuHide  = this.contextMenuHide.bind(this);
        this.contextMenuShow  = this.contextMenuShow.bind(this);
        this.showListAllLaps = this.showListAllLaps.bind(this);
        this.toggleTooltip = this.toggleTooltip.bind(this);
        this.rowEvents = this.rowEvents.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.group = null;
        this.contextSelectedItem = null;
        this.contextSelectedItemData = null;

        this.dialogSportsman = React.createRef();
        this.dialogListAllLaps = React.createRef();
    }

    toggleTooltip() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    deleteRow(e){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: e.data._links.self.href});
        }
    }


    editToOutOfScore(e){
        let typeInMessage = 'OUT OF SCORE';
        if(e.data.typeLap === 'OUT_OF_SCORE') typeInMessage = 'IN SCORE';
        if(confirm('Do you really want to mark the entry as ['+typeInMessage+']?')) {
            if(e.data.typeLap === 'OUT_OF_SCORE'){
                e.data.typeLap = 'OK';
            }else {
                e.data.typeLap = 'OUT_OF_SCORE';
            }
            client({
                method: 'PUT',
                path: e.data._links.self.href,
                entity: e.data,
                headers: {'Content-Type': 'application/json'}
            });
        }
    }

    rowEvents(e, lap, rowIndex){
        if(contextTrigger) {
            this.contextSelectedItem = e.currentTarget;
            this.contextSelectedItemData = lap;
            let outOfScope = '';
            if(lap.typeLap === 'OUT_OF_SCORE') outOfScope = 'out-of-scope';
            this.contextSelectedItem.className = 'default-focus-cell '+outOfScope;
            e.data = lap;
            contextTrigger.handleContextClick(e );
        }
    }
    contextMenuHide(e){
        if(this.contextSelectedItem != null && this.contextSelectedItemData != null){
            let outOfScope = '';
            if(this.contextSelectedItemData.typeLap === 'OUT_OF_SCORE') outOfScope = 'out-of-scope';
            this.contextSelectedItem.className = outOfScope;
        }
    }
    contextMenuShow(e){
        if(this.contextSelectedItemData != null && this.contextSelectedItemData.typeLap === 'OUT_OF_SCORE'){
            ReactDOM.findDOMNode(this.refs['outOfScore']).innerText = "In Score";
        }else{
            ReactDOM.findDOMNode(this.refs['outOfScore']).innerText = "Out of score";
        }
    }
    refreshTableLaps() {
        if(this.group != null) {
            client({
                method: 'GET',
                path: this.group._links.self.href
            }).then(g => {
                client({
                    method: 'GET',
                    path: g.entity._links.laps.href
                }).then(lapsResponse => {
                    let laps = [];
                    lapsResponse.entity._embedded.laps.map(lap => {
                        if (laps[lap._links.sportsmanId.href] == null){
                            laps[lap._links.sportsmanId.href] = [];
                        }
                        if(lap.typeLap !== 'HIDDEN') {
                            laps[lap._links.sportsmanId.href].push(lap);
                        }
                    });

                    this.setState({
                        laps: laps,
                        group: g.entity
                    });
                });
            });
        }
    }
    showEditSportsman(url) {
        this.dialogSportsman.current.toggleEditShow(url);
    }
    showListAllLaps(e, groupSportsman){
        this.dialogListAllLaps.current.toggleShow(groupSportsman);
    }
    componentDidMount() {
        if(this.props.group != null){
            this.group = this.props.group;
            this.refreshTableLaps();
        }
        this.stomp = stompClient.register([
            {route: '/topic/newLap', callback: this.refreshTableLaps},
            {route: '/topic/updateLap', callback: this.refreshTableLaps},
            {route: '/topic/deleteLap', callback: this.refreshTableLaps},
            {route: '/topic/updateGroupSportsman', callback: this.refreshTableLaps}
        ]);
    }
    componentWillUnmount(){
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.group != null){
            this.group = nextProps.group;
            this.refreshTableLaps();
        }
        if(nextProps.groupSportsmen != null){
            this.setState({groupSportsmen: nextProps.groupSportsmen})
        }
    }
    onDragSportsmenStart = (e, index) => {
        this.draggedItem = this.state.groupSportsmen[index];
        e.dataTransfer.effectAllowed = "move";
    };
    onDragSportsmenOver = index => {
        const draggedOverItem = this.state.groupSportsmen[index];
        if (this.draggedItem === draggedOverItem) {
            return;
        }
        let items = this.state.groupSportsmen.filter(item => item !== this.draggedItem);
        items.splice(index, 0, this.draggedItem);
        this.setState({ groupSportsmen:items });
    };

    onDragSportsmenEnd = () => {
        this.state.groupSportsmen.map((groupSportsmen, indx)=>{
            var copyGroupSportsmen = Object.assign({}, groupSportsmen);
            copyGroupSportsmen.sort = indx;
            delete copyGroupSportsmen.sportsman;
            delete copyGroupSportsmen.group;
            client({
                method: 'PUT',
                path: groupSportsmen._links.self.href,
                entity: copyGroupSportsmen,
                headers: {'Content-Type': 'application/json'}
            });
        });
        this.draggedIdx = null;
    };
    onDeleteGroupSportsman = (e, groupSportsman) =>{
        if(confirm('Do you really want to delete the record?')) {
            client({method: 'DELETE', path: groupSportsman._links.self.href});
        }
    }
    render(){
        const headerTable = [];
        const lapsTable = [];
        const footerTable = [];
        let countRows = 0;
        let width = "100%";
        if(this.state.groupSportsmen.length > 0) width = Math.floor(100/this.state.groupSportsmen.length);

        let cels_names = [<th key="lap" width="50" style={{textAlign: 'center', verticalAlign:'middle'}}>LAP</th>];
        this.state.groupSportsmen.map((groupSportsman, idx)=>{
            cels_names.push(<th width={width + '%'}
                                 key={groupSportsman._links.self.href}
                                 onDoubleClick={() => this.showEditSportsman(groupSportsman._links.sportsman.href)}
                                 onDragOver={() => this.onDragSportsmenOver(idx)}
                                 draggable
                                 onDragStart={(e) => this.onDragSportsmenStart(e, idx)}
                                 onDragEnd={this.onDragSportsmenEnd}>
                <WindowCloseIcon
                    color="grey"
                    style={{float:'right', cursor:'pointer'}}
                    onClick={(e) => this.onDeleteGroupSportsman(e, groupSportsman)}/>
                {groupSportsman.sportsman.firstName} {groupSportsman.sportsman.lastName} {groupSportsman.sportsman.nick != ""?'('+groupSportsman.sportsman.nick+')':''}
                        </th>);
            if(this.state.laps[groupSportsman.sportsman.id] != null) {
                let lengthLaps = this.state.laps[groupSportsman.sportsman.id].length
                if(lengthLaps > countRows) countRows = lengthLaps;
            }
        });
        headerTable.push(<tr key={'row_names'}>{cels_names}</tr>);
        let cels_colors = [<td key={'cell_color'}></td>];
        this.state.groupSportsmen.map((groupSportsman, indx)=>{
            let color = {};
            let channel = {};
            let textColor = 'BLACK';
            let border = '0px';
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
            if(color === 'BLACK' || color === 'BLUE') textColor = 'WHITE';
            if(color === 'WHITE') border = '1px solid black';
            let channelNumber = Settings.channelNumber[channel];

            let hasBeenFound = [];

            if(groupSportsman.searchTransponder) hasBeenFound = [<ClipboardCheckOutlineIcon key="has_been_found" color="green" style={{float:'right', cursor:'pointer'}} />]


            cels_colors.push(<td
                                 key={'cell_color_'+indx}>
            <MenuIcon
                key="menu_icon"
                color="grey"
                style={{float:'right', cursor:'pointer'}}
                onClick={(e) => this.showListAllLaps(e, groupSportsman)}/>
                <span id={'span_color_'+indx}
                    style={{  backgroundColor: color,
                                color: textColor,
                                borderRadius:'15px ',
                                padding:'5px',
                                border: border
                }}>
                    {channel}
                </span>
                <Tooltip placement="right" isOpen={this.state.tooltipOpen} target={'span_color_'+indx} toggle={this.toggleTooltip}>
                    [{channelNumber}]
                </Tooltip>
                {hasBeenFound}
            </td>);
        });
        headerTable.push(<tr key={'row_colors'}>{cels_colors}</tr>);

        for(let i = 0; i < countRows; i++){
            let lapNumber = (Global.competition.skipFirstGate? i:i+1);
            let cels = [<td key={'lap_'+i}  width="50" style={{textAlign: 'center'}}>{lapNumber}</td>];
            this.state.groupSportsmen.map(groupSportsman=>{
                if(this.state.laps[groupSportsman.sportsman.id] != null &&
                    this.state.laps[groupSportsman.sportsman.id].length > i) {
                    let lap = this.state.laps[groupSportsman.sportsman.id][i];
                    let time = 0;
                    if(i === 0){
                        time = lap.millisecond - this.state.group.startMillisecond;
                    }else{
                        time = lap.millisecond - this.state.laps[groupSportsman.sportsman.id][i-1].millisecond;
                    }
                    this.state.laps[groupSportsman.sportsman.id][i].time = time;
                    let outOfScope = '';
                    if(lap.typeLap === 'OUT_OF_SCORE') outOfScope = 'out-of-scope';
                    let gap = '';
                    if(i > 0){
                        let timeGap = this.state.laps[groupSportsman.sportsman.id][i-1].time - time;
                        if(timeGap > 0){
                            gap = <span className="badge badge-success" style={{fontWeight:'normal'}}>{timeGap.toClearHHMMSSMSSS()}</span>
                        }else if (timeGap === 0){
                            gap = <span className="badge badge-primary" style={{fontWeight:'normal'}}>{timeGap.toClearHHMMSSMSSS()}</span>
                        }else{
                            gap = <span className="badge badge-danger" style={{fontWeight:'normal'}}>{timeGap.toClearHHMMSSMSSS()}</span>
                        }
                    }
                    let timeString  = time.toHHMMSSMSSS();
                    if(Global.competition.skipFirstGate && i == 0){
                        timeString = 'START';
                        gap = <span className="badge badge-primary" style={{fontWeight:'normal'}}>{time.toClearHHMMSSMSSS()}</span>
                    }

                    cels.push(<td width={width + '%'}
                                  key={lap._links.self.href}
                                  className={outOfScope}
                                  style={{whiteSpace:'nowrap'}}
                                  onContextMenu={(e) => this.rowEvents(e, lap, i)}>{timeString} {gap}</td>)
                }else{
                    cels.push(<td width={width + '%'} key={groupSportsman._links.self.href+'_empty_'+i}></td>)
                }
            });
            lapsTable.push(<tr key={'row_'+i}>{cels}</tr>);
        }

        if(countRows > 0) {
            const colFooterTable = [<td
                key="footer_table_total">{this.props.round.typeRace === 'FIXED_COUNT_LAPS' ? 'POS' : 'Total'}</td>];
            const resalts = [];
            this.state.groupSportsmen.map(groupSportsman => {
                let time = 0;
                let count = 0;
                if (this.state.laps[groupSportsman.sportsman.id] != null) {
                    let laps = this.state.laps[groupSportsman.sportsman.id].filter(lap => lap.typeLap === 'OK');
                    count = laps.length;
                    if (count > 0) time = laps[laps.length - 1].millisecond - this.state.group.startMillisecond;
                }
                resalts[groupSportsman.sportsman.id] = {
                    count: count,
                    time: time
                }
            });
            if (this.props.round.typeRace === 'FIXED_COUNT_LAPS') {
                this.state.groupSportsmen.map(groupSportsman => {
                    let pos = this.state.groupSportsmen
                        .filter(gs => gs.sportsman.id !== groupSportsman.sportsman.id)
                        .filter(gs => {
                            return resalts[gs.sportsman.id].count > resalts[groupSportsman.sportsman.id].count ||
                                (resalts[gs.sportsman.id].count == resalts[groupSportsman.sportsman.id].count
                                    && resalts[gs.sportsman.id].time < resalts[groupSportsman.sportsman.id].time)
                        })
                        .length + 1;
                    let resalt = Object.assign({}, resalts[groupSportsman.sportsman.id]);
                    resalt.pos = pos;
                    resalts[groupSportsman.sportsman.id] = resalt;
                });
            }
            this.state.groupSportsmen.map(groupSportsman => {
                let total = [];
                let resalt = resalts[groupSportsman.sportsman.id];
                if (this.props.round.typeRace === 'FIXED_COUNT_LAPS') {
                    total.push(<b key="pos">{resalt.pos} </b>)
                    if (resalt.count == this.props.round.countLap) {
                        total.push(<span key="time">{'(' + resalt.time.toHHMMSSMSSS() + ')'}</span>);
                    }
                } else if (this.props.round.typeRace === 'FIXED_TIME' || this.props.round.typeRace === 'FIXED_TIME_AND_ONE_LAP_AFTER') {
                    total.push(<span key="count"><b>{resalt.count}</b> {'laps'}</span>);
                }
                colFooterTable.push(<td key={groupSportsman._links.self.href}>{total}</td>)
            });
            footerTable.push(<tfoot key="footer_table">
                                <tr>
                                    {colFooterTable}
                                </tr>
                            </tfoot>);
        }
        return(
            <div>
                <ModalListAllLaps ref={this.dialogListAllLaps}/>
                <ModalSportsman ref={this.dialogSportsman}/>
                <ContextMenuTrigger id="some_unique_identifier" ref={c => contextTrigger = c} collect={props => props}>
                    <div></div>
                </ContextMenuTrigger>

                <ContextMenu id="some_unique_identifier" onHide={this.contextMenuHide} onShow={this.contextMenuShow}  collect={props => props}>
                    <MenuItem onClick={this.editToOutOfScore} ref="outOfScore">
                        Out of score
                    </MenuItem>
                    <MenuItem onClick={this.deleteRow}>
                        Delete
                    </MenuItem>
                </ContextMenu>
                <Table bordered striped hover className="tableFixHead">
                    <thead>
                        {headerTable}
                    </thead>
                    <tbody>
                        {lapsTable}
                    </tbody>
                    {footerTable}
                </Table>
            </div>
        );
    }
}
export default LapsTable;