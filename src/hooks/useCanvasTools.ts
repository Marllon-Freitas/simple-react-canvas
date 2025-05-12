import { useState } from 'react';
import { Line, ToolType } from '../types';

export const useCanvasTools = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(2);

  return {
    activeTool,
    setActiveTool,
    lines,
    setLines,
    lineColor,
    setLineColor,
    lineWidth,
    setLineWidth,
  };
};