import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { CheckIcon } from 'mdi-react'
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
import client from '../client'
import stompClient from '../websocket_listener'
import DialogNewCompetition from './competition/modal_new_competition'
import Settings from '../settings'
import Global from '../global'
import eventClient from '../event_client'
import { competitionSelector, competitionsSelector, loadCompetitions, loadedSelector } from '../redux/competition'

class SelectCompetition extends React.Component {
    constructor (props) {
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

    onEditCompetition (e) {
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
        });
    }
    onNewCompetition () {
        this.dialogNewCompetition.current.clearForm();
        this.dialogNewCompetition.current.toggle();
    }

    refreshListCompetition () {
        client({ method: 'GET', path: Settings.root + '/competitions' }).done(response => {
            let header = 'Select competition';
            const selectedCompetition = response.entity._embedded.competitions.filter(function (competition) {
                return competition.selected;
            });
            if (selectedCompetition.length > 0) {
                header = selectedCompetition[0].name;
                let competition = selectedCompetition[0];
                Global.competition = competition;
            } else {
                Global.competition = null;
            }
            eventClient.emit('SELECT_COMPETITION', {});
            this.setState({
                competitions: response.entity._embedded.competitions,
                header: header

            });
        });
    }

    componentDidMount () {
        const { loadCompetitions } = this.props;
        loadCompetitions();
        this.refreshListCompetition();
        this.stomp = stompClient.register([
            { route: '/topic/newCompetition', callback: this.refreshListCompetition },
            { route: '/topic/updateCompetition', callback: this.refreshListCompetition },
            { route: '/topic/deleteCompetition', callback: this.refreshListCompetition }
        ]);
    }
    render () {
        const { competitions, loaded } = this.props;
        if (!loaded) return <Fragment />;
        return (<Fragment>
            <DialogNewCompetition ref={this.dialogNewCompetition}/>
            <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                    {this.state.header}
                </DropdownToggle>
                <DropdownMenu right>
                    {loaded && competitions.map(competition => (
                        <DropdownItem key={competition._uri.uri} id={competition._uri.uri} onClick={this.onEditCompetition}>
                            {competition.props.name} {competition.props.selected ? <CheckIcon /> : ''}
                        </DropdownItem>
                    ))}
                    <DropdownItem divider/>
                    <DropdownItem id="newCompetition" key="newCompetition" onClick={this.onNewCompetition}>New competition</DropdownItem>
                </DropdownMenu>
            </UncontrolledDropdown>
        </Fragment>);
    }
}

SelectCompetition.propTypes = {
    loadCompetitions: PropTypes.func,
    competitions: PropTypes.array,
    competition: PropTypes.object,
    loaded: PropTypes.bool

};

const mapStateToProps = state => ({
    competitions: competitionsSelector(state),
    competition: competitionSelector(state),
    loaded: loadedSelector(state)
});

const mapDispatchToProps = dispatch => ({
    loadCompetitions: () => dispatch(loadCompetitions())
});
export default connect(mapStateToProps, mapDispatchToProps)(SelectCompetition);
