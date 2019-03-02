// @flow

import React, {useState, useEffect, useCallback} from 'react';
import {connect} from 'react-redux';

import {Button, Paper, Typography} from '@material-ui/core';

import type {Timeline} from 'data/types';
import {initialGameState, getInitialGameState} from 'game/game';
import settings from 'game/settings';
import {getTimeline, getTimelinePlay, getWinner} from 'game/reducer';
import Draw from 'game/draw';

type Props = {
  timeline: Timeline,
  timelinePlay: boolean,
  classes: {[string]: string},
};

let draw;

function DisplayPage({
  timeline,
  timelinePlay,
}: Props) {
  const [game, setGame] = useState(initialGameState);
  const [step, setStep] = useState(0);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    draw = new Draw('c');
  }, []);

  useEffect(() => {
    timeline && draw.setTimeline(timeline);
  }, [timeline]);

  useEffect(() => {
    if (play) {
      draw.start();
    } else {
      draw.stop();
    }
  }, [play]);

  const handleRestart = useCallback(() => {
    setPlay(false);
    if (timelinePlay) {
      setStep(0);
    } else {
      setGame(getInitialGameState(20, 100));
    }
  });

  const timeLeft = Math.round((settings.roundTime * settings.fps - step) / settings.fps);

  return (
    <Paper>
      <canvas id="c" />
      <Button onClick={handleRestart}>Restart</Button>
      <Button onClick={() => { setPlay(!play); }} autoFocus>{play ? 'Stop' : 'Play'}</Button>
      <Typography variant="title">
        {`Time left: ${timeLeft} seconds`}
      </Typography>
      {game.players.length}
    </Paper>
  );
}

export default connect(state => ({
  timeline: getTimeline(state),
  timelinePlay: getTimelinePlay(state),
  winner: getWinner(state),
}))(DisplayPage);
