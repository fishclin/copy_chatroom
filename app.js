var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var user_count = 0;


//當新的使用者連接進來的時候
io.on('connection', function(socket){

		
	//監聽新user登入
	socket.on('add user',function(msg){
		
		user_count++;//增加使用者數量	
		socket.username = msg.username;
		
		console.log("new user:"+msg+" logged. user_count= "+user_count);
		io.emit('add user',{
			username: socket.username,
		});
	});

	//監聽新訊息事件
	socket.on('chat message', function(msg){

		console.log(socket.username+":"+msg.username+", userColor:"+msg.userColor);

  		//發佈新訊息
		io.emit('chat message', {
			username:socket.username,
			msg:msg.text,
			userColor:msg.userColor
		});
	});

	//監聽正在打字
	socket.on('user is typing', function(msg){

		console.log(socket.username+" is typing");

  		//發佈新訊息
		io.emit('user is typing', {
			username:socket.username
		});
	});
	
	////監聽離開聊天室
	socket.on('disconnect',function(){
		user_count--;
		console.log(socket.username+" left. user_count= "+user_count);
		
		//發佈新訊息
		io.emit('user left',{
			username:socket.username
		});
	});


});

//指定port
http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});
