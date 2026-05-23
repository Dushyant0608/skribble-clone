import { useState, useEffect, useRef } from 'react'
import socket from '../socket.js'

export default function Chat({ messages, isDrawer, wordLength }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    if (!isDrawer) {
      socket.emit('guess', { text: input.trim() })
    } else {
      socket.emit('chat', { text: input.trim() })
    }
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div style={{
      background: '#1A1A1A',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            padding: '6px 10px',
            borderRadius: '6px',
            background: msg.type === 'correct' ? '#00C89622' : 'transparent',
            borderLeft: msg.type === 'correct' ? '3px solid #00C896' : 'none'
          }}>
            {msg.type === 'correct' ? (
              <span style={{ color: '#00C896', fontSize: '13px' }}>
                ✓ {msg.text}
              </span>
            ) : (
              <span style={{ fontSize: '13px' }}>
                <span style={{ color: '#00C896' }}>{msg.playerName}: </span>
                <span style={{ color: '#ccc' }}>{msg.text}</span>
              </span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px',
        borderTop: '1px solid #333',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isDrawer ? 'Chat...' : 'Guess the word...'}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#00C896',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Send
        </button>
      </div>

    </div>
  )
}