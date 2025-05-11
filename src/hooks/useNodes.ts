import { useState } from 'react';
import { NodeData, NodeType, Point } from '../types';

const BASE_NODE_WIDTH = 50;
const BASE_NODE_HEIGHT = 50;

export const useNodes = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [nodeTypeToAdd, setNodeTypeToAdd] = useState<NodeType | null>(null);

  const addNode = (position: Point, type: NodeType) => {
    const newNode: NodeData = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      scale: 1,
      width: BASE_NODE_WIDTH,
      height: BASE_NODE_HEIGHT
    };
    setNodes(prev => [...prev, newNode]);
    return newNode;
  };

  const updateNode = (nodeId: string, newPosition: Point) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  };

  return {
    nodes,
    setNodes,
    nodeTypeToAdd,
    setNodeTypeToAdd,
    addNode,
    updateNode,
    deleteNode
  };
};