// @flow

import React, {useState, useEffect} from 'react';
import Vector from 'victor';

import Paper from '@material-ui/core/Paper';
import {withStyles, Button} from '@material-ui/core';

import type {Game, Player, Ball} from 'game/types';
import settings from 'game/settings';
import BallDiv from './Ball';

const PLAYER_SIZE = settings.playerSize;
const EDGE_DISTANCE = settings.playerSize / 2;
const LEFT_EDGE = EDGE_DISTANCE;
const RIGHT_EDGE = settings.fieldWidth - EDGE_DISTANCE;
const TOP_EDGE = EDGE_DISTANCE;
const BOTTOM_EDGE = settings.fieldHeight - EDGE_DISTANCE;

let play = false;

const initialGameState: Game = {
  ball: {
    pos: new Vector(100, 200),
    dir: new Vector(1, 0),
    velocity: 0,
  },
  player: {
    pos: new Vector(200, 100),
    dir: new Vector(1, 0),
    velocity: 0,
  },
};

let game = initialGameState;

let rafId: ?number;

function start(loop) {
  if (!rafId) {
    rafId = window.requestAnimationFrame(loop);
  }
}

function stop() {
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = undefined;
  }
}

function checkCollision(ball, player) {
  return ball.pos.distance(player.pos) <= PLAYER_SIZE;
}

function move(obj: Ball | Player) {
  const {dir} = obj;
  const pos = obj.pos.clone().add(dir.clone().multiplyScalar(obj.velocity));

  return {
    ...obj,
    pos,
    velocity: obj.velocity * settings.ballFriction,
  };
}

function getReflection(direction: Vector, normal: Vector) {
  return direction.clone()
    .add(
      normal.clone()
        .multiplyScalar(-2 * direction.dot(normal)),
    );
}

const LEFT_EDGE_VECTOR = new Vector(1, 0);
const RIGHT_EDGE_VECTOR = LEFT_EDGE_VECTOR.clone().invert();
const TOP_EDGE_VECTOR = new Vector(0, 1);
const BOTTOM_EDGE_VECTOR = TOP_EDGE_VECTOR.clone().invert();

function update(up: Function): Game {
  const {ball, player} = game;
  const {dir} = ball;
  let collisionForce;

  if (checkCollision(game.ball, game.player)) {
    const force = ball.pos.clone().subtract(player.pos).normalize().multiplyScalar(player.velocity);
    ball.dir = dir.clone().add(force).normalize();
    ball.velocity = force.length() * 3;
  }

  if (game.ball.pos.x < LEFT_EDGE) {
    collisionForce = getReflection(ball.dir, LEFT_EDGE_VECTOR);
    game.ball.pos.x = LEFT_EDGE;
  }
  if (game.ball.pos.x > RIGHT_EDGE) {
    collisionForce = getReflection(ball.dir, RIGHT_EDGE_VECTOR);
    game.ball.pos.x = RIGHT_EDGE;
  }
  if (game.ball.pos.y < TOP_EDGE) {
    collisionForce = getReflection(ball.dir, TOP_EDGE_VECTOR);
    game.ball.pos.y = TOP_EDGE;
  }
  if (game.ball.pos.y > BOTTOM_EDGE) {
    collisionForce = getReflection(ball.dir, BOTTOM_EDGE_VECTOR);
    game.ball.pos.y = BOTTOM_EDGE;
  }

  if (collisionForce) {
    ball.dir = collisionForce;
  }

  try {
    return {
      ...game,
      ball: move(game.ball),
      player: move(up(game.player, game.ball)),
    };
  } catch (e) {
    return game;
  }
}

type Props = {
  code: string,
  classes: {[string]: string}
};

function DisplayPage({code, classes}: Props) {
  const [ball, setBall] = useState(initialGameState.ball);
  const [player, setPlayer] = useState(initialGameState.player);

  useEffect(() => {
    function loop() {
      rafId = undefined;

      play && (game = update(code));
      setBall(game.ball);
      setPlayer(game.player);

      // slint-disable-next-line no-use-before-define
      start(loop);
    }

    start(loop);

    return () => stop();
  }, [code]);

  return (
    <Paper className={classes.root}>
      <BallDiv entity={ball} color="gray" />
      <BallDiv entity={player} color="green" />
      <Button onClick={() => { game = initialGameState; }}>Restart</Button>
      <Button onClick={() => { play = !play; }} autoFocus>{play ? 'Stop' : 'Play'}</Button>
    </Paper>
  );
}

export default withStyles({
  root: {
    width: settings.fieldWidth,
    height: settings.fieldHeight,
  },
})(DisplayPage);
