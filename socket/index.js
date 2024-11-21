const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.on('chat message', (msg) => {
    console.log('Mensaje recibido: ' + msg);
    io.emit('chat message', msg); //x tots
  });
  socket.broadcast.emit('hi'); 
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
