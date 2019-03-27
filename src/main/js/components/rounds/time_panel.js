'use strict';

import React from "react";
import stompClient from "../../websocket_listener";

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours !== "00"?hours+':':'')+minutes+':'+seconds;
}

class TimePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timeRace: '0'
        }
        this.refreshTimeRace = this.refreshTimeRace.bind(this);
    }

    refreshTimeRace(time){
        this.setState({
            timeRace:time.body
        });
    }
    componentDidMount() {
        this.stomp = stompClient.register([
            {route: '/topic/reportTimeRace', callback: this.refreshTimeRace}
        ]);
    }
    componentWillUnmount(){
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }
    render(){
        return(<span className="timer text-monospace">{this.state.timeRace.toHHMMSS()}</span>);
    }
}


export default TimePanel;