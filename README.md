# Bot challenge game module
[![Build Status](https://travis-ci.org/Galiaf47/bot-challenge.svg?branch=master)](https://travis-ci.org/Galiaf47/bot-challenge)

## Install for web
```
npm install -S bot-challenge
```

## Install and run CLI
### Install
```
npm install bot-challenge
```
### Run
```
node node_modules/bot-challenge/lib/cli.js id=path/to/bot.js id2=path/to/bot2.js > game.json
```

## Rules
* Fight till one player left or timeout
* No need to merge to finish
* Winner takes max score
* Winner position depends on total player cells mass at finish
* If mass is the same, players compared by lifetime

## Restrictions
* Max velocity change
* Max velocity (depends on mass)
* Max direction change
* No control over charged cells
* Cells can't merge until timeout pass
* Bot sees only limited radius around first cell
* Bot vision radius depends on total player mass
* Function execution should not take more than x ms
* Function size should not be more than x kb minified
