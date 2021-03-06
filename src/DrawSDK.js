// @flow

import _ from 'lodash';

import Draw, {type DrawOptions} from './Draw';
import {getInitialGameState, update} from './game';
import type {Id, UpdatePlayerFunction} from './game/types';
import GameState from './game/GameState';

type Options = DrawOptions & {
  playersCount: number;
  playerBot: UpdatePlayerFunction,
  enemyBot: UpdatePlayerFunction,
};

class DrawSDK extends Draw {
  bots: {[Id]: UpdatePlayerFunction};

  gameState: GameState;

  constructor({
    playersCount, playerBot, enemyBot, ...options
  }: Options) {
    super({
      ...options,
      players: _.times(playersCount, index => ({
        id: index,
        color: index === 0 ? '#009900' : '#990000',
      })),
    });

    this.initBots(playerBot, enemyBot);
    this.initState();
  }

  initBots(playerBot: UpdatePlayerFunction, enemyBot: UpdatePlayerFunction) {
    this.bots = _.mapValues(this.players, player => (player.id === 0 ? playerBot : enemyBot));
  }

  initState() {
    this.gameState = getInitialGameState(_.values(this.players), 100);
    this.initGraphicObjects(this.gameState.toTimeline());
    this.setFollow(0);
  }

  loop() {
    this.gameState = update(this.gameState, this.bots);
    this.update(this.gameState.toTimeline());
  }

  applyBot(id: Id, func: UpdatePlayerFunction) {
    this.bots[id] = func;
  }

  reset() {
    this.stop();
    this.clearScene();
    this.initState();
  }
}

export default DrawSDK;
