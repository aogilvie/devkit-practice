'use strict';

/* jshint ignore:start */
import animate;
import ui.View as View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;

import src.game.PlayerControl as PlayerControl;
import src.game.GameControl as GameControl;
import src.game.LevelBuilder as LevelBuilder;
import src.game.LevelUtility as LevelUtility;
import src.game.Controls as Controls;
/* jshint ignore:end */

var ScoreboardView = Class(View, function(supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);

    this.build();
  };

  this.build = function() {
    this._headerImage = new Image({
      url: 'resources/images/ui/header.png'
    });

    this._headerView = new ui.ImageView({
      superview: this,
      image: this._headerImage,
      x: 0,
      y: -20,
      width: 320,
      height: 200
    });

    this._scoreboard = new ui.TextView({
      superview: this,
      x: 0,
      y: 100,
      width: 320,
      height: 50,
      autoSize: false,
      size: 38,
      verticalAlign: 'middle',
      horizontalAlign: 'center',
      wrap: false,
      color: '#FFFFFF'
    });
  };
});

var BackgroundView = Class(View, function(supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);

    this.build();
  };

  this.build = function() {
    this._backgroundImage = new Image({
      url: 'resources/images/ui/background.png'
    });

    this._backgroundView = new ui.ImageView({
      superview: this,
      image: this._backgroundImage,
      x: 0,
      y: 0,
      width: 320,
      height: 570
    });
  };
});

var TileView = Class(View, function(supr) {
  this.init = function (opts) {
    supr(this, 'init', [opts]);

    this.playerControl = new PlayerControl();
    this.gameControl = new GameControl(this.playerControl);

    this.levelBuilder = new LevelBuilder(this.playerControl, this.gameControl);
    this.level = this.levelBuilder.create();

    this.controls = new Controls(
      this, //window.document.getElementsByTagName('canvas')[0],
      this.playerControl,
      this.gameControl,
      this.level
    );
  };

  // Main render loop
  this.render = function(context) {
    this.gameControl.update();

    this.levelBuilder.renderTiles(context);
    this.levelBuilder.renderClusters(context);

    this.getSuperview().getParents()[2]
      ._scoreboardView
      ._scoreboard
      .setText(this.gameControl.score.toString());
    if (this.gameControl.gameover === true) {
      // Show scoreboard
    }
  };

  this.initGame = function() {
    this.gameControl.setGameState(GameControl.gamestate.READY);
    this.gameControl.setLevel(this.level);
    this.playerControl.findMoves();
    LevelUtility.findClusters(this.level);
  };
});

exports = Class(View, function(supr) {
  this.init = function(opts) {
    opts = merge(opts, {
      x: 0,
      y: 0,
      width: 320,
      height: 480,
    });

    supr(this, 'init', [opts]);
    this.build();
  };

  this.build = function() {
    // view 0
    this._view0 = new View({
      superview: this,
      x: 0,
      y: 0,
      width: 320,
      height: 480
    });

    // view 1
    this._view1 = new View({
      superview: this,
      x: 0,
      y: 0,
      width: 320,
      height: 480
    });

    // view 2
    this._view2 = new View({
      superview: this,
      x: 0,
      y: 0,
      width: 320,
      height: 200
    });

    this._backgroundView = new BackgroundView({
      superview: this.getSubviews()[0],
      x: 0,
      y: 0,
      width: 320,
      height: 480
    });

    this._tileView = new TileView({
      superview: this.getSubviews()[1],
      x: 0,
      y: 0,
      width: 320,
      height: 480
    });

    this._scoreboardView = new ScoreboardView({
      superview: this.getSubviews()[2],
      x: 0,
      y: 0,
      width: 320,
      height: 200
    });

    // The start event is emitted from the start button via the main application.
    this.on('app:start', this._tileView.initGame.bind(this._tileView));
  };
});
