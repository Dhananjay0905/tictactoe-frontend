// FILE: src/pages/GameBoard.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Board from '../components/Board';
import axios from 'axios';
import '../styles/GameBoard.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

let socket;

function GameBoard({ user }) {
    const { gameId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState(null);
    const [playerSymbol, setPlayerSymbol] = useState(null);
    const [message, setMessage] = useState('Connecting to server...');

    const updateStats = useCallback(async (result, symbol) => {
        const token = localStorage.getItem('token');
        if (!token || !symbol) return; // Don't update stats for non-players

        let stats = { wins: 0, losses: 0, draws: 0 };
        if (result === 'draw') {
            stats.draws = 1;
        } else if (result === symbol) {
            stats.wins = 1;
        } else {
            stats.losses = 1;
        }

        try {
            await axios.put(`${API_URL}/game/stats`, stats, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to update stats", error);
        }
    }, []);

    useEffect(() => {
        console.log("[GameBoard] useEffect triggered. Initializing socket connection.");
        socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log(`[GameBoard] Socket connected with id: ${socket.id}`);
            
            const isJoining = new URLSearchParams(location.search).get('join');
            
            if (gameId === 'new' && location.state?.config) {
                setMessage('Creating your game...');
                socket.emit('createGame', { ...location.state.config, socketId: socket.id });
            } else if (isJoining || gameId !== 'new') {
                setMessage('Joining game...');
                socket.emit('joinGame', { gameId });
            }
        });

        socket.on('gameUpdate', (newGameState) => {
            console.log("[GameBoard] 'gameUpdate' event received.", newGameState);
            setGameState(newGameState);
            if (!playerSymbol) {
                const me = newGameState.players.find(p => p.id === socket.id);
                if (me) setPlayerSymbol(me.symbol);
            }
            setMessage('');
        });

        socket.on('gameCreated', ({ gameId: newGameId, gameState: newGameState }) => {
            console.log(`[GameBoard] 'gameCreated' event received. New Game ID: ${newGameId}`, newGameState);
            
            if (newGameState.gameMode === 'online' && newGameState.players.length === 1) {
                setMessage('Waiting for another player to join...');
            } else {
                setMessage('');
            }

            setGameState(newGameState);
            const me = newGameState.players.find(p => p.id === socket.id);
            if (me) {
                setPlayerSymbol(me.symbol);
            }
            
            navigate(`/game/${newGameId}`, { replace: true });
        });

        socket.on('gameOver', (finalGameState) => {
            console.log("[GameBoard] 'gameOver' event received.", finalGameState);
            setGameState(finalGameState);
            let finalMessage = '';
            if (finalGameState.winner === 'draw') {
                finalMessage = 'It\'s a draw!';
            } else {
                finalMessage = `Player ${finalGameState.winner} wins!`;
            }
            setMessage(finalMessage);
            
            // We need to get the current player symbol to update stats correctly
            // Using a functional update for setPlayerSymbol ensures we get the latest state
            setPlayerSymbol(prevSymbol => {
                updateStats(finalGameState.winner, prevSymbol);
                return prevSymbol;
            });

            setTimeout(() => navigate('/gamemode'), 5000);
        });
        
        socket.on('playerLeft', ({ message: msg }) => {
            console.log("[GameBoard] 'playerLeft' event received.");
            setMessage(msg);
            setTimeout(() => navigate('/gamemode'), 3000);
        });

        socket.on('error', (errorMessage) => {
            console.error("[GameBoard] 'error' event received:", errorMessage);
            alert(errorMessage);
            navigate('/gamemode');
        });

        return () => {
            console.log("[GameBoard] Cleanup: Disconnecting socket.");
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This effect should only run once on mount to establish a stable socket connection.

    const handleCellClick = (index) => {
        if (!gameState || gameState.board[index] !== null || gameState.winner) {
            return;
        }

        if (gameState.gameMode === 'local') {
            socket.emit('makeMove', { gameId, index, playerSymbol: gameState.currentPlayer });
            return;
        }

        if (gameState.currentPlayer === playerSymbol) {
            socket.emit('makeMove', { gameId, index, playerSymbol });
        }
    };

    if (!gameState) {
        return <div className="loading">{message}</div>;
    }

    return (
        <div className="game-board-container">
            <h2>Tic-Tac-Toe</h2>
            {gameState.gameMode === 'online' && <p className="game-id-display">Game ID: {gameId} (Share with a friend!)</p>}
            <Board board={gameState.board} onCellClick={handleCellClick} />
            <div className="game-info">
                {message ? (
                    <p className="message">{message}</p>
                ) : (
                    <>
                        <p>Current Turn: {gameState.currentPlayer}</p>
                        {playerSymbol && gameState.gameMode !== 'local' && <p>You are: {playerSymbol}</p>}
                    </>
                )}
            </div>
        </div>
    );
}

export default GameBoard;
