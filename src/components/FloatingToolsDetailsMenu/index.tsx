import React from 'react';
import { ToolType } from '../../types';
import { PencilSettings } from './components/PencilSettings';
import { EraserSettings } from './components/EraserSettings';

interface FloatingToolsDetailsMenuProps {
  activeTool: ToolType | null;
  lineColor: string;
  setLineColor: (color: string) => void;
  isDarkMode: boolean;
}

const FloatingToolsDetailsMenu: React.FC<FloatingToolsDetailsMenuProps> = ({
  activeTool,
  lineColor,
  setLineColor,
  isDarkMode
}) => {
  if (!activeTool) return null;

  return (
    <div
      className={`fixed top-1/2 left-6 transform -translate-y-1/2 px-4 py-3 rounded-xl
        bg-white/80 dark:bg-black/80 backdrop-blur-lg border
        border-black/10 dark:border-white/10 shadow-lg shadow-black/10
        transition-opacity min-w-[200px] max-w-[380px]`}
    >
      <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
        {activeTool === ToolType.PENCIL && 'Pencil Settings'}
        {activeTool === ToolType.ERASER && 'Eraser Settings'}
      </h3>

      {activeTool === ToolType.PENCIL && (
        <PencilSettings lineColor={lineColor} setLineColor={setLineColor} isDarkMode={isDarkMode} />
      )}

      {activeTool === ToolType.ERASER && <EraserSettings />}
    </div>
  );
};

export default React.memo(FloatingToolsDetailsMenu);