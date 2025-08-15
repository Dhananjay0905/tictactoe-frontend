// FILE: src/components/Navbar.js
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar({ user, onLogout }) {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
                    Tic-Tac-Toe
                </Link>

                <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                    &#9776; {/* Hamburger Icon */}
                </button>

                <ul className={isMobileMenuOpen ? "nav-links mobile-open" : "nav-links"}>
                    {user ? (
                        <>
                            <li><span className="nav-welcome">Welcome, {user.name}!</span></li>
                            <li><NavLink to="/gamemode" onClick={closeMobileMenu}>New Game</NavLink></li>
                            <li><NavLink to="/stats" onClick={closeMobileMenu}>My Stats</NavLink></li>
                            <li><button onClick={() => { onLogout(); closeMobileMenu(); }} className="nav-logout-btn">Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><NavLink to="/login" onClick={closeMobileMenu}>Login</NavLink></li>
                            <li><NavLink to="/register" onClick={closeMobileMenu}>Register</NavLink></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
