// lib/performanceUtils.ts
import { DataPoint } from './types';

// Largest Triangle Three Buckets (LTTB) Downsampling Algorithm
// export function downsampleLTTB(data: DataPoint[], threshold: number): DataPoint[] {
//   if (data.length <= threshold || threshold <= 2) {
//     return data;
//   }

//   const sampled: DataPoint[] = [];
//   sampled.push(data[0]); // Always keep first point

//   const bucketSize = (data.length - 2) / (threshold - 2);

//   let a = 0; // Initially a is the first point in the triangle

//   for (let i = 0; i < threshold - 2; i++) {
//     // Calculate point average for next bucket (for triangle apex)
//     let avgX = 0;
//     let avgY = 0;
//     const avgRangeStart = Math.floor((i + 2) * bucketSize) + 1;
//     const avgRangeEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, data.length);
//     const avgRangeLength = avgRangeEnd - avgRangeStart;

//     for (let j = avgRangeStart; j < avgRangeEnd; j++) {
//       avgX += data[j].timestamp;
//       avgY += data[j].value;
//     }
//     avgX /= avgRangeLength;
//     avgY /= avgRangeLength;

//     // Get the range for this bucket
//     const rangeOffs = Math.floor((i + 1) * bucketSize) + 1;
//     const rangeTo = Math.floor((i + 2) * bucketSize) + 1;

//     // Point a
//     const pointAX = data[a].timestamp;
//     const pointAY = data[a].value;

//     let maxArea = -1;
//     let maxAreaPoint = data[rangeOffs];

//     for (let j = rangeOffs; j < rangeTo; j++) {
//       // Calculate triangle area over three buckets
//       const area = Math.abs(
//         (pointAX - avgX) * (data[j].value - pointAY) - (pointAX - data[j].timestamp) * (avgY - pointAY)
//       ) * 0.5;

//       if (area > maxArea) {
//         maxArea = area;
//         maxAreaPoint = data[j];
//         a = j; // This a is the next a
//       }
//     }

//     sampled.push(maxAreaPoint);
//   }

//   sampled.push(data[data.length - 1]); // Always keep last point

//   return sampled;
// }

export function downsampleLTTB(data: DataPoint[], threshold: number): DataPoint[] {
  // Basic validation
  if (!Array.isArray(data) || data.length === 0) return [];
  // Filter out invalid items (defensive)
  const clean = data.filter(d =>
    d != null &&
    typeof d.timestamp === 'number' &&
    typeof d.value === 'number'
  );

  const n = clean.length;
  if (threshold >= n || threshold <= 2 || n <= 2) {
    // Nothing to do, return a shallow copy
    return clean.slice();
  }

  // handle small thresholds explicitly
  if (threshold === 1) return [clean[Math.floor(n / 2)]];
  if (threshold === 2) return [clean[0], clean[n - 1]];

  const sampled: DataPoint[] = [];
  // Always include first
  sampled.push(clean[0]);

  const bucketSize = (n - 2) / (threshold - 2);

  let a = 0; // index of previously selected point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate start & end for the "next" bucket used to compute average
    const avgStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, n);

    // clamp
    const avgRangeStart = Math.max(1, Math.min(avgStart, n - 1));
    const avgRangeEnd = Math.max(avgRangeStart + 1, Math.min(avgEnd, n));

    // compute average X,Y for next bucket
    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;
    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += clean[j].timestamp;
      avgY += clean[j].value;
      avgCount++;
    }
    if (avgCount > 0) {
      avgX /= avgCount;
      avgY /= avgCount;
    } else {
      // fallback to last point if bucket empty
      avgX = clean[n - 1].timestamp;
      avgY = clean[n - 1].value;
    }

    // Now search this bucket for the point with max triangle area
    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, n);

    const bucketStart = Math.max(1, Math.min(rangeStart, n - 1));
    const bucketStop = Math.max(bucketStart + 1, Math.min(rangeEnd, n));

    const pointAX = clean[a].timestamp;
    const pointAY = clean[a].value;

    let maxArea = -1;
    let maxAreaIdx = bucketStart;

    for (let j = bucketStart; j < bucketStop; j++) {
      const pj = clean[j];
      if (!pj) continue;
      // triangle area calculation (A = 0.5 * |(xA - xC)*(yB - yA) - (xA - xB)*(yC - yA)|)
      const area = Math.abs(
        (pointAX - avgX) * (pj.value - pointAY) -
        (pointAX - pj.timestamp) * (avgY - pointAY)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaIdx = j;
      }
    }

    sampled.push(clean[maxAreaIdx]);
    a = maxAreaIdx;
  }

  // Always include last
  sampled.push(clean[n - 1]);

  return sampled;
}

// Simple decimation (every nth point)
export function decimateData(data: DataPoint[], factor: number): DataPoint[] {
  if (factor <= 1) return data;
  
  const result: DataPoint[] = [];
  for (let i = 0; i < data.length; i += factor) {
    result.push(data[i]);
  }
  
  // Always include last point
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }
  
  return result;
}

// Aggregate data by time buckets
export function aggregateByTime(
  data: DataPoint[],
  bucketSize: number // in milliseconds
): DataPoint[] {
  if (data.length === 0) return [];

  const buckets = new Map<number, { sum: number; count: number; category: string }>();

  data.forEach(point => {
    const bucketKey = Math.floor(point.timestamp / bucketSize) * bucketSize;
    
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, { sum: 0, count: 0, category: point.category });
    }
    
    const bucket = buckets.get(bucketKey)!;
    bucket.sum += point.value;
    bucket.count += 1;
  });

  return Array.from(buckets.entries())
    .map(([timestamp, { sum, count, category }]) => ({
      timestamp,
      value: sum / count,
      category
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Filter data by time range
export function filterByTimeRange(
  data: DataPoint[],
  start: number,
  end: number
): DataPoint[] {
  return data.filter(point => point.timestamp >= start && point.timestamp <= end);
}

// Filter by categories
export function filterByCategories(
  data: DataPoint[],
  categories: string[]
): DataPoint[] {
  if (categories.length === 0) return data;
  return data.filter(point => categories.includes(point.category));
}

// Calculate data statistics
export interface DataStatistics {
  min: number;
  max: number;
  mean: number;
  count: number;
}

export function calculateStatistics(data: DataPoint[]): DataStatistics {
  if (data.length === 0) {
    return { min: 0, max: 0, mean: 0, count: 0 };
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  data.forEach(point => {
    if (point.value < min) min = point.value;
    if (point.value > max) max = point.value;
    sum += point.value;
  });

  return {
    min,
    max,
    mean: sum / data.length,
    count: data.length
  };
}