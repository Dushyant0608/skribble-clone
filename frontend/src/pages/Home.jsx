import { useState, useEffect } from 'react'
import socket from '../socket.js'

export default function Home({ setScreen, setRoomData, setPlayerData }) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    socket.on('room_created', (data) => {
      setPlayerData({ id: data.playerId, name: playerName })
      setRoomData({ roomId: data.roomId, isHost: true })
      setScreen('lobby')
    })

    socket.on('room_joined', (data) => {
      setPlayerData({ id: data.playerId, name: playerName })
      setRoomData({
        roomId: data.roomId,
        isHost: false,
        players: data.players,
        host: data.host,
        settings: data.settings
      })
      setScreen('lobby')
    })

    socket.on('error', (data) => {
      setError(data.message)
      setLoading(false)
    })

    return () => {
      socket.off('room_created')
      socket.off('room_joined')
      socket.off('error')
    }
  }, [playerName])

  const handleCreate = () => {
    if (!playerName.trim()) return setError('Enter your name')
    setLoading(true)
    setError('')
    socket.connect()
    socket.emit('create_room', {
      playerName: playerName.trim(),
      settings: { rounds: 3, drawTime: 60, wordCount: 3 }
    })
  }

  const handleJoin = () => {
    if (!playerName.trim()) return setError('Enter your name')
    if (!roomCode.trim()) return setError('Enter room code')
    setLoading(true)
    setError('')
    socket.connect()
    socket.emit('join_room', {
      playerName: playerName.trim(),
      roomId: roomCode.trim().toUpperCase()
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1A1A1A',
        padding: '40px',
        borderRadius: '12px',
        width: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h1 style={{ color: '#00C896', margin: 0, textAlign: 'center' }}>
          skribbl clone
        </h1>

        <input
          placeholder="Your name"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          style={inputStyle}
        />

        {!joining ? (
          <>
            <button onClick={handleCreate} disabled={loading} style={btnStyle('#00C896')}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
            <button onClick={() => setJoining(true)} style={btnStyle('#333')}>
              Join Room
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Room code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              style={inputStyle}
            />
            <button onClick={handleJoin} disabled={loading} style={btnStyle('#00C896')}>
              {loading ? 'Joining...' : 'Join'}
            </button>
            <button onClick={() => setJoining(false)} style={btnStyle('#333')}>
              Back
            </button>
          </>
        )}

        {error && (
          <p style={{ color: '#ff4444', margin: 0, textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #333',
  background: '#111',
  color: '#fff',
  fontSize: '16px',
  outline: 'none'
}

const btnStyle = (bg) => ({
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  background: bg,
  color: '#fff',
  fontSize: '16px',
  cursor: 'pointer'
})