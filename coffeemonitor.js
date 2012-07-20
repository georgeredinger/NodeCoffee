var http = require('http'),
  sys  = require('util'),
  fs   = require('fs'),
  ws   = require('ws');

//var http_port = 0xCAFE;
var http_port = 4000;
var mouse_device = "/dev/input/event11";
var heat_start = 0;
var heat_duration = 0;


function zfill(num, len) {return (Array(len).join("0") + num).slice(-len);}


http.createServer(function(request, response) {
	response.writeHead(200, {
		'Content-Type': 'text/html'
	});
	var rs = fs.createReadStream(__dirname + '/index.html');
	sys.pump(rs, response);
}).listen(http_port);

fs.open(mouse_device, "r", function (err, fd) {
	if (err) throw err;
	var buffer = new Buffer(24),
	    heating = false;

	function startRead() {
		fs.read(fd, buffer, 0, 24, null, function (err, bytesRead) {
			if (err) throw err;
		var useconds = 0.0,
			 seconds = 0.0,
			 type = 0.0,
       code = 0.0,
       value =0.0,
			 data = '';			 

			seconds = buffer[3]
			seconds += seconds * 255+buffer[2]
			seconds += seconds * 255+buffer[1]
			seconds += seconds * 255+buffer[0]

      useconds = buffer[7]
			useconds += useconds * 255+buffer[6]
			useconds += useconds * 255+buffer[5]
			useconds += useconds * 255+buffer[4]

			type = buffer[9];
			type = type + buffer[10];

			code = buffer[12];
			code = code + buffer[11];

			value = buffer[14];
			value = value + buffer[13];

			data = seconds+':'+zfill(useconds,6)+':'+ zfill(type.toString(2),16)+':'+zfill(code.toString(2),16)+":"+zfill(value.toString(2),16);

			if(!(type == 0 || type == 1)) {
				if(type == 0x10){
					if(code == 0x2) {
//						console.log("left dn --> ");
					} 
					if(code == 0x1){
//						console.log("left up --> ");
					}
				}
				if(type == 0x12){
					if(code == 0x2) {
//						console.log("midd dn --> ");
					} 
					if(code == 0x1){
//						console.log("midd up --> ");
					}
				} 	
				if(type == 0x11){
					if(code == 0x2) {
						heating = true;
            heat_start = process.uptime();
						console.log("heating...");
					} 
					if(code == 0x1){
						heating = false;
						heat_duration = process.uptime() - heat_start;
						if(heat_duration < 20.0) {
							console.log("warming");
						}   
						if(heat_duration > 25 ){
						  console.log("brew " + heat_duration);
						}
					}
				} 	
			}
			startRead();
		});
	}
	startRead();
});

console.log("http server listening on port: "+http_port);
