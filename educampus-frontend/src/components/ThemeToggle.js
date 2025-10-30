import React, { useState, useEffect } from 'react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  // 1. Get the theme from localStorage, or default to 'light'
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  // 2. When the 'theme' state changes, update the <body> class and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // 3. Handle the toggle click
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <label className="theme-toggle-label" htmlFor="theme-toggle">
      Dark Mode
      <div className="theme-toggle-switch">
        <input
          type="checkbox"
          id="theme-toggle"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <span className="slider"></span>
      </div>
    </label>
  );
};

export default ThemeToggle;