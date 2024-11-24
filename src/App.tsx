import { useState } from "react";
import InfiniteCanvas from "./components/InfiniteCanvas"
import FloatingMenu from "./components/FloatingMenu";
import { NodeData, Point } from "./types";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [nodeTypeToAdd, setNodeTypeToAdd] = useState<'square' | 'circle' | null>(null);

  const handleAddNode = (type: 'square' | 'circle') => {
    setNodeTypeToAdd(type);
  };

  const handlePlaceNode = (position: Point) => {
    if (!nodeTypeToAdd) return;

    const newNode: NodeData = {
      id: `${nodeTypeToAdd}-${Date.now()}`,
      type: nodeTypeToAdd,
      position,
      scale: 1,
    };
    setNodes((prev) => [...prev, newNode]);
    setNodeTypeToAdd(null);
  };

  const handleUpdateNode = (nodeId: string, newPosition: Point) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  };

  return (
    <div className="w-screen h-screen">
      <FloatingMenu
        darkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onAddNode={handleAddNode}
      />
      <InfiniteCanvas 
        darkMode={isDarkMode} 
        nodes={nodes} 
        onUpdateNode={handleUpdateNode}
        onPlaceNode={handlePlaceNode}
        nodeTypeToAdd={nodeTypeToAdd}
      />
    </div>
  );
}

export default App;