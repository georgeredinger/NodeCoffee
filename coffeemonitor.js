var http = require('http'),
sys  = require('util'),
fs   = require('fs'),
io = require('socket.io'),
events = require('./events'),
mousemod    = require('./mouse');
var http_port = 4321;
var heat_start = 0;
var input_device = '';
var heat_duration = 0;
var	dn_stamp = 0.0,
up_stamp = 0.0,
dn_last = 0.0,
up_last = 0.0,
brew_last = 0.0,
heating = false,
brewing = false,
brew_time = 5*60*1000,
warming_interval = 4*60*1000,
happenen = Date.now();
var ticks=0;
var startRDown=0.0;
var gclient;

var server = http.createServer(function(request, response) {
	response.writeHead(200, {
		'Content-Type': 'text/html'
	});
	var rs = fs.createReadStream(__dirname + '/index.html');
	sys.pump(rs, response);
});
server.listen(http_port);

function monitor_mouse() {
  function handle_timeout() {
  		if(heating) {
  			if((Date.now()-happenen) > warming_interval) {
  				if(!brewing) {
  					brewing=true;
  				  events.insert(socket,"brewing :"+Date());
  				}
  			}
  		}
  		if(!heating) {
  			if((Date.now()-happenen) > warming_interval) {
  				events.insert(socket,"off:"+Date());
  			}
  		}
  		if(brew_last != 0.0) {
  			events.insert(socket,"last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
  		}
  		startTimeout(handle_timeout, 1000);
  	}
  
  	function startTimeout() {
  		setTimeout(handle_timeout, 1000);
  	}
  
  	function err(e) {
  		console.log("error " + e);
  	}
  
  	function rig(e){
  		var delta=0.0;
      happenen = Date.now();
  		if(e.state == 'D'){
  			startRDown = e.time;
  			heating=true;
  			events.insert(socket,"on :"+Date());
  		} else {
  			deltaT=e.time-startRDown;
  			events.insert(socket,"off: "+ Date() + ' ' + deltaT);
  			heating=false;
  		  brewing=false;
  			}
  	}
  
 	var mouse = new mousemod.Mouse(1);
  	mouse.on('R', rig);
  	mouse.on('error', err);
  	startTimeout();
};


var socket = io.listen(server);
socket.set('log level',1); //turn off logging

socket.on('connection',function(client) {
	console.log('connected to client');
	client.emit("message","Drink Coffee");
	m=events.recent();

	for(var i in m) {
		client.emit("message",m[i].name+":"+m[i].ts);
		console.log("Sending history:"+m[i].name+":"+m[i].ts);
	}
});

happenen = Date.now();

monitor_mouse();
console.log("http server listening on port: "+http_port);

