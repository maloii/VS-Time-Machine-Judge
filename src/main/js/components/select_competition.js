'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import client from '../client';
import follow from '../follow';
import stompClient from '../websocket_listener';
import '../settings';
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

const root = '/api/data';

class DialogNewCompetition extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            modalNewCompetition:false,
            activeTab: '1'
        }
        this.toggle = this.toggle.bind(this);
        this.toggleTabs = this.toggleTabs.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    handleSave(){
        const newCompetition = {
            name: ReactDOM.findDOMNode(this.refs['name']).value.trim(),
        };

        console.log(newCompetition);
        follow(client, root, ['competitions']).done(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newCompetition,
                headers: {'Content-Type': 'application/json'}
            })
        });
        this.toggle();
    }

    toggle() {
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

    render(){
        return (<Modal isOpen={this.state.modalNewCompetition} toggle={this.toggle} className={this.props.className}>
            <ModalHeader toggle={this.toggle}>New competition</ModalHeader>
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
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId="1">
                            <Row>
                                <Col sm="12">
                                    <Form>
                                        <FormGroup row>
                                            <Label for="name" sm={2}>Name</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="name" id="name" placeholder="Name new competition" ref="name" />
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="logo" sm={2}>Logo</Label>
                                            <Col sm={10}>
                                                <CustomInput type="file" id="logo" name="logo" />
                                            </Col>
                                        </FormGroup>
                                        <FormGroup row>
                                            <Label for="logo" sm={2}>Map</Label>
                                            <Col sm={10}>
                                                <CustomInput type="file" id="map" name="map" />
                                            </Col>
                                        </FormGroup>
                                    </Form>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tabId="2">
                            <Row>
                                <Col sm="12">
                                    <Form>
                                        <FormGroup row>
                                            <Label for="distance" sm={2}>Distance</Label>
                                            <Col sm={10}>
                                                <Input type="text" name="distance" id="distance" placeholder="Distance track" ref="distance" />
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
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
                <Button color="primary" onClick={this.handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>)
    }

}

class SelectCompetition extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            competitions: [],
        };

        this.dialogNewCompetition = React.createRef();
        this.onNewCompetition = this.onNewCompetition.bind(this);
        this.refreshListCompetition = this.refreshListCompetition.bind(this);
    }

    onNewCompetition(){
        this.dialogNewCompetition.current.toggle();
    }



    refreshListCompetition(){
        client({method: 'GET', path: root+'/competitions'}).done(response => {
            this.setState({competitions: response.entity._embedded.competitions});
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

        console.log(this.state.competitions);
        const items = this.state.competitions.map(competition =>
                                    <DropdownItem key={competition._links.self.href} row>
                                        {competition.name}
                                    </DropdownItem>);

        return (<>
            <DialogNewCompetition ref={this.dialogNewCompetition}/>
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                    Select competition
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