const path = require('path');

const moduleConfig = {
  rules: [
    {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
    {
      test: /\.(png|svg|jpg|gif)$/,
      use: [
        'file-loader',
      ],
    },
  ],
};

const config = {
  mode: 'development',
  entry: {
    main: './src/index.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './example',
  },
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: ['botChallenge'],
    libraryTarget: 'umd',
  },
  module: moduleConfig,
};

const cliConfig = {
  mode: 'production',
  entry: {
    cli: './src/cli/index.js',
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: ['botChallenge', '[name]'],
    libraryTarget: 'umd',
  },
  module: moduleConfig,
};

module.exports = [config, cliConfig];
