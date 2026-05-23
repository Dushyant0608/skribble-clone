import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager.js';
import { create } from 'domain';

const app = express();
app.use(cors());
app.get('/' , (req,res)=>{
    res.send("Server is up and running")
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {origin: '*', methods:['GET','POST']}
});

const gameManager = new GameManager(io);

io.on('connection', (socket) => {
    console.log('connected:', socket.id)
  
    socket.on('create_room', (data) => gameManager.createRoom(socket, data))
    socket.on('join_room', (data) => gameManager.joinRoom(socket, data))
    socket.on('start_game', () => gameManager.startGame(socket))
    socket.on('word_chosen', (data) => gameManager.wordChosen(socket, data))
    socket.on('draw_start', (data) => gameManager.handleDraw(socket, 'draw_start', data))
    socket.on('draw_move', (data) => gameManager.handleDraw(socket, 'draw_move', data))
    socket.on('draw_end', () => gameManager.handleDraw(socket, 'draw_end', {}))
    socket.on('canvas_clear', () => gameManager.handleDraw(socket, 'canvas_clear', {}))
    socket.on('draw_undo', () => gameManager.handleDraw(socket, 'draw_undo', {}))
    socket.on('guess', (data) => gameManager.handleGuess(socket, data))
    socket.on('chat', (data) => gameManager.handleChat(socket, data))
    socket.on('disconnect', () => gameManager.handleDisconnect(socket))
  })
  
  httpServer.listen(3001, () => console.log('Server on port 3001'))