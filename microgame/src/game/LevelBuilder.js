'use strict';

/* jshint ignore:start */
import src.game.LevelUtility as LevelUtility;
import src.game.GemBuilder as GemBuilder;
import src.game.GameControl as GameControl;
/* jshint ignore:end */

function LevelBuilder(playerControl, gameControl, config) {
  config = config || {};
  this.clusters = []; // { column, row, length, horizontal }

  this._playerCtl = playerControl;
  this._gameCtl = gameControl;

  this._x = config.x || 42;               // X position
  this._y = config.y || 200;              // Y position
  this._columns = config.columns || 6;    // Number of tile columns
  this._rows = config.rows || 6;          // Number of tile rows
  this._tilewidth = config.tilewidth || 40;    // Visual width of a tile
  this._tileheight = config.tileheight || 40;  // Visual height of a tile
  this._tiles = config.tiles || [];            // The two-dimensional tile array
  this._selectedtile = config.selectedtile || {
    selected: false, column: 0, row: 0
  };

  this.gemBuilder = new GemBuilder();
  this.gemBuilder.create('resources/images/gems/gem_01.png');
  this.gemBuilder.create('resources/images/gems/gem_02.png');
  this.gemBuilder.create('resources/images/gems/gem_03.png');
  this.gemBuilder.create('resources/images/gems/gem_04.png');
  this.gemBuilder.create('resources/images/gems/gem_05.png');

  this._tilecolors = this.gemBuilder.gems;
  // [[255, 128, 128],
  // [128, 255, 128],
  // [128, 128, 255],
  // [255, 255, 128],
  // [255, 128, 255],
  // [128, 255, 255],
  // [255, 255, 255]];

  // Initialize the two-dimensional tile array
  for (var i = 0; i < this._columns; i++) {
    this._tiles[i] = [];
    for (var j = 0; j < this._rows; j++) {
      // Define a tile type and a shift parameter for animation
      this._tiles[i][j] = { type: 0, shift: 0 };
    }
  }
}

LevelBuilder.prototype.create = function() {
  var done = false;   // Marker for level creation completed

  // Remove clusters and insert tiles
  function resolveClusters(level) {
    // Check for clusters
    LevelUtility.findClusters(level);

    // While there are clusters left
    while (level.clusters.length > 0) {

      // Remove clusters
      LevelUtility.removeClusters(level);

      // Shift tiles
      LevelUtility.shiftTiles(level);

      // Check if there are clusters left
      LevelUtility.findClusters(level);
    }
  }

  // Keep generating levels until it is correct
  while (done === false) {

    // Create a level with random tiles
    for (var i = 0; i < this._columns; i++) {
      for (var j = 0; j < this._rows; j++) {
        this._tiles[i][j].type = LevelUtility.getRandomTile(this);
      }
    }

    // Resolve the clusters
    resolveClusters(this);

    this._playerCtl.setLevel(this);
    // Check if there are valid moves
    this._playerCtl.findMoves();

    // Done when there is a valid move
    console.log('there are moves available', this._playerCtl._currentMoves);
    if (this._playerCtl._currentMoves.length > 0) {
      done = true;
    }
  }

  this._playerCtl.setLevel(this);
  this._gameCtl.setLevel(this);
  return this;
};

