import React from 'react';
import { ToolType } from '../../types';
import { PencilSettings } from './components/PencilSettings';
import { EraserSettings } from './components/EraserSettings';
import { useThemeContext } from '../../contexts/ThemeContext/useThemeContext';

interface FloatingToolsDetailsMenuProps {
  activeTool: ToolType | null;
  lineColor: string;
  setLineColor: (color: string) => void;
  setLineWidth: (width: number) => void;
}

const FloatingToolsDetailsMenu: React.FC<FloatingToolsDetailsMenuProps> = ({
  activeTool,
  lineColor,
  setLineColor,
  setLineWidth,
}) => {
  const { isDarkMode } = useThemeContext();
  if (!activeTool || activeTool !== ToolType.PENCIL && activeTool !== ToolType.ERASER) return null;

  return (
    <div
      className={`fixed top-1/2 left-6 transform -translate-y-1/2 px-4 py-3 rounded-xl
        ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}  backdrop-blur-lg border
        border-black/10 dark:border-white/10 shadow-lg shadow-black/10 transition-opacity 
        min-w-[200px] max-w-[283px]`}
    >
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'} mb-4`}>
        {activeTool === ToolType.PENCIL && 'Pencil Settings'}
        {activeTool === ToolType.ERASER && 'Eraser Settings'}
      </h3>

      {activeTool === ToolType.PENCIL && (
        <PencilSettings 
          lineColor={lineColor} 
          setLineColor={setLineColor}
          setLineWidth={setLineWidth}
        />
      )}

      {activeTool === ToolType.ERASER && <EraserSettings />}
    </div>
  );
};

export default React.memo(FloatingToolsDetailsMenu);