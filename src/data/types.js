// @flow

type Cell = {
  pos: {
    x: number,
    y: number,
  },
  dir: number,
  size: number,
};

export type Player = {
  id: number,
  cells: Cell[],
};

export type TimelineItem = {
  players: Player[],
  snacks: Array<{
    id: number,
    pos: {
      x: number,
      y: number,
    }
  }>,
};

export type Timeline = TimelineItem[];