LevelBuilder.prototype.renderTiles = function(context) {
  var i;
  var j;
  for (i = 0; i < this._columns; i++) {
    for (j = 0; j < this._rows; j++) {
      // Get the shift of the tile for animation
      var shift = this._tiles[i][j].shift;

      // Calculate the tile coordinates
      var coord = this._getTileCoordinate(
        i,
        j,
        0,
        (this._gameCtl.getAnimTime() / GameControl.ANIMATION_TIME_TOTAL) * shift
      );

      // Check if there is a tile present
      if (this._tiles[i][j].type >= 0) {
        // Get the color of the tile
        var col = this._tilecolors[this._tiles[i][j].type];

        // Draw the tile using the color
        this.gemBuilder.draw(context, col, coord.tilex, coord.tiley, this._tilewidth, this._tileheight);
      }

      // Draw the selected tile
      if (this._selectedtile.selected) {
        if (this._selectedtile.column === i && this._selectedtile.row === j) {
          // Draw a red tile
          this._drawTile(context, coord.tilex, coord.tiley, 255, 0, 0);
        }
      }
    }
  }

  // Render the swap animation
  if (this._gameCtl.getGameState() === GameControl.gamestate.RESOLVE &&
     (this._gameCtl.getAnimState() === GameControl.animstate.ANIMATING ||
      this._gameCtl.getAnimState() === GameControl.animstate.REVERSE)) {
    // Calculate the x and y shift
    var shiftx = this._playerCtl.getCurrentMove().column2 - this._playerCtl.getCurrentMove().column1;
    var shifty = this._playerCtl.getCurrentMove().row2 - this._playerCtl.getCurrentMove().row1;

    // First tile
    var coord1 = this._getTileCoordinate(
      this._playerCtl.getCurrentMove().column1,
      this._playerCtl.getCurrentMove().row1,
      0,
      0
    );
    var coord1shift = this._getTileCoordinate(
      this._playerCtl.getCurrentMove().column1,
      this._playerCtl.getCurrentMove().row1,
      (this._gameCtl.getAnimTime() / GameControl.ANIMATION_TIME_TOTAL) * shiftx,
      (this._gameCtl.getAnimTime() / GameControl.ANIMATION_TIME_TOTAL) * shifty
    );
    var col1 =
      this._tilecolors[this._tiles[
        this._playerCtl.getCurrentMove().column1
      ][this._playerCtl.getCurrentMove().row1].type];

    // Second tile
    var coord2 = this._getTileCoordinate(
      this._playerCtl.getCurrentMove().column2,
      this._playerCtl.getCurrentMove().row2,
      0,
      0
    );
    var coord2shift = this._getTileCoordinate(
      this._playerCtl.getCurrentMove().column2,
      this._playerCtl.getCurrentMove().row2,
      (this._gameCtl.getAnimTime() / GameControl.ANIMATION_TIME_TOTAL) * -shiftx,
      (this._gameCtl.getAnimTime() / GameControl.ANIMATION_TIME_TOTAL) * -shifty
    );
    var col2 =
      this._tilecolors[this._tiles[
        this._playerCtl.getCurrentMove().column2
      ][this._playerCtl.getCurrentMove().row2].type];

    // Draw a black background
    this._drawTile(context, coord1.tilex, coord1.tiley, 0, 0, 0);
    this._drawTile(context, coord2.tilex, coord2.tiley, 0, 0, 0);

    // Change the order, depending on the animation state
    if (this._gameCtl.getAnimState() === GameControl.animstate.ANIMATING) {
      // Draw the tiles
      this._drawTile(context, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
      this._drawTile(context, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
    } else {
      // Draw the tiles
      this._drawTile(context, coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
      this._drawTile(context, coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
    }
  }
};

// Render clusters
LevelBuilder.prototype.renderClusters = function(context) {
  var i;
  for (i = 0; i < this.clusters.length; i++) {
    // Calculate the tile coordinates
    var coord = this._getTileCoordinate(this.clusters[i].column, this.clusters[i].row, 0, 0);

    if (this.clusters[i].horizontal) {
      // Draw a horizontal line
      context.fillStyle = '#00ff00';
      context.fillRect(
        coord.tilex + this._tilewidth/2,
        coord.tiley + this._tileheight/2 - 4,
        (this.clusters[i].length - 1) * this._tilewidth, 8
      );
    } else {
      // Draw a vertical line
      context.fillStyle = '#0000ff';
      context.fillRect(
        coord.tilex + this._tilewidth/2 - 4,
        coord.tiley + this._tileheight/2, 8,
        (this.clusters[i].length - 1) * this._tileheight
      );
    }
  }
};

LevelBuilder.prototype._getTileCoordinate = function(column, row, columnoffset, rowoffset) {
  var tilex = this._x + (column + columnoffset) * this._tilewidth;
  var tiley = this._y + (row + rowoffset) * this._tileheight;
  return { tilex: tilex, tiley: tiley };
};

// Draw a tile with a color
LevelBuilder.prototype._drawTile = function(context, x, y, r, g, b) {
  context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ', 0.2)';
  context.fillRect(x + 2, y + 2, this._tilewidth - 4, this._tileheight - 4);
};

exports = LevelBuilder;
