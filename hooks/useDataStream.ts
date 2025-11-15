// hooks/useDataStream.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DataPoint } from '@/lib/types';
import { generateNewDataPoint } from '@/lib/dataGenerator';

// Keep max 10K points for memory efficiency
const MAX_DATA_POINTS = 10000;

export function useDataStream(initialData: DataPoint[]) {
  // Ensure initial data doesn't exceed limit
  const trimmedInitial = initialData.length > MAX_DATA_POINTS 
    ? initialData.slice(-MAX_DATA_POINTS)
    : initialData;
    
  const [data, setData] = useState<DataPoint[]>(trimmedInitial);
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Real-time updates every 100ms as per requirement
    intervalRef.current = setInterval(() => {
      setData(prevData => {
        const lastValue = prevData[prevData.length - 1]?.value;
        const newPoint = generateNewDataPoint(lastValue);
        
        // Sliding window: maintain max points
        const newData = [...prevData, newPoint];
        if (newData.length > MAX_DATA_POINTS) {
          // Remove oldest 10% when limit exceeded for efficiency
          return newData.slice(Math.floor(MAX_DATA_POINTS * 0.1));
        }
        return newData;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming]);

  const toggleStreaming = useCallback(() => {
    setIsStreaming(prev => !prev);
  }, []);

  const resetData = useCallback((newData: DataPoint[]) => {
    const trimmed = newData.length > MAX_DATA_POINTS
      ? newData.slice(-MAX_DATA_POINTS)
      : newData;
    setData(trimmed);
  }, []);

  const addDataPoints = useCallback((points: DataPoint[]) => {
    setData(prevData => {
      const newData = [...prevData, ...points];
      if (newData.length > MAX_DATA_POINTS) {
        return newData.slice(-MAX_DATA_POINTS);
      }
      return newData;
    });
  }, []);

  return {
    data,
    isStreaming,
    toggleStreaming,
    resetData,
    addDataPoints
  };
}