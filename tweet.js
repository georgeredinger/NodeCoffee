// Tweet
var util = require('util'),
exec = require('child_process').exec,
child;

tweet = function() {
child = exec('./notify.sh', function (error, stdout, stderr) {
							 console.log('stdout: ' + stdout);
							 console.log('stderr: ' + stderr);
							 if (error !== null) {
								 console.log('exec error: ' + error);
							 }
						 });
}

exports.tweet = tweet;
