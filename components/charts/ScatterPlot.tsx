'use client';

import { useEffect, useRef, useMemo } from 'react';
import { DataPoint, ChartDimensions } from '@/lib/types';
import { setupCanvas, createCoordinateSystem, drawAxes, clearCanvas } from '@/lib/canvasUtils';
import { downsampleLTTB } from '@/lib/performanceUtils';

interface ScatterPlotProps {
  data: DataPoint[];
  width: number;
  height: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'A': '#ef4444',
  'B': '#3b82f6',
  'C': '#10b981',
  'D': '#f59e0b',
  'E': '#8b5cf6'
};

export default function ScatterPlot({
  data,
  width,
  height
}: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions: ChartDimensions = {
    width,
    height,
    padding: { top: 20, right: 20, bottom: 40, left: 60 }
  };

  // Downsample for performance
  const displayData = useMemo(() => {
    if (data.length > 2000) {
      return downsampleLTTB(data, 2000);
    }
    return data;
  }, [data]);

  const { dataMin, dataMax, timeMin, timeMax } = useMemo(() => {
    if (data.length === 0) {
      return { dataMin: 0, dataMax: 100, timeMin: 0, timeMax: 1 };
    }

    let min = Infinity;
    let max = -Infinity;
    let tMin = Infinity;
    let tMax = -Infinity;

    data.forEach(point => {
      if (point.value < min) min = point.value;
      if (point.value > max) max = point.value;
      if (point.timestamp < tMin) tMin = point.timestamp;
      if (point.timestamp > tMax) tMax = point.timestamp;
    });

    const padding = (max - min) * 0.1;
    return {
      dataMin: min - padding,
      dataMax: max + padding,
      timeMin: tMin,
      timeMax: tMax
    };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayData.length === 0) return;

    const ctx = setupCanvas(canvas, width, height);
    const coordSystem = createCoordinateSystem(
      dimensions,
      dataMin,
      dataMax,
      timeMin,
      timeMax
    );

    clearCanvas(ctx, width, height);
    drawAxes(ctx, dimensions, dataMin, dataMax);

    // Draw points
    displayData.forEach(point => {
      const x = coordSystem.xScale(point.timestamp);
      const y = coordSystem.yScale(point.value);
      
      ctx.fillStyle = CATEGORY_COLORS[point.category] || '#6b7280';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw legend
    const legendX = width - dimensions.padding.right - 100;
    let legendY = dimensions.padding.top + 10;

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    Object.entries(CATEGORY_COLORS).forEach(([category, color]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(legendX, legendY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.fillText(`Category ${category}`, legendX + 10, legendY + 4);
      legendY += 20;
    });

  }, [displayData, width, height, dataMin, dataMax, timeMin, timeMax, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded-lg"
    />
  );
}