// @flow

import Victor from 'victor';

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

export type Cell = {
  id: Id,
  parentId: Id,
  pos: Victor,
  dir: Victor,
  velocity: number,
  size: number,
  charge: number,
  split: number,
};

export type Player = {
  id: Id,
  cells: Cell[],
  split: boolean,
};

export type Snack = {
  id: Id,
  pos: Victor,
};

export type Game = {|
  players: Player[],
  snacks: Snack[],
|};

export type GameState = Game;

export type UpdatePlayerFunction = (player: Player, enemies: Cell[]) => Player;
