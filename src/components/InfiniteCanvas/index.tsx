import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Action, ActionType, InfiniteCanvasProps, Line, NodeData, Point, ToolType, Transform } from '../../types';
import SmoothBrush from '../../utils/SmoothBrush';
import { drawNode, drawNodePrevOutline, getCanvasCoordinates, getCursorStyle, isPointInNode, isPointOnLine } from './utils';
import { useThemeContext } from '../../contexts/ThemeContext/useThemeContext';
import { useCanvasToolsContext } from '../../contexts/CanvasToolsContext/useCanvasToolsContext';

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  nodes,
  onUpdateNode,
  onPlaceNode,
  onDeleteNode,
  nodeTypeToAdd,
  onMouseUp,
  setNodes,
  addAction
}) => {
  const { isDarkMode } = useThemeContext();
  const { activeTool, lines, setLines, lineColor, lineWidth} = useCanvasToolsContext();
  

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
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    grid: isDarkMode ? '#333333' : '#dddddd',
    axes: isDarkMode ? '#404040' : '#cccccc'
  };
  
  const transformColorForTheme = (color: string, darkMode: boolean): string => {
    const lightToDark = {
      '#000000': '#FFFFFF',
      '#FF4D4D': '#FF6666',
      '#4DFF4D': '#66FF66',
      '#4D4DFF': '#6666FF',
      '#FFB84D': '#FFB366',
      '#A64DA6': '#CC99CC',
      '#FFFF66': '#FFFF99',
      '#FF66FF': '#FF99FF',
    };

    const darkToLight = Object.fromEntries(
      Object.entries(lightToDark).map(([light, dark]) => [dark, light])
    );

    const mapping = darkMode ? lightToDark : darkToLight;
    return (mapping as Record<string, string>)[color] || color;
  };

  useEffect(() => {
    setLines((prevLines) =>
      prevLines.map((line) => ({
        ...line,
        color: transformColorForTheme(line.color, isDarkMode),
      }))
    );
  }, [isDarkMode, setLines]);

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

  const drawSmoothLine = useCallback((points: Point[], color: string, lineWidth: number) => {
    if (!context || points.length < 2) return;

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      context?.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    context?.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );

    context.stroke();
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
      drawNode(context, node, isDarkMode, selectedNode);
    });

    lines.forEach(line => {
      drawSmoothLine(line.points, line.color, line.width);
    });

    if (newNode) {
      drawNodePrevOutline(context, newNode, isDarkMode);
    }

    context.restore();
  }, 
  [context, colors.background, transform.x, transform.y, transform.scale, drawGrid, nodes, lines, newNode, isDarkMode, selectedNode, drawSmoothLine]);

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
  }, [context, transform, isDarkMode, nodes, selectedNode, lines, lineColor]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !context) return;

    const coords = getCanvasCoordinates(canvasRef.current, e.clientX, e.clientY, transform);

    if (drawing) {
      handlePencilDrawing(coords);
      return;
    }

    if (resizingNode && initialPosition && newNode) {
      handleNodeResizing(coords);
      return;
    }

    if (isDraggingNode && selectedNode && lastPosition) {
      handleNodeDragging(e);
      return;
    }

    if (isDragging && lastPosition) {
      handleCanvasDragging(e);
    }
  };

  const handlePencilDrawing = (coords: Point) => {
    smoothBrush.update(coords, { both: false, friction: 0.30 });
    const brushCoords = smoothBrush.getBrushCoordinates();

    setLines(prev => {
      const newLines = [...prev];
      const lastIndex = newLines.length - 1;
      if (lastIndex >= 0) {
        newLines[lastIndex] = {
          ...newLines[lastIndex],
          points: [...newLines[lastIndex].points, brushCoords]
        };
      }
      return newLines;
    });

    draw();
  };

  const handleNodeResizing = (coords: Point) => {
    const newWidth = Math.abs(coords.x - initialPosition!.x);
    const newHeight = Math.abs(coords.y - initialPosition!.y);

    const newPosition = {
      x: coords.x < initialPosition!.x 
        ? initialPosition!.x - newWidth / 2 
        : initialPosition!.x + newWidth / 2,
      y: coords.y < initialPosition!.y 
        ? initialPosition!.y - newHeight / 2 
        : initialPosition!.y + newHeight / 2
    };

    setNewNode(prev => prev ? ({
      ...prev,
      width: newWidth,
      height: newHeight,
      position: newPosition
    }) : null);

    draw();
  };

  const handleNodeDragging = (e: React.MouseEvent) => {
    const deltaX = (e.clientX - lastPosition!.x) / transform.scale;
    const deltaY = (e.clientY - lastPosition!.y) / transform.scale;

    const node = nodes.find(n => n.id === selectedNode);
    if (node && selectedNode) {
      onUpdateNode?.(selectedNode, {
        x: node.position.x + deltaX,
        y: node.position.y + deltaY
      });
    }

    setLastPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasDragging = (e: React.MouseEvent) => {
    const deltaX = e.clientX - lastPosition!.x;
    const deltaY = e.clientY - lastPosition!.y;

    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastPosition({ x: e.clientX, y: e.clientY });
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(canvasRef.current!, e.clientX, e.clientY, transform);

    if (e.button === 1) {
      startCanvasDragging(e);
      return;
    }

    if (activeTool === ToolType.ERASER) {
      handleEraserAction(coords);
      return;
    }

    if (activeTool === ToolType.PENCIL) {
      startDrawing(coords);
      return;
    }

    if (nodeTypeToAdd) {
      startNodeCreation(coords);
      return;
    }

    const clickedNode = nodes.find(node => isPointInNode(coords, node));
    if (clickedNode) {
      startNodeDragging(e, clickedNode);
      return;
    }

    handleToolSpecificActions(e, coords);
  };

  const startCanvasDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
  };

  const handleEraserAction = (coords: Point) => {
    const lineIndex = lines.findIndex(line => isPointOnLine(coords, line.points));
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
  };

  const startDrawing = (coords: Point) => {
    setDrawing(true);
    const newLine: Line = {
      points: [coords],
      color: lineColor,
      width: lineWidth
    };
    setLines(prev => [...prev, newLine]);
    smoothBrush.update(coords, { both: true });
  };

  const startNodeCreation = (coords: Point) => {
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
  };

  const startNodeDragging = (e: React.MouseEvent, clickedNode: NodeData) => {
    setSelectedNode(clickedNode.id);
    setIsDraggingNode(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
    setInitialPosition(clickedNode.position);
  };

  const handleToolSpecificActions = (e: React.MouseEvent, coords: Point) => {
    switch (activeTool) {
      case ToolType.ZOOM:
        performZoom(e, coords);
        break;
      case ToolType.PAN:
        startCanvasDragging(e);
        break;
      default:
        if (onPlaceNode && nodeTypeToAdd) {
          onPlaceNode(coords);
        } else {
          startCanvasDragging(e);
        }
    }
  };

  const performZoom = (e: React.MouseEvent, coords: Point) => {
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
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) {
      resetCanvasDragging();
      return;
    }

    if (drawing) {
      finishDrawing();
      return;
    }

    if (resizingNode && newNode) {
      finalizeNodeCreation();
      return;
    }

    if (isDraggingNode && selectedNode && initialPosition) {
      handleNodeDragCompletion();
    }

    resetDraggingStates();
  };

  const resetCanvasDragging = () => {
    setIsDragging(false);
    setLastPosition(null);
  };

  const finishDrawing = () => {
    setDrawing(false);
    const lastLine = lines[lines.length - 1];
    const newAction: Action = { 
      type: ActionType.DRAW, 
      line: lastLine 
    };
    addAction(newAction);
  };

  const finalizeNodeCreation = () => {
    setNodes(prev => [...prev, newNode!]);
    
    setSelectedNode(newNode!.id);
    
    const newAction: Action = { 
      type: ActionType.ADD, 
      node: newNode! 
    };
    addAction(newAction);

    setResizingNode(null);
    setInitialPosition(null);
    setNewNode(null);
  };

  const handleNodeDragCompletion = () => {
    onMouseUp?.(selectedNode!, initialPosition!);
  };

  const resetDraggingStates = () => {
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