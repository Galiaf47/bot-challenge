// @flow

import Vector from 'victor';

import type {Id} from './types';
import {getId} from './utils';

class Cell {
  id: Id = getId();

  playerId: Id;

  pos: Vector;

  dir: Vector = new Vector(1, 0);

  velocity: number = 0;

  mass: number = 500;

  charge: number = 0;

  split: number = 0;

  constructor(playerId: Id, pos: Vector) {
    this.playerId = playerId;
    this.pos = pos;
  }

  get size() {
    return Math.sqrt(this.mass / Math.PI);
  }
}

export default Cell;
