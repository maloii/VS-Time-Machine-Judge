'use strict';
import React from "react";
import ReactDOM from "react-dom";
import {
    Container,
    Row,
    Col,
    Button,
    ModalHeader,
    ModalBody,
    Modal,
    ModalFooter,
    Label,
    Input,
    FormGroup,
    Card,
    CardImg,
    CardBody,
    Alert
} from "reactstrap";
import {WithContext as ReactTags} from './react_tags/ReactTags';
import {AccountPlusIcon, DeleteForeverIcon, AccountEditIcon} from 'mdi-react';
import ReactDataGrid from 'react-data-grid';
import {Menu} from 'react-data-grid-addons';
import Settings from '../settings'
import Global from '../global'
import eventClient from '../event_client'
import follow from "../follow";
import when from 'when';
import client from "../client";
import stompClient from "../websocket_listener";

const {ContextMenu, MenuItem, SubMenu, ContextMenuTrigger} = Menu;

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];


class ModalSportsman extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sportsman: {},
            url: null,
            tags: []
        }

        this.handleSave = this.handleSave.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.toggle = this.toggle.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
        this.toggleEditShow = this.toggleEditShow.bind(this);
        this.handleUDelete = this.handleUDelete.bind(this);
        this.handleDeleteTransponder = this.handleDeleteTransponder.bind(this);
        this.handleAdditionTransponder = this.handleAdditionTransponder.bind(this);
    }

    toggle() {
        this.setState({
            modalSportsman: !this.state.modalSportsman
        });
    }

    toggleShow() {
        this.setState({
            modalSportsman: !this.state.modalSportsman,
            sportsman: {},
            url: null,
            tags: []
        });
    }

    toggleEditShow(url) {
        this.setState({tags: []});
        client({method: 'GET', path: url}).then(response => {
            client({
                method: 'GET',
                path: response.entity._links.transponders.href
            }).then(transponders => {
                transponders.entity._embedded.transponders.map(t => {
                    this.setState({
                        tags: [...this.state.tags, {id: t._links.self.href, text: t.number}]
                    });
                });
            });
            this.setState({
                modalSportsman: !this.state.modalSportsman,
                sportsman: response.entity,
                url: url
            });
        });

    }

    handleSave() {
        const newSportsman = {
            firstName: ReactDOM.findDOMNode(this.refs['firstName']).value.trim(),
            lastName: ReactDOM.findDOMNode(this.refs['lastName']).value.trim(),
            middleName: ReactDOM.findDOMNode(this.refs['middleName']).value.trim(),
            nick: ReactDOM.findDOMNode(this.refs['nick']).value.trim(),
            city: ReactDOM.findDOMNode(this.refs['city']).value.trim(),
            age: ReactDOM.findDOMNode(this.refs['age']).value.trim(),
            team: ReactDOM.findDOMNode(this.refs['team']).value.trim(),
            phone: ReactDOM.findDOMNode(this.refs['phone']).value.trim(),
            email: ReactDOM.findDOMNode(this.refs['email']).value.trim(),
            country: ReactDOM.findDOMNode(this.refs['country']).value.trim(),
            selected: false,
            competition: Global.competition._links.competition.href
        };
        follow(client, Settings.root, ['sportsmen']).then(response => {
            return client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newSportsman,
                headers: {'Content-Type': 'application/json'}
            })
        }).then(responseSportsman => {
            this.sportsmanHref = responseSportsman.entity._links.self.href
            this.state.tags.map(tag => {

                client({
                    method: 'POST',
                    path: Settings.root + '/transponders',
                    entity: {
                        number: tag.text,
                        sportsman: this.sportsmanHref,
                        competition: Global.competition._links.competition.href
                    },
                    headers: {'Content-Type': 'application/json'}
                });

            });
        });
        this.toggle();
    }

    handleUpdate() {

        const updateSportsman = {
            ...this.state.sportsman, ...{
                firstName: ReactDOM.findDOMNode(this.refs['firstName']).value.trim(),
                lastName: ReactDOM.findDOMNode(this.refs['lastName']).value.trim(),
                middleName: ReactDOM.findDOMNode(this.refs['middleName']).value.trim(),
                nick: ReactDOM.findDOMNode(this.refs['nick']).value.trim(),
                city: ReactDOM.findDOMNode(this.refs['city']).value.trim(),
                age: ReactDOM.findDOMNode(this.refs['age']).value.trim(),
                team: ReactDOM.findDOMNode(this.refs['team']).value.trim(),
                phone: ReactDOM.findDOMNode(this.refs['phone']).value.trim(),
                email: ReactDOM.findDOMNode(this.refs['email']).value.trim(),
                country: ReactDOM.findDOMNode(this.refs['country']).value.trim()
            }
        };

        console.log(updateSportsman);
        client({
            method: 'PUT',
            path: this.state.url,
            entity: updateSportsman,
            headers: {'Content-Type': 'application/json'}
        }).done(()=>{
            console.log(this.props);
            this.toggle()
        });
    }

    handleUDelete() {
        if (confirm('Do you really want to delete the record?')) {
            client({method: 'DELETE', path: this.state.url}
            ).done();
            this.toggle();
        }
    }

    handleDeleteTransponder(i) {

        if (this.state.url !== null) {
            client({method: 'DELETE', path: this.state.tags[i].id}
            ).done(() => {
                const {tags} = this.state;
                this.setState({
                    tags: tags.filter((tag, index) => index !== i),
                });
            });
        } else {
            const {tags} = this.state;
            this.setState({
                tags: tags.filter((tag, index) => index !== i),
            });
        }
    }

    handleAdditionTransponder(tag) {
        if (this.state.url !== null) {
            client({
                method: 'POST',
                path: Settings.root + '/transponders',
                entity: {
                    number: tag.text,
                    sportsman: this.state.url,
                    competition: Global.competition._links.competition.href
                },
                headers: {'Content-Type': 'application/json'}
            }).then(() => {
                this.setState(state => ({tags: [...state.tags, tag]}));
            });
        } else {
            this.setState(state => ({tags: [...state.tags, tag]}));
        }
    }

    render() {
        const {tags, suggestions} = this.state;
        let submit = <Button color="primary" onClick={this.handleSave}>
            Save
        </Button>
        let deleteButton = '';
        let header = 'New sportsman';
        if (this.state.url !== null) {
            submit = <Button color="primary" onClick={this.handleUpdate}>
                Update
            </Button>
            deleteButton = <Button color="danger" onClick={this.handleUDelete} className="mr-auto">
                Delete
            </Button>
            header = 'Edit sportsman';

        }

        return (<Modal isOpen={this.state.modalSportsman} toggle={this.toggle} className="modal-lg">
            <ModalHeader toggle={this.toggleShow}>{header}</ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row>
                        <Col xs="8">
                            <FormGroup row>
                                <Label for="name" sm={4}>Transponders</Label>
                                <Col sm={8}>
                                    <ReactTags
                                        tags={tags}
                                        handleDelete={this.handleDeleteTransponder}
                                        handleAddition={this.handleAdditionTransponder}
                                        delimiters={delimiters}
                                        allowDragDrop={false}
                                        placeholder="Transponder"
                                        classNames={{
                                            tagInputField: 'form-control ReactTags__suggestions_input'
                                        }}/>
                                </Col>

                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>First Name</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="firstName"
                                        id="firstName"
                                        ref="firstName"
                                        defaultValue={this.state.sportsman.firstName}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Last Name</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="lastName"
                                        id="lastName"
                                        ref="lastName"
                                        defaultValue={this.state.sportsman.lastName}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Middle Name</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="middleName"
                                        id="middleName"
                                        ref="middleName"
                                        defaultValue={this.state.sportsman.middleName}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Nick</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="nick"
                                        id="nick"
                                        ref="nick"
                                        defaultValue={this.state.sportsman.nick}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Country</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="country"
                                        id="country"
                                        ref="country"
                                        defaultValue={this.state.sportsman.country}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>City</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="city"
                                        id="city"
                                        ref="city"
                                        defaultValue={this.state.sportsman.city}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Age</Label>
                                <Col sm={8}>
                                    <Input
                                        type="number"
                                        name="age"
                                        id="age"
                                        ref="age"
                                        defaultValue={this.state.sportsman.age}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Email</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="email"
                                        id="email"
                                        ref="email"
                                        defaultValue={this.state.sportsman.email}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Phone</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        ref="phone"
                                        defaultValue={this.state.sportsman.phone}/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="name" sm={4}>Team</Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        name="team"
                                        id="team"
                                        ref="team"
                                        defaultValue={this.state.sportsman.team}/>
                                </Col>
                            </FormGroup>
                        </Col>
                        <Col xs="4">
                            <Card>
                                <CardImg top width="100%" src="/images/silhouette.png" alt="Card image cap"/>
                                <CardBody className="text-center">
                                    <Input type="file" name="photo" id="photo" hidden/>
                                    <Button color="info" onClick={event => document.getElementById('photo').click()}>Select
                                        photo</Button>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                {deleteButton}
                <Button color="secondary" onClick={this.toggle}>
                    Close
                </Button>
                {submit}
            </ModalFooter>
        </Modal>);

        /*
    private String photo;
         */
    }
}

