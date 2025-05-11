import { useState } from 'react';
import { Point, ToolType } from '../types';

export const useCanvasTools = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [lines, setLines] = useState<Point[][]>([]);

  return {
    activeTool,
    setActiveTool,
    lines,
    setLines
  };
};