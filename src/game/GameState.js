// @flow

import _ from 'lodash';

import type {Id} from './types';
import {getRandomPosition} from './utils';
import Player from './Player';
import Snack from './Snack';

class GameState {
  players: Player[] = [];

  snacks: Snack[] = [];

  constructor(initialPlayers: {id: Id}[], snacksCount: number) {
    this.players = _.map(initialPlayers, player => new Player(player.id, getRandomPosition()));
    this.snacks = _.times(snacksCount, () => new Snack(getRandomPosition()));
  }
}

export default GameState;
