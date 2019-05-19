'use strict';

import React from "react";
import stompClient from "../../websocket_listener";
import client from "../../client";
import Settings from "../../settings";
import BestLapReportBroadcast from "../broadcast/best_lap_report_broadcast";
import CountLapReportBroadcast from "../broadcast/count_lap_report_broadcast";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import CurrentGroupGridBroadcast from "../broadcast/current_group_grid_broadcast"
import PositionSportsmenBroadcast from "../broadcast/position_sportsmen_broadcast";

class MainScreenBroadcast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            competition: {},
            report:{},
            broadcast: {},
            url:null
        }
        this.refreshBroadcast = this.refreshBroadcast.bind(this);
        this.selectCompetition = this.selectCompetition.bind(this);

        this.componentRef
    }
    refreshBroadcast(){
        let url = '';
        if(this.state.url){
            url = this.state.url;
        }else if(this.state.competition._links){
            url = this.state.competition._links.mainScreenBroadcast.href;
        }
        client({
            method: 'GET',
            path: url
        }).then(broadcast=>{
            if(broadcast.entity.typeBroadcast === 'REPORT_BROADCAST_FULL' || broadcast.entity.typeBroadcast === 'REPORT_BROADCAST_SHORT'){
                client({
                    method: 'GET',
                    path: broadcast.entity._links.report.href
                }).then(report=>{
                    client({
                        method: 'GET',
                        path: Settings.raceApiReport+'/'+report.entity.id,
                        headers: {'Content-Type': 'application/json',
                            "Accept":"application/json"}
                    }).then(r => {
                        this.setState({
                            report: r.entity,
                            broadcast: broadcast.entity
                        });
                    });
                });
            }else {
                this.setState({
                    broadcast: broadcast.entity
                });
            }
        },error=>{
            this.setState({
                broadcast: {},
                report:{}
            });
        })
    }
    selectCompetition() {
        client({method: 'GET', path: Settings.root + '/competitions'}).done(response => {

            const selectedCompetition = response.entity._embedded.competitions.filter(function (competition) {
                return competition.selected;
            });
            let competition = {};
            if (selectedCompetition.length > 0) {
                competition = selectedCompetition[0];
            }
            this.setState({
                competition: competition,
                competitions: response.entity._embedded.competitions

            });
            this.refreshBroadcast();
        });
    }
    componentDidMount() {
        var params = window
            .location
            .search
            .replace('?','')
            .split('&')
            .reduce(
                function(p,e){
                    var a = e.split('=');
                    p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                    return p;
                },
                {}
            );
        if(params['url']) {
            console.log(params['url']);
            this.setState({
                url:params['url']
            });
            this.refreshBroadcast();
        }
        this.selectCompetition();
        this.stomp = stompClient.register([
            {route: '/topic/newBroadcast', callback: this.refreshBroadcast},
            {route: '/topic/updateBroadcast', callback: this.refreshBroadcast},
            {route: '/topic/deleteBroadcast', callback: this.refreshBroadcast},
            {route: '/topic/newSportsman', callback: this.refreshBroadcast},
            {route: '/topic/updateSportsman', callback: this.refreshBroadcast},
            {route: '/topic/deleteSportsman', callback: this.refreshBroadcast},
            {route: '/topic/newLap', callback: this.refreshBroadcast},
            {route: '/topic/updateLap', callback: this.refreshBroadcast},
            {route: '/topic/deleteLap', callback: this.refreshBroadcast},
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
        let results = [];
        if(this.state.broadcast.typeBroadcast === 'REPORT_BROADCAST_FULL'){
            if(this.state.report && this.state.report.report.typeReport === 'BEST_LAP'){
                results.push(<BestLapReportBroadcast  report={this.state.report} key="best_lap" ref={el => (this.componentRef = el)} />);
            }else if(this.state.report.report && this.state.report.report.typeReport === 'COUNT_LAPS'){
                results.push(<CountLapReportBroadcast  report={this.state.report} key="count_lap" ref={el => (this.componentRef = el)} />);
            }else if(this.state.report.report && this.state.report.report.typeReport === "POSITION_SPORTSMEN"){
                results.push(<PositionSportsmenBroadcast  report={this.state.report} key="position_sportsmen" ref={el => (this.componentRef = el)} />);
            }
        }else if(this.state.broadcast.typeBroadcast === 'REPORT_BROADCAST_SHORT'){
            if(this.state.report && this.state.report.report.typeReport === 'BEST_LAP'){
                results.push(<BestLapReportBroadcast short={true} report={this.state.report} key="best_lap_short" ref={el => (this.componentRef = el)} />);
            }else if(this.state.report.report && this.state.report.report.typeReport === 'COUNT_LAPS'){
                results.push(<CountLapReportBroadcast short={true} report={this.state.report} key="count_lap_short" ref={el => (this.componentRef = el)} />);
            }
        }else if(this.state.broadcast.typeBroadcast === 'CURRENT_GROUP_PRESENT'){
            results.push(<CurrentGroupGridBroadcast present={true} key="current_group_present" ref={el => (this.componentRef = el)} />);
        }else if(this.state.broadcast.typeBroadcast === 'CURRENT_GROUP_TELEMETRY'){
            results.push(<CurrentGroupGridBroadcast key="current_group_telemetry" ref={el => (this.componentRef = el)} />);
        }else{
            results.push(<div key="1" key="empty"></div>);
        }
        return(
            <div>
                <ReactCSSTransitionGroup
                    transitionName="anim"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}>
                {results}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}
export default MainScreenBroadcast;