'use strict';

/* jshint ignore:start */
import src.game.LevelUtility as LevelUtility;
/* jshint ignore:end */


function GameControl(playerCtl) {
  this.score = 0;
  this.gameover = false;
  this._playerCtl = playerCtl;
  this._currentGameState = GameControl.gamestate.INIT;
  this._currentAnimState = GameControl.animstate.NONE;
  this._currentAnimTime = GameControl.ANIMATION_TIME;
}

// Public constants
GameControl.ANIMATION_TIME = 0;
GameControl.ANIMATION_TIME_TOTAL = 0.3;
GameControl.gamestate = {
  READY: 'READY',
  INIT: 'INIT',
  RESOLVE: 'RESOLVE'
};
GameControl.animstate = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  ANIMATING: 'ANIMATING',
  REVERSE: 'REVERSE'
};

GameControl.prototype.animstate = GameControl.animstate;
GameControl.prototype.gamestate = GameControl.gamestate;

GameControl.prototype.resetAnimTime = function() {
  this._currentAnimTime = GameControl.ANIMATION_TIME;
};

GameControl.prototype.setAnimTime = function(time) {
  this._currentAnimTime = time;
};

GameControl.prototype.getAnimTime = function() {
  return this._currentAnimTime;
};

GameControl.prototype.getGameState = function() {
  return this._currentGameState;
};

GameControl.prototype.setGameState = function(state) {
  // TODO: error check state?
  this._currentGameState = state;
};

GameControl.prototype.getAnimState = function() {
  return this._currentAnimState;
};

GameControl.prototype.setAnimState = function(state) {
  // TODO: error check state?
  this._currentAnimState = state;
};

GameControl.prototype.setLevel = function(level) {
  this._level = level;
};

GameControl.prototype.update = function() {
  if (this.getGameState() === GameControl.gamestate.READY) {
    // Game is ready for player input

    // // Check for game over
    if (this._playerCtl._currentMoves.length <= 0) {
      this.gameover = true;
    }

  } else if (this.getGameState() === GameControl.gamestate.RESOLVE) {
    // Game is busy resolving and animating clusters
    this.setAnimTime( this.getAnimTime() + 0.05 );

    if (this.getAnimState() === GameControl.animstate.NONE) {
      // Clusters need to be found and removed
      if (this.getAnimTime() > GameControl.ANIMATION_TIME_TOTAL) {
        // Find clusters
        LevelUtility.findClusters(this._level);

        if (this._level.clusters.length > 0) {
          // Add points to the score
          var i;
          for (i = 0; i < this._level.clusters.length; i++) {
            // Add extra points for longer clusters
            this.score += 100 * (this._level.clusters[i].length - 2);
          }

          // Clusters found, remove them
          LevelUtility.removeClusters(this._level);

          // Tiles need to be shifted
          this.setAnimState(GameControl.animstate.PENDING);
        } else {
          // No clusters found, animation complete
          this.setGameState(GameControl.gamestate.READY);
        }
        this.resetAnimTime();
      }
    } else if (this.getAnimState() === GameControl.animstate.PENDING) {
      // Tiles need to be shifted
      if (this.getAnimTime() > GameControl.ANIMATION_TIME_TOTAL) {
        // Shift tiles
        LevelUtility.shiftTiles(this._level);
        this._playerCtl.setLevel(this._level);

        // New clusters need to be found
        this.setAnimState(GameControl.animstate.NONE);
        this.resetAnimTime();

        // Check if there are new clusters
        LevelUtility.findClusters(this._level);
        if (this._level.clusters.length <= 0) {
          // Animation complete
          this.setGameState(GameControl.gamestate.READY);
        }
      }
    } else if (this.getAnimState() === GameControl.animstate.ANIMATING) {
      // Swapping tiles animation
      if (this.getAnimTime() > GameControl.ANIMATION_TIME_TOTAL) {
        // Swap the tiles
        LevelUtility.swap(this._level,
          this._playerCtl._currentMove.column1,
          this._playerCtl._currentMove.row1,
          this._playerCtl._currentMove.column2,
          this._playerCtl._currentMove.row2);

        // Check if the swap made a cluster
        LevelUtility.findClusters(this._level);
        if (this._level.clusters.length > 0) {
          // Valid swap, found one or more clusters
          // Prepare animation states
          this.setAnimState(GameControl.animstate.NONE);
          this.resetAnimTime();
          this.setGameState(GameControl.gamestate.RESOLVE);
        } else {
          // Invalid swap, Rewind swapping animation
          this.setAnimState(GameControl.animstate.REVERSE);
          this.resetAnimTime();
        }

        // Update moves and clusters
    		this._playerCtl.findMoves(this._level);
    		LevelUtility.findClusters(this._level);
      }
    } else if (this.getAnimState() === GameControl.animstate.REVERSE) {
      // Rewind swapping animation
      if (this.getAnimTime() > GameControl.ANIMATION_TIME_TOTAL) {
        // Invalid swap, swap back
        LevelUtility.swap(this._level,
          this._playerCtl._currentMove.column1,
          this._playerCtl._currentMove.row1,
          this._playerCtl._currentMove.column2,
          this._playerCtl._currentMove.row2);

        // Animation complete
        this.setGameState(GameControl.gamestate.READY);
      }
    }

    // Update moves and clusters
    this._playerCtl.findMoves(this._level);
    LevelUtility.findClusters(this._level);
  }
};

exports = GameControl;
