import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Action, InfiniteCanvasProps, NodeData, Point, Transform } from '../types';
import SmoothBrush from '../utils/SmoothBrush';

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ 
  darkMode = false, 
  nodes,
  onUpdateNode,
  onPlaceNode,
  onDeleteNode,
  nodeTypeToAdd,
  activeTool,
  onMouseUp,
  lines,
  setLines,
  setNodes,
  history,
  setHistory,
  historyIndex,
  setHistoryIndex
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState<Point | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [initialPosition, setInitialPosition] = useState<Point | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [resizingNode, setResizingNode] = useState<string | null>(null);
  const [newNode, setNewNode] = useState<NodeData | null>(null);
  const smoothBrush = useRef(new SmoothBrush({ radius: 3 })).current;

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

  const drawSmoothLine = useCallback((line: Point[]) => {
    if (line.length < 2) return;

    context?.beginPath();
    context?.moveTo(line[0].x, line[0].y);

    for (let i = 1; i < line.length - 2; i++) {
      const xc = (line[i].x + line[i + 1].x) / 2;
      const yc = (line[i].y + line[i + 1].y) / 2;
      context?.quadraticCurveTo(line[i].x, line[i].y, xc, yc);
    }

    context?.quadraticCurveTo(
      line[line.length - 2].x,
      line[line.length - 2].y,
      line[line.length - 1].x,
      line[line.length - 1].y
    );
    context?.stroke();
  }, [context]);

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
    });

    context.strokeStyle = darkMode ? '#ffffff' : '#000000';
    context.lineWidth = 2;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    lines.forEach(line => {
      drawSmoothLine(line);
    });

    if (newNode) {
      context.save();
      context.translate(newNode.position.x, newNode.position.y);
      context.scale(newNode.scale, newNode.scale);
      context.strokeStyle = darkMode ? '#ffffff' : '#000000';
      context.lineWidth = 2 / newNode.scale;
      if (newNode.type === 'square') {
        context.strokeRect(-newNode.width / 2, -newNode.height / 2, newNode.width, newNode.height);
      } else {
        context.beginPath();
        context.ellipse(0, 0, newNode.width / 2, newNode.height / 2, 0, 0, 2 * Math.PI);
        context.stroke();
      }
      context.restore();
    }

    context.restore();
  }, [context, colors.background, transform.x, transform.y, transform.scale, drawGrid, nodes, darkMode, lines, newNode, selectedNode, drawSmoothLine]);

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
  }, [context, transform, darkMode, nodes, selectedNode, lines]);

  const getCanvasCoordinates = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - transform.x) / transform.scale;
    const y = (clientY - rect.top - transform.y) / transform.scale;
    return { x, y };
  };

  const isPointInNode = (point: Point, node: NodeData): boolean => {
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
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    if (activeTool === 'pencil') {
      setDrawing(true);
      setLines(prev => [...prev, [coords]]);
      smoothBrush.update(coords, { both: true });
    } else if (nodeTypeToAdd) {
      const newNode: NodeData = {
        id: `${nodeTypeToAdd}-${Date.now()}`,
        type: nodeTypeToAdd,
        position: coords,
        scale: 1,
        width: 0,
        height: 0
      };
      setNewNode(newNode);
      setInitialPosition(coords);
      setResizingNode(newNode.id);
    } else {
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
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!lastPosition && !drawing && !resizingNode && !newNode) return;

    if (drawing) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      smoothBrush.update(coords, { both: false, friction: 0.30 });
      const brushCoords = smoothBrush.getBrushCoordinates();
      setLines(prev => {
        const newLines = [...prev];
        newLines[newLines.length - 1].push(brushCoords);
        return newLines;
      });
      draw();
    } else if (resizingNode && initialPosition && newNode) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const newWidth = Math.abs(coords.x - initialPosition.x);
      const newHeight = Math.abs(coords.y - initialPosition.y);
  
      const newPosition = {
        x: coords.x < initialPosition.x ? initialPosition.x - newWidth / 2 : initialPosition.x + newWidth / 2,
        y: coords.y < initialPosition.y ? initialPosition.y - newHeight / 2 : initialPosition.y + newHeight / 2
      };
  
      setNewNode({
        ...newNode,
        width: newWidth,
        height: newHeight,
        position: newPosition
      });
      draw();
    } else if (isDraggingNode && selectedNode && lastPosition) {
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
    } else if (isDragging && lastPosition) {
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
    if (drawing) {
      setDrawing(false);
      const lastLine = lines[lines.length - 1];
      const newAction: Action = { type: 'draw', line: lastLine };
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newAction]);
      setHistoryIndex(newHistory.length);
    } else if (resizingNode && newNode) {
      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode.id);
      setResizingNode(null);
      setInitialPosition(null);

      const newAction: Action = { type: 'add', node: newNode };
      const newHistory = history.slice(0, historyIndex + 1);
      setHistory([...newHistory, newAction]);
      setHistoryIndex(newHistory.length);
      setNewNode(null);
    } else if (isDraggingNode && selectedNode && initialPosition) {
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
        cursor: nodeTypeToAdd === 'square' || nodeTypeToAdd === 'circle' || activeTool === 'pencil' ? 'crosshair' : activeTool === 'zoom' ? 'zoom-in' : activeTool === 'pan' ? 'grab' : activeTool === 'eraser' ? 'not-allowed' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default InfiniteCanvas;