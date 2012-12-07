var http = require('http'),
sys  = require('util'),
fs   = require('fs'),
io = require('socket.io'),
events = require('./events'),
mousemod    = require('./mouse');
//var http_port = 0xCAFE;
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
var startLDown=0.0;
var startMDown=0.0;
var startRDown=0.0;


if(process.env.input !=''){
	input_device=process.env.input;
} else {
	if(process.argv.length != 3) {
		console.log("supply input device name");
		console.log("eg, node "+process.argv[1]+ "event13");
		exit(0);
	} else {
		input_device=process.argv[2];
	}
}
console.log("readng events from "+input_device);

var server = http.createServer(function(request, response) {
	response.writeHead(200, {
		'Content-Type': 'text/html'
	});
	var rs = fs.createReadStream(__dirname + '/index.html');
	sys.pump(rs, response);
});
server.listen(http_port);

var socket = io.listen(server);


socket.on('connection',function(client) {
	console.log('connected to client');
	client.emit("message","Drink Coffee");
	m=events.recent();

	for(var i in m) {
		client.emit("message",m[i].name+":"+m[i].ts);
		console.log("Sending history:"+m[i].name+":"+m[i].ts);
	}

	function handle_timeout() {
		if(heating) {
			if((Date.now()-happenen) > warming_interval) {
				if(!brewing) {
					brewing=true;
				  console.log("brewing :"+Date());
				  client.emit("message","brewing :"+Date());
				}
			}
		}
		if(!heating) {
			if((Date.now()-happenen) > warming_interval) {
 			  console.log("off:"+Date());
				events.insert("off:"+Date());
				client.emit("message","off:"+Date());
			}
		}
		if(brew_last != 0.0) {
			console.log("last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
			events.insert("message","last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
			client.emit("message","last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
		}
		startTimeout(handle_timeout, 1000);
	}

	function startTimeout() {
		setTimeout(handle_timeout, 1000);
	}

	function err(e) {
		console.log("error " + e);
	}

	function lel(e){
		var delta=0.0;
    happenen = Date.now();
		console.log("left " + e.state + ' ' + e.time);
		if(e.state == 'D'){
			startLDown = e.time;
			heating=true;
			client.emit("message","on :"+Date());
		} else {
			deltaT=e.time-startLDown;
			client.emit("message","deltaTL " + deltaT);
			client.emit("message","off :"+Date());
			heating=false;
		  brewing=false;
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
	var mouse = new mousemod.Mouse(7);
	mouse.on('L', lel);
	mouse.on('R', rig);
	mouse.on('M', mid);
	mouse.on('error', err);
	startTimeout();
});

happenen = Date.now();

console.log("http server listening on port: "+http_port);

