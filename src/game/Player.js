// @flow

import Vector from 'victor';

import type {Id} from './types';
import Cell from './Cell';

class Player {
  id: Id;

  split: boolean = false;

  cells: Cell[] = [];

  constructor(id: Id, pos: Vector) {
    this.id = id;
    this.cells = [new Cell(id, pos)];
  }
}

export default Player;
