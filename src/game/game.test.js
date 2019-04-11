// @flow

import Vector from 'victor';
import _ from 'lodash';

import {getMergedCells} from './index';
import {type Cell} from './types';

let id = 0;

const getId = () => {
  id += 1;
  return id;
};

const createCell = (cell?: {}): Cell => ({
  id: getId(),
  pos: new Vector(2, 2),
  dir: new Vector(1, 0),
  velocity: 0,
  size: 2,
  parentId: 1,
  charge: 0,
  split: 0,
  ...cell,
});

test('Cells merged', () => {
  const cells = [
    createCell({parentId: 1, size: 3}),
    createCell({parentId: 1, size: 3}),
    createCell({parentId: 2, size: 5}),
    createCell({parentId: 3, size: 3}),
    createCell({parentId: 4, size: 4}),
  ];
  const mergedCells = getMergedCells(cells);

  expect(mergedCells.length).toBe(1);
  expect(_.sumBy(mergedCells, 'size')).toBe(_.sumBy(cells, 'size'));
});

test('Same size cells not merged', () => {
  const cells = [
    createCell({parentId: 1}),
    createCell({parentId: 2}),
    createCell({parentId: 3}),
    createCell({parentId: 4}),
    createCell({parentId: 5}),
  ];
  const mergedCells = getMergedCells(cells);

  expect(mergedCells.length).toBe(5);
  expect(mergedCells[0].size).toBe(2);
});

test('Same size cells merged', () => {
  const cells = [
    createCell(),
    createCell(),
    createCell(),
    createCell(),
    createCell(),
  ];
  const mergedCells = getMergedCells(cells);

  expect(mergedCells.length).toBe(1);
  expect(mergedCells[0].size).toBe(10);
});
