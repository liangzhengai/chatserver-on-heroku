//var WebSocketServer = require("ws").Server
var express         = require("express");
var app             = express();
var server          = require("http").createServer(app);
var io				= require('socket.io')(server);

var clients = {};
var sockets = {};

var port            = process.env.PORT || 5000

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/index.html');
});

//var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

/*
var wss = new WebSocketServer({server : server})
console.log("websocket server created")

wss.on("connection", function (ws) {
    var id = setInterval(function () {
        ws.send(JSON.stringify(new Date()), function () {
        })
    }, 1000)

    ws.on("close", function () {
        console.log("websocket connection close")
        clearInterval(id)
    })
})
*/

io.on('connection', function(socket){
	
	socket.on('join', function(user) {
		console.log("[join] " + JSON.stringify(user));

		if( clients[user.id] == undefined ) {

			user.socket_id = socket.id;
			clients[user.id] = user;
			sockets[socket.id] = {"uid":user.id, "socket":socket};

			io.sockets.emit('join', user);
		}
		else {
			if(clients[user.id].socket_id == socket.id ) {
			}
			else {
				socket.emit('error message', "Already used.");
			}
		}
	});

	socket.on('get users', function(user) {
		console.log("[get users] " + JSON.stringify(user));

		socket.emit("get users", clients);
	});

	socket.on('send message', function(msg){

		console.log("[send message]");
		console.log(msg);

		if( msg.receiver == "@TOALL" ) 
			io.sockets.emit('send message', msg);
		else {
			sockets[clients[msg.receiver.id].socket_id].socket.emit("send message", msg);
		}
	});

	socket.on('quit', function(msg) {

		console.log("[quit]" + msg);
		quit(socket.id);
	});

	socket.on('disconnect', function(msg) {

		console.log("[disconnect]" + msg);
		quit(socket.id);
	});
});

function quit( socket_id ) {

	try{
		var uid = sockets[socket_id].uid;
		
		io.sockets.emit('quit', clients[uid]);

		delete sockets[socket_id];
		delete clients[uid];

	} catch( e ) {
		console.log(e);
	}
}