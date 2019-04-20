// @flow

import Vector from 'victor';
import _ from 'lodash';

import type {Id, TimelinePlayer, CellAction} from './types';
import Cell from './Cell';

class Player {
  id: Id;

  cells: Cell[] = [];

  constructor(id: Id, pos: Vector) {
    this.id = id;
    this.cells = [new Cell(id, pos)];
  }

  update({cells, split}: {+cells: CellAction[], +split: boolean}) {
    const cellsActionsMap = _.keyBy(cells, 'id');
    this.cells.forEach(cell => cell.update(cellsActionsMap[cell.id]));
    this.canSplit(split) && this.splitCells();
  }

  canSplit(split: boolean) {
    return (
      split
      && _.size(this.cells) < 4
      && _(this.cells)
        .filter(cell => cell.size > 32 && !cell.charge)
        .size() === _.size(this.cells)
    );
  }

  splitCells() {
    const newCells = this.cells.map(cell => cell.splitCell());
    this.cells.push(...newCells);
  }

  toTimeline(): TimelinePlayer {
    return {
      id: this.id,
      cells: this.cells.map(cell => cell.toTimeline()),
    };
  }
}

export default Player;
