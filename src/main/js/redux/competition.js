import 'babel-polyfill'
import { createSelector } from 'reselect'
import _ from 'lodash'
import { getCompetitions } from '../api/competition_api'
import { loadSporsmen } from './sportsmen'

const MODULE_NAME = 'competition';

const FETCH_COMPETITIONS_REQUEST = 'FETCH_COMPETITIONS_REQUEST';
const FETCH_COMPETITIONS_SUCCESS = 'FETCH_COMPETITIONS_SUCCESS';
const FETCH_COMPETITIONS_ERROR = 'FETCH_COMPETITIONS_ERROR';
const SELECT_COMPETITION = 'SELECT_COMPETITION';

const initState = {
    competitions: [],
    loaded: false
};

export function competition (state = initState, action) {
    if (action.type === FETCH_COMPETITIONS_REQUEST) {
        return (
            {
                ...state,
                competitions: [],
                loaded: action.payload
            });
    } else if (action.type === FETCH_COMPETITIONS_SUCCESS) {
        return (
            {
                ...state,
                competitions: action.payload,
                loaded: true
            });
    } else if (action.type === FETCH_COMPETITIONS_ERROR) {
        return (
            {
                ...state,
                competitions: [],
                error: action.payload,
                loaded: true
            });
    } else if (action.type === SELECT_COMPETITION) {
        return (
            {
                ...state,
                competition: action.payload
            });
    }
    return state;
}

const competitionsRequest = loaded => ({
    type: FETCH_COMPETITIONS_REQUEST,
    payload: loaded
});

const competitionsSuccess = competitions => ({
    type: FETCH_COMPETITIONS_SUCCESS,
    payload: competitions
});

const competitionsError = error => ({
    type: FETCH_COMPETITIONS_ERROR,
    payload: error
});

const selectCompetition = competition => ({
    type: SELECT_COMPETITION,
    payload: competition
});

export function loadCompetitions () {
    return async dispatch => {
        await dispatch(competitionsRequest(false));
        try {
            const response = await getCompetitions();
            const competitions = response.prop('competitions');
            await competitions.map(competition => competition.link('gates').fetch());
            const selectedCompetition = await _.find(competitions, ['props.selected', true]);
            // Global.competition = selectedCompetition; // FIXME
            await dispatch(competitionsSuccess(competitions));
            await dispatch(selectCompetition(selectedCompetition));
            dispatch(loadSporsmen());
        } catch (error) {
            dispatch(competitionsError(error.message));
        }
    };
}

export const competitionsSelector = createSelector(
    state => state[MODULE_NAME].competitions,
    competitions => competitions
);

export const competitionSelector = createSelector(
    state => state[MODULE_NAME].competition,
    competition => competition
);

export const loadedSelector = createSelector(
    state => state[MODULE_NAME].loaded,
    loaded => loaded
);
