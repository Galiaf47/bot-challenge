// @flow

import React, {useState, useEffect, useCallback} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import styled from '@emotion/styled';

import {
  Button, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar,
} from '@material-ui/core';

import type {Timeline} from 'data/types';
import {initialGameState, getInitialGameState} from 'game/game';
import settings from 'game/settings';
import {getTimeline, getTimelinePlay, getWinner} from 'game/reducer';
import Draw from 'game/draw';

const DrawBlock = styled.div`
  display: flex;
  align-items: flex-start;
`;

const ListContainer = styled.div`
  max-height: ${settings.windowSize}px;
  width: 200px;
  overflow-y: auto;
`;

const Color = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  border: solid 1px rgba(255, 255, 255, 0.5);
  background-color: ${({color}) => color};
`;

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
  const [follow, setFollow] = useState(null);

  useEffect(() => {
    draw = new Draw('game', () => {});
    draw.onUpdate = setStep;
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

  useEffect(() => {
    draw.setFollow(follow);
  }, [follow]);

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
      <DrawBlock>
        <canvas id="game" />
        <ListContainer>
          <List>
            <ListItem button dense onClick={() => setFollow(null)} selected={!follow}>
              <ListItemText>
                All
              </ListItemText>
            </ListItem>
            {timeline && _(timeline[step].players)
              .sortBy(player => _.reduce(player.cells, (mass, cell) => mass + cell.size, 0))
              .reverse()
              .map(player => (
                <ListItem
                  key={player.id}
                  button
                  dense
                  onClick={() => setFollow(player.id)}
                  selected={follow === player.id}
                >
                  <ListItemAvatar>
                    <Color color={player.cells[0].color} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Name: ${player.id}`}
                    secondary={`Mass: ${_.reduce(player.cells, (mass, cell) => mass + cell.size, 0)}`}
                  />
                </ListItem>
              ))
              .value()}
          </List>
        </ListContainer>
      </DrawBlock>
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
