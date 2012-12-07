/**
 * Read Linux mouse(s) in node.js
 * Author: Marc Loehe (marcloehe@gmail.com)
 *
 * Adapted from Tim Caswell's nice solution to read a linux joystick
 * http://nodebits.org/linux-joystick
 * https://github.com/nodebits/linux-joystick
 */

var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

var mousemod    = require('./mouse');

/****************
 * Sample Usage *
 ****************/
var startLDown=0.0;
var startMDown=0.0;
var startRDown=0.0;
function err(e) {
  console.log("error " + e);
}

function lel(e){
	console.log("left " + e.state + ' ' + e.time);
  if(e.state == 'D'){
    startLDown = e.time;
  }
  else {
    console.log("deltaTL " + (e.time-startLDown));
  }
}

function rig(e){
	console.log("right " + e.state + ' ' + e.time);
  if(e.state == 'D'){
    startRDown = e.time;
  }
  else {
    console.log("deltaTR " + (e.time-startRDown));
  }
}

function mid(e){
	console.log("middle " + e.state + ' ' + e.time);
  if(e.state == 'D'){
    startMDown = e.time;
  }
  else {
    console.log("deltaTM " + (e.time-startMDown));
  }
}
// read all mouse events from /dev/input/mice
var mouse = new mousemod.Mouse(1);
mouse.on('L', lel);
mouse.on('R', rig);
mouse.on('M', mid);
mouse.on('error', err);

