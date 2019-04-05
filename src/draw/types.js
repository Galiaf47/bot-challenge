// @flow

export type TimelineCell = {
  pos: {
    x: number,
    y: number,
  },
  dir: number,
  size: number,
};

export type Player = {
  id: number,
  cells: TimelineCell[],
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
