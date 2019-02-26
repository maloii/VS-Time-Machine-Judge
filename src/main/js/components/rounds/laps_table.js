'use strict';
import React from 'react';
import {Table} from "reactstrap";
import stompClient from "../../websocket_listener";
import client from "../../client";
import {ContextMenu, ContextMenuTrigger, MenuItem} from "react-contextmenu";


let contextTrigger = null;
class LapsTable  extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sportsmen: []
        }
        this.refreshTableLaps = this.refreshTableLaps.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.editRow = this.editRow.bind(this);
    }



    deleteRow(e){
        console.log('deleteRow');
    }


    editRow(e){
        console.log('editRow');
        console.log(e.data);
    }

    rowEvents = {
        onContextMenu:(e, row, rowIndex) =>{
            if(contextTrigger) {
                e.data = row;
                contextTrigger.handleContextClick(e );
            }
        }
    };
    refreshTableLaps() {
        // client({
        //     method: 'GET',
        //     path: this.props.round._links.groups.href
        // }).then(groups => {
        //     this.setState({groups: groups.entity._embedded.groups});
        //     const selectedGroup = groups.entity._embedded.groups.filter(function (group) {
        //         return group.selected;
        //     });
        //     if (selectedGroup.length > 0) this.loadSelectGroup(selectedGroup[0]);
        //
        // });
    }

    componentDidMount() {
        this.refreshTableLaps();
        this.stomp = stompClient.register([
            {route: '/topic/newLap', callback: this.refreshListGroups},
            {route: '/topic/updateLap', callback: this.refreshListGroups},
            {route: '/topic/deleteLap', callback: this.refreshListGroups}
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
        const headerTable = [];
        this.props.sportsmen.map(sportsman=>{
            headerTable.push(<th key={sportsman._links.self.href}>{sportsman.firstName} {sportsman.lastName}</th>);
        });
        return(
            <>
                <ContextMenuTrigger id="some_unique_identifier" ref={c => contextTrigger = c}>
                    <div></div>
                </ContextMenuTrigger>

                <ContextMenu id="some_unique_identifier">
                    <MenuItem onClick={this.editRow}>
                        Edit
                    </MenuItem>
                    <MenuItem onClick={this.deleteRow}>
                        Delete
                    </MenuItem>
                </ContextMenu>
                <Table bordered>
                    <thead>
                    <tr>
                        {headerTable}
                    </tr>
                    </thead>
                </Table>
            </>
        );
    }
}
export default LapsTable;