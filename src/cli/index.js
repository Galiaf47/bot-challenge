import fs from 'fs';
import * as game from '../game';

const SEPARATOR = '=';

const userBots = {};

process.argv.forEach((arg, index) => {
  if (index > 1) {
    const pair = arg.split(SEPARATOR);

    if (pair.length === 2) {
      try {
        const file = fs.readFileSync(pair[1], 'utf8');
        userBots[pair[0]] = game.compile(file);
      } catch (e) {
        console.log('Error:', e);
      }
    }
  }
});

console.log(userBots);

const timeline = game.simulate(userBots);

console.log(JSON.stringify(timeline[timeline.length - 1].players.length));
