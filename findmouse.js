// get the event# of the highist numbered mouse device in /proc/bus/input/devices
//cat /proc/bus/input/devices | grep mouse | cut -d " " -f3 | tail -1 | grep -o "[0-9]"
//

dev = function() {
  var fs = require('fs');
  var array = fs.readFileSync('/proc/bus/input/devices').toString().split("\n");
	var matches; 
  var digits;
	var max=0;

  for(i in array) {
		if(array[i].indexOf('mouse') > -1) {
      digits = parseInt((array[i].match(/event(\d+)/))[1]);
			if(digits > max) {
			   max=digits;
			}	 
		}
  }
	return(max);
};

exports.mouse_device = dev;
