import { Moon, Sun, Move, ZoomIn, Undo, Redo, Square, Circle, Pencil, Eraser, Settings } from 'lucide-react';
import { FloatingMenuProps, MenuItem } from '../types';

const FloatingMenu = ({ darkMode, onThemeToggle, onAddNode, activeTool, setActiveTool, nodeTypeToAdd, onUndo, onRedo }: FloatingMenuProps) => {
  const menuItems: Record<string, MenuItem[]> = {
    draw: [
      { icon: <Pencil size={20} />, label: 'Pencil' },
      { icon: <Square size={20} />, label: 'Square', onClick: () => onAddNode('square') },
      { icon: <Circle size={20} />, label: 'Circle', onClick: () => onAddNode('circle') },
      { icon: <Eraser size={20} />, label: 'Eraser' },
    ],
    view: [
      { icon: <ZoomIn size={20} />, label: 'Zoom', onClick: () => setActiveTool(activeTool === 'zoom' ? null : 'zoom') },
      { icon: <Move size={20} />, label: 'Pan', onClick: () => setActiveTool(activeTool === 'pan' ? null : 'pan') },
    ],
    actions: [
      { icon: <Undo size={20} />, label: 'Undo', onClick: onUndo },
      { icon: <Redo size={20} />, label: 'Redo', onClick: onRedo },
      { icon: <Settings size={20} />, label: 'Settings' },
    ],
  };

  return (
    <div 
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-xl
        ${darkMode ? 'bg-black/80' : 'bg-white/80'} 
        backdrop-blur-lg border ${darkMode ? 'border-white/10' : 'border-black/10'}
        shadow-lg shadow-black/10 opacity-75 hover:opacity-100 transition-opacity`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-lg transition-colors
            ${darkMode 
              ? 'hover:bg-white/10 text-white' 
              : 'hover:bg-black/10 text-black'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className={`h-6 w-px ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
        {Object.entries(menuItems).map(([group, items]) => (
          <div key={group} className="flex items-center">
            <div className="flex gap-1">
              {items.map((item) => {
                const isActive = activeTool === item.label.toLowerCase() || nodeTypeToAdd === item.label.toLowerCase();
                return (
                  <button
                    key={item.label}
                    className={`p-2 rounded-lg transition-colors group relative
                      ${darkMode 
                        ? isActive ? 'bg-violet-600 text-black' : 'hover:bg-white/10 text-white' 
                        : isActive ? 'bg-violet-600 text-white' : 'hover:bg-black/10 text-black'}`}
                    onClick={item.onClick}
                  >
                    <span className={`${isActive ?  'text-white' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded
                      hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                      ${darkMode 
                        ? 'bg-white text-black' 
                        : 'bg-black text-white'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {group !== 'actions' && (
              <div className={`h-6 w-px mx-2 ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloatingMenu;