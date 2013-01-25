var development=false;
var http = require('http'),
sys  = require('util'),
fs   = require('fs'),
io = require('socket.io'),
events = require('./events'),
mousemod    = require('./mouse'),
path = require('path'),
mouse_device = require('./findmouse');
tweet = require('./tweet');

var http_port = 4321;
var heat_start = 0;
var input_device = '';
var heat_duration = 0;
var	dn_stamp = 0.0;
var ticks=0;
var startRDown=0.0;
var gclient,
pot_off = false;
up_stamp = 0.0,
dn_last = 0.0,
up_last = 0.0,
brew_last = 0.0,
heating = false,
brewing = false;
if(development) {
  var brew_time = 5000;
  var warming_interval = 4000;
}else{
  var brew_time = 5*60*1000;
  var warming_interval = 4*60*1000;
}

happenen = Date.now();

var brews =  [];

fs.readFileSync('brew.log').toString().split('\n').forEach(function (line) { 
	var fields,ts,brew_time,data_arr;

			fields = line.split(/\s+/);
			ts = parseInt(fields[0]);
			brew_time = parseFloat(fields[1]);
	  	data_arr=[ts,brew_time];
			console.log(data_arr);
			brews.push(data_arr)
});

var last_line_of_file_is_empty_with_NaNs=brews.pop();

var server  = http.createServer(function (request, response) {
console.log("begin");
	var filePath = '.' + request.url;
	if (filePath == './'){
		filePath = './index.html';
    console.log("index.html");
	}

	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
      console.log("js");
		break;
		case '.css':
			contentType = 'text/css';
      console.log("css");
		break;
	}

  console.log(filePath);

	fs.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
});


server.listen(http_port);

function monitor_mouse() {
  function handle_timeout() {
  		if(heating) {
  			if((Date.now()-happenen) > warming_interval) {
  				if(!brewing) {
  					brewing=true;
//  				  events.insert(socket,"brewing :"+Date());
	          if(development){
		          console.log("I would be tweeting, but this is development mode");
						}else{
				      tweet.tweet();
						}
  				}
  			}
  		}
  		if(!heating) {
  			if((Date.now()-happenen) > warming_interval) {
					if(!pot_off){
//  				  events.insert(socket,"pot off: "+Date());
						pot_off = true;
					}
  			}
  		}
  		if(brew_last != 0.0) {
//  			events.insert(socket,"last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
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
  		var delta=0.0,
			    ts,brew;
      happenen = Date.now();
  		if(e.state == 'D'){
			  console.log("rig:"+e.time+' '+e.state+" heating == true");
			  pot_off=false;
  			startRDown = e.time;
  			heating=true;
  		} else {
  			deltaT = e.time - startRDown;
        ts = new Date().getTime();
			  console.log("rig:"+e.time+' '+e.state+" else");
				if(brewing) {
					brew = [ts,deltaT];
			    console.log("rig: brewing! "+brew);
  			  events.insert(socket,brew);
					fs.appendFile('brew.log',ts + ' ' + deltaT + '\n', function (err) {
						 if (err)
				  		  throw err;
				  });
				}
  			heating=false;
  		  brewing=false;
  			}
  	}

var mouse = new mousemod.Mouse(mouse_device.mouse_device());
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

	for(var i in brews) {
		if(development){
		  console.log("sending: "+ brews[i]);
		}
		client.emit("message",brews[i]);
	}
});

happenen = Date.now();

monitor_mouse();
console.log("http server listening on port: "+http_port);

