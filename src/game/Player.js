// @flow

import Vector from 'victor';

import type {Id, TimelinePlayer} from './types';
import Cell from './Cell';

class Player {
  id: Id;

  split: boolean = false;

  cells: Cell[] = [];

  constructor(id: Id, pos: Vector) {
    this.id = id;
    this.cells = [new Cell(id, pos)];
  }

  toTimeline(): TimelinePlayer {
    return {
      id: this.id,
      cells: this.cells.map(cell => cell.toTimeline()),
    };
  }
}

export default Player;
