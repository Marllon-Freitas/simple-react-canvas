import { useEffect, useState } from "react";
import InfiniteCanvas from "./components/InfiniteCanvas"
import FloatingMenu from "./components/FloatingMenu";
import { Action, NodeData, Point } from "./types";
const BASE_NODE_WIDTH = 50;
const BASE_NODE_HEIGHT = 50;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [lines, setLines] = useState<Point[][]>([]);
  const [nodeTypeToAdd, setNodeTypeToAdd] = useState<'square' | 'circle' | null>(null);
  const [activeTool, setActiveTool] = useState<'zoom' | 'pan' | 'eraser' | 'pencil' | null>(null);
  const [history, setHistory] = useState<Action[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
      width: BASE_NODE_WIDTH,
      height: BASE_NODE_HEIGHT
    };
    setNodes((prev) => [...prev, newNode]);
    setNodeTypeToAdd(null);

    const newAction: Action = { type: 'add', node: newNode };
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newAction]);
    setHistoryIndex(newHistory.length);
  };

  const handleUpdateNode = (nodeId: string, newPosition: Point) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  };

  const handleDeleteNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setNodes(prev => prev.filter(n => n.id !== nodeId));

      const newAction: Action = { type: 'delete', node };
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newAction]);
      setHistoryIndex(newHistory.length);
    }
  };

  const handleSetActiveTool = (tool: 'zoom' | 'pan' | 'eraser' | 'pencil' | null) => {
    setActiveTool(tool);
    setNodeTypeToAdd(null);
  };

  const handleUndo = () => {
    if (historyIndex < 0) return;

    const action = history[historyIndex];
    if (action.type === 'add') {
      setNodes(prev => prev.filter(node => node.id !== action.node!.id));
    } else if (action.type === 'update') {
      setNodes(prev => prev.map(node => 
        node.id === action.node!.id 
          ? { ...node, position: action.previousPosition! }
          : node
      ));
    } else if (action.type === 'delete') {
      setNodes(prev => [...prev, action.node!]);
    } else if (action.type === 'draw') {
      setLines(prev => prev.slice(0, -1));
    }

    setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;

    const action = history[historyIndex + 1];
    if (action.type === 'add') {
      setNodes(prev => [...prev, action.node!]);
    } else if (action.type === 'update') {
      setNodes(prev => prev.map(node => 
        node.id === action.node!.id 
          ? { ...node, position: action.node!.position }
          : node
      ));
    } else if (action.type === 'delete') {
      setNodes(prev => prev.filter(node => node.id !== action.node!.id));
    } else if (action.type === 'draw') {
      setLines(prev => [...prev, action.line!]);
    }

    setHistoryIndex(historyIndex + 1);
  };

  const handleMouseUp = (nodeId: string, previousPosition: Point) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newAction: Action = { type: 'update', node, previousPosition };
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newAction]);
      setHistoryIndex(newHistory.length);
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history]);

  return (
    <div className="w-screen h-screen">
      <FloatingMenu
        darkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        onAddNode={handleAddNode}
        activeTool={activeTool}
        setActiveTool={handleSetActiveTool}
        nodeTypeToAdd={nodeTypeToAdd}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <InfiniteCanvas 
        darkMode={isDarkMode} 
        nodes={nodes} 
        onUpdateNode={handleUpdateNode}
        onPlaceNode={handlePlaceNode}
        onDeleteNode={handleDeleteNode}
        nodeTypeToAdd={nodeTypeToAdd}
        activeTool={activeTool}
        onMouseUp={handleMouseUp}
        lines={lines}
        setLines={setLines}
        setNodes={setNodes}
        history={history}
        setHistory={setHistory}
        historyIndex={historyIndex}
        setHistoryIndex={setHistoryIndex}
      />
    </div>
  );
}

export default App;