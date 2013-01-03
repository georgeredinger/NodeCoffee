var events = [
	{
  	id: 1,
  	name: "Start",
  	ts: Date.now()
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
		name: '',
		ts:Date.now() 
	};
}

module.exports.insert = function(io,message){
	var new_id = events.length + 1;
	events.push({id:new_id, ts:Date.now(),name:message});
	console.log("inserted:" + events[events.length-1].id+":"+events[events.length-1].ts+":"+events[events.length-1].name);
	if(io) {
  	io.sockets.emit("message",message);
	}
	return new_id;
}

