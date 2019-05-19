import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Table} from "reactstrap";

class PositionSportsmen extends Component {

    render() {
        const { report } = this.props;
        return (
            <div>
                <h5 style={{textAlign:'center', marginBottom:'20px'}}>{report.report.name}</h5>
                <Table bordered striped hover key="table" className="table-sm broadcast_table">
                    <thead>
                    <tr>
                        <th style={{width:'50px'}}>Pos</th>
                        <th>Sportsmen</th>
                        <th>Team</th>
                    </tr>
                    </thead>
                    <tbody>
                    {report.data.map(sportsman => (
                        <tr key={sportsman.id}>
                            <td style={{width:'50px'}}>{sportsman.position? sportsman.position : "N/P"}</td>
                            <td>{sportsman.firstName + ' ' + sportsman.lastName +(sportsman.nick?'['+sportsman.nick+']':'')}</td>
                            <td>{sportsman.team}</td>
                        </tr>
                            ))}
                    </tbody>
                </Table>
            </div>
        );
    }
}

PositionSportsmen.propTypes = {
    report: PropTypes.object.isRequired
};

export default PositionSportsmen;