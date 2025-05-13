import React from 'react';
import { FloatingMenuProps } from '../../types';
import { MenuItems } from './components/MenuItems';
import ThemeToggleButton from './components/ThemeToggleButton';
import { MenuDivider } from './components/MenuDivider';
import { useThemeContext } from '../../contexts/ThemeContext/useThemeContext';

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  nodeTypeToAdd,
  onUndo,
  onRedo,
  onAddNode,
  onSetActiveTool
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-xl
        ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} 
        backdrop-blur-lg border ${isDarkMode ? 'border-white/10' : 'border-black/10'}
        shadow-lg shadow-black/10 opacity-75 hover:opacity-100 transition-opacity`}
    >
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        <MenuDivider darkMode={isDarkMode} />
        <MenuItems
          nodeTypeToAdd={nodeTypeToAdd}
          onAddNode={onAddNode}
          onSetActiveTool={onSetActiveTool}
          onUndo={onUndo}
          onRedo={onRedo}
        />
      </div>
    </div>
  );
};

export default React.memo(FloatingMenu);