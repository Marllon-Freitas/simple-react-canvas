import { ReactNode } from "react";
import { useNodes } from "../../hooks/useNodes";
import { NodesContext } from "./NodesContext";


export const NodesProvider = ({ children }: { children: ReactNode }) => {
  const { nodes, setNodes, nodeTypeToAdd, setNodeTypeToAdd, addNode, updateNode, deleteNode } = useNodes();

  return (
    <NodesContext.Provider value={{
      nodes,
      setNodes,
      nodeTypeToAdd,
      setNodeTypeToAdd,
      addNode,
      updateNode,
      deleteNode
    }}>
      {children}
    </NodesContext.Provider>
  );
};
