import { combineReducers } from 'redux'

import { sportsmen } from './sportsmen'
import { competition } from './competition'

export default combineReducers({
    sportsmen,
    competition
});
