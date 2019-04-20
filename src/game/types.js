// @flow

import Vector from 'victor';

import Player from './Player';
import Cell from './Cell';
import Snack from './Snack';

export type Id = number;

export type TimelineCell = {
  id: Id,
  playerId: Id,
  pos: {
    x: number,
    y: number,
  },
  size: number,
};

export type TimelinePlayer = {
  id: Id,
  cells: TimelineCell[],
};

export type TimelineSnack = {
  id: Id,
  x: number,
  y: number,
};

export type TimelineItem = {
  players: TimelinePlayer[],
  snacks: TimelineSnack[],
};

export type Timeline = TimelineItem[];

export type CellAction = {
  velocity: number,
  dir: Vector,
};

export type BotAction = {
  cells: CellAction[],
  split: boolean,
};

export type UpdatePlayerFunction = (player: Player, enemies: Cell[], snacks: Snack[]) => BotAction;
