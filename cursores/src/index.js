const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path'); //mi ruta 

// intializations
const app = express();
const server = http.createServer(app); //servidor amb express
const io = socketIO(server); //conn dels sockets

// settings
app.set('port', process.env.PORT || 3000);

// sockets
require('./sockets')(io);

// static files
app.use(express.static(path.join(__dirname, 'public')));
console.log(__dirname)
// starting the server
server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});