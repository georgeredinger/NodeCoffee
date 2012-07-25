var http = require('http'),
sys  = require('util'),
fs   = require('fs'),
io = require('socket.io');

var  decode   = require('./decoders');

//var http_port = 0xCAFE;
var http_port = 4000;
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
happenen = false;

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
				if(mouse_event.state == 'D') {
					socket.emit("message","het:"+Date());
					console.log("het:"+Date());
					dn_stamp = mouse_event.time;
					console.log("per:"+Date()+"#"+(dn_stamp - dn_last));
					dn_last = dn_stamp;
					happenen=true;
					heating=true;
				} 
				if(mouse_event.state == 'U'){
					up_stamp = mouse_event.time;
					if((up_stamp - dn_stamp) > brew_time){
						console.log("brw:"+Date());
						//      socket.broadcast.send("brw:"+Date());
						brew_last = Date.now();
					}
					console.log("dur:"+ Date()+"#" + (up_stamp-dn_stamp));
					//     socket.broadcast.send("dur:"+ Date()+"#" + (up_stamp-dn_stamp));
					up_last = up_stamp;
					happenen=true;
					heating=false;
				}
			} 	
			startRead();
		});
	}
	startRead();
});

// if nothing happens for 5 minutes, call the coffee pot "off"
function handle_timeout() {
	if(!heating) {
		if(happenen) {
			console.log("on :"+Date());
			//	  socket.broadcast.send("on :"+Date());
		}else {
			console.log("off:"+Date());
			//		  socket.broadcast.send("off:"+Date());
		}
	}
	if(brew_last != 0.0) {
		console.log("last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
		//		  socket.broadcast.send("last brew was "+ (Date.now() - brew_last)/60000 + " Minutes Ago");
	}
	startTimeout(handle_timeout, warming_interval);
}

function startTimeout(){
	happenen = false;
	setTimeout(handle_timeout, warming_interval);
}


socket.on('connection',function(client) {
	console.log('connected to client');
	client.emit("message","welcome to the coffeepot");
	client.emit("message","please drink coffee");
	t=setInterval( function() {
		var n=42;
		client.emit("message", n.toString());
	}, 4000);
});


startTimeout();
console.log("http server listening on port: "+http_port);

