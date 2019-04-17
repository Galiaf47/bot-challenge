// @flow

import _ from 'lodash';

import type {Id, TimelineItem} from './types';
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

  toTimeline(): TimelineItem {
    return {
      players: this.players.map(player => player.toTimeline()),
      snacks: this.snacks.map(snack => snack.toTimeline()),
    };
  }
}

export default GameState;