class SportsmenTranspondersDataGrid extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tags: []
        }
        this.handleDeleteTransponder = this.handleDeleteTransponder.bind(this);
        this.handleAdditionTransponder = this.handleAdditionTransponder.bind(this);
        this.refreshListTags = this.refreshListTags.bind(this);
    }

    handleDeleteTransponder(i) {
        client({method: 'DELETE', path: this.state.tags[i].id}
        ).done(() => {
            const {tags} = this.state;
            this.setState({
                tags: tags.filter((tag, index) => index !== i),
            });
        });


    }

    handleAdditionTransponder(tag) {
        client({
            method: 'POST',
            path: Settings.root + '/transponders',
            entity: {
                number: tag.text,
                sportsman: this.props.url,
                competition: Global.competition._links.competition.href
            },
            headers: {'Content-Type': 'application/json'}
        }).then(() => {
            this.setState(state => ({tags: [...state.tags, tag]}));
        });

    }

    refreshListTags(){

        console.log(this.props.url);
        client({method: 'GET', path: this.props.url}).then(response => {
            client({
                method: 'GET',
                path: response.entity._links.transponders.href
            }).then(transponders => {
                this.setState({tags: []});
                transponders.entity._embedded.transponders.map(t => {
                    this.setState({
                        tags: [...this.state.tags, {id: t._links.self.href, text: t.number}]
                    });
                });
            });

        });
    }
    componentDidMount() {
        this.refreshListTags();
        // stompClient.register([
        //     {route: '/topic/newTransponder', callback: this.refreshListTags},
        //     {route: '/topic/deleteTransponder', callback: this.refreshListTags},
        //     {route: '/topic/newSportsman', callback: this.refreshListTags},
        //     {route: '/topic/updateSportsman', callback: this.refreshListTags},
        //     {route: '/topic/deleteSportsman', callback: this.refreshListTags}
        // ]);
    }

    render() {
        const {tags, suggestions} = this.state;
        return (<ReactTags
            tags={tags}
            handleDelete={this.handleDeleteTransponder}
            handleAddition={this.handleAdditionTransponder}
            delimiters={delimiters}
            allowDragDrop={false}
            placeholder="Transponder"
            classNames={{
                tagInputField: 'ReactTags__suggestions_input'
            }}/>);
    }
}

