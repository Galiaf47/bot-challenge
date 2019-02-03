// @flow

import axios from 'axios';

import type {Timeline, Player} from './types';

const SERVER_URL = 'http://localhost:3001';

axios.defaults.baseURL = SERVER_URL;

const SIMULATE_URL = '/simulate';
const getSimulationUrl = id => `${SIMULATE_URL}/${id}`;

const postSimulate = (playerFunction: string): Promise<{timeline: Timeline, winner: Player}> => (
  axios.post(SIMULATE_URL, playerFunction, {
    headers: {
      'Content-Type': 'text/plain',
    },
  }).then(res => res.data)
);

const getSimulation = (id: number): Promise<{timeline: Timeline, winner: Player}> => (
  axios.get(getSimulationUrl(id))
    .then(res => res.data)
);

export {
  postSimulate,
  getSimulation,
};
