import { useCallback, useEffect } from "react";
import InfiniteCanvas from "./components/InfiniteCanvas"
import { Action, ActionType, NodeType, Point, ToolType } from "./types";
import { useHistory } from "./hooks/useHistory";
import { useNodes } from "./hooks/useNodes";
import FloatingToolsDetailsMenu from "./components/FloatingToolsDetailsMenu";
import FloatingMenu from "./components/FloatingMenu";
import { useCanvasToolsContext } from "./contexts/CanvasToolsContext/useCanvasToolsContext";

function App() {
  const { setActiveTool, setLines } = useCanvasToolsContext();

  const { history, historyIndex, addAction, setHistoryIndex } = useHistory();
  const { nodes, setNodes, nodeTypeToAdd, setNodeTypeToAdd, addNode, updateNode, deleteNode } = useNodes();

  const handleAddNode = useCallback((type: NodeType) => {
    setNodeTypeToAdd(type);
    setActiveTool(null);
  }, [setNodeTypeToAdd, setActiveTool]);

  const handlePlaceNode = (position: Point) => {
    if (!nodeTypeToAdd) return;
    const newNode = addNode(position, nodeTypeToAdd);
    const newAction: Action = { type: ActionType.ADD, node: newNode };
    addAction(newAction);
    setNodeTypeToAdd(null);
  };

  const handleUpdateNode = (nodeId: string, newPosition: Point) => {
    updateNode(nodeId, newPosition);
  };

  const handleDeleteNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      deleteNode(nodeId);
      const newAction: Action = { type: ActionType.DELETE, node };
      addAction(newAction);
    }
  };

 const handleSetActiveTool = useCallback((tool: ToolType | null) => {
    setActiveTool(tool);
    setNodeTypeToAdd(null);
  }, [setActiveTool, setNodeTypeToAdd]);

  const handleUndo = useCallback(() => {
    if (historyIndex < 0) return;
    const action = history[historyIndex];

    switch (action.type) {
      case 'add':
        setNodes(prev => prev.filter(node => node.id !== action.node!.id));
        break;
      case 'update':
        setNodes(prev => prev.map(node => 
          node.id === action.node!.id 
            ? { ...node, position: action.previousPosition! }
            : node
        ));
        break;
      case 'delete':
        if (action.node) {
          setNodes(prev => [...prev, action.node!]);
        } else if (action.line) {
          setLines(prev => [...prev, action.line!]);
        }
        break;
      case 'draw':
        setLines(prev => prev.slice(0, -1));
        break;
    }

    setHistoryIndex(historyIndex - 1);
  }, [history, historyIndex, setHistoryIndex, setLines, setNodes]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const action = history[historyIndex + 1];

    switch (action.type) {
      case 'add':
        setNodes(prev => [...prev, action.node!]);
        break;
      case 'update':
        setNodes(prev => prev.map(node => 
          node.id === action.node!.id 
            ? { ...node, position: action.node!.position }
            : node
        ));
        break;
      case 'delete':
        if (action.node) {
          setNodes(prev => prev.filter(node => node.id !== action.node!.id));
        } else if (action.line) {
          setLines(prev => prev.filter(line => line !== action.line));
        }
        break;
      case 'draw':
        setLines(prev => [...prev, action.line!]);
        break;
    }

    setHistoryIndex(historyIndex + 1);
  }, [history, historyIndex, setHistoryIndex, setLines, setNodes]);

  const handleMouseUp = (nodeId: string, previousPosition: Point) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newAction: Action = { type: ActionType.UPDATE, node, previousPosition };
      addAction(newAction);
    }
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
        nodeTypeToAdd={nodeTypeToAdd}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAddNode={handleAddNode}
        onSetActiveTool={handleSetActiveTool}
      />
      <FloatingToolsDetailsMenu />
      <InfiniteCanvas
        nodes={nodes} 
        onUpdateNode={handleUpdateNode}
        onPlaceNode={handlePlaceNode}
        onDeleteNode={handleDeleteNode}
        nodeTypeToAdd={nodeTypeToAdd}
        onMouseUp={handleMouseUp}
        setNodes={setNodes}
        addAction={addAction}
      />
    </div>
  );
}

export default App;