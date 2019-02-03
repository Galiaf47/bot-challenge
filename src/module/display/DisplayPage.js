// @flow

import React, {useState, useEffect, useCallback} from 'react';
import {connect} from 'react-redux';
import styled from '@emotion/styled';

import {Button, Paper, Typography} from '@material-ui/core';

import type {Timeline, Player} from 'data/types';
import {update, initialGameState, getInitialGameState} from 'game/game';
import settings from 'game/settings';
import {getTimeline, getTimelinePlay, getWinner} from 'game/reducer';
import BallDiv from './Ball';

const PaperContainer = styled(Paper)`
  width: ${settings.fieldWidth}px;
  height: ${settings.fieldHeight}px;
`;

type Props = {
  code: string,
  timeline: Timeline,
  timelinePlay: boolean,
  classes: {[string]: string},
  winner: ?Player,
};

function DisplayPage({
  code,
  timeline,
  timelinePlay,
  winner,
}: Props) {
  const [game, setGame] = useState(initialGameState);
  const [step, setStep] = useState(0);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    play && requestAnimationFrame(() => {
      if (timelinePlay) {
        setGame(timeline[step]);
      } else {
        setGame(update(game, code));
      }

      setStep(step + 1);
    });
  }, [code, timeline, timelinePlay, step, play]);

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
    <PaperContainer>
      {game.players.map(player => (
        <BallDiv key={player.id} entity={player} color={(winner && winner.id === player.id) ? 'green' : 'grey'} />
      ))}
      <Button onClick={handleRestart}>Restart</Button>
      <Button onClick={() => { setPlay(!play); }} autoFocus>{play ? 'Stop' : 'Play'}</Button>
      <Typography variant="title">
        {`Time left: ${timeLeft} seconds`}
      </Typography>
      {game.players.length}
    </PaperContainer>
  );
}

export default connect(state => ({
  timeline: getTimeline(state),
  timelinePlay: getTimelinePlay(state),
  winner: getWinner(state),
}))(DisplayPage);
