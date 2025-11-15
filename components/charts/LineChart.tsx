// components/charts/LineChart.tsx
'use client';

import { useEffect, useRef, useMemo, memo } from 'react';
import { DataPoint, ChartDimensions } from '@/lib/types';
import { setupCanvas, createCoordinateSystem, drawAxes, clearCanvas } from '@/lib/canvasUtils';
import { downsampleLTTB } from '@/lib/performanceUtils';

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
}

function LineChart({
  data,
  width,
  height,
  color = '#3b82f6'
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const dataRef = useRef<DataPoint[]>([]);

  const dimensions: ChartDimensions = {
    width,
    height,
    padding: { top: 20, right: 20, bottom: 40, left: 60 }
  };

  // Downsample to 600 points for optimal 60 FPS
  const displayData = useMemo(() => {
    if (data.length > 600) {
      return downsampleLTTB(data, 600);
    }
    return data;
  }, [data]);

  // Update data ref
  useEffect(() => {
    dataRef.current = displayData;
  }, [displayData]);

  // Calculate bounds
  const bounds = useMemo(() => {
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
    if (!canvas) return;

    const ctx = setupCanvas(canvas, width, height);
    let isActive = true;
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const coordSystem = createCoordinateSystem(
      dimensions,
      bounds.dataMin,
      bounds.dataMax,
      bounds.timeMin,
      bounds.timeMax
    );

    const render = (currentTime: number) => {
      if (!isActive) return;

      const deltaTime = currentTime - lastTime;

      // Throttle to exactly 60 FPS
      if (deltaTime < frameTime) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      lastTime = currentTime - (deltaTime % frameTime);

      // Clear and redraw
      ctx.clearRect(0, 0, width, height);
      drawAxes(ctx, dimensions, bounds.dataMin, bounds.dataMax);

      // Draw line using Path2D for best performance
      if (dataRef.current.length > 0) {
        const path = new Path2D();
        
        dataRef.current.forEach((point, index) => {
          const x = coordSystem.xScale(point.timestamp);
          const y = coordSystem.yScale(point.value);

          if (index === 0) {
            path.moveTo(x, y);
          } else {
            path.lineTo(x, y);
          }
        });

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke(path);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      isActive = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [width, height, color, bounds, dimensions]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg"
      />
      <div className="text-xs text-gray-500 mt-1">
        Rendering {displayData.length} of {data.length} points
      </div>
    </div>
  );
}

export default memo(LineChart);