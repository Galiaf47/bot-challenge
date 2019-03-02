// @flow

import Victor from 'victor';

export type DynamicEntity = {|
  id: number,
  parentId: number,
  pos: Victor,
  dir: Victor,
  velocity: number,
  size: number,
|};

export type Player = {
  id: number,
  cells: DynamicEntity[],
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
