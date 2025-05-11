import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleButtonProps {
  darkMode: boolean;
  onToggle: () => void;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ darkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors
        ${darkMode 
          ? 'hover:bg-white/10 text-white' 
          : 'hover:bg-black/10 text-black'}`}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggleButton;