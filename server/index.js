// @flow

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import _ from 'lodash';

import {simulate, compile} from '../src/game/game';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.text());

app.post('/simulate', (req, res) => (
  simulate(compile(req.body))
    .then(timeline => res.json({
      timeline,
      winner: _(_.last(timeline).players)
        .sortBy('size')
        .last(),
    }))
));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
