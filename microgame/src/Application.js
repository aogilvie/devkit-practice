'use strict';

/* jshint ignore:start */
// SDK
import device
import ui.StackView as StackView;

// Local source
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
/* jshint ignore:end */

exports = Class(GC.Application, function() {

  this.initUI = function() {
    var titlescreen = new TitleScreen();
    var gamescreen = new GameScreen();

    // Create a stackview of size 320x480, then scale it to fit horizontally
    // Add a new StackView to the root of the scene graph
    var rootView = new StackView({
      superview: this,
      x: 0,
      y: 0,
      width: 320,
      height: 570,
      clip: true,
      scale: device.width / 320
    });
    rootView.push(titlescreen);

    // Events
    titlescreen.on('titlescreen:start', function() {
      rootView.push(gamescreen);
      gamescreen.emit('app:start');
    });

  };

  this.launchUI = function() {};
});
