export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  type: 'square' | 'circle';
  position: Point;
  scale: number;
  width: number;
  height: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export interface FloatingMenuProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  onAddNode: (type: 'square' | 'circle') => void;
  activeTool: 'zoom' | 'pan' | 'eraser' | 'pencil' | null;
  nodeTypeToAdd: 'square' | 'circle' | null;
  setActiveTool: (tool: 'zoom' | 'pan' | 'eraser' | 'pencil' | null) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export interface Action {
  type: 'add' | 'update' | 'delete' | 'draw';
  node?: NodeData;
  previousPosition?: Point;
  line?: Point[];
}

export interface InfiniteCanvasProps {
  darkMode?: boolean;
  nodes: NodeData[];
  nodeTypeToAdd?: 'square' | 'circle' | null;
  onUpdateNode?: (nodeId: string, newPosition: Point) => void;
  onPlaceNode?: (position: Point) => void;
  activeTool: 'zoom' | 'pan' | 'eraser' | 'pencil' | null;
  onMouseUp?: (nodeId: string, previousPosition: Point) => void;
  onDeleteNode?: (nodeId: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
  history: Action[];
  setHistory: React.Dispatch<React.SetStateAction<Action[]>>;
  historyIndex: number;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  lines: Point[][];
  setLines: React.Dispatch<React.SetStateAction<Point[][]>>;
}

export interface SmoothBrushOptions {
  radius?: number;
  enabled?: boolean;
  initialPoint?: Point;
}

export interface SmoothBrushUpdateOptions {
  both?: boolean;
  friction?: number;
}
