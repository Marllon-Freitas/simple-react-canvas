import { ReactNode } from "react";
import { useCanvasTools } from "../../hooks/useCanvasTools";
import { CanvasToolsContext } from "./CanvasToolsContext";

export const CanvasToolsProvider = ({ children }: { children: ReactNode }) => {
  const { activeTool, setActiveTool, lines, setLines, lineColor, setLineColor, lineWidth, setLineWidth} = useCanvasTools();
  
  return (
    <CanvasToolsContext.Provider value={{
      activeTool,
      setActiveTool,
      lines,
      setLines,
      lineColor,
      setLineColor,
      lineWidth,
      setLineWidth
    }}>
      {children}
    </CanvasToolsContext.Provider>
  );
};