'use strict';
import React from 'react';
import {Table} from "reactstrap";
import stompClient from "../../websocket_listener";
import client from "../../client";
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";

Number.prototype.toHHMMSSMSSS = function () {
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
    var res = (hours !== "00"?hours+':':'')+minutes+':'+seconds+'.'+miliseconds;
    return res;
}

let contextTrigger = null;
class LapsTable  extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sportsmen: [],
            laps:[]
        }
        this.refreshTableLaps = this.refreshTableLaps.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.editRow = this.editRow.bind(this);
    }



    deleteRow(e){
        console.log('deleteRow');
    }


    editRow(e){
        console.log('editRow');
        console.log(e.data);
    }

    rowEvents = {
        onContextMenu:(e, row, rowIndex) =>{
            if(contextTrigger) {
                e.data = row;
                contextTrigger.handleContextClick(e );
            }
        }
    };
    refreshTableLaps(url) {
        client({
            method: 'GET',
            path: url
        }).then(lapsResponse => {
            let laps = [];
            lapsResponse.entity._embedded.laps.map(lap => {
                if(laps[lap._links.sportsmanSelf.href] == null) laps[lap._links.sportsmanSelf.href] = [];
                laps[lap._links.sportsmanSelf.href].push(lap);
            });

            this.setState({laps: laps});
        });
    }

    componentDidMount() {
        if(this.props.group != null) this.refreshTableLaps(this.props.group._links.laps.href);
        this.stomp = stompClient.register([
            {route: '/topic/newLap', callback: this.refreshListGroups},
            {route: '/topic/updateLap', callback: this.refreshListGroups},
            {route: '/topic/deleteLap', callback: this.refreshListGroups}
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
        if(nextProps.group != null)this.refreshTableLaps(nextProps.group._links.laps.href);
    }
    render(){
        const headerTable = [];
        const lapsTable = [];
        let countRows = 0;

        headerTable.push(<th key="lap">LAP</th>);
        this.props.sportsmen.map(sportsman=>{
            headerTable.push(<th key={sportsman._links.self.href}>{sportsman.firstName} {sportsman.lastName}</th>);
            if(this.state.laps[sportsman._links.self.href] != null) {
                let lengthLaps = this.state.laps[sportsman._links.self.href].length
                if(lengthLaps > countRows) countRows = lengthLaps;
            }
        });
        for(let i = 0; i < countRows; i++){
            let cels = [<td key={'lap_'+i}>{i+1}</td>];
            this.props.sportsmen.map(sportsman=>{
                if(this.state.laps[sportsman._links.self.href] != null &&
                    this.state.laps[sportsman._links.self.href].length > i) {
                    let lap = this.state.laps[sportsman._links.self.href][i];
                    let time = 0;
                    if(i === 0){
                        time = lap.millisecond - this.props.group.startMillisecond;
                    }else{
                        time = lap.millisecond - this.state.laps[sportsman._links.self.href][i-1].millisecond;
                    }

                    cels.push(<td key={lap._links.self.href}>{time.toHHMMSSMSSS()}</td>)
                }else{
                    cels.push(<td key={sportsman._links.self.href+'_empty_'+i}></td>)
                }
            });
            lapsTable.push(<tr key={'row_'+i}>{cels}</tr>);
        }
        return(
            <>
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
                <Table bordered>
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