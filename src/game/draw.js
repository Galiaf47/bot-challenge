// @flow

import {
  Application, Graphics,
  TilingSprite, Loader,
} from 'pixi.js';
import _ from 'lodash';

import type {Timeline, TimelineItem, TimelineCell} from 'data/types';
import settings from './settings';

import background from './paper.jpg';

const MAX_ZOOM = settings.windowSize / settings.fieldSize;

type CanvasCell = Graphics;

function createCell(cell) {
  const circle = new Graphics();
  circle.beginFill(parseInt(cell.color.replace(/^#/, ''), 16));
  circle.drawCircle(0, 0, 1);
  circle.endFill();
  circle.x = cell.pos.x;
  circle.y = cell.pos.y;
  circle.scale.set(cell.size);
  circle.id = cell.id;

  return circle;
}

class Draw {
  app: Application;

  play: boolean = false;

  timeline: Timeline = [];

  step: number = 0;

  cells: {[string]: CanvasCell} = {};

  followId: ?string;

  onReady: () => void;

  onUpdate: (step: number) => void;

  constructor(id: string, onReady: () => void) {
    this.initCanvas(id);
    this.onReady = onReady;
  }

  initCanvas(id: string) {
    this.app = new Application({
      view: document.getElementById(id),
      width: settings.windowSize,
      height: settings.windowSize,
      antialias: true,
      autoStart: false,
    });

    Loader.shared
      .add(background)
      .load(this.setup);
  }

  setup = (loader: any, resources: {[string]: any}) => {
    const {texture} = resources[background];
    const tilingSprite = new TilingSprite(texture, settings.fieldSize, settings.fieldSize);
    this.app.stage.addChild(tilingSprite);
    this.app.render();

    this.onReady();
  }

  clearScene() {
    this.app.stage.removeChildren();
  }

  setTimeline(timeline: Timeline) {
    !_.isEmpty(this.cells) && this.clearScene();

    this.timeline = timeline;
    this.step = 0;

    this.cells = _(timeline[0].players)
      .map('cells')
      .flatten()
      .map(cell => createCell(cell))
      .keyBy('id')
      .value();
    this.app.stage.addChild(..._.values(this.cells));
  }

  loop() {
    // TODO: possible double loop because of start()
    this.play && requestAnimationFrame(() => {
      this.step += 1;
      if (this.step >= _.size(this.timeline) - 1) {
        this.stop();
      }

      this.update(this.timeline[this.step]);
      this.loop();
    });
  }

  start() {
    this.play = true;
    this.loop();
  }

  stop() {
    this.play = false;
  }

  setFollow(id: ?string) {
    this.followId = id;
  }

  update(item: TimelineItem) {
    const deadPlayers = [];
    const alivePlayers = [];
    const timelinePlayersById = _.keyBy(item.players, 'id');
    const gameCells = _(item.players)
      .map('cells')
      .flatten()
      .keyBy('id')
      .value();
    const newCellsIds = _.difference(_.keys(gameCells), _.keys(this.cells));
    const newCells = _.map(newCellsIds, id => createCell(gameCells[id]));
    _.isEmpty(newCells) || this.app.stage.addChild(...newCells);

    this.cells = {
      ...this.cells,
      ..._.keyBy(newCells, 'id'),
    };

    _.forEach(this.cells, (canvasCell) => {
      const gameCell = gameCells[canvasCell.id];

      if (gameCell) {
        /* eslint-disable no-param-reassign */
        canvasCell.x = gameCell.pos.x;
        canvasCell.y = gameCell.pos.y;
        /* eslint-enable no-param-reassign */
        canvasCell.scale.set(gameCell.size);

        alivePlayers.push(canvasCell.id);
      } else {
        deadPlayers.push(canvasCell.id);
      }
    });

    this.app.stage.removeChild(..._(this.cells).pick(deadPlayers).values().value());
    this.cells = _.pick(this.cells, alivePlayers);

    if (this.followId && timelinePlayersById[this.followId]) {
      this.viewportTo(timelinePlayersById[this.followId].cells[0]);
    } else {
      this.viewportTo(null);
    }

    this.app.render();
    this.onUpdate && (this.step % settings.fps === 0) && this.onUpdate(this.step);
  }

  viewportTo(cell: ?TimelineCell) {
    if (cell) {
      const scale = Math.max(settings.windowSize / (cell.size * 2 * 20), MAX_ZOOM);

      this.app.stage.scale.set(scale);
      this.app.stage.x = -cell.pos.x * scale + settings.windowSize / 2;
      this.app.stage.y = -cell.pos.y * scale + settings.windowSize / 2;
    } else {
      this.app.stage.scale.set(MAX_ZOOM);
      this.app.stage.x = 0;
      this.app.stage.y = 0;
    }
  }
}

export default Draw;
