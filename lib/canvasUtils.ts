// lib/canvasUtils.ts
import { ChartDimensions, CoordinateSystem } from './types';

export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  
  return ctx;
}

export function createCoordinateSystem(
  dimensions: ChartDimensions,
  dataMin: number,
  dataMax: number,
  timeMin: number,
  timeMax: number
): CoordinateSystem {
  const { width, height, padding } = dimensions;
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const xScale = (timestamp: number) => {
    const normalized = (timestamp - timeMin) / (timeMax - timeMin);
    return padding.left + normalized * chartWidth;
  };
  
  const yScale = (value: number) => {
    const normalized = (value - dataMin) / (dataMax - dataMin);
    return height - padding.bottom - normalized * chartHeight;
  };
  
  const xInvert = (pixel: number) => {
    const normalized = (pixel - padding.left) / chartWidth;
    return timeMin + normalized * (timeMax - timeMin);
  };
  
  const yInvert = (pixel: number) => {
    const normalized = (height - padding.bottom - pixel) / chartHeight;
    return dataMin + normalized * (dataMax - dataMin);
  };
  
  return { xScale, yScale, xInvert, yInvert };
}

export function drawAxes(
  ctx: CanvasRenderingContext2D,
  dimensions: ChartDimensions,
  dataMin: number,
  dataMax: number
): void {
  const { width, height, padding } = dimensions;
  
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();
  
  // Y-axis labels
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const value = dataMin + (dataMax - dataMin) * (i / yTicks);
    const y = height - padding.bottom - (height - padding.top - padding.bottom) * (i / yTicks);
    
    ctx.fillText(value.toFixed(1), padding.left - 10, y);
    
    // Grid line
    ctx.strokeStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  dimensions: ChartDimensions,
  xTicks: number,
  yTicks: number
): void {
  const { width, height, padding } = dimensions;
  
  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth = 1;
  
  // Vertical grid lines
  for (let i = 0; i <= xTicks; i++) {
    const x = padding.left + (width - padding.left - padding.right) * (i / xTicks);
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= yTicks; i++) {
    const y = padding.top + (height - padding.top - padding.bottom) * (i / yTicks);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

export function getMousePosition(
  canvas: HTMLCanvasElement,
  event: MouseEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}