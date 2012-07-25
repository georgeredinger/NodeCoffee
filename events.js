var events = [
	{
	id: 1,
	name: "Start",
	ts: Date.now()
},
{
	id: 2,
	name: "Eney",
	ts: Date.now()
},
{
	id: 3,
	name: "Meney",
	ts: Date.now()
}
];

module.exports.all = events;

module.exports.recent = function(){
	var finish = events.length + 1;
	var start = finish-10;
	if(start < 0){
		start=0;
	}
	return events.slice(start,finish);
}


module.exports.new = function(){
	return{
		name: '',
		ts:Date.now() 
	};
}

module.exports.insert = function(message){
	var new_id = events.length + 1;
	events.push({id:new_id, ts:Date.now(),name:message});
	console.log("inserted:" + events[events.length-1].id+":"+events[events.length-1].ts+":"+events[events.length-1].name);
	return new_id;
}

