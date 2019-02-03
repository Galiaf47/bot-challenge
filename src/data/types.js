// @flow

export type TimelineItem = {
  players: Array<{
    id: number,
    pos: {
      x: number,
      y: number,
    },
    dir: number,
    size: number,
  }>,
  snacks: Array<{
    id: number,
    pos: {
      x: number,
      y: number,
    }
  }>,
};

export type Timeline = TimelineItem[];

export type Player = {
  id: number,
  size: number,
};
