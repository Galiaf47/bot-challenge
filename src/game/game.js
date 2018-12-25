// @flow

import Vector from 'victor';

import type {
  GameState,
  Player,
  Ball,
  UpdatePlayerFunction,
} from './types';
import settings from './settings';

const PLAYER_SIZE = settings.playerSize;
const EDGE_DISTANCE = settings.playerSize / 2;
const LEFT_EDGE = EDGE_DISTANCE;
const RIGHT_EDGE = settings.fieldWidth - EDGE_DISTANCE;
const TOP_EDGE = EDGE_DISTANCE;
const BOTTOM_EDGE = settings.fieldHeight - EDGE_DISTANCE;

const FPS = settings.fps;
const TIME = settings.roundTime;
const CICLES = FPS * TIME;

const LEFT_EDGE_VECTOR = new Vector(1, 0);
const RIGHT_EDGE_VECTOR = LEFT_EDGE_VECTOR.clone().invert();
const TOP_EDGE_VECTOR = new Vector(0, 1);
const BOTTOM_EDGE_VECTOR = TOP_EDGE_VECTOR.clone().invert();

const initialGameState: GameState = {
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

function update(gameState: GameState, up: Function): GameState {
  const {ball, player} = gameState;
  const {dir} = ball;
  let collisionForce;

  if (checkCollision(ball, player)) {
    const force = ball.pos.clone()
      .subtract(player.pos)
      .normalize()
      .multiplyScalar(player.velocity);

    ball.dir = dir.clone().add(force).normalize();
    ball.velocity = force.length() * 3;
  }

  if (ball.pos.x < LEFT_EDGE) {
    collisionForce = getReflection(ball.dir, LEFT_EDGE_VECTOR);
    ball.pos.x = LEFT_EDGE;
  }
  if (ball.pos.x > RIGHT_EDGE) {
    collisionForce = getReflection(ball.dir, RIGHT_EDGE_VECTOR);
    ball.pos.x = RIGHT_EDGE;
  }
  if (ball.pos.y < TOP_EDGE) {
    collisionForce = getReflection(ball.dir, TOP_EDGE_VECTOR);
    ball.pos.y = TOP_EDGE;
  }
  if (ball.pos.y > BOTTOM_EDGE) {
    collisionForce = getReflection(ball.dir, BOTTOM_EDGE_VECTOR);
    ball.pos.y = BOTTOM_EDGE;
  }

  if (collisionForce) {
    ball.dir = collisionForce;
  }

  try {
    return {
      ...gameState,
      ball: move(ball),
      player: move(up(player, ball)),
    };
  } catch (e) {
    return gameState;
  }
}

function simulate(updatePlayer: UpdatePlayerFunction): Promise<GameState[]> {
  return new Promise<GameState[]>((resolve, reject) => {
    let lastState: GameState = initialGameState;
    let cicle: number = 1;
    const timeline: GameState[] = [lastState];

    try {
      (function runCicle(): void {
        const end = Math.min(cicle + settings.simulationChunkSize, CICLES);

        while (cicle < end) {
          lastState = update(lastState, updatePlayer);
          cicle += 1;
          timeline.push(lastState);
        }

        if (cicle < CICLES) {
          setTimeout(runCicle, 0);
        } else {
          resolve(timeline);
        }
      }());
    } catch (e) {
      reject(e);
    }
  });
}

export {
  update,
  simulate,
  initialGameState,
};
