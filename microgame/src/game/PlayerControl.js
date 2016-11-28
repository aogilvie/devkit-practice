'use strict';

/* jshint ignore:start */
import src.game.LevelUtility as LevelUtility;
/* jshint ignore:end */

function PlayerControl() {
  this._currentMove = {
    column1: 0,
    row1: 0,
    column2: 0,
    row2: 0
  };
  this._currentMoves = [];
  this._level = {};
}

PlayerControl.prototype.getCurrentMove = function() {
  return this._currentMove;
};

PlayerControl.prototype.setCurrentMove = function(currentMove) {
  this._currentMove = currentMove;
};

PlayerControl.prototype.setLevel = function(currentLevel) {
  this._level = currentLevel;
};

PlayerControl.prototype.findMoves = function() {
  var i;
  var j;
  // Reset moves
  this._currentMoves = [];

  // Check horizontal swaps
  for (j = 0; j < this._level._rows; j++) {
    for (i = 0; i < this._level._columns-1; i++) {
      // Swap, find clusters and swap back
      LevelUtility.swap(this._level, i, j, i+1, j);
      LevelUtility.findClusters(this._level);
      LevelUtility.swap(this._level, i, j, i+1, j);

      // Check if the swap made a cluster
      if (this._level.clusters.length > 0) {
        // Found a move
        this._currentMoves.push({column1: i, row1: j, column2: i+1, row2: j});
      }
    }
  }

  // Check vertical swaps
  for (i = 0; i < this._level._columns; i++) {
    for (j = 0; j < this._level._rows-1; j++) {
      // Swap, find clusters and swap back
      LevelUtility.swap(this._level, i, j, i, j+1);
      LevelUtility.findClusters(this._level);
      LevelUtility.swap(this._level, i, j, i, j+1);

      // Check if the swap made a cluster
      if (this._level.clusters.length > 0) {
        // Found a move
        this._currentMoves.push({column1: i, row1: j, column2: i, row2: j+1});
      }
    }
  }

  // Reset clusters
  this._level.clusters = [];
};

exports = PlayerControl;
