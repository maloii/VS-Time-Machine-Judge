'use strict';

import React from "react";
import stompClient from "../../websocket_listener";
import eventClient from "../../event_client";
import Global from "../../global";
import client from "../../client";
import Settings from "../../settings";
import BestLapReport from "../reports/best_lap_report";
import CountLapReport from "../reports/count_lap_report";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class MainScreenBroadcast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            competition: {},
            report:{},
            broadcast: {}
        }
        this.refreshBroadcast = this.refreshBroadcast.bind(this);
        this.selectCompetition = this.selectCompetition.bind(this);

        this.componentRef
    }
    refreshBroadcast(){
        client({
            method: 'GET',
            path: this.state.competition._links.mainScreenBroadcast.href
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
            this.refreshBroadcast();
        });
    }
    componentDidMount() {
        this.selectCompetition();
        this.stomp = stompClient.register([
            {route: '/topic/newBroadcast', callback: this.refreshBroadcast},
            {route: '/topic/updateBroadcast', callback: this.refreshBroadcast},
            {route: '/topic/deleteBroadcast', callback: this.refreshBroadcast},
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
        if(this.state.broadcast.typeBroadcast === 'REPORT_BROADCAST_FULL'
            || this.state.broadcast.typeBroadcast === 'REPORT_BROADCAST_SHORT'){
            if(this.state.report && this.state.report.report.typeReport === "BEST_LAP"){
                results.push(<BestLapReport  report={this.state.report} key="best_lap" ref={el => (this.componentRef = el)} />);
            }else if(this.state.report.report && this.state.report.report.typeReport === "COUNT_LAPS"){
                results.push(<CountLapReport  report={this.state.report} key="count_lap" ref={el => (this.componentRef = el)} />);
            }
        }else{
            results.push(<div key="empty"></div>);
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