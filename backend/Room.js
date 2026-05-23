import { getRandomWords } from './word.js'

export class Room {
  constructor(id, host, settings, io) {
    this.id = id
    this.host = host
    this.settings = {
      rounds: settings.rounds || 3,
      drawTime: settings.drawTime || 60,
      wordCount: settings.wordCount || 3
    }
    this.io = io
    this.players = []
    this.status = 'waiting'
    this.currentRound = 0
    this.currentDrawer = null
    this.currentWord = null
    this.drawerOrder = []
    this.timer = null
    this.strokes = []
    this.guessedPlayers = new Set()
  }

  addPlayer(id, name) {
    this.players.push({ id, name, score: 0 })
    this.broadcastPlayers()
  }

  removePlayer(id) {
    this.players = this.players.filter(p => p.id !== id)
    
    if (this.status === 'playing' && this.currentDrawer === id) {
      this.endRound(true)
    }
    
    this.broadcastPlayers()
  }

  startGame() {
    this.status = 'playing'
    this.currentRound = 0
    this.drawerOrder = this.players.map(p => p.id)
    this.startRound()
  }

  startRound() {
    this.currentRound++
    this.strokes = []
    this.guessedPlayers = new Set()
    this.currentWord = null

    // figure out who draws this round
    const drawerIndex = (this.currentRound - 1) % this.drawerOrder.length
    this.currentDrawer = this.drawerOrder[drawerIndex]

    console.log('startRound called, round:', this.currentRound)
  console.log('drawer:', this.currentDrawer)
  console.log('room id:', this.id)
  console.log('players in room:', this.players)

    const wordOptions = getRandomWords(this.settings.wordCount)

    // tell everyone a new round started
    this.io.to(this.id).emit('round_start', {
      round: this.currentRound,
      totalRounds: this.settings.rounds * this.drawerOrder.length,
      drawerId: this.currentDrawer,
      drawerName: this.players.find(p => p.id === this.currentDrawer)?.name,
      drawTime: this.settings.drawTime
    })

    // send word choices ONLY to drawer
    this.io.to(this.currentDrawer).emit('word_options', { words: wordOptions })
  }

  wordChosen(word) {
    this.currentWord = word

    this.io.to(this.id).emit('drawing_started', {
      drawerId: this.currentDrawer,
      wordLength: word.length
    })

    this.startTimer()
  }

  startTimer() {
    let timeLeft = this.settings.drawTime

    this.io.to(this.id).emit('timer_update', { timeLeft })

    this.timer = setInterval(() => {
      timeLeft--
      this.io.to(this.id).emit('timer_update', { timeLeft })

      if (timeLeft <= 0) {
        this.endRound(false)
      }
    }, 1000)
  }

  checkGuess(playerId, text) {
    if (playerId === this.currentDrawer) return
    if (this.guessedPlayers.has(playerId)) return
    if (!this.currentWord) return

    const isCorrect = text.trim().toLowerCase() === this.currentWord.toLowerCase()

    if (isCorrect) {
      this.guessedPlayers.add(playerId)
      
      // more time left = more points
      const points = 100
      const player = this.players.find(p => p.id === playerId)
      player.score += points

      // also give drawer points per correct guess
      const drawer = this.players.find(p => p.id === this.currentDrawer)
      drawer.score += 50

      this.io.to(this.id).emit('guess_result', {
        correct: true,
        playerId,
        playerName: player.name,
        points
      })

      // everyone guessed → end round early
      const nonDrawers = this.players.filter(p => p.id !== this.currentDrawer)
      if (this.guessedPlayers.size === nonDrawers.length) {
        this.endRound(false)
      }
    } else {
      // wrong guess — only tell this player
      this.io.to(playerId).emit('guess_result', { correct: false })
      
      // broadcast as chat so others see the attempt
      this.io.to(this.id).emit('chat_message', {
        playerName: this.players.find(p => p.id === playerId)?.name,
        text
      })
    }
  }

  endRound(drawerLeft) {
    clearInterval(this.timer)
    this.timer = null

    this.io.to(this.id).emit('round_end', {
      word: this.currentWord,
      scores: this.players.map(p => ({ id: p.id, name: p.name, score: p.score })),
      drawerLeft
    })

    const totalRounds = this.settings.rounds * this.drawerOrder.length
    
    if (this.currentRound >= totalRounds) {
      setTimeout(() => this.endGame(), 3000)
    } else {
      setTimeout(() => this.startRound(), 3000)
    }
  }

  endGame() {
    this.status = 'ended'
    const sorted = [...this.players].sort((a, b) => b.score - a.score)
    
    this.io.to(this.id).emit('game_over', {
      winner: sorted[0],
      leaderboard: sorted
    })
  }

  broadcastPlayers() {
    this.io.to(this.id).emit('players_update', {
      players: this.players,
      host: this.host
    })
  }
}