// app/page.tsx
import { generateTimeSeriesData } from '@/lib/dataGenerator';
import DashboardClient from './DashboardClient';

// Server Component - generates initial data
export default async function DashboardPage() {
  // Generate 10,000 initial data points as per assignment requirement
  const initialData = generateTimeSeriesData(10000);

  return <DashboardClient initialData={initialData} />;
}