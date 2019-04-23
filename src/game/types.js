// @flow

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
  direction: number,
};

export type BotCell = {
  x: number,
  y: number,
  size: number,
  direction: number,
  velocity: number,
};

export type BotSnack = {
  x: number,
  y: number,
};

export type BotAction = {
  cells: CellAction[],
  split: boolean,
};

export type UpdatePlayerFunction = (
  cells: BotCell[],
  enemies: BotCell[],
  snacks: BotSnack[],
) => BotAction;
