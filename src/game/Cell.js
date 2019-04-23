// @flow

import Vector from 'victor';

import type {
  Id, TimelineCell, CellAction, BotCell,
} from './types';
import {getId} from './utils';
import settings from '../settings';
import Snack from './Snack';

const MAX_VELOCITY = 5;

const restrictMaxVelocity = (velocity: number) => Math.min(velocity, MAX_VELOCITY);

function restrictEdges(pos, size) {
  return new Vector(
    Math.max(Math.min(pos.x, settings.fieldSize - size), size),
    Math.max(Math.min(pos.y, settings.fieldSize - size), size),
  );
}

class Cell {
  id: Id = getId();

  playerId: Id;

  pos: Vector;

  dir: Vector = new Vector(1, 0);

  velocity: number = 0;

  mass: number = settings.initialCellMass;

  eaten: boolean = false;

  constructor(playerId: Id, pos: Vector) {
    this.playerId = playerId;
    this.pos = pos;
  }

  get size() {
    return Math.sqrt(this.mass / Math.PI);
  }

  update({direction, velocity}: CellAction, charge: boolean) {
    if (!charge) {
      this.dir = Vector(0, 1).rotate(direction);
      this.velocity = restrictMaxVelocity(velocity - (this.mass * 0.001));
    }

    const pos = this.pos.clone().add(this.dir.clone().multiplyScalar(this.velocity));
    this.pos = restrictEdges(pos, this.size);
  }

  splitCell() {
    if (this.mass < settings.minSplitMass) {
      return null;
    }

    const oldMass = this.mass;
    this.mass = Math.round(oldMass / 2);

    const newCell = new Cell(this.playerId, this.pos.clone());
    newCell.mass = oldMass - this.mass;
    newCell.velocity = 6;
    newCell.dir = this.dir.clone();

    return newCell;
  }

  feedSnacks(snacks: Snack[]) {
    snacks.forEach((snack) => {
      if (this.isInside(snack.pos) && !snack.eaten) {
        this.eatSnack(snack);
      }
    });
  }

  eatSnack(snack: Snack) {
    this.mass += settings.snackMass;
    snack.markAsEaten();
  }

  eatCell(cell: Cell) {
    this.mass += cell.mass;
    cell.markAsEaten();
  }

  markAsEaten() {
    this.mass = 0;
    this.eaten = true;
  }

  isInside(targetPos: Vector) {
    return this.pos.distance(targetPos) < this.size;
  }

  toTimeline(): TimelineCell {
    return {
      id: this.id,
      playerId: this.playerId,
      pos: {
        x: Math.round(this.pos.x),
        y: Math.round(this.pos.y),
      },
      size: this.size,
    };
  }

  toBotParam(): BotCell {
    return {
      x: this.pos.x,
      y: this.pos.y,
      size: this.size,
      direction: this.dir.angle(),
      velocity: this.velocity,
    };
  }
}

export default Cell;
