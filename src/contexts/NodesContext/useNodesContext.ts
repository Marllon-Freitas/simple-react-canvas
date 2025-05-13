import { useContext } from "react";
import { NodesContext } from "./NodesContext";

export const useNodesContext = () => {
  const context = useContext(NodesContext);
  if (context === undefined) {
    throw new Error('useNodesContext must be used within a NodesProvider');
  }
  return context;
};
