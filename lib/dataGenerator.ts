// lib/dataGenerator.ts
import { DataPoint } from './types';

export function generateTimeSeriesData(count: number): DataPoint[] {
  const now = Date.now();
  const data: DataPoint[] = [];
  const categories = ['A', 'B', 'C', 'D', 'E'];

  for (let i = 0; i < count; i++) {
    const timeOffset = (count - i) * 100; // 100ms intervals
    const timestamp = now - timeOffset;
    
    // Generate realistic time-series data with trends and noise
    const trend = Math.sin(i / 100) * 30;
    const noise = (Math.random() - 0.5) * 20;
    const base = 50 + trend + noise;
    
    data.push({
      timestamp,
      value: Math.max(0, Math.min(100, base)),
      category: categories[i % categories.length]
    });
  }

  return data;
}

export function generateNewDataPoint(lastValue?: number): DataPoint {
  const categories = ['A', 'B', 'C', 'D', 'E'];
  
  // Generate value with momentum from last value
  const baseValue = lastValue !== undefined ? lastValue : 50;
  const change = (Math.random() - 0.5) * 10;
  const newValue = baseValue + change;
  
  return {
    timestamp: Date.now(),
    value: Math.max(0, Math.min(100, newValue)),
    category: categories[Math.floor(Math.random() * categories.length)]
  };
}

export function generateBatchData(count: number, lastValue?: number): DataPoint[] {
  const batch: DataPoint[] = [];
  let currentValue = lastValue !== undefined ? lastValue : 50;
  
  for (let i = 0; i < count; i++) {
    const point = generateNewDataPoint(currentValue);
    batch.push(point);
    currentValue = point.value;
  }
  
  return batch;
}