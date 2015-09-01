


var socket = io(window.location.origin);

socket.on('connect', function () {
    console.log('I have made a persistent two-way connection to the server!');
});

whiteboard.on("draw", function(start, end, color){
	console.log(start, end, color);
	socket.emit('draw', {start: start, end: end, color: color});
});

socket.on('serverDraw', function(data){

	console.log(data)

	whiteboard.draw(data.start, data.end, data.color)
})



