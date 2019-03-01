'use strict';
import React from 'react';
import {Table} from "reactstrap";
import stompClient from "../../websocket_listener";
import client from "../../client";
import {ContextMenu, ContextMenuTrigger, MenuItem, Badge} from "react-contextmenu";
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
            sportsmen: [],
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
        if(this.contextSelectedItem != null){
            let outOfScope = '';
            if(lap.typeLap === 'OUT_OF_SCORE') outOfScope = 'out-of-scope';
            this.contextSelectedItem.className = outOfScope;
        }
    }
    contextMenuShow(e){
        if(this.contextSelectedItemData != null && this.contextSelectedItemData.typeLap === 'OUT_OF_SCORE'){
            ReactDOM.findDOMNode(this.refs['outOfScore']).innerText = "In Score";
        }else{
            ReactDOM.findDOMNode(this.refs['outOfScore']).innerText = "Out of score";
        }
        console.log(e.detail.data.typeLap);
        console.log(ReactDOM.findDOMNode(this.refs['outOfScore']));
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
                        if (laps[lap._links.sportsmanSelf.href] == null) laps[lap._links.sportsmanSelf.href] = [];
                        laps[lap._links.sportsmanSelf.href].push(lap);
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
            {route: '/topic/deleteLap', callback: this.refreshTableLaps}
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
    }
    render(){
        const headerTable = [];
        const lapsTable = [];
        let countRows = 0;

        headerTable.push(<th key="lap" width="50" style={{textAlign: 'center'}}>LAP</th>);
        this.props.sportsmen.map(sportsman=>{
            headerTable.push(<th key={sportsman._links.self.href}>{sportsman.firstName} {sportsman.lastName}</th>);
            if(this.state.laps[sportsman._links.self.href] != null) {
                let lengthLaps = this.state.laps[sportsman._links.self.href].length
                if(lengthLaps > countRows) countRows = lengthLaps;
            }
        });
        for(let i = 0; i < countRows; i++){
            let cels = [<td key={'lap_'+i}  width="50" style={{textAlign: 'center'}}>{i+1}</td>];
            this.props.sportsmen.map(sportsman=>{
                if(this.state.laps[sportsman._links.self.href] != null &&
                    this.state.laps[sportsman._links.self.href].length > i) {
                    let lap = this.state.laps[sportsman._links.self.href][i];
                    let time = 0;
                    if(i === 0){
                        time = lap.millisecond - this.state.group.startMillisecond;
                    }else{
                        time = lap.millisecond - this.state.laps[sportsman._links.self.href][i-1].millisecond;
                    }
                    this.state.laps[sportsman._links.self.href][i].time = time;
                    let outOfScope = '';
                    if(lap.typeLap === 'OUT_OF_SCORE') outOfScope = 'out-of-scope';
                    let gap = '';
                    if(i > 0){
                        let timeGap = this.state.laps[sportsman._links.self.href][i-1].time - time;
                        if(timeGap > 0){
                            gap = <span className="badge badge-success">{timeGap.toClearHHMMSSMSSS()}</span>
                        }else if (timeGap === 0){
                            gap = <span className="badge badge-primary">{timeGap.toClearHHMMSSMSSS()}</span>
                        }else{
                            gap = <span className="badge badge-danger">{timeGap.toClearHHMMSSMSSS()}</span>
                        }
                    }


                    cels.push(<td key={lap._links.self.href} className={outOfScope} onContextMenu={(e) => this.rowEvents(e, lap, i)}>{time.toHHMMSSMSSS()} {gap}</td>)
                }else{
                    cels.push(<td key={sportsman._links.self.href+'_empty_'+i}></td>)
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
                <Table bordered striped hover>
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