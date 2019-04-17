// @flow

import Vector from 'victor';
import _ from 'lodash';

import type {Id, TimelinePlayer, CellAction} from './types';
import Cell from './Cell';
import {getId} from './utils';

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
    this.cells = canSplit(split, this.cells) ? splitCells(this.cells) : this.cells;
  }

  toTimeline(): TimelinePlayer {
    return {
      id: this.id,
      cells: this.cells.map(cell => cell.toTimeline()),
    };
  }
}

export default Player;
