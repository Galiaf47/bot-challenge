// @flow

import _ from 'lodash';

import Draw, {type DrawOptions} from './Draw';
import type {Timeline} from './game/types';

type Options = DrawOptions & {
  timeline: Timeline;
};

class DrawGame extends Draw {
  timeline: Timeline;

  step: number;

  constructor({timeline, ...options}: Options) {
    super(options);
    this.initState(timeline);
  }

  initState(timeline: Timeline) {
    this.timeline = timeline;
    this.step = 0;
    this.initGraphicObjects(this.timeline[0]);
  }

  loop() {
    this.step += 1;
    if (this.step >= _.size(this.timeline) - 1) {
      this.stop();
    }

    this.update(this.timeline[this.step]);
  }
}

export default DrawGame;
