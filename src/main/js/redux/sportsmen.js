import { createSelector } from 'reselect'
import { competitionSelector } from './competition'
import { getSportsmen } from '../api/spotrsmen'

const MODULE_NAME = 'sportsmen';

const FETCH_SPORTSMEN_REQUEST = 'FETCH_SPORTSMEN_REQUEST';
const FETCH_SPORTSMEN_SUCCESS = 'FETCH_SPORTSMEN_SUCCESS';
const FETCH_SPORTSMEN_ERROR = 'FETCH_SPORTSMEN_ERROR';

const ADD_SPORTSMEN = 'ADD_SPORTSMEN';
const DELETE_SPORTSMEN = 'DELETE_SPORTSMEN';
const UPDATE_SPORTSMEN = 'UPDATE_SPORTSMEN';

const initState = {
    sportsmen: [],
    loaded: false
};

export function sportsmen (state = initState, action) {
    if (action.type === FETCH_SPORTSMEN_REQUEST) {
        return (
            {
                ...state,
                sportsmen: [],
                loaded: action.payload
            });
    } else if (action.type === FETCH_SPORTSMEN_SUCCESS) {
        return (
            {
                ...state,
                sportsmen: action.payload,
                loaded: true
            });
    } else if (action.type === FETCH_SPORTSMEN_ERROR) {
        return (
            {
                ...state,
                sportsmen: [],
                error: action.payload,
                loaded: true
            });
    }
    return state;
}
const sportsmenRequest = loaded => ({
    type: FETCH_SPORTSMEN_REQUEST,
    payload: loaded
});

const sportsmenSuccess = sportsmen => ({
    type: FETCH_SPORTSMEN_SUCCESS,
    payload: sportsmen
});

const sportsmenError = error => ({
    type: FETCH_SPORTSMEN_ERROR,
    payload: error
});

export function loadSporsmen () {
    return async (dispatch, state) => {
        await dispatch(sportsmenRequest(false));
        try {
            const competition = competitionSelector(state());
            if (competition) {
                const sportsmen = await getSportsmen(competition.link('sportsmen')._uri.uri);
                dispatch(sportsmenSuccess(sportsmen.props.sportsmen));
            }
        } catch (error) {
            dispatch(sportsmenError(error.message));
        }
    };
}

export const sportsmenSelector = createSelector(
    state => state[MODULE_NAME].sportsmen,
    sportsmen => sportsmen
);
