import { createContext } from 'react';
import { Line, ToolType } from '../../types';

interface CanvasToolsContextType {
  activeTool: ToolType | null;
  setActiveTool: React.Dispatch<React.SetStateAction<ToolType | null>>;
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  lineColor: string;
  setLineColor: React.Dispatch<React.SetStateAction<string>>;
  lineWidth: number;
  setLineWidth: React.Dispatch<React.SetStateAction<number>>;
}

export const CanvasToolsContext = createContext<CanvasToolsContextType | undefined>(undefined);
