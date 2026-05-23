import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import socket from '../socket.js'

const Canvas = forwardRef(({ isDrawer, toolSettings }, ref) => {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const currentStroke = useRef([])
  const allStrokes = useRef([])

  useImperativeHandle(ref, () => ({
    clearCanvas() {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      allStrokes.current = []
    },

    startStroke(data) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.moveTo(data.x, data.y)
      ctx.strokeStyle = data.color
      ctx.lineWidth = data.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    },

    continueStroke(data) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.lineTo(data.x, data.y)
      ctx.stroke()
    },

    endStroke() {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.closePath()
      allStrokes.current.push([...currentStroke.current])
      currentStroke.current = []
    },

    undoStroke() {
      allStrokes.current.pop()
      redrawAll()
    }
  }))

  const redrawAll = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    allStrokes.current.forEach(stroke => {
      if (stroke.length === 0) return
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      ctx.strokeStyle = stroke[0].color
      ctx.lineWidth = stroke[0].size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      stroke.forEach(point => {
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      })
      ctx.closePath()
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const getPos = (e) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
}

    const onMouseDown = (e) => {
      if (!isDrawer) return
      isDrawing.current = true
      const pos = getPos(e)
      const data = {
        x: pos.x,
        y: pos.y,
        color: toolSettings.tool === 'eraser' ? '#111111' : toolSettings.color,
        size: toolSettings.size
      }
      currentStroke.current = [data]

      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.strokeStyle = data.color
      ctx.lineWidth = data.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      socket.emit('draw_start', data)
    }

    const onMouseMove = (e) => {
      if (!isDrawing.current || !isDrawer) return
      const pos = getPos(e)
      const data = { x: pos.x, y: pos.y }
      currentStroke.current.push({
        ...data,
        color: toolSettings.tool === 'eraser' ? '#111111' : toolSettings.color,
        size: toolSettings.size
      })

      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()

      socket.emit('draw_move', data)
    }

    const onMouseUp = () => {
      if (!isDrawing.current || !isDrawer) return
      isDrawing.current = false
      ctx.closePath()
      allStrokes.current.push([...currentStroke.current])
      currentStroke.current = []
      socket.emit('draw_end')
    }

    const onMouseLeave = () => {
      if (isDrawing.current) onMouseUp()
    }

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('mouseleave', onMouseLeave)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [isDrawer, toolSettings])

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={500}
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        cursor: isDrawer ? 'crosshair' : 'default',
        display: 'block'
      }}
    />
  )
})

Canvas.displayName = 'Canvas'
export default Canvas