var events = [
	{
  	id: 1,
  	ts: Date.now(),
  	delta: 0,
  },
];

module.exports.all = events;

module.exports.recent = function(){
  if(events.length > 10000){
		events=events.slice(-5000);
	}
	return events.slice(-500);
}

module.exports.new = function(){
	return{
		delta: 0,
		ts:Date.now().getTime() 
	};
}

module.exports.insert = function(io,message){
	var new_id = events.length + 1;
	events.push({id:new_id, ts:message[0],delta:message[1]});
	console.log("inserted:" + events[events.length-1].id+":"+events[events.length-1].ts+":"+events[events.length-1].delta);
	if(io) {
  	io.sockets.emit("message",message);
		console.log("emiting: "+ message);
	}
	return new_id;
}

