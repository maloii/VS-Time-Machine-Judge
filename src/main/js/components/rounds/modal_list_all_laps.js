import React from "react";
import {Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table} from "reactstrap";
import client from "../../client";
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";
import stompClient from "../../websocket_listener";
import ReactDOM from "react-dom";

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
let contextTrigger = null;
class ModalListAllLaps extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            laps:[]
        }
        this.toggleShow = this.toggleShow.bind(this);
        this.toggle = this.toggle.bind(this);
        this.rowEvents = this.rowEvents.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.editStatus = this.editStatus.bind(this);
        this.editToOutOfScore = this.editToOutOfScore.bind(this);
        this.editToHidden = this.editToHidden.bind(this);
        this.editToOk = this.editToOk.bind(this);
        this.contextMenuHide  = this.contextMenuHide.bind(this);
        this.contextMenuShow  = this.contextMenuShow.bind(this);
        this.refreshTableLaps = this.refreshTableLaps.bind(this);

        this.contextSelectedItem = null;
        this.contextSelectedItemData = null;
        this.groupSportsman = null;
    }
    toggle() {
        this.setState({
            modalListAllLaps: !this.state.modalListAllLaps
        });
    }
    refreshTableLaps(){
        if(this.groupSportsman != null){
            client({
                method: 'GET',
                path: this.groupSportsman._links.laps.href
            }).then(lapsResponse => {
                this.setState({
                    group:this.groupSportsman.group,
                    laps:lapsResponse.entity._embedded.laps
                })
            });
        }
    }
    toggleShow(groupSportsman){
        this.groupSportsman = groupSportsman;
        this.refreshTableLaps();
        this.toggle();
    }
    rowEvents(e, lap, rowIndex){
        if(contextTrigger) {
            this.contextSelectedItem = e.currentTarget;
            this.contextSelectedItemData = lap;
            this.contextSelectedItem.className = 'default-focus-cell';
            e.data = lap;
            contextTrigger.handleContextClick(e);
        }
    }
    deleteRow(e){
        if(confirm('Do you really want to delete the record?')){
            client({method: 'DELETE', path: e.data._links.self.href});
        }
    }
    editStatus(e){
        client({
            method: 'PUT',
            path: e.data._links.self.href,
            entity: e.data,
            headers: {'Content-Type': 'application/json'}
        });
    }
    editToOutOfScore(e){
        e.data.typeLap = 'OUT_OF_SCORE';
        this.editStatus(e);
    }
    editToHidden(e){
        e.data.typeLap = 'HIDDEN';
        this.editStatus(e);
    }
    editToOk(e){
        e.data.typeLap = 'OK';
        this.editStatus(e);

    }
    contextMenuHide(e){
        if(this.contextSelectedItem != null && this.contextSelectedItemData != null){
            this.contextSelectedItem.className = '';
        }
    }
    contextMenuShow(e){
    }
    componentDidMount() {
        if(this.props.group != null){
            this.group = this.props.group;
            this.refreshTableLaps();
        }
        this.stomp = stompClient.register([
            {route: '/topic/newLap', callback: this.refreshTableLaps},
            {route: '/topic/updateLap', callback: this.refreshTableLaps},
            {route: '/topic/deleteLap', callback: this.refreshTableLaps},
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
        if(this.state.group == null) return(<></>);
        let lapsTable = [];
        let lapNumber = 0;
        let lastTimeOk = this.state.group.startMillisecond;
        this.state.laps.map((lap, indx)=>{
            let time = 0;
            let fullTime = 0;
            if(indx === 0){
                time = lap.millisecond - this.state.group.startMillisecond;
            }else{
                time = lap.millisecond - this.state.laps[indx-1].millisecond;
            }
            let strLapNumber = '';
            if(lap.typeLap !== 'HIDDEN'){
                lapNumber++;
                strLapNumber = lapNumber;
                fullTime = lap.millisecond - lastTimeOk;
                lastTimeOk = lap.millisecond;
            }

            lapsTable.push(<tr key={'lap_'+indx}>
                                <td onContextMenu={(e) => this.rowEvents(e, lap, indx)}>{strLapNumber}</td>
                                <td onContextMenu={(e) => this.rowEvents(e, lap, indx)}>{time.toHHMMSSMSSS()} {fullTime>0?'['+fullTime.toHHMMSSMSSS()+']':''}</td>
                                <td onContextMenu={(e) => this.rowEvents(e, lap, indx)}>{lap.typeLap}</td>
                            </tr>)
        })

        return(<Modal isOpen={this.state.modalListAllLaps} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>List all laps</ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col>
                            <ContextMenuTrigger id="list_all_laps_menu" ref={c => contextTrigger = c} collect={props => props}>
                                <div></div>
                            </ContextMenuTrigger>

                            <ContextMenu id="list_all_laps_menu" onHide={this.contextMenuHide} onShow={this.contextMenuShow} collect={props => props}>
                                <MenuItem onClick={this.editToOk}>
                                    Status [OK]
                                </MenuItem>
                                <MenuItem onClick={this.editToOutOfScore}>
                                    Status [OUT_OF_SCORE]
                                </MenuItem>
                                <MenuItem onClick={this.editToHidden}>
                                    Status [HIDDEN]
                                </MenuItem>
                                <MenuItem onClick={this.deleteRow}>
                                    Delete
                                </MenuItem>
                            </ContextMenu>
                            <Table bordered striped hover className="tableFixHead">
                                <thead>
                                    <tr>
                                        <th>LAP</th>
                                        <th>TIME</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {lapsTable}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>);
    }
}

export default ModalListAllLaps;