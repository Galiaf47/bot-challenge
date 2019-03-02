// @flow

import {fabric} from 'fabric';
import _ from 'lodash';

import type {Timeline, TimelineItem} from 'data/types';
import settings from './settings';

const MAX_ZOOM = settings.windowSize / settings.fieldSize;
const MIN_ZOOM = 1;

const BACKGROUND_CENTER = '#fff';
const BACKGROUND_EDGE = '#000';

type CanvasCell = fabric.Circle;

class Draw {
  canvas: fabric.Canvas;

  play: boolean = false;

  timeline: Timeline = [];

  step: number = 0;

  players: CanvasCell[] = [];

  constructor(id: string) {
    this.initCanvas(id);
    this.drawBorder();
    this.setZoomEvents();
  }

  initCanvas(id: string) {
    this.canvas = new fabric.Canvas(id);
    this.canvas.setDimensions({
      width: settings.windowSize + settings.borderSize,
      height: settings.windowSize + settings.borderSize,
    });
    this.canvas.setZoom(MAX_ZOOM);
  }

  setZoomEvents() {
    this.canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();

      zoom += delta / 200;
      if (zoom > MIN_ZOOM) zoom = MIN_ZOOM;
      if (zoom < MAX_ZOOM) zoom = MAX_ZOOM;
      this.canvas.setZoom(zoom);

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  drawBorder() {
    const border = new fabric.Rect({
      width: settings.fieldSize,
      height: settings.fieldSize,
      stroke: 'red',
      strokeWidth: 10,
    });
    border.setGradient('fill', {
      type: 'radial',
      r1: border.width * 2,
      r2: 100,
      x1: border.width / 2,
      y1: border.height / 2,
      x2: border.width / 2,
      y2: border.height / 2,
      colorStops: {
        // $FlowFixMe
        0: BACKGROUND_EDGE,
        // $FlowFixMe
        1: BACKGROUND_CENTER,
      },
    });
    this.canvas.add(border);
  }

  setTimeline(timeline: Timeline) {
    !_.isEmpty(this.players) && this.canvas.remove(..._.values(this.players));

    this.timeline = timeline;
    this.step = 0;
    this.players = _(timeline[0].players)
      .map('cells')
      .flatten()
      .map(cell => new fabric.Circle({
        id: cell.id,
        left: cell.pos.x - cell.size,
        top: cell.pos.y - cell.size,
        fill: '#ff3355',
        radius: cell.size,
        stroke: '#dd2244',
        strokeWidth: Math.round(cell.size / 10),
      }))
      .keyBy('id')
      .value();
    this.canvas && this.canvas.add(..._.values(this.players));
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

  update(item: TimelineItem) {
    const deadPlayers = [];
    const alivePlayers = [];
    const gamePlayers = _(item.players)
      .map('cells')
      .flatten()
      .keyBy('id')
      .value();

    _.forEach(this.players, (canvasPlayer) => {
      const gamePlayer = gamePlayers[canvasPlayer.id];

      if (gamePlayer) {
        canvasPlayer.set({
          left: gamePlayer.pos.x - gamePlayer.size,
          top: gamePlayer.pos.y - gamePlayer.size,
          radius: gamePlayer.size,
        });
        canvasPlayer.moveTo(gamePlayer.size);
        canvasPlayer.setCoords();
        alivePlayers.push(canvasPlayer.id);
      } else {
        deadPlayers.push(canvasPlayer.id);
      }
    });

    this.canvas.remove(..._(this.players).pick(deadPlayers).values().value());
    this.players = _.pick(this.players, alivePlayers);
    this.canvas.renderAll();
  }
}

export default Draw;
