// @flow

import Vector from 'victor';

import {getId} from './utils';
import type {Id} from './types';

class Snack {
  id: Id = getId();

  pos: Vector;

  constructor(pos: Vector) {
    this.pos = pos;
  }
}

export default Snack;
