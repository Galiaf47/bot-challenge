// @flow

import Victor from 'victor';

export type DynamicEntity = {|
  pos: Victor,
  dir: Victor,
  velocity: number,
  size: number,
|};

export type Cell = {
  id: number,
  parentId: number,
  charge: number,
  split: number,
  ...DynamicEntity
};

export type Player = {
  id: number,
  cells: Cell[],
  split: boolean,
  color: string,
};

export type Snack = {
  id: number,
  pos: Victor,
};

export type Game = {|
  players: Player[],
  snacks: Snack[],
|};

export type GameState = Game;

export type UpdatePlayerFunction = (Player, enemies: Player[], snacks: Snack[]) => Player;
