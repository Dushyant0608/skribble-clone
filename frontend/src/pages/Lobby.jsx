import { useState, useEffect } from 'react'
import socket from '../socket.js'

export default function Lobby({ roomData, playerData, setScreen, setRoomData }) {
  const [players, setPlayers] = useState(roomData?.players || [])
  const [host, setHost] = useState(roomData?.host || null)
  const [error, setError] = useState('')

  useEffect(() => {
    socket.on('players_update', (data) => {
      setPlayers(data.players)
      setHost(data.host)
    })

    socket.on('round_start', (data) => {
      setRoomData(prev => ({ ...prev, roundData: data }))
      setScreen('game')
    })

    socket.on('host_changed', (data) => {
      setHost(data.newHost)
    })

    socket.on('error', (data) => {
      setError(data.message)
    })

    return () => {
      socket.off('players_update')
      socket.off('round_start')
      socket.off('host_changed')
      socket.off('error')
    }
  }, [])

  const handleStart = () => {
    socket.emit('start_game')
  }

  const isHost = playerData?.id === host

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
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* Room Code */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#888', margin: '0 0 8px 0' }}>Room Code</p>
          <h2 style={{
            color: '#00C896',
            margin: 0,
            fontSize: '32px',
            letterSpacing: '8px'
          }}>
            {roomData?.roomId}
          </h2>
          <p style={{ color: '#555', fontSize: '13px', margin: '8px 0 0 0' }}>
            Share this code with friends
          </p>
        </div>

        {/* Player List */}
        <div>
          <p style={{ color: '#888', margin: '0 0 12px 0' }}>
            Players ({players.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {players.map(player => (
              <div key={player.id} style={{
                background: '#111',
                padding: '12px 16px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#fff' }}>{player.name}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {player.id === host && (
                    <span style={{
                      color: '#00C896',
                      fontSize: '12px',
                      background: '#00C89622',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      host
                    </span>
                  )}
                  {player.id === playerData?.id && (
                    <span style={{
                      color: '#888',
                      fontSize: '12px'
                    }}>
                      (you)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#ff4444', margin: 0, textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Action */}
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={players.length < 2}
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: players.length < 2 ? '#333' : '#00C896',
              color: players.length < 2 ? '#666' : '#fff',
              fontSize: '16px',
              cursor: players.length < 2 ? 'not-allowed' : 'pointer'
            }}
          >
            {players.length < 2 ? 'Waiting for players...' : 'Start Game'}
          </button>
        ) : (
          <p style={{ color: '#888', textAlign: 'center', margin: 0 }}>
            Waiting for host to start...
          </p>
        )}

      </div>
    </div>
  )
}