'use strict';
import {Button, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter} from 'reactstrap';
import DeleteOutlineIcon from 'mdi-react/DeleteOutlineIcon';
import LogoutIcon from 'mdi-react/LogoutIcon';


import ReactDataGrid from "react-data-grid";
import 'bootstrap/dist/css/bootstrap.css';
import Form from "reactstrap/es/Form";
import FormGroup from "reactstrap/es/FormGroup";
import Col from "reactstrap/es/Col";
import Label from "reactstrap/es/Label";
import Input from "reactstrap/es/Input";
import Table from "reactstrap/es/Table";
import Pagination from "reactstrap/es/Pagination";
import PaginationItem from "reactstrap/es/PaginationItem";
import PaginationLink from "reactstrap/es/PaginationLink";
import Navbar from "reactstrap/es/Navbar";
import NavbarBrand from "reactstrap/es/NavbarBrand";
import NavbarToggler from "reactstrap/es/NavbarToggler";
import Collapse from "reactstrap/es/Collapse";
import Nav from "reactstrap/es/Nav";
import NavItem from "reactstrap/es/NavItem";
import NavLink from "reactstrap/es/NavLink";


const React = require('react');

const moment = require('moment');

const ReactDOM = require('react-dom');
const when = require('when');
const client = require('./client');

const follow = require('./follow'); // function to hop multiple links by "rel"

const stompClient = require('./websocket-listener');

const root = '/api';


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pilots: [],
            attributes: [],
            page: 1,
            pageSize: 20,
            links: {},
            loggedInJadge: this.props.loggedInJadge,
            collapsed: true
        };
        this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
        this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
        this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
        this.toggleNavbar = this.toggleNavbar.bind(this);
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    loadFromServer(pageSize) {
        follow(client, root, [
            {rel: 'pilots', params: {size: pageSize}}]
        ).then(pilotCollection => {
            return client({
                method: 'GET',
                path: pilotCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                // tag::json-schema-filter[]
                /**
                 * Filter unneeded JSON Schema properties, like uri references and
                 * subtypes ($ref).
                 */
                Object.keys(schema.entity.properties).forEach(function (property) {
                    if (schema.entity.properties[property].hasOwnProperty('format') &&
                        schema.entity.properties[property].format === 'uri') {
                        delete schema.entity.properties[property];
                    }
                    else if (schema.entity.properties[property].hasOwnProperty('$ref')) {
                        delete schema.entity.properties[property];
                    }
                });

                this.schema = schema.entity;
                this.links = pilotCollection.entity._links;
                return pilotCollection;
                // end::json-schema-filter[]
            });
        }).then(pilotCollection => {
            this.page = pilotCollection.entity.page;
            return pilotCollection.entity._embedded.pilots.map(pilot =>
                client({
                    method: 'GET',
                    path: pilot._links.self.href
                })
            );
        }).then(pilotPromises => {
            return when.all(pilotPromises);
        }).done(pilots => {
            this.setState({
                page: this.page,
                pilots: pilots,
                attributes: Object.keys(this.schema.properties),
                pageSize: pageSize,
                links: this.links
            });
        });
    }

    onCreate(newPilot) {
        follow(client, root, ['pilots']).done(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newPilot,
                headers: {'Content-Type': 'application/json'}
            })
        })
    }

    onUpdate(pilot, updatedPilot) {
        if(pilot.entity.judge.name === this.state.loggedInJadge) {
            updatedPilot["judge"] = pilot.entity.judge;
            client({
                method: 'PUT',
                path: pilot.entity._links.self.href,
                entity: updatedPilot,
                headers: {
                    'Content-Type': 'application/json',
                    'If-Match': pilot.headers.Etag
                }
            }).done(response => {
                /* Let the websocket handler update the state */
            }, response => {
                if (response.status.code === 403) {
                    alert('ACCESS DENIED: You are not authorized to update ' +
                        pilot.entity._links.self.href);
                }
                if (response.status.code === 412) {
                    alert('DENIED: Unable to update ' + pilot.entity._links.self.href +
                        '. Your copy is stale.');
                }
            });
        } else {
            alert("You are not authorized to update");
        }
    }

    onDelete(pilot) {
        client({method: 'DELETE', path: pilot.entity._links.self.href}
        ).done(response => {/* let the websocket handle updating the UI */},
            response => {
                if (response.status.code === 403) {
                    alert('ACCESS DENIED: You are not authorized to delete ' +
                        pilot.entity._links.self.href);
                }
            });
    }

    onNavigate(navUri) {
        client({
            method: 'GET',
            path: navUri
        }).then(pilotCollection => {
            this.links = pilotCollection.entity._links;
            this.page = pilotCollection.entity.page;

            return pilotCollection.entity._embedded.pilots.map(pilot =>
                client({
                    method: 'GET',
                    path: pilot._links.self.href
                })
            );
        }).then(pilotPromises => {
            return when.all(pilotPromises);
        }).done(pilots => {
            this.setState({
                page: this.page,
                pilots: pilots,
                attributes: Object.keys(this.schema.properties),
                pageSize: this.state.pageSize,
                links: this.links
            });
        });
    }

    updatePageSize(pageSize) {
        if (pageSize !== this.state.pageSize) {
            this.loadFromServer(pageSize);
        }
    }

    refreshAndGoToLastPage(message) {
        follow(client, root, [{
            rel: 'pilots',
            params: {size: this.state.pageSize}
        }]).done(response => {
            if (response.entity._links.last !== undefined) {
                this.onNavigate(response.entity._links.last.href);
            } else {
                this.onNavigate(response.entity._links.self.href);
            }
        })
    }

    refreshCurrentPage(message) {
        follow(client, root, [{
            rel: 'pilots',
            params: {
                size: this.state.pageSize,
                page: this.state.page.number
            }
        }]).then(pilotCollection => {
            this.links = pilotCollection.entity._links;
            this.page = pilotCollection.entity.page;

            return pilotCollection.entity._embedded.pilots.map(pilot => {
                return client({
                    method: 'GET',
                    path: pilot._links.self.href
                })
            });
        }).then(pilotPromises => {
            return when.all(pilotPromises);
        }).then(pilots => {
            this.setState({
                page: this.page,
                pilots: pilots,
                attributes: Object.keys(this.schema.properties),
                pageSize: this.state.pageSize,
                links: this.links
            });
        });
    }

    componentDidMount() {
        this.loadFromServer(this.state.pageSize);
        stompClient.register([
            {route: '/topic/newPilot', callback: this.refreshAndGoToLastPage},
            {route: '/topic/updatePilot', callback: this.refreshCurrentPage},
            {route: '/topic/deletePilot', callback: this.refreshCurrentPage}
        ]);
    }

    render() {
        return (
            <div>
                <Navbar color="light" light>
                    <NavbarBrand href="/" className="mr-auto">VS Time Machine Judge</NavbarBrand>


                    <b>{this.state.loggedInJadge}</b> &nbsp;&nbsp;&nbsp; <a href="/logout"><LogoutIcon /></a>
                </Navbar>

                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                <PilotList page={this.state.page}
                              pilots={this.state.pilots}
                              links={this.state.links}
                              pageSize={this.state.pageSize}
                              attributes={this.state.attributes}
                              onNavigate={this.onNavigate}
                              onUpdate={this.onUpdate}
                              onDelete={this.onDelete}
                              updatePageSize={this.updatePageSize}
                              loggedInJadge={this.state.loggedInJadge}/>

                              <PilotDataGrid
                                  pilots={this.state.pilots}
                                  onUpdate={this.onUpdate}
                                  attributes={this.state.attributes}
                              />
            </div>
        )
    }
}




