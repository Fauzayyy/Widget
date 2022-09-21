const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require('fs');
const io = new Server(server, {
  cors: {
    origin: ["http://localhost"],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'],
  },
  allowEIO3: true
});
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

server.listen(PORT, () => {
  console.log(`LISTENING ON POR : ${PORT}`);
});


const sessions_users = [];
var IdUser = 0;

// const SESSIONS_FILE = './users-sessions.json';
// const createSessionsFileIfNotExists = function() {
//   if (!fs.existsSync(SESSIONS_FILE)) {
//     try {
//       fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
//       console.log('Sessions file created successfully.');
//     } catch (err) {
//       console.log('Failed to create sessions file: ', err);
//     }
//   }
// }

// createSessionsFileIfNotExists();

//Save Session File
// const setSessionsFile = function(sessions) {
//   fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions), function(err) {
//     if (err) {
//       console.log(err);
//     }
//   });
// }


//Baca Sessions
// const getSessionsFile = function() {
//   return JSON.parse(fs.readFileSync(SESSIONS_FILE));
// }

io.on('connection', (socket) => {


  // const savedSessions = getSessionsFile();
  // init(socket);

  // console.log(savedSessions.length);
    // send regular messages to all socket.io clients with the current server time


//ADD USERS JOIN

socket.broadcast.emit('daftar users',sessions_users);
io.emit('daftar user',sessions_users);

 



  
  socket.on('create-session', function(data) {
    console.log('Create session: ' + data);
    // const savedSessions = getSessionsFile();
    // const sessionIndex = savedSessions.findIndex(sess => sess.username == data);

    const sessionIndexLocals = sessions_users.findIndex(sess => sess.username == data);
    if (!sessions_users[sessionIndexLocals]) {
      // setSessionsFile(savedSessions);
      createdsessions(data,socket.id);
      socket.username = data;
      socket.emit('login',{users:data,id:socket.id});
      socket.broadcast.emit('user join',{users : data , id : socket.id});
      console.log(`User ${data} Joined`);
    usersaktif(io)

    }else{
    //   console.log(sessionIndex);
    sessions_users[sessionIndexLocals].ready = true;
    // savedSessions[sessionIndex].ready = true;
    socket.username = data;
    socket.emit('login',{users:data,id:socket.id});
    socket.broadcast.emit('user join',{users : data , id : socket.id});
    console.log(`User ${data} Joined Again`);
    // setSessionsFile(savedSessions);
  usersaktif(io)

  }

  });


socket.on('message',(msg,to)=>{
  console.log(msg);
  console.log('pesan'+to);
  // const savedSessions = getSessionsFile();
  // const client = savedSessions.find(sess => sess.username == socket.username);
  // const ToData = savedSessions.find(sess => sess.idS == to);

  const clientLocalSes = sessions_users.find(sess => sess.username == socket.username);
  const ToDataLocalSes = sessions_users.find(sess => sess.idS == to);

  socket.broadcast.emit('pesan',{
    'username' : socket.username,
    'value' : msg ,
     "id" : to,
     "from" : clientLocalSes.idS,
     "nameto" : ToDataLocalSes.username
});


})



  socket.on('disconnect', (reason)=>{
    var connectionMessage = socket.username + " Disconnected from Socket " + socket.id;
    console.log(connectionMessage);
    // const savedSessions = getSessionsFile();
    // const client = savedSessions.find(sess => sess.username == socket.username);
    // const sessionIndex = savedSessions.findIndex(sess => sess.username == socket.username);

    const clientLocal = sessions_users.find(sess => sess.username == socket.username);
    const sessionIndexLocal = sessions_users.findIndex(sess => sess.username == socket.username);

    // console.log(sessionIndex);
    if(socket.username !== undefined){
    // savedSessions[sessionIndex].ready = false;
    // setSessionsFile(savedSessions);

    sessions_users[sessionIndexLocal].ready = false;

    socket.broadcast.emit('user left',{username : clientLocal.username, id : clientLocal.id});
  usersaktif(io)
    }

  });


  

  
  

  // const savedSessions = getSessionsFile();
  // socket.emit('daftar users',savedSessions);

});

const usersaktif = function(io){
  const dataAktif = [];
  // const savedSessions = getSessionsFile();
  for (var i = 0; i < sessions_users.length; i++) {
    const data = sessions_users[i];
    if (data.ready === true) {
    dataAktif.push(
      {data}
    );
    }

    // console.log(dataAktif);
    // send regular messages to all socket.io clients with the current server time
io.emit('list on',dataAktif);
  
  }
  // console.log(dataAktif)

}


const init = function(socket) {
  // const savedSessions = getSessionsFile();
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
  // Menambahkan session ke file
  // const savedSessions = getSessionsFile();
  // const sessionIndex = savedSessions.findIndex(sess => sess.username == username);
  const sessionIndex = sessions_users.findIndex(sess => sess.username == username);
  if (sessionIndex == -1) {
  //   savedSessions.push({
  //     username: username,
  //     id : IdUser ++ ,
  //     description: 'user',
  //     idS : id ,
  //     ready : true,
  // });

  sessions_users.push({
    username: username,
    id : IdUser ++ ,
    description: 'user',
    idS : id ,
    ready : true,
});
  // setSessionsFile(savedSessions);

  }
}

init();
