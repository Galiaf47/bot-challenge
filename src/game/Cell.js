// @flow

import Vector from 'victor';

import type {
  Id, TimelineCell, CellAction,
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

  update({dir, velocity}: CellAction) {
    // TODO: if mass big enough there will be no velocity
    this.velocity = restrictMaxVelocity(velocity - (this.mass * 0.0001)) * settings.ballFriction;
    const pos = this.pos.clone().add(dir.clone().multiplyScalar(this.velocity));

    this.pos = restrictEdges(pos, this.size);
    this.charge = this.charge ? this.charge - 1 : 0;
    this.split = this.split ? this.split - 1 : 0;
  }

  splitCell() {
    const oldMass = this.mass;
    this.mass = Math.round(oldMass / 2);
    this.velocity = 0;
    this.split = 500;

    const newCell = new Cell(this.playerId, this.pos);
    newCell.mass = oldMass - this.mass;
    newCell.velocity = 20;
    newCell.charge = 50;
    newCell.split = 500;

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
}

export default Cell;
