import React, { useContext } from 'react';
import { ThemeContext } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import BlurToggle from './components/BlurToggle';
import ThemeToggle from './components/ThemeToggle';
import './styles/globals.css';
import './styles/glass.css';

const App: React.FC = () => {
    const { isBlurred } = useContext(ThemeContext);

    return (
        <div className={`app ${isBlurred ? 'blurred' : ''}`}>
            <Navbar />
            <Hero />
            <Features />
            <BlurToggle />
            <ThemeToggle />
            <Footer />
        </div>
    );
};

export default App;