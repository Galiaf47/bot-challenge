// @flow

import Vector from 'victor';

import settings from '../settings';

export const getRandomPosition = (): Vector => (
  new Vector(Math.round(Math.random() * settings.fieldSize),
    Math.round(Math.random() * settings.fieldSize))
);

let idCounter = 0;
export const getId = (): number => {
  idCounter += 1;
  return idCounter;
};
