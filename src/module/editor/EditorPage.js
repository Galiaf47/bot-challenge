// @flow
/** @jsx jsx */

import * as React from 'react';
import {css, jsx} from '@emotion/core';

import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import {Button, CircularProgress} from '@material-ui/core';

const defaultValue = `
function updatePlayer(player, ball) {
  const dir = ball.pos.clone().subtract(player.pos).normalize();

  return {
    ...player,
    dir,
    velocity: 3,
  };
}
`;

// eslint-disable-next-line no-new-func
const compile = value => window.Function(`"use strict";return (${value})`)();

const styles = {
  container: css`
    padding: 16px;
  `,
  buttons: css`
    display: flex;
  `,
  progress: css`
  `,
};

type Props = {
  onChange: (value: Function) => void
};

const EditorPage = ({onChange}: Props) => {
  const inputEl = React.useRef(null);
  const [simulating, setSimulating] = React.useState(false);

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
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSimulating(true)}
          >
            Start simulation
          </Button>
          {simulating && <CircularProgress size={24} css={styles.progress} />}
        </div>
      </div>
    </Paper>
  );
};

export default EditorPage;
