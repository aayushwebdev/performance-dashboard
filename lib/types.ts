// lib/types.ts
export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'heatmap';
  dataKey: string;
  color: string;
  visible: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface FilterConfig {
  categories: string[];
  timeRange: TimeRange;
  aggregation: '1min' | '5min' | '1hour' | 'none';
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CoordinateSystem {
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  xInvert: (pixel: number) => number;
  yInvert: (pixel: number) => number;
}