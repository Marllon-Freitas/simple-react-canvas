import React from 'react';
import { FloatingMenuProps } from '../../types';
import { MenuItems } from './components/MenuItems';
import ThemeToggleButton from './components/ThemeToggleButton';
import { MenuDivider } from './components/MenuDivider';

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  darkMode,
  onThemeToggle,
  activeTool,
  nodeTypeToAdd,
  ...actions
}) => {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-xl
        ${darkMode ? 'bg-black/80' : 'bg-white/80'} 
        backdrop-blur-lg border ${darkMode ? 'border-white/10' : 'border-black/10'}
        shadow-lg shadow-black/10 opacity-75 hover:opacity-100 transition-opacity`}
    >
      <div className="flex items-center gap-2">
        <ThemeToggleButton darkMode={darkMode} onToggle={onThemeToggle} />
        <MenuDivider darkMode={darkMode} />
        <MenuItems
          darkMode={darkMode}
          activeTool={activeTool}
          nodeTypeToAdd={nodeTypeToAdd}
          {...actions}
        />
      </div>
    </div>
  );
};