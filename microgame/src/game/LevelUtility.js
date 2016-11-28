'use strict';


var LevelUtility = {};

// Swap two tiles in the level
LevelUtility.swap = function(level, x1, y1, x2, y2) {
  var typeswap = level._tiles[x1][y1].type;
  level._tiles[x1][y1].type = level._tiles[x2][y2].type;
  level._tiles[x2][y2].type = typeswap;
};

// Loop over the cluster tiles and execute a function
LevelUtility.loopClusters = function(clusters, func) {
  var i;
  var j;
  for (i = 0; i < clusters.length; i++) {
    //  { column, row, length, horizontal }
    var cluster = clusters[i];
    var coffset = 0;
    var roffset = 0;
    for (j = 0; j < cluster.length; j++) {
      func(i, cluster.column+coffset, cluster.row+roffset, cluster);

      if (cluster.horizontal) {
        coffset++;
      } else {
        roffset++;
      }
    }
  }
};

LevelUtility.getRandomTile = function(level) {
  return Math.floor(Math.random() * level._tilecolors.length);
};

// Find clusters in the level
LevelUtility.findClusters = function(level) {
  var clusters = [];
  var checkcluster;
  var i;
  var j;

  // Find horizontal clusters
  for (j = 0; j < level._rows; j++) {
    // Start with a single tile, cluster of 1
    var matchlengthHoriz = 1;
    for (i = 0; i < level._columns; i++) {
      checkcluster = false;

      if (i === level._columns-1) {
        // Last tile
        checkcluster = true;
      } else {
        // Check the type of the next tile
        if (level._tiles[i][j].type === level._tiles[i+1][j].type &&
          level._tiles[i][j].type !== -1) {
          // Same type as the previous tile, increase matchlength
          matchlengthHoriz += 1;
        } else {
          // Different type
          checkcluster = true;
        }
      }

      // Check if there was a cluster
      if (checkcluster) {
        if (matchlengthHoriz >= 3) {
          // Found a horizontal cluster
          clusters.push({ column: i+1-matchlengthHoriz, row:j,
            length: matchlengthHoriz, horizontal: true });
        }

        matchlengthHoriz = 1;
      }
    }
  }

  // Find vertical clusters
  for (i = 0; i < level._columns; i++) {
    // Start with a single tile, cluster of 1
    var matchlengthVert = 1;
    for (j = 0; j < level._rows; j++) {
      checkcluster = false;

      if (j === level._rows-1) {
        // Last tile
        checkcluster = true;
      } else {
        // Check the type of the next tile
        if (level._tiles[i][j].type === level._tiles[i][j+1].type &&
          level._tiles[i][j].type !== -1) {
          // Same type as the previous tile, increase matchlength
          matchlengthVert += 1;
        } else {
          // Different type
          checkcluster = true;
        }
      }

      // Check if there was a cluster
      if (checkcluster) {
        if (matchlengthVert >= 3) {
          // Found a vertical cluster
          clusters.push({ column: i, row:j+1-matchlengthVert,
            length: matchlengthVert, horizontal: false });
        }

        matchlengthVert = 1;
      }
    }
  }
  level.clusters = clusters;
};

// Remove the clusters
LevelUtility.removeClusters = function(level) {
  // Change the type of the tiles to -1, indicating a removed tile
  LevelUtility.loopClusters(level.clusters, function(index, column, row) {
    level._tiles[column][row].type = -1;
  });

  var i;
  var j;
  var shift;
  // Calculate how much a tile should be shifted downwards
  for (i = 0; i < level._columns; i++) {
    shift = 0;
    for (j = level._rows-1; j >= 0; j--) {
      // Loop from bottom to top
      if (level._tiles[i][j].type === -1) {
        // Tile is removed, increase shift
        shift++;
        level._tiles[i][j].shift = 0;
      } else {
        // Set the shift
        level._tiles[i][j].shift = shift;
      }
    }
  }
};

// Shift tiles and insert new tiles
LevelUtility.shiftTiles = function(level) {
  // Shift tiles
  for (var i = 0; i < level._columns; i++) {
    for (var j = level._rows-1; j >= 0; j--) {
      // Loop from bottom to top
      if (level._tiles[i][j].type === -1) {
        // Insert new random tile
        level._tiles[i][j].type = LevelUtility.getRandomTile(level);
      } else {
        // Swap tile to shift it
        var shift = level._tiles[i][j].shift;
        if (shift > 0) {
          LevelUtility.swap(level, i, j, i, j + shift);
        }
      }

      // Reset shift
      level._tiles[i][j].shift = 0;
    }
  }
};

exports = LevelUtility;
