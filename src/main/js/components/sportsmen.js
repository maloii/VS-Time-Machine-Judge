'use strict';
import React from "react";
import {Alert, Button, Col, Container, Row} from "reactstrap";
import {WithContext as ReactTags} from './react_tags/ReactTags';
import {AccountEditIcon, AccountPlusIcon, DeleteForeverIcon} from 'mdi-react';
import ReactDataGrid from 'react-data-grid';
import {ImageFormatter, Menu} from 'react-data-grid-addons';
import Settings from '../settings'
import Global from '../global'
import eventClient from '../event_client'
import when from 'when';
import client from "../client";
import stompClient from "../websocket_listener";
import ModalSportsman from "./sportsman/modal_new_sportsman"

const {ContextMenu, MenuItem, SubMenu, ContextMenuTrigger} = Menu;

const KeyCodes = {
    comma: 188,
    enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class SportsmenTranspondersDataGrid extends React.Component {

    constructor(props) {
        super(props);
        this.handleDeleteTransponder = this.handleDeleteTransponder.bind(this);
        this.handleAdditionTransponder = this.handleAdditionTransponder.bind(this);
    }

    handleDeleteTransponder(i) {
        client({method: 'DELETE', path: this.props.row.transponders[i].url})
    }

    handleAdditionTransponder(tag) {
        client({
            method: 'POST',
            path: Settings.root + '/transponders',
            entity: {
                number: tag.text,
                sportsman: this.props.row.url,
                competition: Global.competition._links.competition.href
            },
            headers: {'Content-Type': 'application/json'}
        }).then(() => {

        }, response => {
            if (response.status.code === 409) {
                alert('A transponder with this number is already registered! ');
            }
        });
    }

    render() {
        let tags = [];
        this.props.row.transponders.map(t=>{
            tags =  [...tags, {id: t.url, text: t.number}]
        })

        return (<ReactTags
            tags={tags}
            handleDelete={this.handleDeleteTransponder}
            handleAddition={this.handleAdditionTransponder}
            delimiters={delimiters}
            allowDragDrop={false}
            autofocus={false}
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
        this.sortRows = this.sortRows.bind(this);

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


    sortRows(initialRows, sortColumn, sortDirection){
        function comparer (a, b) {
            //console.log(a[sortColumn].localeCompare(b[sortColumn]));
            if (sortDirection === "ASC") {
                return a[sortColumn] > b[sortColumn] ? 1 : -1;
            } else if (sortDirection === "DESC") {
                return a[sortColumn] < b[sortColumn] ? 1 : -1;
            }
        };
        let sportsmen = this.props.sportsmenTabl.sort(comparer);
        this.setState({
            sportsmenTabl:sportsmen
        });
        return sportsmen;
    };

    render() {
        const columns = [
            {key: "position", name: "№", sortable: true, width: 50 },
            {key: "firstName", name: "First Name", editable: true, resizable: true, sortable: true },
            {key: "lastName", name: "Last Name", editable: true, resizable: true, sortable: true, sortDescendingFirst: true},
            {key: "nick", name: "Nick(OSD)", width: 170, editable: true, resizable: true, sortable: true},
            {key: "transponders", name: "Transponders", formatter: <SportsmenTranspondersDataGrid /> },
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
                rowGetter={i => this.props.sportsmenTabl[i]}
                rowsCount={this.props.sportsmenTabl.length}
                onGridRowsUpdated={this.onGridRowsUpdated}
                minHeight={window.innerHeight-200}
                getCellActions={this.getCellActions}
                contextMenu={
                    <ExampleContextMenu
                        onRowDelete={(e, {rowIdx}) => deleteRow(this, this.props.sportsmenTabl[rowIdx].url)}
                        onRowEdit={(e, {rowIdx}) => editRow(this, this.props.sportsmenTabl[rowIdx].url)}
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
                onGridSort={(sortColumn, sortDirection) =>
                    this.sortRows(this.props.sportsmenTabl, sortColumn, sortDirection)
                }

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
            sportsmenTabl: [],
            attributes: []
        }
        this.selectCompetition = this.selectCompetition.bind(this);
        this.showNewSportsman = this.showNewSportsman.bind(this);
        this.showEditSportsman = this.showEditSportsman.bind(this);
        this.refreshListSportsmen = this.refreshListSportsmen.bind(this);
        this.onUpdateAttribute = this.onUpdateAttribute.bind(this);

        this.dialogSportsman = React.createRef();
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
                }).then(sportsmanCollection => {
                    return sportsmanCollection.entity._embedded.sportsmen.map(sportsman =>
                        client({
                            method: 'GET',
                            path: sportsman._links.self.href
                        })
                    );
                }).then(sportsmanPromises => {
                    return when.all(sportsmanPromises);
                }).then(s=>{
                    this.sportsmen = s;
                    return s.map(sportsman =>
                        client({
                            method: 'GET',
                            path: sportsman.entity._links.transponders.href
                        })
                    );
                }).then(transPromises => {
                    return when.all(transPromises);
                }).done(trans => {
                    let sportsmen = this.sportsmen;
                    let sportsmenTabl = [];
                    sportsmen.map(function callback(s, index, array) {
                        let arrTrans = [];
                        trans[index].entity._embedded.transponders.map(tr=>{
                            arrTrans.push({number:tr.number, url:tr._links.self.href});
                        });
                        // transponders: arrTrans.join(', '),
                        sportsmenTabl = [...sportsmenTabl, {
                            firstName: s.entity.firstName,
                            lastName: s.entity.lastName,
                            nick: s.entity.nick,
                            transponders: arrTrans,
                            url: s.url,
                            position:(index+1)
                        }]
                    });
                    this.setState({
                        sportsmenTabl: sportsmenTabl,
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
        this.stomp = stompClient.register([
            {route: '/topic/newSportsman', callback: this.refreshListSportsmen},
            {route: '/topic/updateSportsman', callback: this.refreshListSportsmen},
            {route: '/topic/deleteSportsman', callback: this.refreshListSportsmen},
            {route: '/topic/newTransponder', callback: this.refreshListSportsmen},
            {route: '/topic/deleteTransponder', callback: this.refreshListSportsmen}
        ]);
    }

    componentWillMount() {
        eventClient.on('SELECT_COMPETITION', this.selectCompetition);
    }

    componentWillUnmount() {
        eventClient.removeEventListener('SELECT_COMPETITION', this.selectCompetition);
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
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
                                    sportsmenTabl={this.state.sportsmenTabl}
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