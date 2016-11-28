'use strict';

function GemBuilder() {
  this.gems = [];
}

GemBuilder.prototype.create = function(imgPath) {
  var image = new Image();
  image.onload = function() {};
  image.src = imgPath;
  this.gems.push(image);
};

GemBuilder.prototype.draw = function(context, img, x, y, w, h) {
  context.drawImage(img, x, y, w, h);
};

exports = GemBuilder;
