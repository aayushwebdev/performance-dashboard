// components/ui/PerformanceMonitor.tsx
'use client';

import { PerformanceMetrics } from '@/lib/types';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  dataPointCount: number;
}

export default function PerformanceMonitor({
  metrics,
  dataPointCount
}: PerformanceMonitorProps) {
  const { fps, memoryUsage, renderTime, dataProcessingTime } = metrics;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="performance-monitor bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
      <h3 className="text-lg font-bold mb-3 text-gray-100">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-gray-400 text-xs mb-1">FPS</div>
          <div className={`text-2xl font-bold ${getFPSColor(fps)}`}>
            {fps}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: 60
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Memory</div>
          <div className="text-2xl font-bold text-blue-400">
            {memoryUsage.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            MB
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Render Time</div>
          <div className="text-2xl font-bold text-purple-400">
            {renderTime.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ms
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Data Points</div>
          <div className="text-2xl font-bold text-cyan-400">
            {dataPointCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            points
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Status:</span>
          <span className={fps >= 55 ? 'text-green-400' : 'text-yellow-400'}>
            {fps >= 55 ? '✓ Optimal Performance' : '⚠ Performance Degraded'}
          </span>
        </div>
      </div>
    </div>
  );
}