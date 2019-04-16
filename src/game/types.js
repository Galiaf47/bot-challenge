// @flow

import Player from './Player';
import Cell from './Cell';

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
  x: number,
  y: number,
};

export type TimelineItem = {
  players: TimelinePlayer[],
  snacks: TimelineSnack[],
};

export type Timeline = TimelineItem[];

export type UpdatePlayerFunction = (player: Player, enemies: Cell[]) => Player;
