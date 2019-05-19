import React, {Component} from 'react';
import PropTypes from 'prop-types';

class PositionSportsmenBroadcast extends Component {

    render() {
        const { report } = this.props;
        return (
            <div>
                <div className="title">{report.report.name}</div>
                <table className="broadcast_table">
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
                </table>
            </div>
        );
    }
}

PositionSportsmenBroadcast.propTypes = {
    report: PropTypes.object.isRequired
};

export default PositionSportsmenBroadcast;