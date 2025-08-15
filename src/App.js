// FILE: src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import GameMode from './pages/GameMode';
import GameBoard from './pages/GameBoard';
import Stats from './pages/Stats';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container">
        {/* THIS IS THE FIX: Wrapping the Routes in the .page-container div */}
        <div className="page-container">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/gamemode" element={<GameMode />} />
            <Route path="/game/:gameId" element={<GameBoard user={user} />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/" element={user ? <GameMode /> : <Login />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
