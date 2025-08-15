// FILE: src/pages/GameBoard.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Board from "../components/Board";
import axios from "axios";
import "../styles/GameBoard.css";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

let socket;

function GameBoard({ user }) {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [message, setMessage] = useState("Connecting to server...");
  const [isGameOver, setIsGameOver] = useState(false);
  const [rematchOffered, setRematchOffered] = useState(false);
  const [opponentRequestedRematch, setOpponentRequestedRematch] =
    useState(false);

  const updateStats = useCallback(async (result, symbol) => {
    const token = localStorage.getItem("token");
    if (!token || !symbol) return;

    let stats = { wins: 0, losses: 0, draws: 0 };
    if (result === "draw") {
      stats.draws = 1;
    } else if (result === symbol) {
      stats.wins = 1;
    } else {
      stats.losses = 1;
    }

    try {
      await axios.put(`${API_URL}/game/stats`, stats, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to update stats", error);
    }
  }, []);

  useEffect(() => {
    socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      const isJoining = new URLSearchParams(location.search).get("join");
      if (gameId === "new" && location.state?.config) {
        setMessage("Creating your game...");
        socket.emit("createGame", {
          ...location.state.config,
          socketId: socket.id,
        });
      } else if (isJoining || gameId !== "new") {
        setMessage("Joining game...");
        socket.emit("joinGame", { gameId });
      }
    });

    socket.on("gameUpdate", (newGameState) => {
      setGameState(newGameState);
      setIsGameOver(false);
      setRematchOffered(false);
      setOpponentRequestedRematch(false);
      setMessage("");
      const me = newGameState.players.find((p) => p.id === socket.id);
      if (me) setPlayerSymbol(me.symbol);
    });

    socket.on(
      "gameCreated",
      ({ gameId: newGameId, gameState: newGameState }) => {
        setGameState(newGameState);
        const me = newGameState.players.find((p) => p.id === socket.id);
        if (me) setPlayerSymbol(me.symbol);
        if (
          newGameState.gameMode === "online" &&
          newGameState.players.length === 1
        ) {
          setMessage("Waiting for another player to join...");
        } else {
          setMessage("");
        }
        navigate(`/game/${newGameId}`, { replace: true });
      }
    );

    socket.on("gameOver", (finalGameState) => {
      setGameState(finalGameState);
      setIsGameOver(true);
      let finalMessage = "";
      if (finalGameState.winner === "draw") {
        finalMessage = "It's a draw!";
      } else {
        finalMessage = `Player ${finalGameState.winner} wins!`;
      }
      setMessage(finalMessage);
      setPlayerSymbol((prevSymbol) => {
        updateStats(finalGameState.winner, prevSymbol);
        return prevSymbol;
      });
    });

    socket.on("rematchOffer", ({ player }) => {
      if (player !== socket.id) {
        setOpponentRequestedRematch(true);
      }
    });

    socket.on("playerLeft", ({ message: msg }) => {
      setMessage(msg);
      setIsGameOver(true); // Disable board and show buttons
    });

    socket.on("error", (errorMessage) => {
      alert(errorMessage);
      navigate("/gamemode");
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCellClick = (index) => {
    if (
      !gameState ||
      gameState.board[index] !== null ||
      gameState.winner ||
      isGameOver
    ) {
      return;
    }
    if (gameState.currentPlayer === playerSymbol) {
      socket.emit("makeMove", { gameId, index, playerSymbol });
    }
  };

  const handlePlayAgain = () => {
    setRematchOffered(true);
    socket.emit("requestRematch", { gameId });
  };

  const handleExit = () => {
    navigate("/gamemode");
  };

  if (!gameState) {
    return <div className="loading">{message}</div>;
  }

  return (
    <div className="game-board-container">
      <h2>Tic-Tac-Toe</h2>
      {gameState.gameMode === "online" && !isGameOver && (
        <p className="game-id-display">Game ID: {gameId}</p>
      )}
      <Board board={gameState.board} onCellClick={handleCellClick} />
      <div className="game-info">
        {message && <p className="message">{message}</p>}
        {!message && !isGameOver && (
          <>
            <p>Current Turn: {gameState.currentPlayer}</p>
            {playerSymbol && <p>You are: {playerSymbol}</p>}
          </>
        )}
        {isGameOver && (
          <div className="game-over-controls">
            {opponentRequestedRematch && !rematchOffered && (
              <p>Your opponent wants a rematch!</p>
            )}
            <button onClick={handlePlayAgain} disabled={rematchOffered}>
              {rematchOffered ? "Waiting for opponent..." : "Play Again"}
            </button>
            <button onClick={handleExit}>Exit to Lobby</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameBoard;
