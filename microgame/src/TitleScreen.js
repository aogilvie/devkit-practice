'use strict';

 /* jshint ignore:start */
import device

import ui.View;
import ui.ImageView;
import ui.TextView as TextView;

// Plugin
/* globals auth */
import auth;
/* jshint ignore:end */

exports = Class(ui.ImageView, function(supr) {
  this.init = function(opts) {
    supr(this, 'init', [opts]);

    this.build();
    this.login(function(err) {
      if (err) {
        // There is an error because this is fake
        console.log(err);
      }
      // Continue anyway
      this.addStartButton();
    }.bind(this));
  };

  this.render = function(ctx) {
    // Background
    var grd = ctx.createLinearGradient(0, 0, 320, 570);
    grd.addColorStop(0, '#3093c7');
    grd.addColorStop(1, '#1c5a85');

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 320, 570);
  };

  this.login = function(cb) {
    var authMachine = new auth({
      myserver: 'http://fake.com',
      endpoints: {
        login: '/login'
      }
    });
    // fake some logging in...
    window.setTimeout(function() {
      authMachine.login(null, null, cb);
    }, 2000);
  };

  this.build = function() {
    this._tapStartText = new TextView({
      superview: this,
      layout: 'box',
      text: 'logging in...',
      color: 'white',
      size: 30,
      x: 0,
      y: 310,
      width: 320,
      height: 100
    });

    this._sampleTitleText = new TextView({
      superview: this,
      layout: 'box',
      text: 'Sample Title Text',
      color: 'white',
      wrap: true,
      size: 100,
      x: 0,
      y: 100,
      width: 300,
      height: 100
    });

    this._byTheStudioText = new TextView({
      superview: this,
      layout: 'box',
      text: 'By iReliNeedsPhotoshop Studios',
      color: 'black',
      autoFontSize: true,
      size: 12,
      x: 0,
      y: 500,
      width: 320,
      height: 100
    });
  };

  this.addStartButton = function() {
    this._tapStartText.setText('[ Tap to start! ]');

    // Float a view (button) above the text
    var startbutton = new ui.View({
      superview: this,
      x: this._tapStartText.style.x,
      y: this._tapStartText.style.y,
      // bug with getHeight() and getWidth()?
      width: this._tapStartText.style._width,
      height: this._tapStartText.style._height
    });
    startbutton.on('InputSelect', function() {
      this.emit('titlescreen:start');
    }.bind(this));
  };
});
