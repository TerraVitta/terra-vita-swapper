import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className={`navbar ${theme}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">Terra Vita Swapper</Link>
                <ul className="navbar-links">
                    <li><Link to="/features">Features</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;