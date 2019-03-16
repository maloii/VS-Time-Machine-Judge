'use strict';
import React from "react";
import {Table} from "reactstrap";

class CountLapReport extends React.Component {
    constructor(props) {
        super(props);

    }
    render(){
        let tableRows = [];
        this.props.report.data.map(row=>{
            tableRows.push(<tr key={row.sportsman.id}>
                <td style={{width:'50px'}}>{row.position}</td>
                <td>{row.sportsman.firstName + ' ' + row.sportsman.lastName +(row.sportsman.nick?'['+row.sportsman.nick+']':'')}</td>
                <td>{row.count}</td>
                <td>{row.gap}</td>
                <td>{row.rel}</td>
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
                        <th>Laps</th>
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

export default CountLapReport;