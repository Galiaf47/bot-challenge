// @flow

import Vector from 'victor';
import _ from 'lodash';

import {getMergedCells} from './index';
import Cell from './Cell';

let id = 0;

const getId = () => {
  id += 1;
  return id;
};

const createCell = (parentId = 1, size = 2): Cell => {
  const newCell = new Cell(parentId, new Vector(2, 2));
  newCell.mass = size;
  newCell.id = getId();
  return newCell;
};

test('Cells merged', () => {
  const cells = [
    createCell(1, 3),
    createCell(1, 3),
    createCell(2, 5),
    createCell(3, 3),
    createCell(4, 4),
  ];
  const mergedCells = getMergedCells(cells);

  expect(mergedCells.length).toBe(1);
  expect(_.sumBy(mergedCells, 'size')).toBe(_.sumBy(cells, 'size'));
});

test('Same size cells not merged', () => {
  const cells = [
    createCell(1),
    createCell(2),
    createCell(3),
    createCell(4),
    createCell(5),
  ];
  const mergedCells = getMergedCells(cells);

  expect(mergedCells.length).toBe(5);
  expect(mergedCells[0].mass).toBe(2);
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
  expect(mergedCells[0].mass).toBe(10);
});
