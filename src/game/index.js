// @flow

import Vector from 'victor';
import _ from 'lodash';

import type {
  GameState, Player, Cell, UpdatePlayerFunction, TimelineItem, Timeline, Id,
} from './types';
import settings from '../settings';

const FPS = settings.fps;
const TIME = settings.roundTime;
const CICLES = FPS * TIME;

let idCounter = 0;
const getId = (): number => {
  idCounter += 1;
  return idCounter;
};

const getRandomPosition = () => (
  new Vector(Math.round(Math.random() * settings.fieldSize),
    Math.round(Math.random() * settings.fieldSize))
);

type InitialPlayer = {
  id: Id,
}

const getInitialGameState = (players: InitialPlayer[], snacksCount: number): GameState => ({
  players: _.map(players, player => ({
    id: player.id,
    cells: [{
      id: getId(),
      parentId: player.id,
      pos: getRandomPosition(),
      dir: new Vector(1, 0),
      velocity: 0,
      size: Math.round(Math.random() * 16) + 16,
      charge: 0,
      split: 0,
    }],
    split: false,
  })),
  snacks: _.times(snacksCount, () => ({
    id: getId(),
    pos: getRandomPosition(),
  })),
});

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

  return {
    ...player,
    cells: _.map(newCells, (obj) => {
      const {dir} = obj;
      const velocity = obj.velocity - (obj.size * 0.01);
      const pos = obj.pos.clone().add(dir.clone().multiplyScalar(velocity));

      return ({
        ...obj,
        pos: restrictEdges(pos, obj.size),
        velocity: velocity * settings.ballFriction,
        charge: obj.charge ? obj.charge - 1 : 0,
        split: obj.split ? obj.split - 1 : 0,
      });
    }),
    split: false,
  };
}

function checkCollision(currentCell: Cell, targetCell: Cell): boolean {
  return currentCell.pos.distance(targetCell.pos) <= Math.max(currentCell.size, targetCell.size);
}

function isMergeableSibling(current: Cell, target: Cell): boolean {
  return current.parentId === target.parentId && !current.split && !target.split;
}

export const getMergedCells = (cells: Cell[]): Cell[] => cells.reduce((result, cell: Cell) => {
  _.forEach(cells, (target) => {
    if (cell.id === target.id || !cell.size) {
      return;
    }

    if (
      checkCollision(cell, target)
      && (
        cell.size > target.size
        || isMergeableSibling(cell, target)
      )) {
      /* eslint-disable no-param-reassign */
      cell.size += target.size;
      target.size = 0;
      /* eslint-enable no-param-reassign */
    }
  });

  cell.size && result.push(cell);

  return result;
}, []);

const cellsToPlayers = (players: Player[], cells: Cell[]) => {
  const playersMap = _.keyBy(players, 'id');

  return _(cells)
    .groupBy('parentId')
    .map((cellsGroup, id) => ({
      ...playersMap[id],
      cells: cellsGroup,
    }))
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
    const players = mergeCells(updatedPlayers);

    return {
      ...gameState,
      players,
    };
  } catch (e) {
    return gameState;
  }
}

const stateToTimelineItem = (state: GameState): TimelineItem => ({
  players: _.map(state.players, player => ({
    id: player.id,
    cells: _.map(player.cells, cell => ({
      id: cell.id,
      playerId: player.id,
      pos: {
        x: Math.round(cell.pos.x),
        y: Math.round(cell.pos.y),
      },
      size: cell.size,
    })),
  })),
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
