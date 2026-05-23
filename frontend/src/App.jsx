import { useState } from 'react'
import Home from './pages/Home.jsx'
import Lobby from './pages/Lobby.jsx'
import Game from './pages/Game.jsx'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [roomData, setRoomData] = useState(null)
  const [playerData, setPlayerData] = useState(null)

  return (
    <>
      {screen === 'home' && (
        <Home
          setScreen={setScreen}
          setRoomData={setRoomData}
          setPlayerData={setPlayerData}
        />
      )}
      {screen === 'lobby' && (
        <Lobby
          roomData={roomData}
          playerData={playerData}
          setScreen={setScreen}
          setRoomData={setRoomData}
        />
      )}
      {screen === 'game' && (
        <Game
          roomData={roomData}
          playerData={playerData}
          setScreen={setScreen}
        />
      )}
    </>
  )
}