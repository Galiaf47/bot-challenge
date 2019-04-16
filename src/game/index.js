/* eslint-disable no-param-reassign */
// @flow

import Vector from 'victor';
import _ from 'lodash';

import type {
  UpdatePlayerFunction, TimelineItem, Timeline, Id,
} from './types';
import settings from '../settings';
import GameState from './GameState';
import Cell from './Cell';
import Player from './Player';
import {getId} from './utils';

const FPS = settings.fps;
const TIME = settings.roundTime;
const CICLES = FPS * TIME;

type InitialPlayer = {
  id: Id,
}

const getInitialGameState = (
  players: InitialPlayer[], snacksCount: number,
): GameState => new GameState(players, snacksCount);

function restrictEdges(pos, size) {
  return new Vector(
    Math.max(Math.min(pos.x, settings.fieldSize - size), size),
    Math.max(Math.min(pos.y, settings.fieldSize - size), size),
  );
}

// TODO: /2 => round - diff to avoid mass loss
const splitCells = (cells: Cell[]): Cell[] => _(cells).map(cell => [
  {
    ...cell,
    size: cell.size / 2,
    velocity: 0,
    split: 500,
  },
  {
    ...cell,
    id: getId(),
    size: cell.size / 2,
    velocity: 20,
    charge: 50,
    split: 500,
  },
]).flatten().value();

const canSplit = (split, cells) => (split
  && _.size(cells) < 4
  && _(cells)
    .filter(cell => cell.size > 32 && !cell.charge)
    .size() === _.size(cells)
);

function applyFunctionResult(player: Player): Player {
  const {cells, split} = player;
  const newCells = canSplit(split, cells) ? splitCells(cells) : cells;

  player.cells = _.map(newCells, (obj) => {
    const {dir} = obj;
    // TODO: if mass big enough there will be no velocity
    const velocity = obj.velocity - (obj.mass * 0.0001);
    const pos = obj.pos.clone().add(dir.clone().multiplyScalar(velocity));

    obj.pos = restrictEdges(pos, obj.size);
    obj.velocity = velocity * settings.ballFriction;
    obj.charge = obj.charge ? obj.charge - 1 : 0;
    obj.split = obj.split ? obj.split - 1 : 0;

    return obj;
  });
  player.split = false;

  return player;
}

function checkCollision(currentCell: Cell, targetCell: Cell): boolean {
  return currentCell.pos.distance(targetCell.pos) <= Math.max(currentCell.size, targetCell.size);
}

function isMergeableSibling(current: Cell, target: Cell): boolean {
  return current.playerId === target.playerId && !current.split && !target.split;
}

export const getMergedCells = (cells: Cell[]): Cell[] => cells.reduce((result, cell: Cell) => {
  _.forEach(cells, (target) => {
    if (cell.id === target.id || !cell.mass) {
      return;
    }

    if (
      checkCollision(cell, target)
      && (
        cell.mass > target.mass
        || isMergeableSibling(cell, target)
      )) {
      /* eslint-disable no-param-reassign */
      cell.mass += target.mass;
      target.mass = 0;
      /* eslint-enable no-param-reassign */
    }
  });

  cell.mass && result.push(cell);

  return result;
}, []);

const cellsToPlayers = (players: Player[], cells: Cell[]) => {
  const playersMap = _.keyBy(players, 'id');

  return _(cells)
    .groupBy('playerId')
    .map((cellsGroup, id) => {
      const player = playersMap[id];
      player.cells = cellsGroup;
      return player;
    })
    .value();
};

function mergeCells(players: Player[]): Player[] {
  const allCells = _(players).map('cells').flatten().value();
  const mergedCells = getMergedCells(allCells);

  return cellsToPlayers(players, mergedCells);
}

const getEnemies = (players: Player[], player: Player): Cell[] => _(players)
  .without(player)
  .map('cells')
  .flatten()
  .value();

function update(gameState: GameState, bots: {[Id]: UpdatePlayerFunction}): GameState {
  // TODO: try-catch for playerFuncion
  try {
    const updatedPlayers: Player[] = gameState.players.map(player => (
      applyFunctionResult(bots[player.id](player, getEnemies(gameState.players, player)))
    ));
    // eslint-disable-next-line no-param-reassign
    gameState.players = mergeCells(updatedPlayers);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Update game', e);
  }

  return gameState;
}

const stateCellToTimelineCell = (cell: Cell) => ({
  id: cell.id,
  playerId: cell.playerId,
  pos: {
    x: Math.round(cell.pos.x),
    y: Math.round(cell.pos.y),
  },
  size: cell.size,
});

const statePlayerToTimelinePlayer = (player: Player) => ({
  id: player.id,
  cells: _.map(player.cells, stateCellToTimelineCell),
});

const stateToTimelineItem = (state: GameState): TimelineItem => ({
  players: _.map(state.players, statePlayerToTimelinePlayer),
  snacks: _.map(state.snacks, snack => ({
    x: Math.round(snack.pos.x),
    y: Math.round(snack.pos.y),
  })),
});

function simulate(bots: {[number]: UpdatePlayerFunction}): Timeline {
  const players = _.map(bots, (fn, id) => ({id: _.toNumber(id)}));
  let lastState: GameState = getInitialGameState(players, 0);
  let cicle: number = 1;
  const timeline: Timeline = [stateToTimelineItem(lastState)];

  while (cicle < CICLES && _.size(lastState.players) > 1) {
    lastState = update(lastState, bots);
    cicle += 1;
    timeline.push(stateToTimelineItem(lastState));
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
  stateToTimelineItem,
};
