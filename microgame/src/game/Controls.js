'use strict';

/* jshint ignore:start */
import event.input.InputEvent as InputEvent;
from event.input.dispatch import eventTypes;
/* jshint ignore:end */

// Check if two tiles can be swapped
function canSwap(x1, y1, x2, y2) {
  // Check if the tile is a direct neighbor of the selected tile
  if ((Math.abs(x1 - x2) === 1 && y1 === y2) ||
      (Math.abs(y1 - y2) === 1 && x1 === x2)) {
    return true;
  }

  return false;
}

// Get the mouse position
function getMousePos(screen, evt) {
  var rect = screen.getBoundingShape();
  return {
    x: Math.round(
      (evt.srcPoint.x - 0/*rect.left*/) / (750/*rect.right*/ - 0/*rect.left*/) * rect.width
    ),
    y: Math.round(
      (evt.srcPoint.y - 0/*rect.top*/) / (1335/*rect.bottom*/ - 0/*rect.top*/) * rect.height
    )
  };
}

// Get the tile under the mouse
function getMouseTile(level, pos) {
  // Calculate the index of the tile
  var tx = Math.floor((pos.x - level._x) / level._tilewidth);
  var ty = Math.floor((pos.y - level._y) / level._tileheight);

  // Check if the tile is valid
  if (tx >= 0 && tx < level._columns && ty >= 0 && ty < level._rows) {
    // Tile is valid
    return {
      valid: true,
      x: tx,
      y: ty
    };
  }

  // No valid tile
  return {
    valid: false,
    x: 0,
    y: 0
  };
}

/*
* @param screen (DOM element) to attach events to
* @param playerControl (PlayerControl Object) player object
* @param gameControl (GameControl Object) game state object
* @param level (Object) level
*/
function Controls(screen, playerControl, gameControl, level) {
  this._screen = screen;
  this._level = level;
  this._isdragging = false;
  this._playerCtl = playerControl;
  this._gameCtl = gameControl;

  this.setup();
}

/*
* @param evt DOM event
*/
Controls.prototype.setup = function() {
  this._screen.on('InputStart', function(evt) {
    this._onMouseDown.call(this, evt);
  }.bind(this));
  this._screen.on('InputMove', function(evt) {
    this._onMouseMove.call(this, evt);
  }.bind(this));
  this._screen.on('InputSelect', function(evt) {
    this._onMouseOut.call(this, evt);
  }.bind(this));

};

/*
* @private
* @param evt DOM event
*/
Controls.prototype._onMouseMove = function(evt) {
  // Get the mouse position
  var pos = getMousePos(this._screen, evt);

  // Check if we are dragging with a tile selected
  if (this._isdragging === true && this._level._selectedtile.selected) {
    // Get the tile under the mouse
    var mt = getMouseTile(this._level, pos);
    if (mt.valid) {
      // Valid tile

      // Check if the tiles can be swapped
      if (canSwap(mt.x,
                  mt.y,
                  this._level._selectedtile.column,
                  this._level._selectedtile.row)) {
        // Swap the tiles
        this._mouseSwap(mt.x,
                        mt.y,
                        this._level._selectedtile.column,
                        this._level._selectedtile.row);
      }
    }
  }
};

/*
* @private
* @param evt DOM event
*/
Controls.prototype._onMouseDown = function(evt) {
  // Get the mouse position
  var pos = getMousePos(this._screen, evt);
  // Start dragging
  if (this._isdragging === false) {
    // Get the tile under the mouse
    var mt = getMouseTile(this._level, pos);

    if (mt.valid) {
      // Valid tile
      var swapped = false;
      if (this._level._selectedtile.selected) {
        if (mt.x === this._level._selectedtile.column &&
          mt.y === this._level._selectedtile.row) {
          // Same tile selected, deselect
          this._level._selectedtile.selected = false;
          this._isdragging = true;
          return;
        } else if (canSwap(mt.x,
                          mt.y,
                          this._level._selectedtile.column,
                          this._level._selectedtile.row)) {
          // Tiles can be swapped, swap the tiles
          this._mouseSwap(mt.x,
                          mt.y,
                          this._level._selectedtile.column,
                          this._level._selectedtile.row);
          swapped = true;
        }
      }

      if (swapped === false) {
        // Set the new selected tile
        this._level._selectedtile.column = mt.x;
        this._level._selectedtile.row = mt.y;
        this._level._selectedtile.selected = true;
      }
    } else {
      // Invalid tile
      this._level._selectedtile.selected = false;
    }

    // Start dragging
    this._isdragging = true;
  }

  // Check if a button was clicked
  // var i;
  // for (i = 0; i < buttons.length; i++) {
  //   if (pos.x >= buttons[i].x && pos.x < buttons[i].x+buttons[i].width &&
  //     pos.y >= buttons[i].y && pos.y < buttons[i].y+buttons[i].height) {
  //
  //     // Button i was clicked
  //     if (i == 0) {
  //       // New Game
  //       newGame();
  //     } else if (i == 1) {
  //       // Show Moves
  //       showmoves = !showmoves;
  //       buttons[i].text = (showmoves ? "Hide" : "Show") + " Moves";
  //     } else if (i == 2) {
  //       // AI Bot
  //       aibot = !aibot;
  //       buttons[i].text = (aibot ? "Disable" : "Enable") + " AI Bot";
  //     }
  //   }
  // }
};

/*
* @private
* @param evt DOM event
*/
Controls.prototype._onMouseUp = function() {
  // Reset dragging
  console.log('_onMouseUp');
  this._isdragging = false;
};

Controls.prototype._onMouseOut = function() {
  // Reset dragging
  this._isdragging = false;
};

// Swap two tiles as a player action
Controls.prototype._mouseSwap = function(c1, r1, c2, r2) {
  // Save the current move
  this._playerCtl.setCurrentMove({
    column1: c1,
    row1: r1,
    column2: c2,
    row2: r2
  });

  // Deselect
  this._level._selectedtile.selected = false;

  // Start animation
  this._gameCtl.setAnimState(this._gameCtl.animstate.ANIMATING);
  this._gameCtl.resetAnimTime();
  this._gameCtl.setGameState(this._gameCtl.gamestate.RESOLVE);
};

exports = Controls;
