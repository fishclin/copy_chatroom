var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var user_count = 0;

var onlineList_Text = ""; 

// = '{"username": "Guest-Test", "userColor": "yellow" }';

/*var onlineList_Text = 
'{"username": "jack", "userColor": "blue" },' +
'{"username": "merry", "userColor": "yellow" },' +
'{"username": "Michael", "userColor": "orange" },' +
'{"username": "jane", "userColor": "red"}';
*/

//當新的使用者連接進來的時候
io.on('connection', function(socket){

		
	//監聽新user登入
	socket.on('add user',function(msg){
		
		user_count++;//增加使用者數量
		socket.username = msg.username;//儲存使用者名稱
		
		console.log("new user:"+msg.username+" 登入. user_count= "+user_count);

		if(user_count == 1) 
		{//增加第一個人的 onlineList_Text 格式(前面不用逗號)
			onlineList_Text = '{"username":"'+ msg.username +'","userColor":"'+ msg.userColor +'"}';
			console.log("增加第一人 user_count = "+user_count);
			console.log(onlineList_Text);
		}
		else if(user_count > 1)
		{//增加使用者名單(username & userColor)
			onlineList_Text = onlineList_Text + ',{"username":"'+ msg.username +'","userColor":"'+ msg.userColor +'"}';
			console.log("增加一人 user_count= "+user_count);
		}

		//console.log(onlineList_Text);

		var onlineList = JSON.parse('['+onlineList_Text+']'); //轉成JSON格式

		/*列印 JSON 
		var i;
        for(i = 0; i < onlineList.length; i++) 
        {
            console.log("onlineList JSON: i="+i+", "+onlineList[i].username+" "+onlineList[i].userColor);
        }*/


		io.emit('add user',{
			username: socket.username,
			onlineList: onlineList
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
	
	//監聽離開聊天室
	socket.on('disconnect',function(){
		
		if(user_count > 0)
		{
			user_count--; //不允許人數小於0	
		}
		
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

function addUserList(onlineList_Text, username, userColor)
{
	onlineList_Text = onlineList_Text + ' ,{"username":" '+ username +' ", "userColor":" '+ userColor +' "} ';
	return onlineList_Text;
}


