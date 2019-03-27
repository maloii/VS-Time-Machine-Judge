'use strict';
import React from "react";
import {
    Button,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import InputMask from 'react-input-mask';
import ReactDOM from "react-dom";
import client from "../../client";
import follow from "../../follow";
import Settings from "../../settings";

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

class ModalNewLap extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lap:{},
            groupSportsman:{},
            timeStart: null,
            timeEnd: null,
            invalidName:false
        }
        this.handleSave = this.handleSave.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.checkTimeRange = this.checkTimeRange.bind(this);
        this.parseTime = this.parseTime.bind(this);
    }

    toggle() {
        this.setState({
            modalNewLap: !this.state.modalNewLap
        });
    }

    toggleShow(timeStart, timeEnd, groupSportsman, competition) {
        this.setState({
            timeStart:timeStart,
            timeEnd:timeEnd,
            invalidTime:false,
            groupSportsman:groupSportsman,
            competition: competition,
            value:'',
            modalNewLap: !this.state.modalNewLap
        })

    }
    parseTime(timeStr){
        let arrTime = timeStr.split(':');
        let milliseconds = 0;
        if(arrTime.length > 1){
            let arrTimeMilliseconds = arrTime[1].split('.');
            if(arrTimeMilliseconds.length > 1){
                milliseconds = Number(arrTimeMilliseconds[1]);
            }else{
                milliseconds = 0;
            }
            milliseconds = (Number(arrTimeMilliseconds[0]) * 1000) + milliseconds;
        }else{
            milliseconds = 60*1000;
        }
        if(arrTime.length >= 0){
            milliseconds = (Number(arrTime[0])*60000) + milliseconds;
        }
        return milliseconds;
    }
    checkTimeRange(timeStr){
        let milliseconds = this.parseTime(timeStr);
        if(this.state.timeStart && this.state.timeEnd){
            return (this.state.timeEnd - this.state.timeStart) > milliseconds && milliseconds > 0;
        }else{
            return true;
        }

    }
    onChangeTime = (event) => {
        this.setState({
            value: event.target.value,
            invalidTime: !this.checkTimeRange(event.target.value)
        });
    }
    handleSave(){

        let timeStr = ReactDOM.findDOMNode(this.refs['time']).value.trim();
        if(this.checkTimeRange(timeStr)){
            let lap = {
                millisecond: this.state.timeStart+this.parseTime(timeStr),
                groupSportsman: this.state.groupSportsman._links.self.href,
                typeLap: 'OK'
            }
            client({
                method: 'GET',
                path: this.state.groupSportsman._links.sportsman.href
            }).then(sportsman => {
                lap.sportsman = sportsman.entity._links.self.href;
                client({
                    method: 'GET',
                    path: this.state.groupSportsman._links.group.href
                }).then(group => {
                    lap.group = group.entity._links.self.href;
                    client({
                        method: 'GET',
                        path: group.entity._links.round.href
                    }).then(round => {
                        lap.round = round.entity._links.self.href;
                        client({
                            method: 'GET',
                            path: this.state.competition._links.gates.href
                        }).then(gates => {
                            if(gates.entity._embedded && gates.entity._embedded.gates.length > 0) {
                                lap.gate = gates.entity._embedded.gates[0]._links.self.href;
                                follow(client, Settings.root, ['laps']).then(response => {
                                    client({
                                        method: 'POST',
                                        path: response.entity._links.self.href,
                                        entity: lap,
                                        headers: {'Content-Type': 'application/json'}
                                    })
                                });
                                this.toggle();
                            }
                        });
                    });
                });
            });

        }else{
            alert("New lap time out of range");
        }

    }

    render(){
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let header = 'New lap';
        let start = "0";
        let end = "∞";
        if(this.state.timeStart && this.state.timeEnd){
            end = (this.state.timeEnd - this.state.timeStart).toHHMMSSMSSS();
        }


        return(
            <Modal isOpen={this.state.modalNewLap} toggle={this.toggle}>
                <ModalHeader toggle={this.toggleShow}>{header}</ModalHeader>
                <ModalBody>
                    <Container fluid>
                        <Row>
                            <Col>
                                <FormGroup row>
                                    <Label for="name" sm={7}>Time from: <b>{start}</b> to: <b>{end}</b> </Label>
                                    <Col sm={5}>
                                        <InputMask mask="59:59.999"
                                                   ref="time"
                                                   maskChar={null}
                                                   value={this.state.value}
                                                   defaultValue={this.state.value}
                                                   placeholder="59:59.999"
                                                   onChange={this.onChangeTime}
                                                   formatChars={{
                                                       '9': '[0-9]',
                                                       '5': '[0-5]',
                                                   }}
                                                   invalid={this.state.invalidTime}>
                                            {(inputProps) => <Input type="text" {...inputProps}
                                                                    defaultValue={this.state.value}
                                                                    invalid={this.state.invalidTime} />}
                                        </InputMask>
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Container>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.toggle}>
                        Close
                    </Button>
                    {submit}
                </ModalFooter>
            </Modal>
        );
    }
}


export default ModalNewLap;