// FILE: src/pages/GameMode.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GameMode.css";

// We no longer need socket.io here

function GameMode() {
  const [mode, setMode] = useState("ai");
  const [difficulty, setDifficulty] = useState("easy");
  const [playerSymbol, setPlayerSymbol] = useState("X");
  const [joinGameId, setJoinGameId] = useState("");
  const navigate = useNavigate();

  const handleStartGame = () => {
    // If joining an existing online game, navigate to its URL
    if (mode === "online" && joinGameId) {
      navigate(`/game/${joinGameId}?join=true`);
      return;
    }

    // For all new games, create a config object
    const gameConfig = {
      gameMode: mode,
      symbol: playerSymbol,
      difficulty: mode === "ai" ? difficulty : null,
    };

    // Navigate to a temporary route and pass the config in the state
    // The GameBoard component will handle the actual game creation
    navigate("/game/new", { state: { config: gameConfig } });
  };

  return (
    <div className="gamemode-container">
      <h2>Choose Your Game</h2>

      <div className="option-group">
        <label>Game Mode:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="ai">Player vs AI</option>
          <option value="local">Player vs Player (Local)</option>
          <option value="online">Player vs Player (Online)</option>
        </select>
      </div>

      {mode === "ai" && (
        <div className="option-group">
          <label>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      )}

      <div className="option-group">
        <label>Choose your side:</label>
        <div className="symbol-picker">
          <button
            className={playerSymbol === "X" ? "active" : ""}
            onClick={() => setPlayerSymbol("X")}
          >
            X
          </button>
          <button
            className={playerSymbol === "O" ? "active" : ""}
            onClick={() => setPlayerSymbol("O")}
          >
            O
          </button>
        </div>
      </div>

      {mode === "online" && (
        <div className="option-group">
          <label>Join Game by ID:</label>
          <input
            type="text"
            placeholder="Enter Game ID"
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
          />
        </div>
      )}

      <button className="start-game-btn" onClick={handleStartGame}>
        {mode === "online" && joinGameId ? "Join Game" : "Start Game"}
      </button>
    </div>
  );
}

export default GameMode;
