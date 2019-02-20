import React from "react";
import eventClient from '../event_client'
import {Alert, Container} from "reactstrap";
import Global from "../global";

class Rounds extends React.Component {

    constructor(props) {
        super(props);
        this.state  = {
            competition: Global.competition
        }
        this.selectCompetition = this.selectCompetition.bind(this);
    }


    componentWillMount() {
        eventClient.on('SELECT_COMPETITION', this.selectCompetition);
    }

    componentWillUnmount(){
        eventClient.removeEventListener('SELECT_COMPETITION', this.selectCompetition);
    }

    selectCompetition({ competition }){
        this.setState({
            competition:Global.competition
        });
    }
    render() {
        if(this.state.competition === null) return(
            <Container>
                <Alert color="primary">
                    Create and select a competition!
                </Alert>
            </Container>
        );

        return (
           <Container>
                Rounds
            </Container>
        );
    }
}

export default Rounds;