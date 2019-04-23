/* eslint-disable no-param-reassign */
// @flow

import _ from 'lodash';

import type {
  UpdatePlayerFunction, Timeline, Id,
  BotCell,
} from './types';
import settings from '../settings';
import GameState from './GameState';
import Cell from './Cell';
import Player from './Player';
import Snack from './Snack';

const FPS = settings.fps;
const TIME = settings.roundTime;
const CICLES = FPS * TIME;

type InitialPlayer = {
  id: Id,
}

const getInitialGameState = (
  players: InitialPlayer[], snacksCount: number,
): GameState => new GameState(players, snacksCount);

function checkCollision(currentCell: Cell, targetCell: Cell): boolean {
  return currentCell.pos.distance(targetCell.pos) <= Math.max(currentCell.size, targetCell.size);
}

export const getMergedCells = (cells: Cell[]): Cell[] => cells.reduce((result, cell: Cell) => {
  _.forEach(cells, (target) => {
    if (cell.id === target.id || !cell.mass) {
      return;
    }

    if (
      checkCollision(cell, target)
      && cell.mass > target.mass
    ) {
      /* eslint-disable no-param-reassign */
      // cell.mass += target.mass;
      // target.mass = 0;
      /* eslint-enable no-param-reassign */
    }
  });

  cell.mass && result.push(cell);

  return result;
}, []);

// const cellsToPlayers = (players: Player[], cells: Cell[]) => {
//   const playersMap = _.keyBy(players, 'id');

//   _(cells)
//     .groupBy('playerId')
//     .forEach((cellsGroup, id) => {
//       const player = playersMap[id];
//       player.cells = cellsGroup;
//     });
// };

function mergeCells(players: Player[], snacks: Snack[]) {
  const allCells = _(players).map('cells').flatten().value();
  allCells.forEach(cell => cell.feedSnacks(snacks));
  // const mergedCells = getMergedCells(allCells);

  // cellsToPlayers(players, mergedCells);
}

const getEnemies = (players: Player[], player: Player): BotCell[] => _(players)
  .without(player)
  .map('cells')
  .flatten()
  .map(cell => cell.toBotParam())
  .value();

function update(gameState: GameState, bots: {[Id]: UpdatePlayerFunction}): GameState {
  // TODO: try-catch for playerFuncion
  try {
    const snacks = gameState.snacks.filter(snack => !snack.eaten);
    const botSnacks = snacks.map(snack => snack.toBotParam());
    gameState.players.forEach((player) => {
      const botFn = bots[player.id];
      const enemies = getEnemies(gameState.players, player);
      const updateAction = botFn(player.toBotParam(), enemies, botSnacks);
      player.update(updateAction);
    });
    // eslint-disable-next-line no-param-reassign
    mergeCells(gameState.players, snacks);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Update game', e);
  }

  return gameState;
}

function simulate(bots: {[number]: UpdatePlayerFunction}): Timeline {
  const players = _.map(bots, (fn, id) => ({id: _.toNumber(id)}));
  let lastState: GameState = getInitialGameState(players, 100);
  let cicle: number = 1;
  const timeline: Timeline = [lastState.toTimeline()];

  while (cicle < CICLES && _.size(lastState.players) > 1) {
    lastState = update(lastState, bots);
    cicle += 1;
    timeline.push(lastState.toTimeline());
  }

  return timeline;
}

// TODO: try-catch
/* eslint-disable no-new-func */
// $FlowFixMe
const compile = (value: string) => Function(`"use strict";return (${value})`)();
/* eslint-enable no-new-func */

export {
  update,
  simulate,
  compile,
  getInitialGameState,
};
