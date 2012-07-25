var http = require('http'),
sys  = require('util'),
fs   = require('fs'),
io = require('socket.io');

var  decode   = require('./decoders');

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
brew_time = 5*60*1000,
warming_interval = 4*60*1000,
happenen = Date.now();

if(process.env.input !=''){
	input_device="/dev/input/"+process.env.input;
}else{
	if(process.argv.length != 3) {
		console.log("supply input device name");
		console.log("eg, node "+process.argv[1]+ "event13");
		exit(0);
	}else{
		input_device="/dev/input/"+process.argv[2];
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

	function handle_timeout() {
		if(!heating) {
			if((Date.now()-happenen) < warming_interval) {
				console.log("on :"+Date());
				client.emit("message","on :"+Date());
			}else {
				console.log("off:"+Date());
				client.emit("message","off:"+Date());
			}
		}
		if(brew_last != 0.0) {
			console.log("last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
			client.emit("message","last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
		}
		startTimeout(handle_timeout, warming_interval);
	}

	function startTimeout(){
		happenen = Date.now();
		setTimeout(handle_timeout, warming_interval);
	}


	fs.open(input_device, "r", function (err, fd) {
		if (err) throw err;
		var buffer = new Buffer(24),
		heating = false,
		mouse_event = {};

		function startRead() {
			fs.read(fd, buffer, 0, 24, null, function (err, bytesRead) {
				if (err) throw err;

				mouse_event = decode.mouse_event(buffer);
				if(mouse_event.button == 'R'){
					happenen=Date.now();
					if(mouse_event.state == 'D') {
						client.emit("message","het:"+Date());
						console.log("het:"+Date());
						dn_stamp = mouse_event.time;
						console.log("per:"+Date()+"#"+(dn_stamp - dn_last));
						client.emit("message","per:"+Date()+"#"+(dn_stamp - dn_last));
						dn_last = dn_stamp;
						heating=true;
					} 
					if(mouse_event.state == 'U'){
						up_stamp = mouse_event.time;
						if((up_stamp - dn_stamp) > brew_time){
							console.log("brw:"+Date());
							client.emit("message","brw:"+Date());
							brew_last = Date.now();
						}
						console.log("dur:"+ Date()+"#" + (up_stamp-dn_stamp));
						client.emit("message","dur:"+ Date()+"#" + (up_stamp-dn_stamp));
						up_last = up_stamp;
						heating=false;
					}
				} 	
				startRead();
			});
		}
		startRead();
	});
	startTimeout();
});

console.log("http server listening on port: "+http_port);

