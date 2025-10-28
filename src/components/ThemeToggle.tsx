import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="phone">
      <div className="main-circle"></div>
      <div className="content">
        <div className="circle">
          <div className="crescent"></div>
        </div>
        <label>
          <div className="toggle"></div>
          <input 
            type="checkbox" 
            checked={isDark}
            onChange={toggleTheme}
          />
          <div className="names">
            <p className="light">Light</p>
            <p className="dark">Dark</p>
          </div>
        </label>
      </div>
    </div>
  );
};
