// @flow

import Vector from 'victor';
import _ from 'lodash';

import type {
  TimelineItem,
  Timeline,
} from 'data/types';
import type {
  GameState,
  Player,
  DynamicEntity,
  Cell,
  UpdatePlayerFunction,
} from './types';
import settings from './settings';

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

const getInitialGameState = (cellsCount: number, snacksCount: number): GameState => ({
  players: _.times(cellsCount, () => {
    const id = getId();

    return {
      id,
      color: `#${Math.round(Math.random() * 250).toString(16)}${Math.round(Math.random() * 256).toString(16)}${Math.round(Math.random() * 256).toString(16)}`,
      cells: [{
        id: getId(),
        parentId: id,
        pos: getRandomPosition(),
        dir: new Vector(1, 0),
        velocity: 0,
        size: Math.round(Math.random() * 16) + 16,
        charge: 0,
        split: 0,
      }],
      split: false,
    };
  }),
  snacks: _.times(snacksCount, () => ({
    id: getId(),
    pos: getRandomPosition(),
  })),
});

const initialGameState: GameState = getInitialGameState(10, 100);

function checkCollision(currentCell: Cell, targetCell: Cell): boolean {
  if (currentCell.parentId === targetCell.parentId && (currentCell.split || targetCell.split)) {
    return false;
  }

  return currentCell.pos.distance(targetCell.pos) <= Math.max(currentCell.size, targetCell.size);
}

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

function getCollidedCells(targetCell: Cell, cells: Cell[]): Cell[] {
  return _.filter<Cell>(cells, (cell: Cell) => (cell.id !== targetCell.id
    && checkCollision(cell, targetCell)
  ));
}

function mergeCells(players: Player[]): Player[] {
  const allCells = _(players).map('cells').flatten().value();
  const playersMap = _.keyBy(players, 'id');

  const mergedCells = allCells.reduce((result, cell: Cell) => {
    const collidedCells: Cell[] = _.sortBy(getCollidedCells(cell, allCells), 'size');

    if (_.isEmpty(collidedCells)) {
      result.push(cell);
    } else if (_.last(collidedCells).size < cell.size) {
      result.push({
        ...cell,
        size: cell.size + _.sumBy(collidedCells, 'size'),
      });
    }

    return result;
  }, []);

  return _(mergedCells)
    .groupBy('parentId')
    .map((cells, id) => ({
      ...playersMap[id],
      cells,
    }))
    .value();
}

const getEnemies = (players: Player[], player: Player): DynamicEntity[] => _(players)
  .without(player)
  .map('cells')
  .flatten()
  .value();

function update(gameState: GameState, playerFunction: Function): GameState {
  // TODO: try-catch for playerFuncion
  try {
    const updatedPlayers: Player[] = gameState.players.map(player => (
      applyFunctionResult(playerFunction(player, getEnemies(gameState.players, player)))
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
      pos: cell.pos.toObject(),
      dir: cell.dir.angle(),
      size: cell.size,
      color: player.color,
    })),
  })),
  snacks: _.map(state.snacks, snack => ({
    id: snack.id,
    pos: snack.pos.toObject(),
  })),
});

function simulate(updatePlayer: UpdatePlayerFunction): Promise<Timeline> {
  return new Promise<Timeline>((resolve, reject) => {
    let lastState: GameState = getInitialGameState(40, 0);
    let cicle: number = 1;
    const timeline: Timeline = [stateToTimelineItem(lastState)];

    try {
      (function runCicle(): void {
        const end = Math.min(cicle + settings.simulationChunkSize, CICLES);

        while (cicle < end && _.size(lastState.players) > 1) {
          lastState = update(lastState, updatePlayer);
          cicle += 1;
          timeline.push(stateToTimelineItem(lastState));
        }

        if (cicle < CICLES && _.size(lastState.players) > 1) {
          setTimeout(runCicle, 0);
        } else {
          resolve(timeline);
        }
      }());
    } catch (e) {
      reject(e);
    }
  });
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
  initialGameState,
  getInitialGameState,
};
