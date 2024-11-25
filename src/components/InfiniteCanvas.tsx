import React, { useEffect, useRef, useState, useCallback } from 'react';
import { InfiniteCanvasProps, NodeData, Point, Transform } from '../types';

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ 
  darkMode = false, 
  nodes,
  onUpdateNode,
  onPlaceNode,
  onDeleteNode,
  nodeTypeToAdd,
  activeTool,
  onMouseUp
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState<Point | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [initialPosition, setInitialPosition] = useState<Point | null>(null);
  
  const colors = {
    background: darkMode ? '#1a1a1a' : '#ffffff',
    grid: darkMode ? '#333333' : '#dddddd',
    axes: darkMode ? '#404040' : '#cccccc'
  };

  const drawGrid = useCallback(() => {
    if (!context || !canvasRef.current) return;

    const gridSize = 50;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const startX = Math.floor(-transform.x / transform.scale / gridSize) * gridSize - gridSize;
    const startY = Math.floor(-transform.y / transform.scale / gridSize) * gridSize - gridSize;
    const endX = Math.ceil((width - transform.x) / transform.scale / gridSize) * gridSize + gridSize;
    const endY = Math.ceil((height - transform.y) / transform.scale / gridSize) * gridSize + gridSize;

    context.beginPath();
    context.strokeStyle = colors.grid;
    context.lineWidth = 1 / transform.scale;

    for (let x = startX; x <= endX; x += gridSize) {
      context.moveTo(x, startY);
      context.lineTo(x, endY);
    }

    for (let y = startY; y <= endY; y += gridSize) {
      context.moveTo(startX, y);
      context.lineTo(endX, y);
    }

    context.stroke();

    context.beginPath();
    context.strokeStyle = colors.axes;
    context.lineWidth = 2 / transform.scale;

    context.moveTo(startX, 0);
    context.lineTo(endX, 0);
    context.moveTo(0, startY);
    context.lineTo(0, endY);

    context.stroke();
  }, [context, colors.grid, colors.axes, transform.x, transform.y, transform.scale]);

  const draw = useCallback(() => {
    if (!context || !canvasRef.current) return;

    const canvas = canvasRef.current;
    context.fillStyle = colors.background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(transform.x, transform.y);
    context.scale(transform.scale, transform.scale);

    drawGrid();

    nodes.forEach(node => {
      context.save();
      context.translate(node.position.x, node.position.y);
      context.scale(node.scale, node.scale);
      
      if (node.id === selectedNode) {
        context.strokeStyle = darkMode ? '#ffffff' : '#000000';
        context.lineWidth = 2 / node.scale;
      }
      
      context.fillStyle = node.type === 'square' ? 'blue' : 'red';
      
      if (node.type === 'square') {
        context.fillRect(-25, -25, 50, 50);
        if (node.id === selectedNode) {
          context.strokeRect(-25, -25, 50, 50);
        }
      } else {
        context.beginPath();
        context.arc(0, 0, 25, 0, 2 * Math.PI);
        context.fill();
        if (node.id === selectedNode) {
          context.stroke();
        }
      }
      context.restore();
    });

    context.restore();
  }, [context, colors.background, transform.x, transform.y, transform.scale, drawGrid, nodes, selectedNode, darkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { devicePixelRatio: ratio = 1 } = window;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
      draw();
    };

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = transform.scale * zoomFactor;

      if (newScale < 0.1 || newScale > 3) return;

      const scaleDiff = newScale - transform.scale;
      const newX = transform.x - (mouseX - transform.x) * scaleDiff / transform.scale;
      const newY = transform.y - (mouseY - transform.y) * scaleDiff / transform.scale;

      setTransform({
        x: newX,
        y: newY,
        scale: newScale
      });
    };

    setContext(ctx);
    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(canvas);
    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('wheel', handleWheelEvent);
    };
  }, [transform.scale, colors.background, draw, transform]);

  useEffect(() => {
    if (!context) return;
    draw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, transform, darkMode, nodes, selectedNode]);


  const getCanvasCoordinates = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - transform.x) / transform.scale;
    const y = (clientY - rect.top - transform.y) / transform.scale;
    return { x, y };
  };

  const isPointInNode = (point: Point, node: NodeData): boolean => {
    const size = 25 * node.scale;
    if (node.type === 'square') {
      return (
        point.x >= node.position.x - size &&
        point.x <= node.position.x + size &&
        point.y >= node.position.y - size &&
        point.y <= node.position.y + size
      );
    } else {
      const dx = point.x - node.position.x;
      const dy = point.y - node.position.y;
      return Math.sqrt(dx * dx + dy * dy) <= size;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    const clickedNode = nodes.find(node => isPointInNode(coords, node));
    if (clickedNode) {
      if (activeTool === 'eraser') {
        onDeleteNode?.(clickedNode.id);
      } else {
        setSelectedNode(clickedNode.id);
        setIsDraggingNode(true);
        setLastPosition({ x: e.clientX, y: e.clientY });
        setInitialPosition(clickedNode.position);
      }
    } else {
      if (activeTool === 'zoom') {
        const zoomFactor = e.shiftKey ? 0.9 : 1.1;
        const newScale = transform.scale * zoomFactor;

        if (newScale < 0.1 || newScale > 3) return;

        const scaleDiff = newScale - transform.scale;
        const newX = transform.x - (coords.x * scaleDiff);
        const newY = transform.y - (coords.y * scaleDiff);

        setTransform({
          x: newX,
          y: newY,
          scale: newScale
        });
      } else if (activeTool === 'pan') {
        setIsDragging(true);
        setLastPosition({ x: e.clientX, y: e.clientY });
      } else if (onPlaceNode && nodeTypeToAdd) {
        onPlaceNode(coords);
      } else {
        setIsDragging(true);
        setLastPosition({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!lastPosition) return;

    if (isDraggingNode && selectedNode) {
      const deltaX = (e.clientX - lastPosition.x) / transform.scale;
      const deltaY = (e.clientY - lastPosition.y) / transform.scale;

      const node = nodes.find(n => n.id === selectedNode);
      if (node) {
        onUpdateNode?.(selectedNode, {
          x: node.position.x + deltaX,
          y: node.position.y + deltaY
        });
      }

      setLastPosition({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      const deltaX = e.clientX - lastPosition.x;
      const deltaY = e.clientY - lastPosition.y;

      setTransform(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingNode && selectedNode && initialPosition) {
      onMouseUp?.(selectedNode, initialPosition);
    }
    setIsDragging(false);
    setIsDraggingNode(false);
    setLastPosition(null);
    setInitialPosition(null);
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      style={{ 
        background: colors.background,
        cursor: nodeTypeToAdd === 'square' || nodeTypeToAdd === 'circle' ? 'crosshair' : activeTool === 'zoom' ? 'zoom-in' : activeTool === 'pan' ? 'grab' : activeTool === 'eraser' ? 'not-allowed' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default InfiniteCanvas;