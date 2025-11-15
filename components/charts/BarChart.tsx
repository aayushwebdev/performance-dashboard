'use client';

import { useEffect, useRef, useMemo, memo } from 'react';
import { DataPoint, ChartDimensions } from '@/lib/types';
import { setupCanvas, createCoordinateSystem, drawAxes, clearCanvas } from '@/lib/canvasUtils';
import { aggregateByTime } from '@/lib/performanceUtils';

interface BarChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
  bucketSize?: number;
}

function BarChart({
  data,
  width,
  height,
  color = '#10b981',
  bucketSize = 5000
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions: ChartDimensions = {
    width,
    height,
    padding: { top: 20, right: 20, bottom: 40, left: 60 }
  };

  const aggregatedData = useMemo(() => {
    return aggregateByTime(data, bucketSize);
  }, [data, bucketSize]);

  const bounds = useMemo(() => {
    if (aggregatedData.length === 0) {
      return { dataMin: 0, dataMax: 100, timeMin: 0, timeMax: 1 };
    }

    let min = Infinity;
    let max = -Infinity;
    let tMin = Infinity;
    let tMax = -Infinity;

    aggregatedData.forEach(point => {
      if (point.value < min) min = point.value;
      if (point.value > max) max = point.value;
      if (point.timestamp < tMin) tMin = point.timestamp;
      if (point.timestamp > tMax) tMax = point.timestamp;
    });

    const padding = (max - min) * 0.1;
    return {
      dataMin: 0,
      dataMax: max + padding,
      timeMin: tMin,
      timeMax: tMax
    };
  }, [aggregatedData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || aggregatedData.length === 0) return;

    const ctx = setupCanvas(canvas, width, height);
    const coordSystem = createCoordinateSystem(
      dimensions,
      bounds.dataMin,
      bounds.dataMax,
      bounds.timeMin,
      bounds.timeMax
    );

    clearCanvas(ctx, width, height);
    drawAxes(ctx, dimensions, bounds.dataMin, bounds.dataMax);

    const chartWidth = width - dimensions.padding.left - dimensions.padding.right;
    const barWidth = Math.max(2, (chartWidth / aggregatedData.length) * 0.8);

    ctx.fillStyle = color;
    aggregatedData.forEach((point) => {
      const x = coordSystem.xScale(point.timestamp);
      const y = coordSystem.yScale(point.value);
      const barHeight = coordSystem.yScale(0) - y;

      ctx.fillRect(
        x - barWidth / 2,
        y,
        barWidth,
        barHeight
      );
    });

  }, [aggregatedData, width, height, color, bounds, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded-lg"
    />
  );
}

export default memo(BarChart);