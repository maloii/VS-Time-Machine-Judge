import React from "react";
import client from "../../client";
import ReactDOM from "react-dom";
import follow from "../../follow";
import Settings from "../../settings";
import axios from "axios";
import classnames from 'classnames';
import {
    Button,
    Col, CustomInput, DropdownItem, DropdownMenu, DropdownToggle, Form,
    FormGroup, Input, InputGroup, Label,
    Modal,
    ModalBody, ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,InputGroupButtonDropdown,
} from "reactstrap";

const channels = [  'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8',
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'];

const colors   = [  'BLUE', 'RED', 'GREEN', 'WHITE', 'YELLOW', 'MAGENTA', 'CYAN', 'BLACK'];

class DialogNewCompetition extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            modalNewCompetition:false,
            activeTab: '1',
            id: 0,
            channel1:'R1',
            channel2:'R2',
            channel3:'R3',
            channel4:'R4',
            channel5:'R5',
            channel6:'R6',
            channel7:'R7',
            channel8:'R8',

            color1: 'BLUE',
            color2: 'RED',
            color3: 'GREEN',
            color4: 'YELLOW',
            color5: 'MAGENTA',
            color6: 'CYAN',
            color7: 'WHITE',
            color8: 'BLACK',

            dropdownOpenChannel1: false,
            dropdownOpenChannel2: false,
            dropdownOpenChannel3: false,
            dropdownOpenChannel4: false,
            dropdownOpenChannel5: false,
            dropdownOpenChannel6: false,
            dropdownOpenChannel7: false,
            dropdownOpenChannel8: false,

            dropdownOpenColor1: false,
            dropdownOpenColor2: false,
            dropdownOpenColor3: false,
            dropdownOpenColor4: false,
            dropdownOpenColor5: false,
            dropdownOpenColor6: false,
            dropdownOpenColor7: false,
            dropdownOpenColor8: false,
        }
        this.toggle = this.toggle.bind(this);
        this.toggleTabs = this.toggleTabs.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.clearForm = this.clearForm.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleUDelete = this.handleUDelete.bind(this);
        this.onSelectChannel = this.onSelectChannel.bind(this);
        this.onSelectColor = this.onSelectColor.bind(this);

        this.toggleDropDownChannel = this.toggleDropDownChannel.bind(this);

        this.toggleDropDownColor = this.toggleDropDownColor.bind(this);



    }
    toggleDropDownChannel(pos) {
        switch (pos) {
            case 1:this.setState({dropdownOpenChannel1: !this.state.dropdownOpenChannel1});break;
            case 2:this.setState({dropdownOpenChannel2: !this.state.dropdownOpenChannel2});break;
            case 3:this.setState({dropdownOpenChannel3: !this.state.dropdownOpenChannel3});break;
            case 4:this.setState({dropdownOpenChannel4: !this.state.dropdownOpenChannel4});break;
            case 5:this.setState({dropdownOpenChannel5: !this.state.dropdownOpenChannel5});break;
            case 6:this.setState({dropdownOpenChannel6: !this.state.dropdownOpenChannel6});break;
            case 7:this.setState({dropdownOpenChannel7: !this.state.dropdownOpenChannel7});break;
            case 8:this.setState({dropdownOpenChannel8: !this.state.dropdownOpenChannel8});break;
        }
    }

    toggleDropDownColor(pos) {
        switch (pos) {
            case 1:this.setState({dropdownOpenColor1: !this.state.dropdownOpenColor1});break;
            case 2:this.setState({dropdownOpenColor2: !this.state.dropdownOpenColor2});break;
            case 3:this.setState({dropdownOpenColor3: !this.state.dropdownOpenColor3});break;
            case 4:this.setState({dropdownOpenColor4: !this.state.dropdownOpenColor4});break;
            case 5:this.setState({dropdownOpenColor5: !this.state.dropdownOpenColor5});break;
            case 6:this.setState({dropdownOpenColor6: !this.state.dropdownOpenColor6});break;
            case 7:this.setState({dropdownOpenColor7: !this.state.dropdownOpenColor7});break;
            case 8:this.setState({dropdownOpenColor8: !this.state.dropdownOpenColor8});break;
        }
    }

    clearForm(){
        this.setState({
            name: '',
            selected: true,
            distance: 0,
            delay: 10,
            competition:undefined
        });
    }

    handleUDelete(){
        if(confirm('Do you really want to delete the record?')) {
            client({method: 'DELETE', path: this.state.competition.entity._links.self.href}
            ).done();

            this.toggle();
        }
    }
    onKeyDown(event){
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            if(this.state.competition !== undefined){
                this.handleUpdate();
            }else{
                this.handleSave();
            }
        }
    }

    handleUpdate(){
        const newCompetition = {
            name: ReactDOM.findDOMNode(this.refs['name']).value.trim(),
            selected: ReactDOM.findDOMNode(this.refs['selected']).checked,
            skipFirstGate: ReactDOM.findDOMNode(this.refs['skipFirstGate']).checked,

            channel1: this.state.channel1,
            channel2: this.state.channel2,
            channel3: this.state.channel3,
            channel4: this.state.channel4,
            channel5: this.state.channel5,
            channel6: this.state.channel6,
            channel7: this.state.channel7,
            channel8: this.state.channel8,

            color1: this.state.color1,
            color2: this.state.color2,
            color3: this.state.color3,
            color4: this.state.color4,
            color5: this.state.color5,
            color6: this.state.color6,
            color7: this.state.color7,
            color8: this.state.color8,
        };
        const newGate = {
            number: 0,
            finish:true,
            position: 0,
            distance: ReactDOM.findDOMNode(this.refs['distance']).value.trim(),
            delay: ReactDOM.findDOMNode(this.refs['delay']).value.trim()
        };
        follow(client, Settings.root, ['competitions']).then(response => {
            return client({
                method: 'PUT',
                path: this.state.competition.entity._links.self.href,
                entity: newCompetition,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(responseCompetition => {
            client({
                method: 'PUT',
                path: this.state.competition.gates[0]._links.self.href,
                entity: newGate,
                headers: {'Content-Type': 'application/json'}
            });
        })
        this.toggle();
    }
    handleSave(){
        const newCompetition = {
            name: ReactDOM.findDOMNode(this.refs['name']).value.trim(),
            selected: ReactDOM.findDOMNode(this.refs['selected']).checked,
            skipFirstGate: ReactDOM.findDOMNode(this.refs['skipFirstGate']).checked,

            channel1: this.state.channel1,
            channel2: this.state.channel2,
            channel3: this.state.channel3,
            channel4: this.state.channel4,
            channel5: this.state.channel5,
            channel6: this.state.channel6,
            channel7: this.state.channel7,
            channel8: this.state.channel8,

            color1: this.state.color1,
            color2: this.state.color2,
            color3: this.state.color3,
            color4: this.state.color4,
            color5: this.state.color5,
            color6: this.state.color6,
            color7: this.state.color7,
            color8: this.state.color8,
        };
        follow(client, Settings.root, ['competitions']).then(response => {
            return client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newCompetition,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(responseCompetition => {
            this.competitionHref = responseCompetition.entity._links.self.href

            const newGate = {
                number: 0,
                finish:true,
                position: 0,
                distance: ReactDOM.findDOMNode(this.refs['distance']).value.trim(),
                delay: ReactDOM.findDOMNode(this.refs['delay']).value.trim(),
                competition:this.competitionHref
            };
            return client({
                method: 'POST',
                path: Settings.root+'/gates',
                entity: newGate,
                headers: {'Content-Type': 'application/json'}
            });
        });
        this.toggle();
    }
    toggleEdit(competition) {
        this.toggleTabs('1');
        this.setState({
            competition: competition,
            name: competition.entity.name,
            selected: competition.entity.selected,
            skipFirstGate: competition.entity.skipFirstGate,

            channel1: competition.entity.channel1,
            channel2: competition.entity.channel2,
            channel3: competition.entity.channel3,
            channel4: competition.entity.channel4,
            channel5: competition.entity.channel5,
            channel6: competition.entity.channel6,
            channel7: competition.entity.channel7,
            channel8: competition.entity.channel8,

            color1: competition.entity.color1,
            color2: competition.entity.color2,
            color3: competition.entity.color3,
            color4: competition.entity.color4,
            color5: competition.entity.color5,
            color6: competition.entity.color6,
            color7: competition.entity.color7,
            color8: competition.entity.color8,

            distance: competition.gates[0].distance,
            delay: competition.gates[0].delay

        });
        this.toggle();

    }
    toggle() {
        this.toggleTabs('1');
        this.setState({
            modalNewCompetition: !this.state.modalNewCompetition
        });
    }

    toggleTabs(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    handleUpload(e){
        let files = e.target.files || e.dataTransfer.files;
        document.getElementById(e.target.name).style.display = 'none';
        this.setState({
            loaded: 0
        })

        const data = new FormData()
        data.append('file', files[0], files[0].name);
        axios
            .post('/api/upload/img', data, {
                headers: {'Content-Type': 'multipart/form-data'},

                onUploadProgress: ProgressEvent => {
                    // this.setState({
                    //     loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
                    // })
                    console.log((ProgressEvent.loaded / ProgressEvent.total*100));
                },
            })
            .then(res => {
                console.log(res)
            })
    }

    onSelectChannel(pos, channel) {
        switch (pos) {
            case 1: this.setState({channel1:channel});break;
            case 2: this.setState({channel2:channel});break;
            case 3: this.setState({channel3:channel});break;
            case 4: this.setState({channel4:channel});break;
            case 5: this.setState({channel5:channel});break;
            case 6: this.setState({channel6:channel});break;
            case 7: this.setState({channel7:channel});break;
            case 8: this.setState({channel8:channel});break;
        }
    }
    onSelectColor(pos, color){
        switch (pos) {
            case 1: this.setState({color1:color});break;
            case 2: this.setState({color2:color});break;
            case 3: this.setState({color3:color});break;
            case 4: this.setState({color4:color});break;
            case 5: this.setState({color5:color});break;
            case 6: this.setState({color6:color});break;
            case 7: this.setState({color7:color});break;
            case 8: this.setState({color8:color});break;
        }
    }
    render(){
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New competition';
        if(this.state.competition !== undefined){
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleUDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit competition';

        }
        const  channelsTable = [];
        const  colorTable = [];
        for(var i = 1; i <=8; i++){
            let isOpenChannel = false;
            let isOpenColor = false;
            let channelValue = '';
            let colorValue = '';
            switch (i) {
                case 1:
                    isOpenChannel = this.state.dropdownOpenChannel1;
                    isOpenColor = this.state.dropdownOpenColor1;
                    channelValue = this.state.channel1;
                    colorValue = this.state.color1;
                    break;
                case 2:
                    isOpenChannel = this.state.dropdownOpenChannel2;
                    isOpenColor = this.state.dropdownOpenColor2;
                    channelValue = this.state.channel2;
                    colorValue = this.state.color2;
                    break;
                case 3:
                    isOpenChannel = this.state.dropdownOpenChannel3;
                    isOpenColor = this.state.dropdownOpenColor3;
                    channelValue = this.state.channel3;
                    colorValue = this.state.color3;
                    break;
                case 4:
                    isOpenChannel = this.state.dropdownOpenChannel4;
                    isOpenColor = this.state.dropdownOpenColor4;
                    channelValue = this.state.channel4;
                    colorValue = this.state.color4;
                    break;
                case 5:
                    isOpenChannel = this.state.dropdownOpenChannel5;
                    isOpenColor = this.state.dropdownOpenColor5;
                    channelValue = this.state.channel5;
                    colorValue = this.state.color5;
                    break;
                case 6:
                    isOpenChannel = this.state.dropdownOpenChannel6;
                    isOpenColor = this.state.dropdownOpenColor6;
                    channelValue = this.state.channel6;
                    colorValue = this.state.color6;
                    break;
                case 7:
                    isOpenChannel = this.state.dropdownOpenChannel7;
                    isOpenColor = this.state.dropdownOpenColor7;
                    channelValue = this.state.channel7;
                    colorValue = this.state.color7;
                    break;
                case 8:
                    isOpenChannel = this.state.dropdownOpenChannel8;
                    isOpenColor = this.state.dropdownOpenColor8;
                    channelValue = this.state.channel8;
                    colorValue = this.state.color8;
                    break;
            }
            channelsTable.push(<FormGroup row key={'form_'+i}>
                <Label for="distance" sm={3}>Position {i}</Label>
                <Col sm={9}>
                    <InputGroup>
                        <Input type="text"
                               name={'channel'+i}
                               key={'channel'+i+channelValue}
                               id={'channel'+i}
                               placeholder="Channel"
                               ref={'channel'+i}
                               defaultValue={channelValue}/>
                        <InputGroupButtonDropdown addonType="append"
                                                  isOpen={isOpenChannel}
                                                  toggle={this.toggleDropDownChannel.bind(null, i)}>
                            <DropdownToggle caret>
                                Channels
                            </DropdownToggle>
                            <DropdownMenu>
                                {channels.map(channel => {
                                    return <DropdownItem key={channel}
                                                         onClick={this.onSelectChannel.bind(null, i, channel)}
                                                         value={channel}>{channel}</DropdownItem>
                                })}
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                    </InputGroup>
                </Col>
            </FormGroup>);


            colorTable.push(<FormGroup row key={'form_'+i}>
                <Label for="distance" sm={3}>Position 1</Label>
                <Col sm={9}>
                    <InputGroup>
                        <Input type="text"
                               name={'color'+i}
                               key={'color'+i+colorValue}
                               id={'color'+i}
                               placeholder="Color"
                               ref={'color'+i}
                               defaultValue={colorValue}
                               style={{backgroundColor: colorValue}}
                        />
                        <InputGroupButtonDropdown addonType="append"
                                                  isOpen={isOpenColor}
                                                  toggle={this.toggleDropDownColor.bind(null, i)}>
                            <DropdownToggle caret>
                                Colors
                            </DropdownToggle>
                            <DropdownMenu>
                                {colors.map((color, indx)=>{
                                    return <DropdownItem key={color} style={{backgroundColor:color}}
                                                         onClick={this.onSelectColor.bind(null, i, color)}
                                                         value={color}
                                                         name={indx}>{color}</DropdownItem>
                                })}
                            </DropdownMenu>
                        </InputGroupButtonDropdown>
                    </InputGroup>
                </Col>
            </FormGroup>)
        }

        return (<Modal isOpen={this.state.modalNewCompetition} toggle={this.toggle} className={this.props.className}>
            <ModalHeader toggle={this.toggle}>{header}</ModalHeader>
            <ModalBody>
                <div>
                    <Nav tabs  style={{marginBottom: 16+'px'}}>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '1' })}
                                onClick={() => { this.toggleTabs('1'); }}
                            >
                                Data
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '2' })}
                                onClick={() => { this.toggleTabs('2'); }}
                            >
                                Gates
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '3' })}
                                onClick={() => { this.toggleTabs('3'); }}
                            >
                                Channels
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.activeTab === '4' })}
                                onClick={() => { this.toggleTabs('4'); }}
                            >
                                Colors
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab} onKeyDown={this.onKeyDown}>
                        <TabPane tabId="1">
                            <Row>
                                <Col sm="12">
                                    <FormGroup row>
                                        <Label for="name" sm={2}>Name</Label>
                                        <Col sm={10}>
                                            <Input
                                                type="text"
                                                name="name"
                                                id="name"
                                                placeholder="Name new competition"
                                                ref="name"
                                                defaultValue={this.state.name} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label for="logo" sm={2}>Logo</Label>
                                        <Col sm={10}>
                                            <CustomInput type="file" id="logo" name="logo" onChange={this.handleUpload} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label for="logo" sm={2}>Map</Label>
                                        <Col sm={10}>
                                            <CustomInput type="file" id="map" name="map" onChange={this.handleUpload} />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label for="selected" sm={4}>Select</Label>
                                        <Col sm={8}>
                                            <Input
                                                type="checkbox"
                                                id="selected"
                                                ref="selected"
                                                name="selected"
                                                defaultChecked={this.state.selected}/>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label for="selected" sm={4}>skip the gate</Label>
                                        <Col sm={8}>
                                            <Input
                                                type="checkbox"
                                                id="skipFirstGate"
                                                ref="skipFirstGate"
                                                name="skipFirstGate"
                                                defaultChecked={this.state.skipFirstGate}/>
                                        </Col>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="2">
                            <Row>
                                <Col sm="12">
                                    <Form>
                                        <FormGroup row>
                                            <Label for="distance" sm={3}>Distance(metrs)</Label>
                                            <Col sm={5}>
                                                <Input
                                                    type="number"
                                                    defaultValue={this.state.distance}
                                                    name="distance"
                                                    id="distance"
                                                    placeholder="Distance track"
                                                    ref="distance" />
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="distance" sm={3}>Delay(sec)</Label>
                                            <Col sm={5}>
                                                <Input
                                                    type="number"
                                                    defaultValue={this.state.delay}
                                                    name="delay"
                                                    id="delay"
                                                    placeholder="Delay time"
                                                    ref="delay" />
                                            </Col>
                                        </FormGroup>

                                    </Form>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="3">
                            <Row>
                                <Col sm="12">
                                    <Form>
                                        {channelsTable}
                                    </Form>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tabId="4">
                            <Row>
                                <Col sm="12">
                                    <Form>
                                        {colorTable}
                                    </Form>
                                </Col>
                            </Row>
                        </TabPane>
                    </TabContent>
                </div>
            </ModalBody>
            <ModalFooter>
                {deleteButton}
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
                {submit}
            </ModalFooter>
        </Modal>)
    }

}

export default DialogNewCompetition;