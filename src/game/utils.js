// @flow

import Vector from 'victor';

import settings from '../settings';
import Cell from './Cell';

export const getRandomPosition = (): Vector => (
  new Vector(Math.round(Math.random() * settings.fieldSize),
    Math.round(Math.random() * settings.fieldSize))
);

let idCounter = 0;
export const getId = (): number => {
  idCounter += 1;
  return idCounter;
};

export const checkCollision = (c1: Cell, c2: Cell): boolean => (
  c1.pos.distance(c2.pos) <= Math.max(c1.size, c2.size)
);
