// @flow

import Vector from 'victor';

import {getId} from './utils';
import type {Id, TimelineSnack} from './types';

class Snack {
  id: Id = getId();

  pos: Vector;

  constructor(pos: Vector) {
    this.pos = pos;
  }

  toTimeline(): TimelineSnack {
    return {
      x: Math.round(this.pos.x),
      y: Math.round(this.pos.y),
    };
  }
}

export default Snack;
