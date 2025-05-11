import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Action, ActionType, InfiniteCanvasProps, NodeData, Point, ToolType, Transform } from '../../types';
import SmoothBrush from '../../utils/SmoothBrush';
import { drawNode, drawNodePrevOutline, getCanvasCoordinates, getCursorStyle, isPointInNode, isPointOnLine } from './utils';

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
  addAction
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
      drawNode(context, node, darkMode, selectedNode);
    });

    context.strokeStyle = darkMode ? '#ffffff' : '#000000';
    context.lineWidth = 2;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    lines.forEach(line => {
      drawSmoothLine(line);
    });

    if (newNode) {
      drawNodePrevOutline(context, newNode, darkMode);
    }

    context.restore();
  }, 
  [
    context, 
    colors.background, 
    transform.x, 
    transform.y, 
    transform.scale, 
    drawGrid, 
    nodes, 
    darkMode, 
    lines, 
    newNode, 
    selectedNode, 
    drawSmoothLine
  ]);

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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(canvasRef.current!, e.clientX, e.clientY, transform);

    if (e.button === 1) {
      setIsDragging(true);
      setLastPosition({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool === ToolType.ERASER) {
      const lineIndex = lines.findIndex(line => isPointOnLine(coords, line));
      if (lineIndex !== -1) {
        const removedLine = lines[lineIndex];
        setLines(prev => prev.filter((_, index) => index !== lineIndex));

        const newAction: Action = { type: ActionType.DELETE, line: removedLine };
        addAction(newAction);
        return;
      }

      const clickedNode = nodes.find(node => isPointInNode(coords, node));
      if (clickedNode) {
        onDeleteNode?.(clickedNode.id);
      }
      return;
    }

    if (activeTool === ToolType.PENCIL) {
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
        setSelectedNode(clickedNode.id);
        setIsDraggingNode(true);
        setLastPosition({ x: e.clientX, y: e.clientY });
        setInitialPosition(clickedNode.position);
      } else {
        if (activeTool === ToolType.ZOOM) {
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
        } else if (activeTool === ToolType.PAN) {
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
      const coords = getCanvasCoordinates(canvasRef.current!, e.clientX, e.clientY, transform);
      smoothBrush.update(coords, { both: false, friction: 0.30 });
      const brushCoords = smoothBrush.getBrushCoordinates();
      setLines(prev => {
        const newLines = [...prev];
        newLines[newLines.length - 1].push(brushCoords);
        return newLines;
      });
      draw();
    } else if (resizingNode && initialPosition && newNode) {
      const coords = getCanvasCoordinates(canvasRef.current!, e.clientX, e.clientY, transform);
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

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) {
      setIsDragging(false);
      setLastPosition(null);
      return;
    }
    if (drawing) {
      setDrawing(false);
      const lastLine = lines[lines.length - 1];
      const newAction: Action = { type: ActionType.DRAW, line: lastLine };
      addAction(newAction);
    } else if (resizingNode && newNode) {
      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode.id);
      setResizingNode(null);
      setInitialPosition(null);

      const newAction: Action = { type: ActionType.ADD, node: newNode };
      addAction(newAction);
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
        cursor: isDragging ? 'grab' : getCursorStyle(nodeTypeToAdd, activeTool)
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default InfiniteCanvas;