class SportsmenDataGrid extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedIndexes: []
        }
        this.onGridRowsUpdated = this.onGridRowsUpdated.bind(this);
        this.onRowsSelected = this.onRowsSelected.bind(this);
        this.onRowsDeselected = this.onRowsDeselected.bind(this);
        this.deleteSportsmen = this.deleteSportsmen.bind(this);
        this.editSportsmen = this.editSportsmen.bind(this);
        this.getCellActions = this.getCellActions.bind(this);
    }

    onGridRowsUpdated({fromRow, toRow, updated}) {
        for (let i = fromRow; i <= toRow; i++) {
            var newRow = {...this.props.sportsmen[i].entity, ...updated};
            const updatedPilot = {};
            this.props.attributes.forEach(attribute => {
                updatedPilot[attribute] = newRow[attribute];
            });
            this.props.onUpdate(this.props.sportsmen[i], updatedPilot);
        }
    };

    onRowsSelected(rows) {
        this.setState({
            selectedIndexes: this.state.selectedIndexes.concat(
                rows.map(r => r.rowIdx)
            )
        });
        rows.map(r => {

            var newRow = {...this.props.sportsmen[r.rowIdx].entity, ...{selected: true}};
            const updatedPilot = {};
            this.props.attributes.forEach(attribute => {
                updatedPilot[attribute] = newRow[attribute];
            });
            client({
                method: 'PUT',
                path: this.props.sportsmen[r.rowIdx].url,
                entity: updatedPilot,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        });
    }

    onRowsDeselected(rows) {
        let rowIndexes = rows.map(r => r.rowIdx);
        this.setState({
            selectedIndexes: this.state.selectedIndexes.filter(
                i => rowIndexes.indexOf(i) === -1
            )
        });
        rows.map(r => {
            var newRow = {...this.props.sportsmen[r.rowIdx].entity, ...{selected: false}};
            const updatedPilot = {};
            this.props.attributes.forEach(attribute => {
                updatedPilot[attribute] = newRow[attribute];
            });
            client({
                method: 'PUT',
                path: this.props.sportsmen[r.rowIdx].url,
                entity: updatedPilot,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        });
    }

    deleteSportsmen(url) {
        if (confirm('Do you really want to delete the record?')) {
            client({method: 'DELETE', path: url}
            ).done();
        }
    }

    editSportsmen(url) {
        this.props.editSportsmen(url);
        //console.log(url);
    }

    getCellActions(column, row) {
        const cellActions = {
            button: [
                {
                    icon: <DeleteForeverIcon/>,
                    callback: () => {
                        this.deleteSportsmen(row.url);
                    }
                },
                {
                    icon: <AccountEditIcon/>,
                    callback: () => {
                        this.editSportsmen(row.url);
                    }
                }
            ]
        };
        return cellActions[column.key];

    }

    render() {

        function sportsmenTransponders(row) {
            return <SportsmenTranspondersDataGrid url={row.value}/>;
        }

        const columns = [
            {key: "firstName", name: "First Name", editable: true, resizable: true},
            {key: "lastName", name: "Last Name", editable: true, resizable: true},
            {key: "nick", name: "Nick(OSD)", width: 170, editable: true, resizable: true},
            {key: "transponders", name: "Transponders", resizable: true, formatter:sportsmenTransponders},
            {key: "button", name: "", width: 80},
            {key: "last", name: "", width: 30}
        ];

        function ExampleContextMenu({
                                        idx,
                                        id,
                                        rowIdx,
                                        onRowDelete,
                                        onRowEdit
                                    }) {
            return (
                <ContextMenu id={id}>
                    <MenuItem data={{rowIdx, idx}} onClick={onRowEdit}>
                        Edit
                    </MenuItem>
                    <MenuItem data={{rowIdx, idx}} onClick={onRowDelete}>
                        Delete
                    </MenuItem>
                </ContextMenu>
            );
        }

        function deleteRow(parent, rows) {
            parent.deleteSportsmen(rows);
        };

        function editRow(parent, rows) {
            parent.editSportsmen(rows);
        };
        let selectedIndexes = [];
        this.props.sportsmen.map(function callback(sportsman, index, array) {
            if (sportsman.entity.selected) {
                selectedIndexes = selectedIndexes.concat(index)
            }
        });
        return (

            <ReactDataGrid
                columns={columns}
                rowGetter={i => {
                    if (i < 0 || i >= this.props.sportsmen.length) {
                        return ({});
                    } else {
                        return ({
                            firstName: this.props.sportsmen[i].entity.firstName,
                            lastName: this.props.sportsmen[i].entity.lastName,
                            nick: this.props.sportsmen[i].entity.nick,
                            transponders: this.props.sportsmen[i].url,
                            url: this.props.sportsmen[i].url
                        })
                    }
                }}
                rowsCount={this.props.sportsmen.length}
                onGridRowsUpdated={this.onGridRowsUpdated}
                minHeight={500}
                getCellActions={this.getCellActions}
                contextMenu={
                    <ExampleContextMenu
                        onRowDelete={(e, {rowIdx}) => deleteRow(this, this.props.sportsmen[rowIdx].url)}
                        onRowEdit={(e, {rowIdx}) => editRow(this, this.props.sportsmen[rowIdx].url)}
                    />
                }
                RowsContainer={ContextMenuTrigger}
                enableCellSelect={true}
                rowSelection={{
                    showCheckbox: true,
                    enableShiftSelect: true,
                    onRowsSelected: this.onRowsSelected,
                    onRowsDeselected: this.onRowsDeselected,
                    selectBy: {
                        indexes: selectedIndexes
                    }
                }}
            />
        );
    }
}

/*


 */

class Sportsmen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            competition: Global.competition,
            sportsmen: [],
            attributes: []
        }
        this.selectCompetition = this.selectCompetition.bind(this);
        this.showNewSportsman = this.showNewSportsman.bind(this);
        this.showEditSportsman = this.showEditSportsman.bind(this);
        this.refreshListSportsmen = this.refreshListSportsmen.bind(this);
        this.onUpdateAttribute = this.onUpdateAttribute.bind(this);

        this.dialogSportsman = React.createRef();
    }

    componentWillMount() {
        eventClient.on('SELECT_COMPETITION', this.selectCompetition);
    }

    componentWillUnmount() {
        eventClient.removeEventListener('SELECT_COMPETITION', this.selectCompetition);
    }

    showNewSportsman() {
        this.dialogSportsman.current.toggleShow();
    }

    showEditSportsman(url) {
        this.dialogSportsman.current.toggleEditShow(url);
    }

    refreshListSportsmen() {
        if (Global.competition !== null) {
            client({method: 'GET', path: Global.competition._links.sportsmen.href}).then(response => {

                client({
                    method: 'GET',
                    path: Settings.root + '/profile/sportsmen',
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
                        } else if (schema.entity.properties[property].hasOwnProperty('$ref')) {
                            delete schema.entity.properties[property];
                        }
                    });
                    this.schema = schema.entity;
                    return response;
                    // end::json-schema-filter[]
                }).then(sportsmanCollection => {
                    return sportsmanCollection.entity._embedded.sportsmen.map(sportsman =>
                        client({
                            method: 'GET',
                            path: sportsman._links.self.href
                        })
                    );
                }).then(sportsmanPromises => {
                    return when.all(sportsmanPromises);
                }).done(sportsmen => {

                    this.setState({
                        sportsmen: sportsmen,
                        attributes: Object.keys(this.schema.properties)

                    });
                });

            });
        }
    }

    selectCompetition({competition}) {
        this.setState({
            competition: Global.competition
        });
        this.refreshListSportsmen();
    }

    componentDidMount() {
        this.refreshListSportsmen();
        stompClient.register([
            {route: '/topic/newSportsman', callback: this.refreshListSportsmen},
            {route: '/topic/updateSportsman', callback: this.refreshListSportsmen},
            {route: '/topic/deleteSportsman', callback: this.refreshListSportsmen},
            {route: '/topic/newTransponder', callback: this.refreshListSportsmen},
            {route: '/topic/deleteTransponder', callback: this.refreshListSportsmen}
        ]);
    }

    onUpdateAttribute(sportsman, updatedSportsman) {
        client({
            method: 'PUT',
            path: sportsman.entity._links.self.href,
            entity: updatedSportsman,
            headers: {
                'Content-Type': 'application/json',
                'If-Match': sportsman.headers.Etag
            }
        }).done(response => {
            /* Let the websocket handler update the state */
        }, response => {
            if (response.status.code === 403) {
                alert('ACCESS DENIED: You are not authorized to update ' +
                    sportsman.entity._links.self.href);
            }
            if (response.status.code === 412) {
                alert('DENIED: Unable to update ' + sportsman.entity._links.self.href +
                    '. Your copy is stale.');
            }
        });
    }

    render() {

        if (this.state.competition === null) {
            return (
                <Container>
                    <Alert color="primary">
                        Create and select a competition!
                    </Alert>
                </Container>
            )
        } else {
            return (
                <>
                    <ModalSportsman ref={this.dialogSportsman}/>
                    <Container fluid>
                        <Row>
                            <Col className="d-flex">
                                <Button color="primary" className="ml-auto" onClick={this.showNewSportsman}>
                                    <AccountPlusIcon/> Add new sportsman
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="d-flex pt-3">
                                <SportsmenDataGrid
                                    sportsmen={this.state.sportsmen}
                                    onUpdate={this.onUpdateAttribute}
                                    attributes={this.state.attributes}
                                    editSportsmen={this.showEditSportsman}
                                />
                            </Col>
                        </Row>
                    </Container>
                </>
            );
        }

    }
}

export default Sportsmen;