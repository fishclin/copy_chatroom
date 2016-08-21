var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var user_count = 0;

//var onlineList_Text = ""; //此為登入登出要共同維護的名單

var onlineList_JSON=[]; //此為登入登出要共同維護的名單

//當新的使用者連接進來的時候
io.on('connection', function(socket){

		
	//監聽新user登入
	socket.on('add user',function(msg){
		
		user_count++;//增加使用者數量
		socket.username = msg.username;//儲存使用者名稱
		
		console.log("new user:"+msg.username+" 登入. user_count= "+user_count);

		addUsernameToList( msg.username, msg.userColor); //登入者加入名單

		io.emit('update onlineList',{
			onlineList: onlineList_JSON
		});

		console.log("onlineList_JSON= "+onlineList_JSON);
		console.log("onlineList= "+onlineList_JSON+"\n");

		io.emit('add user',{
			username: socket.username,
		});
		
	});

	//監聽新訊息事件
	socket.on('chat message', function(msg){

		console.log(socket.username+":"+msg.text+", userColor:"+msg.userColor);

  		//發佈新訊息
		io.emit('chat message', {
			username:socket.username,
			msg:msg.text,
			userColor:msg.userColor
		});
	});

	//監聽private私訊
	socket.on('private message', function(msg){

		console.log(socket.username+":"+msg.text+", userColor:"+msg.userColor);

		//以個人名字為端口，發送private message
		io.emit( msg.privateName , {
			username:socket.username,
			msg:msg.text,
			userColor:"black"
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
	
	//監聽private對象正在打字
	socket.on('user is typing for private', function(msg){

		console.log(socket.username+" is typing for private: "+msg.privateName);

  		//發佈新訊息給私訊對象
		io.emit( msg.privateName, {

			username:socket.username,
			msg:socket.username+"正在打字",
			userColor:"black"

		});
	});

	//監聽離開聊天室
	socket.on('disconnect',function(){
		
		if(user_count > 0)
		{
			user_count--; //不允許人數小於0
			removeUsernameFromList( socket.username, socket.userColor );
			console.log("已減少一人: "+socket.username);
		}		

		//通知client有人離開訊息
		io.emit('user left',{
			username:socket.username
		});

		//通知client更新名單
		io.emit('update onlineList',{
			onlineList: onlineList_JSON
		});

		console.log(socket.username+" 離開了. 人數= "+user_count);
	});


});

//指定port
http.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});


function addUsernameToList( username, userColor )
{
	//var onlineList;

	onlineList_JSON.push({username:username, userColor:userColor});//新增一個user
	
	console.log("PUSH結果: "+ JSON.stringify(onlineList_JSON));
	console.log("提取JSON: "+onlineList_JSON[0]);
	console.log("提取JSON: "+onlineList_JSON[0].username);

}

function removeUsernameFromList( username, userColor )
{
	var i;
	var index;

	for( i = 0 ; i< onlineList_JSON.length ; i++ )
	{
		if( onlineList_JSON[i].username == username )
		{
			index = i;			
			console.log("找到 username"+username+", index="+index);
			break;
		}    	
	}
	onlineList_JSON.splice( index, 1 );
	console.log("刪除 Username:"+username+", index="+index);
	printOnlineList_JSON();
}

function printOnlineList_JSON()
{
	console.log("更新後名單");
	for( i = 0 ; i< onlineList_JSON.length ; i++ )
	{
		console.log("{username: "+onlineList_JSON[i].username+", userColor: "+onlineList_JSON[i].userColor+"}");
	}
}
