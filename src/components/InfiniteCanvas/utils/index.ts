import { Point, Transform, NodeData, NodeType, ToolType } from '../../../types';

export function getCanvasCoordinates(
  canvas: HTMLCanvasElement, 
  clientX: number, 
  clientY: number, 
  transform: Transform
): Point {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left - transform.x) / transform.scale;
  const y = (clientY - rect.top - transform.y) / transform.scale;
  return { x, y };
}

export function isPointInNode(point: Point, node: NodeData): boolean {
  if (node.type === NodeType.SQUARE) {
    const halfWidth = node.width / 2;
    const halfHeight = node.height / 2;
    const left = node.position.x - halfWidth;
    const right = node.position.x + halfWidth;
    const top = node.position.y - halfHeight;
    const bottom = node.position.y + halfHeight;

    return (
      point.x >= left &&
      point.x <= right &&
      point.y >= top &&
      point.y <= bottom
    );
  } else {
    const radiusX = node.width / 2;
    const radiusY = node.height / 2;
    const dx = (point.x - node.position.x) / radiusX;
    const dy = (point.y - node.position.y) / radiusY;
    return (dx * dx + dy * dy) <= 1;
  }
}

export function getCursorStyle(
  nodeTypeToAdd: NodeType | null | undefined,
  activeTool: ToolType | null
): string {
  if (nodeTypeToAdd === NodeType.SQUARE || nodeTypeToAdd === NodeType.CIRCLE || activeTool === ToolType.PENCIL) {
    return 'crosshair';
  }
  if (activeTool === ToolType.ZOOM) {
    return 'zoom-in';
  }
  if (activeTool === ToolType.PAN) {
    return 'grab';
  }
  if (activeTool === ToolType.ERASER) {
    return 'not-allowed';
  }
  return 'default';
}

export function drawNode(context: CanvasRenderingContext2D, node: NodeData, darkMode: boolean, selectedNode: string | null) {
  context.save();
  context.translate(node.position.x, node.position.y);
  context.scale(node.scale, node.scale);

  if (node.id === selectedNode) {
    context.strokeStyle = darkMode ? '#ffffff' : '#000000';
    context.lineWidth = 2 / node.scale;
  }

  context.fillStyle = node.type === NodeType.SQUARE ? 'rgba(76, 0, 255, 0.5)' : 'rgba(208, 255, 0, 0.25)';

  if (node.type === NodeType.SQUARE) {
    context.fillRect(-node.width / 2, -node.height / 2, node.width, node.height);
    if (node.id === selectedNode) {
      context.strokeRect(-node.width / 2, -node.height / 2, node.width, node.height);
    }
  } else {
    context.beginPath();
    context.ellipse(0, 0, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
    context.fill();
    if (node.id === selectedNode) {
      context.stroke();
    }
  }
  context.restore();
};

export function drawNodePrevOutline(context: CanvasRenderingContext2D, node: NodeData, darkMode: boolean) {
  context.save();
  context.translate(node.position.x, node.position.y);
  context.scale(node.scale, node.scale);

  context.strokeStyle = darkMode ? '#ffffff' : '#000000';
  context.lineWidth = 2 / node.scale;

  if (node.type === NodeType.SQUARE) {
    context.strokeRect(-node.width / 2, -node.height / 2, node.width, node.height);
  } else {
    context.beginPath();
    context.ellipse(0, 0, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
    context.stroke();
  }
  context.restore();
}

export const isPointOnLine = (point: Point, line: Point[], threshold: number = 2): boolean => {
  for (let i = 0; i < line.length - 1; i++) {
    const start = line[i];
    const end = line[i + 1];

    const distanceToSegment = (p: Point, p1: Point, p2: Point) => {
      if (p1.x === p2.x && p1.y === p2.y) {
        return Math.sqrt((p.x - p1.x) ** 2 + (p.y - p1.y) ** 2);
      }

      const l2 = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
      let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
      t = Math.max(0, Math.min(1, t));

      const projection = {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      };

      return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
    };

    const distance = distanceToSegment(point, start, end);

    const minX = Math.min(start.x, end.x) - threshold;
    const maxX = Math.max(start.x, end.x) + threshold;
    const minY = Math.min(start.y, end.y) - threshold;
    const maxY = Math.max(start.y, end.y) + threshold;

    if (distance <= threshold && 
        point.x >= minX && point.x <= maxX && 
        point.y >= minY && point.y <= maxY) {
      return true;
    }
  }
  return false;
};