import { useState } from "react";
import InfiniteCanvas from "./components/InfiniteCanvas"
import FloatingMenu from "./components/FloatingMenu";
import { NodeData, Point } from "./types";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [nodeTypeToAdd, setNodeTypeToAdd] = useState<'square' | 'circle' | null>(null);
  const [activeTool, setActiveTool] = useState<'zoom' | 'pan' | null>(null);

  const handleAddNode = (type: 'square' | 'circle') => {
    setNodeTypeToAdd(type);
    setActiveTool(null);
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

  const handleSetActiveTool = (tool: 'zoom' | 'pan' | null) => {
    setActiveTool(tool);
    setNodeTypeToAdd(null);
  };

  return (
    <div className="w-screen h-screen">
      <FloatingMenu
        darkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onAddNode={handleAddNode}
        activeTool={activeTool}
        setActiveTool={handleSetActiveTool}
        nodeTypeToAdd={nodeTypeToAdd}
      />
      <InfiniteCanvas 
        darkMode={isDarkMode} 
        nodes={nodes} 
        onUpdateNode={handleUpdateNode}
        onPlaceNode={handlePlaceNode}
        nodeTypeToAdd={nodeTypeToAdd}
        activeTool={activeTool}
      />
    </div>
  );
}

export default App;