// @flow

import Victor from 'victor';

export type DynamicEntity = {|
  pos: Victor,
  dir: Victor,
  velocity: number,
|}

export type Player = DynamicEntity;

export type Ball = DynamicEntity;

export type Game = {|
  ball: Ball,
  player: Player,
|};
