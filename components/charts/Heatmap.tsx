// components/charts/Heatmap.tsx
'use client';

import { useEffect, useRef, useMemo } from 'react';
import { DataPoint, ChartDimensions } from '@/lib/types';
import { setupCanvas, clearCanvas } from '@/lib/canvasUtils';
// import { aggregateByTime } from '@/lib/performanceUtils';

interface HeatmapProps {
  data: DataPoint[];
  width: number;
  height: number;
}

export default function Heatmap({ data, width, height }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions: ChartDimensions = {
    width,
    height,
    padding: { top: 40, right: 80, bottom: 60, left: 60 }
  };

  // Create 2D grid data
  const gridData = useMemo(() => {
    const categories = ['A', 'B', 'C', 'D', 'E'];
    const timeSlots = 20; // Number of time buckets
    
    if (data.length === 0) {
      return { grid: [], categories, timeSlots, max: 0 };
    }

    const timeMin = Math.min(...data.map(d => d.timestamp));
    const timeMax = Math.max(...data.map(d => d.timestamp));
    const timeBucketSize = (timeMax - timeMin) / timeSlots;

    // Initialize grid
    const grid: number[][] = Array(categories.length)
      .fill(0)
      .map(() => Array(timeSlots).fill(0));
    
    const counts: number[][] = Array(categories.length)
      .fill(0)
      .map(() => Array(timeSlots).fill(0));

    // Aggregate data into grid
    data.forEach(point => {
      const categoryIndex = categories.indexOf(point.category);
      if (categoryIndex === -1) return;

      const timeIndex = Math.min(
        Math.floor((point.timestamp - timeMin) / timeBucketSize),
        timeSlots - 1
      );

      grid[categoryIndex][timeIndex] += point.value;
      counts[categoryIndex][timeIndex]++;
    });

    // Calculate averages
    let max = 0;
    for (let i = 0; i < categories.length; i++) {
      for (let j = 0; j < timeSlots; j++) {
        if (counts[i][j] > 0) {
          grid[i][j] = grid[i][j] / counts[i][j];
          if (grid[i][j] > max) max = grid[i][j];
        }
      }
    }

    return { grid, categories, timeSlots, max };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gridData.grid.length === 0) return;

    const ctx = setupCanvas(canvas, width, height);
    clearCanvas(ctx, width, height);

    const { grid, categories, timeSlots, max } = gridData;

    const chartWidth = width - dimensions.padding.left - dimensions.padding.right;
    const chartHeight = height - dimensions.padding.top - dimensions.padding.bottom;
    
    const cellWidth = chartWidth / timeSlots;
    const cellHeight = chartHeight / categories.length;

    // Draw cells
    for (let i = 0; i < categories.length; i++) {
      for (let j = 0; j < timeSlots; j++) {
        const value = grid[i][j];
        const intensity = max > 0 ? value / max : 0;
        
        // Color gradient from blue (low) to red (high)
        const r = Math.floor(intensity * 239 + (1 - intensity) * 59);
        const g = Math.floor(intensity * 68 + (1 - intensity) * 130);
        const b = Math.floor(intensity * 68 + (1 - intensity) * 246);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        const x = dimensions.padding.left + j * cellWidth;
        const y = dimensions.padding.top + i * cellHeight;
        
        ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);

        // Draw value text if cell is large enough
        if (cellWidth > 40 && cellHeight > 30) {
          ctx.fillStyle = intensity > 0.5 ? '#ffffff' : '#000000';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            value.toFixed(1),
            x + cellWidth / 2,
            y + cellHeight / 2
          );
        }
      }
    }

    // Draw category labels (Y-axis)
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    categories.forEach((cat, i) => {
      const y = dimensions.padding.top + i * cellHeight + cellHeight / 2;
      ctx.fillText(`Category ${cat}`, dimensions.padding.left - 10, y);
    });

    // Draw time labels (X-axis)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let j = 0; j < Math.min(timeSlots, 10); j++) {
      const step = Math.floor(timeSlots / 10);
      const index = j * step;
      const x = dimensions.padding.left + index * cellWidth + cellWidth / 2;
      const y = height - dimensions.padding.bottom + 10;
      ctx.fillText(`T${index}`, x, y);
    }

    // Draw color scale legend
    const legendWidth = 20;
    const legendHeight = chartHeight;
    const legendX = width - dimensions.padding.right + 20;
    const legendY = dimensions.padding.top;

    for (let i = 0; i < 100; i++) {
      const intensity = i / 100;
      const r = Math.floor(intensity * 239 + (1 - intensity) * 59);
      const g = Math.floor(intensity * 68 + (1 - intensity) * 130);
      const b = Math.floor(intensity * 68 + (1 - intensity) * 246);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(
        legendX,
        legendY + legendHeight - (i / 100) * legendHeight,
        legendWidth,
        legendHeight / 100
      );
    }

    // Legend labels
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    ctx.fillText(max.toFixed(1), legendX + legendWidth + 5, legendY);
    ctx.fillText('0', legendX + legendWidth + 5, legendY + legendHeight);

  }, [gridData, width, height, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded-lg"
    />
  );
}