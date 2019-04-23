// @flow

import Vector from 'victor';
import _ from 'lodash';

import type {
  Id, TimelinePlayer, BotAction, BotCell,
} from './types';
import Cell from './Cell';
import {checkCollision} from './utils';
import settings from '../settings';

class Player {
  id: Id;

  cells: Cell[] = [];

  split: number = 0;

  charge: number = 0;

  constructor(id: Id, pos: Vector) {
    this.id = id;
    this.cells = [new Cell(id, pos)];
  }

  update({cells, split}: BotAction) {
    this.split = this.split ? this.split - 1 : 0;
    this.charge = this.charge ? this.charge - 1 : 0;

    this.cells.forEach((cell, index) => {
      if (index < cells.length) {
        cell.update(cells[index], !!this.charge);
      }
    });

    split && this.canSplit() && this.splitCells();
    this.canMerge() && this.mergeSplitCells();
  }

  canSplit(): boolean {
    return (
      _.size(this.cells) < settings.maxSplitCells
      && !this.charge
    );
  }

  splitCells(): void {
    const newCells = _(this.cells)
      .map(cell => cell.splitCell())
      .compact()
      .value();

    this.cells.push(...newCells);
    this.split = settings.splitTime;
    this.charge = settings.chargeTime;
  }

  canMerge(): boolean {
    return !this.split && this.cells.length > 1;
  }

  mergeSplitCells() {
    for (let i = 0; i < this.cells.length; i += 1) {
      for (let j = i + 1; j < this.cells.length; j += 1) {
        if (checkCollision(this.cells[i], this.cells[j])) {
          this.cells[i].eatCell(this.cells[j]);
        }
      }
    }

    this.cells = this.cells.filter(cell => !cell.eaten);
  }

  toTimeline(): TimelinePlayer {
    return {
      id: this.id,
      cells: this.cells.map(cell => cell.toTimeline()),
    };
  }

  toBotParam(): BotCell[] {
    return this.cells.map(cell => cell.toBotParam());
  }
}

export default Player;
