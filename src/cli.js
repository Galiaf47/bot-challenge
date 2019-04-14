import fs from 'fs';
import * as game from './game';

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
        // eslint-disable-next-line no-console
        console.error('Error:', e);
      }
    }
  }
});


const timeline = game.simulate(userBots);

// eslint-disable-next-line no-console
console.log(JSON.stringify(timeline));
