'use strict';
import React from 'react';
import {Button, Table} from "reactstrap";
import {WindowCloseIcon} from "mdi-react";
import stompClient from "../../websocket_listener";
import client from "../../client";
import {Badge, ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import ReactDOM from "react-dom";

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
            group:{}
        }
        this.refreshTableLaps = this.refreshTableLaps.bind(this);
        this.contextMenuHide  = this.contextMenuHide.bind(this);
        this.contextMenuShow  = this.contextMenuShow.bind(this);
        this.editToOutOfScore = this.editToOutOfScore.bind(this);
        this.rowEvents = this.rowEvents.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.group = null;
        this.contextSelectedItem = null;
        this.contextSelectedItemData = null;
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
                        if (laps[lap._links.sportsmanId.href] == null) laps[lap._links.sportsmanId.href] = [];
                        laps[lap._links.sportsmanId.href].push(lap);
                    });

                    this.setState({
                        laps: laps,
                        group: g.entity
                    });
                });
            });
        }
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
        let countRows = 0;
        let width = "100%";
        if(this.state.groupSportsmen.length > 0) width = Math.floor(100/this.state.groupSportsmen.length);

        headerTable.push(<th key="lap" width="50" style={{textAlign: 'center'}}>LAP</th>);
        this.state.groupSportsmen.map((groupSportsman, idx)=>{
            headerTable.push(<th width={width + '%'}
                                 key={groupSportsman._links.self.href}
                                 onDragOver={() => this.onDragSportsmenOver(idx)}
                                 draggable
                                 onDragStart={(e) => this.onDragSportsmenStart(e, idx)}
                                 onDragEnd={this.onDragSportsmenEnd}>
                {groupSportsman.sportsman.firstName} {groupSportsman.sportsman.lastName}{groupSportsman.sportsman.nick != ""?'('+groupSportsman.sportsman.nick+')':''}
                    <WindowCloseIcon
                        color="grey"
                        style={{float:'right', cursor:'pointer'}}
                        onClick={(e) => this.onDeleteGroupSportsman(e, groupSportsman)}/>
                        </th>);
            if(this.state.laps[groupSportsman.sportsman.id] != null) {
                let lengthLaps = this.state.laps[groupSportsman.sportsman.id].length
                if(lengthLaps > countRows) countRows = lengthLaps;
            }
        });

        for(let i = 0; i < countRows; i++){
            let cels = [<td key={'lap_'+i}  width="50" style={{textAlign: 'center'}}>{i+1}</td>];
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
                            gap = <span className="badge badge-success">{timeGap.toClearHHMMSSMSSS()}</span>
                        }else if (timeGap === 0){
                            gap = <span className="badge badge-primary">{timeGap.toClearHHMMSSMSSS()}</span>
                        }else{
                            gap = <span className="badge badge-danger">{timeGap.toClearHHMMSSMSSS()}</span>
                        }
                    }


                    cels.push(<td width={width + '%'} key={lap._links.self.href} className={outOfScope} onContextMenu={(e) => this.rowEvents(e, lap, i)}>{time.toHHMMSSMSSS()} {gap}</td>)
                }else{
                    cels.push(<td width={width + '%'} key={groupSportsman._links.self.href+'_empty_'+i}></td>)
                }
            });
            lapsTable.push(<tr key={'row_'+i}>{cels}</tr>);
        }
        return(
            <>
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
                <Table bordered striped hover >
                    <thead>
                    <tr>
                        {headerTable}
                    </tr>
                    </thead>
                    <tbody>
                        {lapsTable}
                    </tbody>
                </Table>
            </>
        );
    }
}
export default LapsTable;