import React from 'react';
import { Square, Circle, Pencil, Eraser, Move, ZoomIn, Undo, Redo, Settings, MousePointer } from 'lucide-react';
import { MenuItem, NodeType, ToolType } from '../../../types';

interface MenuItemsProps {
  activeTool?: ToolType | null;
  nodeTypeToAdd?: NodeType | null;
  onAddNode?: (type: NodeType) => void;
  onSetActiveTool?: (tool: ToolType | null) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  darkMode: boolean;
}

export const MenuItems: React.FC<MenuItemsProps> = ({
  activeTool,
  nodeTypeToAdd,
  onAddNode = () => {},
  onSetActiveTool = () => {},
  onUndo = () => {},
  onRedo = () => {},
  darkMode,
}) => {
  const menuItems: Record<string, MenuItem[]> = {
    draw: [
      {
        icon: <MousePointer size={20} />,
        label: 'Select',
        onClick: () => onSetActiveTool(ToolType.SELECT),
      },
      { 
        icon: <Pencil size={20} />, 
        label: 'Pencil', 
        onClick: () => onSetActiveTool(ToolType.PENCIL) 
      },
      { 
        icon: <Square size={20} />, 
        label: 'Square', 
        onClick: () => onAddNode(NodeType.SQUARE)
      },
      { 
        icon: <Circle size={20} />, 
        label: 'Circle', 
        onClick: () => onAddNode(NodeType.CIRCLE)
      },
      { 
        icon: <Eraser size={20} />, 
        label: 'Eraser', 
        onClick: () => onSetActiveTool(ToolType.ERASER) 
      },
    ],
    view: [
      { 
        icon: <ZoomIn size={20} />, 
        label: 'Zoom', 
        onClick: () => onSetActiveTool(ToolType.ZOOM) 
      },
      { 
        icon: <Move size={20} />, 
        label: 'Pan', 
        onClick: () => onSetActiveTool(ToolType.PAN) 
      },
    ],
    actions: [
      { icon: <Undo size={20} />, label: 'Undo', onClick: onUndo },
      { icon: <Redo size={20} />, label: 'Redo', onClick: onRedo },
      { icon: <Settings size={20} />, label: 'Settings' },
    ],
  };

  return (
    <>
      {Object.entries(menuItems).map(([group, items]) => (
        <div key={group} className="flex items-center">
          <div className="flex gap-1">
            {items.map((item) => {
              const isActive =
                activeTool === item.label.toLowerCase() || nodeTypeToAdd === item.label.toLowerCase();

              return (
                <button
                  key={item.label}
                  className={`p-2 rounded-lg transition-colors group relative
                    ${darkMode 
                      ? isActive ? 'bg-violet-600 text-black' : 'hover:bg-white/10 text-white' 
                      : isActive ? 'bg-violet-600 text-white' : 'hover:bg-black/10 text-black'}`}
                  onClick={item.onClick}
                >
                  <span className={`${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                  <span
                    className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded
                      hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                      ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
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
    </>
  );
};