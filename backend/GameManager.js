import { Room } from './Room.js'

export class GameManager {
  constructor(io) {
    this.io = io
    this.rooms = new Map()
    this.socketToRoom = new Map()
  }

  generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let id = ''
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)]
    }
    // make sure it doesn't clash with existing room
    if (this.rooms.has(id)) return this.generateRoomId()
    return id
  }

  createRoom(socket, data) {
    const { playerName, settings } = data
    const roomId = this.generateRoomId()

    const room = new Room(roomId, socket.id, settings || {}, this.io)
    room.addPlayer(socket.id, playerName)

    this.rooms.set(roomId, room)
    this.socketToRoom.set(socket.id, roomId)

    socket.join(roomId)
    console.log('socket joined room:', socket.id, roomId)
    const rooms = socket.rooms
    console.log('socket.rooms after join:', rooms)

    socket.emit('room_created', {
      roomId,
      playerId: socket.id
    })
  }

  joinRoom(socket, data) {
    const { playerName, roomId } = data
    const room = this.rooms.get(roomId.toUpperCase())

    if (!room) {
      socket.emit('error', { message: 'Room not found' })
      return
    }

    if (room.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' })
      return
    }

    if (room.players.length >= 10) {
      socket.emit('error', { message: 'Room is full' })
      return
    }

    room.addPlayer(socket.id, playerName)
    this.socketToRoom.set(socket.id, roomId.toUpperCase())
    socket.join(roomId.toUpperCase())
    console.log('socket joined room:', socket.id, roomId.toUpperCase())
    console.log('socket.rooms after join:', socket.rooms)

    socket.emit('room_joined', {
      roomId: room.id,
      playerId: socket.id,
      players: room.players,
      host: room.host,
      settings: room.settings
    })
  }

  startGame(socket) {
    const room = this.getRoom(socket)
    if (!room) return

    if (room.host !== socket.id) {
      socket.emit('error', { message: 'Only host can start the game' })
      return
    }

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players' })
      return
    }

    room.startGame()
  }

  wordChosen(socket, data) {
    const room = this.getRoom(socket)
    if (!room) return

    if (room.currentDrawer !== socket.id) return

    room.wordChosen(data.word)
  }

  handleDraw(socket, event, data) {
    const room = this.getRoom(socket)
    if (!room) return

    if (room.currentDrawer !== socket.id) return

    if (event === 'draw_start' || event === 'draw_move') {
      room.strokes.push({ event, ...data })
    }

    if (event === 'canvas_clear') {
      room.strokes = []
    }

    if (event === 'draw_undo') {
      // remove strokes back to last draw_end
      let i = room.strokes.length - 1
      while (i >= 0 && room.strokes[i].event !== 'draw_end') {
        room.strokes.pop()
        i--
      }
      if (room.strokes.length > 0) room.strokes.pop() // remove the draw_end too
    }

    if (event === 'draw_end') {
      room.strokes.push({ event: 'draw_end' })
    }

    // broadcast to everyone else in room
    socket.to(room.id).emit(event, data)
  }

  handleGuess(socket, data) {
    const room = this.getRoom(socket)
    if (!room) return

    room.checkGuess(socket.id, data.text)
  }

  handleChat(socket, data) {
    const room = this.getRoom(socket)
    if (!room) return

    const player = room.players.find(p => p.id === socket.id)
    if (!player) return

    this.io.to(room.id).emit('chat_message', {
      playerName: player.name,
      text: data.text
    })
  }

  handleDisconnect(socket) {
    const roomId = this.socketToRoom.get(socket.id)
    if (!roomId) return

    const room = this.rooms.get(roomId)
    if (!room) return

    room.removePlayer(socket.id)
    this.socketToRoom.delete(socket.id)

    // if room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomId)
      return
    }

    // if host left, assign new host
    if (room.host === socket.id) {
      room.host = room.players[0].id
      this.io.to(roomId).emit('host_changed', { newHost: room.host })
    }
  }

  getRoom(socket) {
    const roomId = this.socketToRoom.get(socket.id)
    if (!roomId) return null
    return this.rooms.get(roomId) || null
  }
}