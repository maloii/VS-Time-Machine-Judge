'use strict';

import ReactDataGrid from "react-data-grid";
import React from 'react';
import when from 'when';
import client from '../client';
import follow from '../follow';
import stompClient from '../websocket_listener';
import '../settings';

const root = '/api/data';

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


class Pilots extends React.Component {

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
                <PilotDataGrid
                    pilots={this.state.pilots}
                    onUpdate={this.onUpdate}
                    attributes={this.state.attributes}
                />
            </div>
        )
    }
}

export default Pilots;