// @flow

import * as React from 'react';

import Grid from '@material-ui/core/Grid';

import DisplayPage from 'module/display/DisplayPage';
import EditorPage from 'module/editor/EditorPage';

type State = {
  code: ?Function
};

class App extends React.PureComponent<void, State> {
  state = {
    code: null,
  };

  handleChange = (code: string) => {
    this.setState({code});
  };

  render() {
    const {code} = this.state;

    return (
      <Grid container spacing={32}>
        <Grid item xs>
          <DisplayPage code={code} />
        </Grid>
        <Grid item xs>
          <EditorPage onChange={this.handleChange} />
        </Grid>
      </Grid>
    );
  }
}

export default App;
