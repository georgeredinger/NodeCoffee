function buffer_to_float4(buffer,index) {
  flt = buffer[3+index]
	flt += flt * 255+buffer[index+2]
	flt += flt * 255+buffer[index+1]
	flt += flt * 255+buffer[index]
	return flt;
}

function mouse_event(mouse,buffer) {
	var useconds = 0.0,
	seconds = 0.0,
	type = 0.0,
	code = 0.0,
	button ='',
	state = '';

	seconds = buffer_to_float4(buffer,0);
	useconds = buffer_to_float4(buffer,4);

	type = buffer[9];
	type = type + buffer[10];

	code = buffer[12];
	code = code + buffer[11];


	if(!(type == 0 || type == 1)) {
		if(type == 0x10){
			if(code == 0x2) {
				button='L';
				state='D';
			} 
			if(code == 0x1){
				button='L';
				state='U';
			}
		}
		if(type == 0x12){
			if(code == 0x2) {
				button='M';
				state='D';

			} 
			if(code == 0x1){
				button='M';
				state='U';
			}
		} 	
		if(type == 0x11){
			if(code == 0x2) {
				button='R';
				state='D';
			} 
			if(code == 0x1){
				button='R';
				state='U';
			}
		}
	}
	e = {
		time: seconds+useconds/1000000.0,
		type: button,
		state: state,
	}
  return e;
}
exports.mouse_event = mouse_event;

