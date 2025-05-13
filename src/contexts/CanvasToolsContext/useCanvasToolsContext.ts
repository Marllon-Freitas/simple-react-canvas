import { useContext } from "react";
import { CanvasToolsContext } from "./CanvasToolsContext";

export const useCanvasToolsContext = () => {
  const context = useContext(CanvasToolsContext);
  if (context === undefined) {
    throw new Error('useCanvasToolsContext must be used within a CanvasToolsProvider');
  }
  return context;
};