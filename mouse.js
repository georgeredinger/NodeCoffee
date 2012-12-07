var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

var decode   = require('./decode_mouse_buffer');

function Mouse(mouseid) {
  this.wrap('onOpen');
  this.wrap('onRead');
  //this.buf = new Buffer(3);
  this.buf = new Buffer(24);
  fs.open('/dev/input/event' + mouseid , 'r', this.onOpen);
}

Mouse.prototype = Object.create(EventEmitter.prototype, {
  constructor: {value: Mouse}
});

Mouse.prototype.wrap = function(name) {
  var self = this;
  var fn = this[name];
  this[name] = function (err) {
    if (err) return self.emit('error', err);
    return fn.apply(self, Array.prototype.slice.call(arguments, 1));
  };
};

Mouse.prototype.onOpen = function(fd) {
  this.fd = fd;
  this.startRead();
};

Mouse.prototype.startRead = function() {
  fs.read(this.fd, this.buf, 0, 24, null, this.onRead);
};

Mouse.prototype.onRead = function(bytesRead) {
  event = decode.mouse_event(this,this.buf);
  event.dev = this.dev;
  this.emit(event.type, event);
  if (this.fd) this.startRead();
};

Mouse.prototype.close = function(callback) {
  fs.close(this.fd, (function(){console.log(this);}));
  this.fd = undefined;
}


exports.Mouse = Mouse;
