'use strict';

import React from "react";
import stompClient from "../../websocket_listener";
import client from "../../client";
import Settings from "../../settings";
import Global from "../../global";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
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
class CurrentGroupGridBroadcast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            group:{},
            competition:{}
        }
        this.selectCompetition = this.selectCompetition.bind(this);
        this.refreshGroup = this.refreshGroup.bind(this);
        this.refreshTime = this.refreshTime.bind(this);
    }

    refreshTime(){

    }
    refreshGroup(){
        client({method: 'GET', path: Settings.root+'/groups/search/selectedBroadcast'}).done(response => {
            this.setState({
                group:response.entity
            });
        });
    }

    selectCompetition() {
        client({method: 'GET', path: Settings.root+'/competitions'}).done(response => {

            const selectedCompetition = response.entity._embedded.competitions.filter(function(competition) {
                return competition.selected;
            });
            let competition = {};
            if(selectedCompetition.length > 0){
                competition = selectedCompetition[0];
            }
            this.setState({
                competition:competition,
                competitions: response.entity._embedded.competitions,

            });
            this.refreshGroup();
        });
    }

    componentDidMount() {
        this.selectCompetition();
        this.stomp = stompClient.register([
            {route: '/topic/reportTimeRace', callback: this.refreshTime},
            {route: '/topic/newLap', callback: this.refreshGroup},
            {route: '/topic/updateLap', callback: this.refreshGroup},
            {route: '/topic/deleteLap', callback: this.refreshGroup},
            {route: '/topic/updateGroupSportsman', callback: this.refreshGroup},
            {route: '/topic/updateGroup', callback: this.refreshGroup},
            {route: '/topic/updateRound', callback: this.refreshGroup},
            {route: '/topic/updateSportsman', callback: this.refreshGroup},
            {route: '/topic/newCompetition', callback: this.selectCompetition},
            {route: '/topic/updateCompetition', callback: this.selectCompetition},
            {route: '/topic/deleteCompetition', callback: this.selectCompetition}
        ]);
    }

    componentWillUnmount() {
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }
    render(){
        let grid = [];
        let html = <></>;

        if (this.state.group._embedded) {
            this.state.group._embedded.groupSportsmen.map((groupSportsman, i) => {
                let lapsHtml = [];
                let laps = groupSportsman.laps.filter(lap => (lap.typeLap === 'OK' || lap.typeLap === 'START'));
                let lapNumber = 0;
                let start = 0;
                if(laps.length >= 10){
                    start = laps.length - 11;
                    lapNumber = start-1;
                }
                laps.slice(start, laps.length).map((lap, indx) => {
                    let timeBefore = 0;
                    if ((indx+start) == 0) {
                        timeBefore = this.state.group.startMillisecond;
                    } else {
                        timeBefore = laps[indx+start - 1].millisecond
                    }
                    let time = lap.millisecond - timeBefore;
                    let timeStr = time.toHHMMSSMSSS();
                    let lapStr = '';
                    if (lap.typeLap === 'START') {
                        timeStr = 'START';
                    } else {
                        lapNumber++;
                        lapStr = lapNumber + ' - ';
                    }
                    lapsHtml.push(
                        <li key={lap.id}><span>{lapStr}</span>{timeStr}</li>
                    );
                });

                let color = {};
                let channel = '';
                switch (i) {
                    case 0:
                        color = this.state.competition.color1;
                        channel = this.state.competition.channel1;
                        break;
                    case 1:
                        color = this.state.competition.color2;
                        channel = this.state.competition.channel2;
                        break;
                    case 2:
                        color = this.state.competition.color3;
                        channel = this.state.competition.channel3;
                        break;
                    case 3:
                        color = this.state.competition.color4;
                        channel = this.state.competition.channel4;
                        break;
                    case 4:
                        color = this.state.competition.color5;
                        channel = this.state.competition.channel5;
                        break;
                    case 5:
                        color = this.state.competition.color6;
                        channel = this.state.competition.channel6;
                        break;
                    case 6:
                        color = this.state.competition.color7;
                        channel = this.state.competition.channel7;
                        break;
                    case 7:
                        color = this.state.competition.color8;
                        channel = this.state.competition.channel8;
                        break;
                }
                if(this.props.present){
                    grid.push(
                        <ReactCSSTransitionGroup
                            key={i}
                            transitionName="anim"
                            transitionEnterTimeout={300}
                            transitionLeaveTimeout={300}>
                            <div key={groupSportsman.id}>
                                <div>
                                    <div className="data">
                                        <div>
                                        <img src={groupSportsman.sportsman.photo} alt={groupSportsman.sportsman.nick}
                                             width="100px" height="100px"/>
                                        </div>
                                        <span
                                            style={{borderLeft: '10px solid ' + color}}>{groupSportsman.sportsman.firstName} {groupSportsman.sportsman.lastName} {groupSportsman.sportsman.nick != "" ? '(' + groupSportsman.sportsman.nick + ')' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </ReactCSSTransitionGroup>)
                }else {
                    grid.push(
                        <ReactCSSTransitionGroup
                            key={i}
                            transitionName="anim"
                            transitionEnterTimeout={300}
                            transitionLeaveTimeout={300}>
                            <div key={groupSportsman.id}>
                                <div>
                                    <div className="laps">
                                        <ul>
                                            <ReactCSSTransitionGroup
                                                transitionName="anim"
                                                transitionEnterTimeout={300}
                                                transitionLeaveTimeout={300}>
                                                {lapsHtml}
                                            </ReactCSSTransitionGroup>
                                        </ul>
                                    </div>
                                    <div className="data">
                                        <img src={groupSportsman.sportsman.photo} alt={groupSportsman.sportsman.nick}
                                             width="100px" height="100px"/>
                                        <span
                                            style={{borderLeft: '10px solid ' + color}}>{groupSportsman.sportsman.firstName} {groupSportsman.sportsman.lastName} {groupSportsman.sportsman.nick != "" ? '(' + groupSportsman.sportsman.nick + ')' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </ReactCSSTransitionGroup>)
                }
            })
        }
        if(this.props.present){
            html = <div className="current_group_grid_broapcast_present">{grid}</div>;
        }else {
            html = <div className="current_group_grid_broapcast">{grid}</div>;
        }
        return(html);
    }

}

export default CurrentGroupGridBroadcast;