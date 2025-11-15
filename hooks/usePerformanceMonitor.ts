// hooks/usePerformanceMonitor.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { PerformanceMetrics } from '@/lib/types';

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime >= 2000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        
        // Calculate average render time
        const avgRenderTime = renderTimesRef.current.length > 0
          ? renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length
          : 0;

        setMetrics(prev => ({
          ...prev,
          fps,
          renderTime: avgRenderTime,
          memoryUsage: (performance as any).memory
            ? (performance as any).memory.usedJSHeapSize / 1048576
            : 0
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
        renderTimesRef.current = [];
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const recordRenderTime = (time: number) => {
    renderTimesRef.current.push(time);
  };

  const recordDataProcessingTime = (time: number) => {
    setMetrics(prev => ({ ...prev, dataProcessingTime: time }));
  };

  return {
    metrics,
    recordRenderTime,
    recordDataProcessingTime
  };
}