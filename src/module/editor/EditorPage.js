// @flow
/** @jsx jsx */

import * as React from 'react';
import {connect} from 'react-redux';
import {css, jsx} from '@emotion/core';

import {
  Button,
  CircularProgress,
  Paper,
  TextField,
} from '@material-ui/core';

import {
  simulate,
  playTimeline,
  getSimulating,
  getTimeline,
} from 'game/reducer';
import {compile} from 'game/game';
import type {UpdatePlayerFunction} from 'game/types';

const defaultValue = `
function updatePlayer(player, enemies) {
  let split = false;

  return {
    ...player,
    cells: player.cells ? player.cells.map(cell => {
      let dir = cell.dir;
      let velocity;

      const closest = enemies.sort((e1, e2) => (e1.pos.distance(cell.pos) - e2.pos.distance(cell.pos)))[0];

      if(closest.size < cell.size) {
        const distance = closest.pos.distance(cell.pos);
        dir = closest.pos.clone().subtract(cell.pos).normalize();
        velocity = 3;
        if (distance < cell.size * 4) {
          split = true;
        }
      } else {
        dir = closest.pos.clone().subtract(cell.pos).invert().normalize();
        velocity = 5;
      }

      if (cell.charge) velocity = 10;

      return {
        ...cell,
        dir,
        velocity,
      };
    }) : player.cells,
    split,
  };
}
`;

const styles = {
  container: css`
    padding: 16px;
  `,
  buttons: css`
    display: flex;
    align-items: center;
  `,
  buttonContainer: css`
    position: relative;
    margin: 8px;
  `,
  progress: css`
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -12px;
    margin-left: -12px;
  `,
};

type Props = {
  simulating: boolean,
  timelineExists: boolean,
  handleSimulateClick: (UpdatePlayerFunction) => void,
  handlePlayClick: () => void,
  onChange: (value: Function) => void
};

const EditorPage = ({
  simulating,
  timelineExists,
  handleSimulateClick,
  handlePlayClick,
  onChange,
}: Props) => {
  const inputEl = React.useRef(null);

  return (
    <Paper css={styles.container}>
      <TextField
        inputRef={inputEl}
        label="Bot source code"
        multiline
        rows="30"
        fullWidth
        margin="normal"
        defaultValue={defaultValue}
      />
      <div css={styles.buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => inputEl.current && onChange(compile(inputEl.current.value))}
        >
          Apply
        </Button>
        <div css={styles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => inputEl.current && handleSimulateClick(inputEl.current.value)}
            disabled={simulating}
          >
            Start simulation
          </Button>
          {simulating && <CircularProgress size={24} css={styles.progress} />}
        </div>
        <Button
          variant="contained"
          color="primary"
          disabled={!timelineExists}
          onClick={handlePlayClick}
        >
          Play
        </Button>
      </div>
    </Paper>
  );
};

export default connect(state => ({
  simulating: getSimulating(state),
  timelineExists: !!getTimeline(state),
}), {
  handleSimulateClick: simulate,
  handlePlayClick: playTimeline,
})(EditorPage);
export {
  compile,
};
