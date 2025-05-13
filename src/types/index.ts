export enum NodeType {
  SQUARE = 'square',
  CIRCLE = 'circle',
}

export enum ToolType {
  ZOOM = 'zoom',
  PAN = 'pan',
  ERASER = 'eraser',
  PENCIL = 'pencil',
  SELECT = 'select',
}

export enum ActionType {
  ADD = 'add',
  DELETE = 'delete',
  UPDATE = 'update',
  DRAW = 'draw',
}

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  points: Point[];
  color: string;
  width: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface NodeData {
  id: string;
  type: NodeType | null;
  position: Point;
  scale: number;
  width: number;
  height: number;
}

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export interface FloatingMenuProps {
  onAddNode: (type: NodeType) => void;
  onSetActiveTool: (tool: ToolType | null) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export interface Action {
  type: ActionType;
  node?: NodeData;
  line?: Line;
  previousPosition?: Point;
  previousLine?: Line;
  lineIndex?: number;
}

export interface InfiniteCanvasProps {
  onUpdateNode?: (nodeId: string, newPosition: Point) => void;
  onPlaceNode?: (position: Point) => void;
  onMouseUp?: (nodeId: string, previousPosition: Point) => void;
  onDeleteNode?: (nodeId: string) => void;
  addAction: (action: Action) => void;
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