class PilotDataGrid extends React.Component{
    constructor(props){
        super(props);

        this.onGridRowsUpdated = this.onGridRowsUpdated.bind(this);
    }
    onGridRowsUpdated({ fromRow, toRow, updated }){

        console.log({ fromRow, toRow, updated });
        for (let i = fromRow; i <= toRow; i++) {
            var newRow = { ...this.props.pilots[i].entity, ...updated };
            const updatedPilot = {};
            this.props.attributes.forEach(attribute => {
                updatedPilot[attribute] = newRow[attribute];
            });
            this.props.onUpdate(this.props.pilots[i], updatedPilot);
        }
    };
    render() {

        const columns = [
            { key: "firstName", name: "First Name", editable: true },
            { key: "lastName", name: "Last Name", editable: true },
            { key: "middleName", name: "Middle Name", editable: true },
            { key: "photo", name: "Photo", editable: true }
        ];

        return (

            <ReactDataGrid
                columns={columns}
                rowGetter={i => {
                    if(i < 0){
                        return ({});
                    }
                    else {
                        return ({
                            firstName: this.props.pilots[i].entity.firstName,
                            lastName: this.props.pilots[i].entity.lastName,
                            middleName: this.props.pilots[i].entity.middleName,
                            photo: this.props.pilots[i].entity.photo
                        })
                    }
                }}
                rowsCount={this.props.pilots.length}
                onGridRowsUpdated={this.onGridRowsUpdated}
                enableCellSelect={true}
            />
        );
    }
}
class CreateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);

        this.state = {
            modal: false
        };
    }

    handleSubmit(e) {
        e.preventDefault();
        const newPilot = {};
        this.props.attributes.forEach(attribute => {
            newPilot[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newPilot);
        this.props.attributes.forEach(attribute => {
            ReactDOM.findDOMNode(this.refs[attribute]).value = ''; // clear out the dialog's inputs
        });
        this.toggle();
    }

    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }
    render() {
        const inputs = this.props.attributes.map(attribute =>

            <FormGroup row key={attribute}>
                    <Label for={attribute} sm={3} >{attribute}:</Label>
                <Col sm={9}>
                        <Input
                    type="text"
                    name={attribute}
                    ref={attribute}
                    placeholder={attribute}/>
                </Col>
            </FormGroup>
        );
        return (
            <div>
                <Button outline color="primary" onClick={this.toggle}>
                    Create
                </Button>
                <Modal  isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Create new pilot</ModalHeader>
                    <ModalBody>
                        <Form>
                            {inputs}
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>
                            Close
                        </Button>
                        <Button color="primary" onClick={this.handleSubmit}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </Modal>

            </div>
        )
    }
}

class UpdateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toggle = this.toggle.bind(this);

        this.state = {
            modal: false
        };
    }

    handleSubmit(e) {
        e.preventDefault();
        const updatedPilot = {};
        this.props.attributes.forEach(attribute => {
            updatedPilot[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.pilot, updatedPilot);
        this.toggle();
    }


    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    render() {
        const inputs = this.props.attributes.map(attribute =>
            <FormGroup row key={this.props.pilot.entity[attribute]}>
                <Label for={this.props.pilot.entity[attribute]} sm={3}>{attribute}:</Label>
                <Col sm={9}>
                    <Input
                        type="text"
                        name={attribute}
                        ref={attribute}
                        id={this.props.pilot.entity[attribute]}
                        placeholder={attribute}
                        defaultValue={this.props.pilot.entity[attribute]} />
                </Col>
            </FormGroup>
        );

        const dialogId = "updatePilot-" + this.props.pilot.entity._links.self.href;

        const isJadgeCorrect = this.props.pilot.entity.judge.name == this.props.loggedInJadge;

        if (isJadgeCorrect === false) {
            return (
                <div>
                    <a>Not Your Pilot</a>
                </div>
            )
        } else {
            return (
                <div>
                    <Button color="primary" onClick={this.toggle}>
                        Update
                    </Button>
                    <Modal  isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                        <ModalHeader toggle={this.toggle}>Update an pilot</ModalHeader>
                        <ModalBody>
                            <Form>
                                {inputs}
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.toggle}>
                                Close
                            </Button>
                            <Button color="primary" onClick={this.handleSubmit}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </Modal>
                </div>

            )
        }
    }

}

class PilotList extends React.Component {

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        e.preventDefault();
        const pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
        }
    }

    handleNavFirst(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render() {
        const pageInfo = this.props.page.hasOwnProperty("number") ?
            <h3>Pilots - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

        const pilots = this.props.pilots.map(pilot =>
            <Pilot key={pilot.entity._links.self.href}
                      pilot={pilot}
                      attributes={this.props.attributes}
                      onUpdate={this.props.onUpdate}
                      onDelete={this.props.onDelete}
                      loggedInJadge={this.props.loggedInJadge}/>
        );

        const navLinks = [];
        if ("first" in this.props.links) {
                navLinks.push(  <PaginationItem>
                                    <PaginationLink previous onClick={this.handleNavFirst}  href="#" />
                                </PaginationItem>
                )
        }
        if ("prev" in this.props.links) {
                navLinks.push(  <PaginationItem>
                                    <PaginationLink next onClick={this.handleNavPrev}  href="#" >
                                        &lt;
                                    </PaginationLink>
                                </PaginationItem>
                )
        }
        if ("next" in this.props.links) {
                navLinks.push(  <PaginationItem>
                                    <PaginationLink next onClick={this.handleNavNext}  href="#" >
                                        &gt;
                                    </PaginationLink>
                                </PaginationItem>
                )
        }
        if ("last" in this.props.links) {
                navLinks.push(  <PaginationItem>
                                    <PaginationLink next onClick={this.handleNavLast}  href="#" />
                                </PaginationItem>
                    )
        }

        return (<div>
                    {pageInfo}
                    <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <Table  hover>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Middle Name</th>
                            <th>Photo</th>
                            <th>Jadge</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {pilots}
                    </tbody>
                </Table>
                    <div>
                        <Pagination size="sm" aria-label="Page navigation">
                        {navLinks}
                        </Pagination>
                    </div>
            </div>
        )
    }
}

// tag::pilot[]
class Pilot extends React.Component {

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);

        this.state = {
            date:moment(),
            collapsed: true
        };
    }

    handleDelete() {
        this.props.onDelete(this.props.pilot);
    }
    render() {
        const {date} = this.state;
        return (
            <tr>
                <td>{this.props.pilot.entity.firstName}</td>
                <td>{this.props.pilot.entity.lastName}</td>
                <td>{this.props.pilot.entity.middleName}</td>
                <td>{date.format('DD.MM.YYYY')}</td>
                <td>{this.props.pilot.entity.judge.name}</td>
                <td>
                    <UpdateDialog pilot={this.props.pilot}
                                  attributes={this.props.attributes}
                                  onUpdate={this.props.onUpdate}
                                  loggedInJadge={this.props.loggedInJadge}/>
                </td>
                <td>
                    <Button color="danger" onClick={this.handleDelete}><DeleteOutlineIcon /></Button>

                </td>
            </tr>
        )
    }
}

ReactDOM.render(
                <App loggedInJadge={document.getElementById('judgename').value } />,
            document.getElementById('react')
)