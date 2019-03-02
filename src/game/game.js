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
  UpdatePlayerFunction,
} from './types';
import settings from './settings';

const FPS = settings.fps;
const TIME = settings.roundTime;
const CICLES = FPS * TIME;

const getRandomPosition = () => (
  new Vector(Math.round(Math.random() * settings.fieldSize),
    Math.round(Math.random() * settings.fieldSize))
);

const getInitialGameState = (cellsCount: number, snacksCount: number): GameState => ({
  players: _.times(cellsCount, id => ({
    id,
    pos: getRandomPosition(),
    dir: new Vector(1, 0),
    velocity: 0,
    size: Math.round(Math.random() * 16) + 16,
  })),
  snacks: _.times(snacksCount, id => ({
    id,
    pos: getRandomPosition(),
  })),
});

const initialGameState: GameState = getInitialGameState(10, 100);

function checkCollision(currentCell, targetCell) {
  return currentCell.pos.distance(targetCell.pos) <= Math.max(currentCell.size, targetCell.size);
}

function restrictEdges(pos, size) {
  return new Vector(
    Math.max(Math.min(pos.x, settings.fieldSize - size), size),
    Math.max(Math.min(pos.y, settings.fieldSize - size), size),
  );
}

function move(obj: Player) {
  const {dir} = obj;
  const velocity = obj.velocity - (obj.size * 0.01);
  const pos = obj.pos.clone().add(dir.clone().multiplyScalar(velocity));

  return {
    ...obj,
    pos: restrictEdges(pos, obj.size),
    velocity: velocity * settings.ballFriction,
  };
}

function getCollidedCells(targetCell: Player, cells: Player[]): Player[] {
  return _.filter<Player>(cells, (cell: Player) => (cell.id !== targetCell.id
    && checkCollision(cell, targetCell)
  ));
}

function mergeCells(cells: Player[]) {
  return cells.reduce((result, cell) => {
    const collidedCells: Player[] = _.sortBy(getCollidedCells(cell, cells), 'size');

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
}

function update(gameState: GameState, playerFunction: Function): GameState {
  // TODO: try-catch for playerFuncion
  try {
    const players = mergeCells(gameState.players.map(player => (
      move(playerFunction(player, _.without(gameState.players, player)))
    )));

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
    pos: player.pos.toObject(),
    dir: player.dir.angle(),
    size: player.size,
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
