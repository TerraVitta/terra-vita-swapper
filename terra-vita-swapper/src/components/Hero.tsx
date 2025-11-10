import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './Hero.css';

const Hero: React.FC = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`hero ${isDarkMode ? 'hero-dark' : 'hero-light'}`}>
            <div className="hero-content">
                <h1 className="hero-title">Welcome to Terra Vita Swapper</h1>
                <p className="hero-description">
                    Experience seamless swapping with our modern liquid glass interface.
                </p>
                <button className="hero-button">Get Started</button>
            </div>
        </div>
    );
};

export default Hero;