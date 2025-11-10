import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const BlurToggle: React.FC = () => {
    const { isBlurEnabled, toggleBlur } = useContext(ThemeContext);

    return (
        <div className="blur-toggle">
            <label>
                <input
                    type="checkbox"
                    checked={isBlurEnabled}
                    onChange={toggleBlur}
                />
                Enable Blur Effect
            </label>
        </div>
    );
};

export default BlurToggle;