// @flow

import type {ThunkAction} from 'core/types/reducer';
import type {RootState} from 'app/types';
import * as logger from 'logger';
import {postSimulate} from 'data';
import type {Player, Timeline} from 'data/types';

const SET_SIMULATING = 'bcsdk/game/SET_SIMULATING';
const SET_TIMELINE = 'bcsdk/game/SET_TIMELINE';
const SET_PLAY_TIMELINE = 'bcsdk/game/SET_PLAY_TIMELINE';
const SET_WINNER = 'bcsdk/game/SET_WINNER';

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

type SetWinnerAction = {
  type: typeof SET_WINNER,
  payload: Player,
};

type Action =
  | SetSimulatingAction
  | SetTimelineAction
  | PlayTimelineAction
  | SetWinnerAction;

export type State = {|
  simulating: boolean,
  timeline: ?Timeline,
  play: boolean,
  winner: ?Player,
|};

const initialState: State = {
  simulating: false,
  timeline: null,
  play: false,
  winner: null,
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
    case SET_WINNER:
      return {
        ...state,
        winner: action.payload,
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

const setWinner = (winner: Player): SetWinnerAction => ({
  type: SET_WINNER,
  payload: winner,
});

const playTimeline = (): PlayTimelineAction => ({
  type: SET_PLAY_TIMELINE,
  payload: true,
});

// thunks

const simulate = (updatePlayer: string): ThunkAction<Action, State> => (dispatch) => {
  dispatch(setSimulating(true));

  postSimulate(updatePlayer)
    .then((result) => {
      dispatch(setTimeline(result.timeline));
      dispatch(setWinner(result.winner));
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
const getWinner = (state: RootState): ?Player => getState(state).winner;

export default reducer;
export {
  // actions
  simulate,
  playTimeline,

  // selectors
  getSimulating,
  getTimeline,
  getTimelinePlay,
  getWinner,
};
