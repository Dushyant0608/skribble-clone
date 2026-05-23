import socket from '../socket.js'

export default function Toolbar({ toolSettings, setToolSettings, canvasRef }) {
    const colors = [
      '#000000', '#ffffff', '#ff4444', '#ff8800',
      '#ffff00', '#00cc00', '#0088ff', '#8800ff',
      '#ff00ff', '#00ffff', '#8B4513', '#888888'
    ]
  
    const handleClear = () => {
      canvasRef.current.clearCanvas()
      socket.emit('canvas_clear')
    }
  
    const handleUndo = () => {
      canvasRef.current.undoStroke()
      socket.emit('draw_undo')
    }
  
    return (
      <div style={{
        background: '#1A1A1A',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
  
        {/* Colors */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {colors.map(color => (
            <div
              key={color}
              onClick={() => setToolSettings(prev => ({
                ...prev,
                color,
                tool: 'brush'
              }))}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: color,
                cursor: 'pointer',
                border: toolSettings.color === color && toolSettings.tool === 'brush'
                  ? '3px solid #00C896'
                  : '2px solid #444'
              }}
            />
          ))}
        </div>
  
        {/* Brush size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888', fontSize: '13px' }}>Size</span>
          <input
            type="range"
            min="2"
            max="40"
            value={toolSettings.size}
            onChange={e => setToolSettings(prev => ({
              ...prev,
              size: parseInt(e.target.value)
            }))}
          />
          <span style={{ color: '#fff', fontSize: '13px', width: '24px' }}>
            {toolSettings.size}
          </span>
        </div>
  
        {/* Eraser */}
        <button
          onClick={() => setToolSettings(prev => ({ ...prev, tool: 'eraser' }))}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: toolSettings.tool === 'eraser' ? '#00C896' : '#333',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Eraser
        </button>
  
        {/* Undo */}
        <button
          onClick={handleUndo}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#333',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Undo
        </button>
  
        {/* Clear */}
        <button
          onClick={handleClear}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#ff4444',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Clear
        </button>
  
      </div>
    )
  }