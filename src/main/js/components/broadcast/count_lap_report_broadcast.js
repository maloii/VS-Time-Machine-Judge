'use strict';
import React from "react";
import {Table} from "reactstrap";

class CountLapReportBroadcast extends React.Component {
    constructor(props) {
        super(props);

    }
    render(){
        let tableRows = [];
        let html = <></>;
        if(this.props.short){
            this.props.report.data.slice(0, 10).map(row=>{
                tableRows.push(<tr key={row.sportsman.id}>
                    <td className="position">{row.position}</td>
                    <td className="fio">{(row.sportsman.nick ? row.sportsman.nick : row.sportsman.lastName)}</td>
                    <td className="time">{row.count}</td>
                    <td className="gap">{row.gap}</td>
                </tr>);
            });
            html =  <div key="broadcast_table_count_short">
                        <table className="broadcast_table_short">
                            <tbody>
                            {tableRows}
                            </tbody>
                        </table>
                    </div>;
        }else{
            this.props.report.data.slice(0, 10).map(row=>{
                tableRows.push(<tr key={row.sportsman.id}>
                    <td style={{width:'50px'}}>{row.position}</td>
                    <td>{row.sportsman.firstName + ' ' + row.sportsman.lastName +(row.sportsman.nick?'['+row.sportsman.nick+']':'')}</td>
                    <td>{row.count}</td>
                    <td>{row.gap}</td>
                    <td>{row.rel}</td>
                </tr>);
            });
            html = <div key="broadcast_table_count">
                        <div className="title">{this.props.report.report.name}</div>
                        <table className="broadcast_table">
                            <thead>
                            <tr>
                                <th style={{width:'50px'}}>Pos</th>
                                <th>Sportsmen</th>
                                <th>Laps</th>
                                <th>Gap</th>
                                <th>Rel.</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tableRows}
                            </tbody>
                        </table>
                    </div>;
        }
        return(html);
    }

}

export default CountLapReportBroadcast;