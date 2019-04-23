// @flow

import Vector from 'victor';

import {getId} from './utils';
import type {Id, TimelineSnack, BotSnack} from './types';

class Snack {
  id: Id = getId();

  pos: Vector;

  eaten = false;

  constructor(pos: Vector) {
    this.pos = pos;
  }

  markAsEaten() {
    this.eaten = true;
  }

  toTimeline(): TimelineSnack {
    return {
      id: this.id,
      x: Math.round(this.pos.x),
      y: Math.round(this.pos.y),
    };
  }

  toBotParam(): BotSnack {
    return {
      x: this.pos.x,
      y: this.pos.y,
    };
  }
}

export default Snack;
