const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const request = require('request');
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require('fs');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'],
  },
  allowEIO3: true
});
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('index/index.html', {
    root: __dirname
  });
});

server.listen(PORT, () => {
  console.log(`LISTENING ON POR : ${PORT}`);
});


const sessions_users = [];
var IdUser = 0;



io.on('connection', (socket) => {


    socket.broadcast.emit('daftar users',sessions_users);
    io.emit('daftar user',sessions_users);
    socket.emit('daftar_user',sessions_users);



   socket.on('create-session', function(data) {
    console.log('Create session: ' + data);

    const sessionIndexLocals = sessions_users.findIndex(sess => sess.username == data);
    if (!sessions_users[sessionIndexLocals]) {
      createdsessions(data,socket.id);
      socket.username = data;
      socket.emit('login',{users:data,id:socket.id});
      socket.broadcast.emit('user join',{users : data , id : socket.id});
      console.log(`User ${data} Joined`);
    usersaktif(io)

    }else{
    sessions_users[sessionIndexLocals].ready = true;
    socket.username = data;
    socket.emit('login',{users:data,id:socket.id});
    socket.broadcast.emit('user join',{users : data , id : socket.id});
    console.log(`User ${data} Joined Again`);
  usersaktif(io)

  }

  });


socket.on('message',(msg,to)=>{
  console.log(msg);
  console.log('pesan'+to);
  const clientLocalSes = sessions_users.find(sess => sess.username == socket.username);
  const ToDataLocalSes = sessions_users.find(sess => sess.idS == to);
if(ToDataLocalSes.username != undefined || ToDataLocalSes.username != "" ){


  socket.broadcast.emit('pesan',{
    'username' : socket.username,
    'value' : msg ,
     "id" : to,
     "from" : clientLocalSes.idS,
     "nameto" : ToDataLocalSes.username
});
request.post('https://pertamalab.com/adminchat/api/savemsg.php').form(
  {
    username:socket.username,
    value:msg,
    id_penerima:to,
    from_chat:clientLocalSes.idS,
    nama_penerima : ToDataLocalSes.username,
    type : "text",
    caption :""
  },function(err,res,json){
    if(err){
      console.log("API POST FAILED");
    }else{
      console.log(json);
    }
  });
}
})


socket.on('send_img', (msg,to,caption) => {
  console.log('received base64 file from' + to);
  const clientLocalSes = sessions_users.find(sess => sess.username == socket.username);
  const ToDataLocalSes = sessions_users.find(sess => sess.idS == to);
  if(ToDataLocalSes.username != undefined || ToDataLocalSes.username != "" ){
  socket.broadcast.emit('pesan_img',
      {
        "username": socket.username,
        "base64": msg,
        "caption": caption,
        "id" : to ,
        "from" : clientLocalSes.idS,
        "nameto" : ToDataLocalSes.username
      }

  );

  request.post('https://pertamalab.com/adminchat/api/savemsg.php').form(
    {
      username:socket.username,
      value:msg,
      id_penerima:to,
      from_chat:clientLocalSes.idS,
      nama_penerima : ToDataLocalSes.username,
      type: "image",
      caption:caption
    },function(err,res,json){
      if(err){
        console.log("API POST FAILED");
      }else{
        console.log(json);
      }
    });
}
});



  socket.on('disconnect', (reason)=>{
    var connectionMessage = socket.username + " Disconnected from Socket " + socket.id;
    console.log(connectionMessage);


    const clientLocal = sessions_users.find(sess => sess.username == socket.username);
    const sessionIndexLocal = sessions_users.findIndex(sess => sess.username == socket.username);

    if(socket.username !== undefined){
    sessions_users[sessionIndexLocal].ready = false;
    socket.broadcast.emit('user left',{username : clientLocal.username, id : clientLocal.id});
    usersaktif(io)
    }

  });



});

const usersaktif = function(io){
  const dataAktif = [];
  for (var i = 0; i < sessions_users.length; i++) {
    const data = sessions_users[i];
    if (data.ready === true) {
    dataAktif.push(
      {data}
    );
    }
io.emit('list on',dataAktif);

  }


}


const init = function(socket) {
  if (sessions_users.length > 0) {
    if (socket) {
      socket.emit('daftar users',sessions_users);
    } else {
      savedSessions.forEach(sess => {
        createdsessions(sess.username, sess.idS);
      });
    }
  }
}



const createdsessions = function (username,id){
  const sessionIndex = sessions_users.findIndex(sess => sess.username == username);
  if (sessionIndex == -1) {
  sessions_users.push({
    username: username,
    id : IdUser ++ ,
    description: 'user',
    idS : id ,
    ready : true,
});
  }
}

init();
