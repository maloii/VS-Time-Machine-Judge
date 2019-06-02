import stompClient from '../websocket_listener'
import { loadCompetitions } from '../redux/competition'
import { loadSporsmen } from '../redux/sportsmen'

export default (story) => {
    stompClient.register([
        // Competitions
        { route: '/topic/newCompetition', callback: () => story.dispatch(loadCompetitions()) },
        { route: '/topic/updateCompetition', callback: () => story.dispatch(loadCompetitions()) },
        { route: '/topic/deleteCompetition', callback: () => story.dispatch(loadCompetitions()) },
        // Sportsmen
        { route: '/topic/newSportsman', callback: () => story.dispatch(loadSporsmen()) },
        { route: '/topic/updateSportsman', callback: () => story.dispatch(loadSporsmen()) },
        { route: '/topic/deleteSportsman', callback: () => story.dispatch(loadSporsmen()) },
        { route: '/topic/newTransponder', callback: () => story.dispatch(loadSporsmen()) },
        { route: '/topic/deleteTransponder', callback: () => story.dispatch(loadSporsmen()) }
    ]);
};
