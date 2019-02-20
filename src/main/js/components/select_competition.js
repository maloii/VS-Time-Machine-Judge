'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import client from '../client';
import follow from '../follow';
import axios from 'axios';
import stompClient from '../websocket_listener';
import {
    Button,
    Col,
    CustomInput,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    UncontrolledDropdown
} from "reactstrap";
import classnames from 'classnames';

import Settings from '../settings'
import Global from '../global'
import eventClient from '../event_client'


class DialogNewCompetition extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            modalNewCompetition:false,
            activeTab: '1',
            id: 0
        }
        this.toggle = this.toggle.bind(this);
        this.toggleTabs = this.toggleTabs.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.clearForm = this.clearForm.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.handleUDelete = this.handleUDelete.bind(this);


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
                                            <Label for="selected" sm={2}>Select</Label>
                                            <Col sm={10}>
                                                <Input
                                                    type="checkbox"
                                                    id="selected"
                                                    ref="selected"
                                                    name="selected"
                                                    defaultChecked={this.state.selected}/>
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

class SelectCompetition extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            competitions: [],
            header: ''
        };

        this.dialogNewCompetition = React.createRef();
        this.onNewCompetition = this.onNewCompetition.bind(this);
        this.refreshListCompetition = this.refreshListCompetition.bind(this);
        this.onEditCompetition = this.onEditCompetition.bind(this);
    }

    onEditCompetition(e){
        client({
            method: 'GET',
            path: e.currentTarget.id
        }).then(editCompetition => {
            this.competition = editCompetition;
            return (client({
                method: 'GET',
                path: editCompetition.entity._links.gates.href
            }));
        }).then(gates => {
            this.competition.gates = gates.entity._embedded.gates;
            this.dialogNewCompetition.current.toggleEdit(this.competition);
        })

    }
    onNewCompetition(){
        this.dialogNewCompetition.current.clearForm();
        this.dialogNewCompetition.current.toggle();
    }



    refreshListCompetition(){
        client({method: 'GET', path: Settings.root+'/competitions'}).done(response => {

            let header = 'Select competition';
            const selectedCompetition = response.entity._embedded.competitions.filter(function(competition) {
                return competition.selected;
            });
            if(selectedCompetition.length > 0){
                header = selectedCompetition[0].name;
                let competition = selectedCompetition[0];
                Global.competition = competition;
            }else{
                Global.competition = null;
            }
            eventClient.emit('SELECT_COMPETITION', {});
            this.setState({
                competitions: response.entity._embedded.competitions,
                header: header

            });
        });
    }

    componentDidMount() {
        this.refreshListCompetition();
        stompClient.register([
            {route: '/topic/newCompetition', callback: this.refreshListCompetition},
            {route: '/topic/updateCompetition', callback: this.refreshListCompetition},
            {route: '/topic/deleteCompetition', callback: this.refreshListCompetition}
        ]);
    }

    render() {

        const items = this.state.competitions.map(competition =>
                                    <DropdownItem key={competition._links.self.href} id={competition._links.self.href}  onClick={this.onEditCompetition}>
                                        {competition.name}
                                    </DropdownItem>);

        return (<>
            <DialogNewCompetition ref={this.dialogNewCompetition}/>
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                    {this.state.header}
                </DropdownToggle>
                <DropdownMenu right>
                    {items}
                    <DropdownItem divider/>
                    <DropdownItem id="newCompetition" key="newCompetition" onClick={this.onNewCompetition}>New competition</DropdownItem>
                </DropdownMenu>
            </UncontrolledDropdown>
        </>)
    }
}

export default SelectCompetition;