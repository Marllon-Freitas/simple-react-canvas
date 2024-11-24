export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  type: 'square' | 'circle';
  position: Point;
  scale: number;
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
}

export interface InfiniteCanvasProps {
  darkMode?: boolean;
  nodes: NodeData[];
  nodeTypeToAdd?: 'square' | 'circle' | null;
  onUpdateNode?: (nodeId: string, newPosition: Point) => void;
  onPlaceNode?: (position: Point) => void;
}
