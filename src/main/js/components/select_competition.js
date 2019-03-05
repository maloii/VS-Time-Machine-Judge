'use strict';
import React from 'react';
import client from '../client';
import stompClient from '../websocket_listener';
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown,} from "reactstrap";
import DialogNewCompetition from './competition/modal_new_competition';
import {CheckIcon} from 'mdi-react'
import Settings from '../settings'
import Global from '../global'
import eventClient from '../event_client'


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
        this.stomp = stompClient.register([
            {route: '/topic/newCompetition', callback: this.refreshListCompetition},
            {route: '/topic/updateCompetition', callback: this.refreshListCompetition},
            {route: '/topic/deleteCompetition', callback: this.refreshListCompetition}
        ]);
    }
    componentWillUnmount(){
        for (const sub in this.stomp.subscriptions) {
            if (this.stomp.subscriptions.hasOwnProperty(sub)) {
                this.stomp.unsubscribe(sub);
            }
        }
    }
    render() {

        const items = this.state.competitions.map(competition =>
                                    <DropdownItem key={competition._links.self.href} id={competition._links.self.href}  onClick={this.onEditCompetition}>
                                        {competition.name} {competition.selected?<CheckIcon />:''}
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