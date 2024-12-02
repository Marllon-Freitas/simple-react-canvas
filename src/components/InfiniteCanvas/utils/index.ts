import { Point, Transform, NodeData } from '../../../types';

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
  if (node.type === 'square') {
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
  nodeTypeToAdd: 'square' | 'circle' | null | undefined,
  activeTool: string | null | undefined
): string {
  if (nodeTypeToAdd === 'square' || nodeTypeToAdd === 'circle' || activeTool === 'pencil') {
    return 'crosshair';
  }
  if (activeTool === 'zoom') {
    return 'zoom-in';
  }
  if (activeTool === 'pan') {
    return 'grab';
  }
  if (activeTool === 'eraser') {
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

  context.fillStyle = node.type === 'square' ? 'rgba(76, 0, 255, 0.5)' : 'rgba(208, 255, 0, 0.25)';

  if (node.type === 'square') {
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

  if (node.type === 'square') {
    context.strokeRect(-node.width / 2, -node.height / 2, node.width, node.height);
  } else {
    context.beginPath();
    context.ellipse(0, 0, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
    context.stroke();
  }
  context.restore();
}
