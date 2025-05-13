import { createContext } from 'react';
import { NodeData, NodeType, Point } from '../../types';

interface NodesContextType {
  nodes: NodeData[];
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  nodeTypeToAdd: NodeType | null;
  setNodeTypeToAdd: React.Dispatch<React.SetStateAction<NodeType | null>>;
  addNode: (position: Point, type: NodeType) => NodeData;
  updateNode: (nodeId: string, newPosition: Point) => void;
  deleteNode: (nodeId: string) => void;
}

export const NodesContext = createContext<NodesContextType | undefined>(undefined);