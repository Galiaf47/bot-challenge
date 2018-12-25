import {combineReducers} from 'redux';

import reducer from 'game/reducer';

const rootReducer = combineReducers({
  game: reducer,
});

export default rootReducer;
