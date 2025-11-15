'use client';

import { useState, useMemo, useTransition } from 'react';
import { DataPoint, FilterConfig } from '@/lib/types';
import { DataProvider, useData } from '@/components/providers/DataProvider';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import ScatterPlot from '@/components/charts/ScatterPlot';
import Heatmap from '@/components/charts/Heatmap';
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';
import FilterPanel from '@/components/controls/FilterPanel';
import { filterByCategories, aggregateByTime } from '@/lib/performanceUtils';
import { generateTimeSeriesData } from '@/lib/dataGenerator';

function DashboardContent() {
  const { data, isStreaming, toggleStreaming, resetData } = useData();
  const { metrics } = usePerformanceMonitor();
  const [isPending, startTransition] = useTransition();

  const [filter, setFilter] = useState<FilterConfig>({
    categories: [],
    timeRange: { start: 0, end: Date.now() },
    aggregation: 'none'
  });

  // Responsive chart sizing
  const [chartSize] = useState({ width: 700, height: 350 });

  // Apply filters with memoization
  const filteredData = useMemo(() => {
    let result = data;

    if (filter.categories.length > 0) {
      result = filterByCategories(result, filter.categories);
    }

    if (filter.aggregation !== 'none') {
      const bucketSizes = {
        '1min': 60000,
        '5min': 300000,
        '1hour': 3600000
      };
      result = aggregateByTime(result, bucketSizes[filter.aggregation]);
    }

    return result;
  }, [data, filter]);

  const handleStressTest = (pointCount: number) => {
    startTransition(() => {
      const newData = generateTimeSeriesData(pointCount);
      resetData(newData);
    });
  };

  const handleFilterChange = (newFilter: FilterConfig) => {
    startTransition(() => {
      setFilter(newFilter);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="header mb-6 bg-blue-600">
          <h1 className="text-3xl font-bold text-white mb-2">
            Performance Dashboard
          </h1>
          <p className="text-white-600">
            Real-time data visualization with 10,000+ data points at 60 FPS
          </p>
        </div>

        {/* Performance Metrics & Controls */}
        <div className="control-row grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <PerformanceMonitor
              metrics={metrics}
              dataPointCount={data.length}
            />
          </div>

          <div className="stream bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Controls</h3>
            
            <button
              onClick={toggleStreaming}
              disabled={isPending}
              className={`w-full mb-3 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${
                isStreaming
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isStreaming ? 'Stop Stream' : 'Start Stream'}
            </button>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-2">Stress Test:</p>
              {[5000, 10000, 25000, 50000].map(count => (
                <button
                  key={count}
                  onClick={() => handleStressTest(count)}
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  {(count / 1000).toFixed(0)}K Points
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-container mb-6">
          <FilterPanel
            filter={filter}
            onFilterChange={handleFilterChange}
            availableCategories={['A', 'B', 'C', 'D', 'E']}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="chart-container bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Line Chart
            </h3>
            <LineChart
              data={filteredData}
              width={chartSize.width}
              height={chartSize.height}
              color="#3b82f6"
            />
          </div>

          <div className="chart-container bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Bar Chart (Aggregated)
            </h3>
            <BarChart
              data={filteredData}
              width={chartSize.width}
              height={chartSize.height}
              color="#10b981"
              bucketSize={5000}
            />
          </div>

          <div className="chart-container bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Scatter Plot
            </h3>
            <ScatterPlot
              data={filteredData}
              width={chartSize.width}
              height={chartSize.height}
            />
          </div>

          <div className="chart-container bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Heatmap
            </h3>
            <Heatmap
              data={filteredData}
              width={chartSize.width}
              height={chartSize.height}
            />
          </div>
        </div>

        {/* Optimizations Info */}
        <div className="footer mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Performance Optimizations Active:
          </h3>
          <ul className="grid grid-cols-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>LTTB downsampling (10K → 600 points per chart)</li>
            <li>RequestAnimationFrame loop with 60 FPS throttling</li>
            <li>Sliding window memory management (max 10K points)</li>
            <li>React.memo for all chart components</li>
            <li>Path2D API for efficient canvas rendering</li>
            <li>useTransition for non-blocking UI updates</li>
            <li>Server-side initial data generation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({ initialData }: { initialData: DataPoint[] }) {
  return (
    <DataProvider initialData={initialData}>
      <DashboardContent />
    </DataProvider>
  );
}