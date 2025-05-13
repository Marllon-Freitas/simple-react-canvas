import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeContext } from '../../../contexts/ThemeContext/useThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeContext();
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors
        ${isDarkMode 
          ? 'hover:bg-white/10 text-white' 
          : 'hover:bg-black/10 text-black'}`}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggleButton;