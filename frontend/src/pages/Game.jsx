import { useState, useEffect, useRef } from 'react'
import socket from '../socket.js'
import Canvas from '../components/Canvas.jsx'
import Toolbar from '../components/Toolbar.jsx'
import Chat from '../components/Chat.jsx'

export default function Game({ roomData, playerData, setScreen }) {
  const [phase, setPhase] = useState('choosing')
  const [players, setPlayers] = useState([])
  const [drawer, setDrawer] = useState(null)
  const [drawerName, setDrawerName] = useState('')
  const [wordOptions, setWordOptions] = useState([])
  const [wordLength, setWordLength] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [round, setRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(1)
  const [roundEndWord, setRoundEndWord] = useState('')
  const [winner, setWinner] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [messages, setMessages] = useState([])
  const [toolSettings, setToolSettings] = useState({
    color: '#000000',
    size: 6,
    tool: 'brush'
  })

  const canvasRef = useRef(null)
  const isDrawer = playerData?.id === drawer

  useEffect(() => {
    socket.on('round_start', (data) => {
      setDrawer(data.drawerId)
      setDrawerName(data.drawerName)
      setRound(data.round)
      setTotalRounds(data.totalRounds)
      setPhase('choosing')
      setMessages([])
      // clear canvas for new round
      if (canvasRef.current) canvasRef.current.clearCanvas()
    })

    socket.on('word_options', (data) => {
      setWordOptions(data.words)
    })

    socket.on('drawing_started', (data) => {
      setWordLength(data.wordLength)
      setPhase('drawing')
    })

    socket.on('timer_update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    socket.on('players_update', (data) => {
      setPlayers(data.players)
    })

    socket.on('guess_result', (data) => {
      if (data.correct) {
        setMessages(prev => [...prev, {
          type: 'correct',
          text: `${data.playerName} guessed the word! +${data.points}pts`
        }])
      }
    })

    socket.on('chat_message', (data) => {
      setMessages(prev => [...prev, {
        type: 'chat',
        playerName: data.playerName,
        text: data.text
      }])
    })

    socket.on('round_end', (data) => {
      setRoundEndWord(data.word)
      setPlayers(data.scores)
      setPhase('roundEnd')
      if (canvasRef.current) canvasRef.current.clearCanvas()
    })

    socket.on('game_over', (data) => {
      setWinner(data.winner)
      setLeaderboard(data.leaderboard)
      setPhase('gameOver')
    })

    // drawing events for guessers
    socket.on('draw_start', (data) => {
      if (canvasRef.current) canvasRef.current.startStroke(data)
    })

    socket.on('draw_move', (data) => {
      if (canvasRef.current) canvasRef.current.continueStroke(data)
    })

    socket.on('draw_end', () => {
      if (canvasRef.current) canvasRef.current.endStroke()
    })

    socket.on('canvas_clear', () => {
      if (canvasRef.current) canvasRef.current.clearCanvas()
    })

    socket.on('draw_undo', () => {
      if (canvasRef.current) canvasRef.current.undoStroke()
    })

    return () => {
      socket.off('round_start')
      socket.off('word_options')
      socket.off('drawing_started')
      socket.off('timer_update')
      socket.off('players_update')
      socket.off('guess_result')
      socket.off('chat_message')
      socket.off('round_end')
      socket.off('game_over')
      socket.off('draw_start')
      socket.off('draw_move')
      socket.off('draw_end')
      socket.off('canvas_clear')
      socket.off('draw_undo')
    }
  }, [])

  const handleWordChoice = (word) => {
    socket.emit('word_chosen', { word })
  }

  const renderChoosing = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {isDrawer ? (
        <>
          <h2 style={{ color: '#fff' }}>Choose a word to draw</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            {wordOptions.map(word => (
              <button
                key={word}
                onClick={() => handleWordChoice(word)}
                style={{
                  padding: '16px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#00C896',
                  color: '#fff',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                {word}
              </button>
            ))}
          </div>
        </>
      ) : (
        <h2 style={{ color: '#888' }}>
          {drawerName} is choosing a word...
        </h2>
      )}
    </div>
  )

  const renderDrawing = () => (
    <div style={{ display: 'flex', gap: '16px', height: '100%' }}>

      {/* Left — Player list */}
      <div style={{
        width: '160px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {players.map(p => (
          <div key={p.id} style={{
            background: p.id === drawer ? '#00C89622' : '#1A1A1A',
            border: p.id === drawer ? '1px solid #00C896' : '1px solid transparent',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#fff', margin: 0, fontSize: '14px' }}>{p.name}</p>
            <p style={{ color: '#00C896', margin: 0, fontSize: '12px' }}>{p.score} pts</p>
          </div>
        ))}
      </div>

      {/* Center — Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1A1A1A',
          padding: '10px 16px',
          borderRadius: '8px'
        }}>
          <span style={{ color: '#888' }}>
            Round {round} / {totalRounds}
          </span>
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            {timeLeft}s
          </span>
          <span style={{ color: '#888' }}>
            {isDrawer
              ? 'You are drawing'
              : '_ '.repeat(wordLength).trim()
            }
          </span>
        </div>

        <Canvas
          ref={canvasRef}
          isDrawer={isDrawer}
          toolSettings={toolSettings}
        />

        {isDrawer && (
          <Toolbar
            toolSettings={toolSettings}
            setToolSettings={setToolSettings}
            canvasRef={canvasRef}
          />
        )}
      </div>

      {/* Right — Chat */}
      <div style={{ width: '220px' }}>
        <Chat
          messages={messages}
          isDrawer={isDrawer}
          wordLength={wordLength}
        />
      </div>

    </div>
  )

  const renderRoundEnd = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '20px'
    }}>
      <h2 style={{ color: '#fff' }}>Round Over!</h2>
      <p style={{ color: '#888', fontSize: '18px' }}>
        The word was{' '}
        <span style={{ color: '#00C896', fontWeight: 'bold' }}>
          {roundEndWord}
        </span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
        {players.map((p, i) => (
          <div key={p.id} style={{
            background: '#1A1A1A',
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#fff' }}>{i + 1}. {p.name}</span>
            <span style={{ color: '#00C896' }}>{p.score} pts</span>
          </div>
        ))}
      </div>
      <p style={{ color: '#555' }}>Next round starting soon...</p>
    </div>
  )

  const renderGameOver = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '20px'
    }}>
      <h1 style={{ color: '#00C896' }}>Game Over!</h1>
      {winner && (
        <p style={{ color: '#fff', fontSize: '20px' }}>
          🏆 {winner.name} wins!
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
        {leaderboard.map((p, i) => (
          <div key={p.id} style={{
            background: '#1A1A1A',
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: i === 0 ? '#00C896' : '#fff' }}>
              {i + 1}. {p.name}
            </span>
            <span style={{ color: '#00C896' }}>{p.score} pts</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setScreen('home')}
        style={{
          padding: '12px 32px',
          borderRadius: '8px',
          border: 'none',
          background: '#00C896',
          color: '#fff',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Play Again
      </button>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111111',
      padding: '16px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      {phase === 'choosing' && renderChoosing()}
      {phase === 'drawing' && renderDrawing()}
      {phase === 'roundEnd' && renderRoundEnd()}
      {phase === 'gameOver' && renderGameOver()}
    </div>
  )
}