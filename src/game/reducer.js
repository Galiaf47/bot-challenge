// @flow

import type {ThunkAction} from 'core/types/reducer';
import type {RootState} from 'app/types';
import * as logger from 'logger';
import type {UpdatePlayerFunction, Timeline} from './types';
import * as game from './game';

const SET_SIMULATING = 'bcsdk/game/SET_SIMULATING';
const SET_TIMELINE = 'bcsdk/game/SET_TIMELINE';
const SET_PLAY_TIMELINE = 'bcsdk/game/SET_PLAY_TIMELINE';

type SetSimulatingAction = {
  type: typeof SET_SIMULATING,
  payload: boolean
};

type SetTimelineAction = {
  type: typeof SET_TIMELINE,
  payload: ?Timeline
};

type PlayTimelineAction = {
  type: typeof SET_PLAY_TIMELINE,
  payload: boolean,
};

type Action =
  | SetSimulatingAction
  | SetTimelineAction
  | PlayTimelineAction;

export type State = {|
  simulating: boolean,
  timeline: ?Timeline,
  play: boolean,
|};

const initialState: State = {
  simulating: false,
  timeline: null,
  play: false,
};

function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SET_SIMULATING:
      return {
        ...state,
        simulating: action.payload,
      };
    case SET_TIMELINE:
      return {
        ...state,
        timeline: action.payload,
      };
    case SET_PLAY_TIMELINE:
      return {
        ...state,
        play: action.payload,
      };
    default:
      return state;
  }
}

// actions

const setSimulating = (simulating: boolean): SetSimulatingAction => ({
  type: SET_SIMULATING,
  payload: simulating,
});

const setTimeline = (timeline: Timeline): SetTimelineAction => ({
  type: SET_TIMELINE,
  payload: timeline,
});

const playTimeline = (play: boolean): PlayTimelineAction => ({
  type: SET_PLAY_TIMELINE,
  payload: play,
});

// thunks

const simulate = (updatePlayer: UpdatePlayerFunction): ThunkAction<Action, State> => (dispatch) => {
  dispatch(setSimulating(true));

  game.simulate(updatePlayer)
    .then((timeline) => {
      dispatch(setTimeline(timeline));
    }, (err) => {
      logger.error(err);
    })
    .finally(() => {
      dispatch(setSimulating(false));
    });
};

// selectors

const getState = (state: RootState): State => state.game;
const getSimulating = (state: RootState): boolean => getState(state).simulating;
const getTimeline = (state: RootState): ?Timeline => getState(state).timeline;
const getTimelinePlay = (state: RootState): boolean => getState(state).play;

export default reducer;
export {
  // actions
  simulate,
  playTimeline,

  // selectors
  getSimulating,
  getTimeline,
  getTimelinePlay,
};
