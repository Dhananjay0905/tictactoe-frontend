import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Tic-Tac-Toe
      </Link>
      <ul className="nav-links">
        {user ? (
          <>
            <li>
              <span className="nav-welcome">Welcome, {user.name}!</span>
            </li>
            <li>
              <Link to="/gamemode">New Game</Link>
            </li>
            <li>
              <Link to="/stats">My Stats</Link>
            </li>
            <li>
              <button onClick={onLogout} className="nav-logout-btn">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
