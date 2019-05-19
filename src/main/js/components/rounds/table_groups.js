import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Table} from "reactstrap";
import Global from "../../global";

class TableGroups extends Component {

    channelAndColor = indx => {
        let color = {};
        let channel = '';
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
        return ({
            color,
            channel,
            textColor,
            border
        })
    }

    render() {
        const { round, groups } = this.props;

        return (
            <Fragment>
                <h3 style={{ textAlign: 'center', marginBottom: '15px'}}>{round.name}</h3>
                <Table bordered striped hover className="tableFixHead">
                    <thead>
                    <tr>
                        <th>Pos.</th>
                        <th>Sportsman</th>
                        <th>Channel</th>
                        <th>Color</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groups.map((group, indxGroup) => (
                        <Fragment  key={`${indxGroup}_group`}>
                            <tr>
                                <th colSpan={4}>{group.name}</th>
                            </tr>
                            {group._embedded.groupSportsmen.map((groupSportsman, indx) => {
                                const cac = this.channelAndColor(indx);
                                return (
                                    <tr key={`${indx}_groupSportsman`}>
                                        <td>#{indx + 1}</td>
                                        <td>{`${groupSportsman.sportsman.firstName} ${groupSportsman.sportsman.lastName}${groupSportsman.sportsman.nick != ""?' ('+groupSportsman.sportsman.nick+')':''}`}</td>
                                        <td>{cac.channel}</td>
                                        <td
                                            style={{
                                                backgroundColor: cac.color,
                                                color: cac.textColor
                                            }}>
                                            {cac.color}
                                        </td>
                                    </tr>
                                )})}
                        </Fragment>
                    ))}
                    </tbody>
                </Table>
            </Fragment>
        );
    }
}

TableGroups.propTypes = {
    round: PropTypes.object.isRequired,
    groups: PropTypes.array.isRequired
};

export default TableGroups;