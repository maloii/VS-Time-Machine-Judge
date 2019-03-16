'use strict';
import React from "react";
import {Table} from "reactstrap";

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

class BestLapReport extends React.Component {
    constructor(props) {
        super(props);

    }
    render(){
        let tableRows = [];
        this.props.report.data.map(row=>{
            tableRows.push(<tr key={row.sportsman.id}>
                <td style={{width:'50px'}}>{row.position}</td>
                <td>{row.sportsman.firstName + ' ' + row.sportsman.lastName +(row.sportsman.nick?'['+row.sportsman.nick+']':'')}</td>
                <td>{(row.timeLap<999999999)?row.timeLap.toHHMMSSMSSS():'--:--.---'}</td>
                <td>{(row.gap && row.timeLap<999999999)?row.gap.toClearHHMMSSMSSS():''}</td>
                <td>{(row.rel && row.timeLap<999999999)?row.rel.toClearHHMMSSMSSS():''}</td>
            </tr>);
        })
        return(
            <div>
                <h5 style={{textAlign:'center', marginBottom:'20px'}}>{this.props.report.report.name}</h5>
                <Table bordered striped hover key="table" className="table-sm">
                    <thead>
                    <tr>
                        <th style={{width:'50px'}}>Pos</th>
                        <th>Sportsmen</th>
                        <th>Time</th>
                        <th>Gap</th>
                        <th>Rel.</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tableRows}
                    </tbody>
                </Table>
            </div>
        );
    }

}

export default BestLapReport;