// components/providers/DataProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { DataPoint } from '@/lib/types';
import { useDataStream } from '@/hooks/useDataStream';

interface DataContextType {
  data: DataPoint[];
  isStreaming: boolean;
  toggleStreaming: () => void;
  resetData: (newData: DataPoint[]) => void;
  addDataPoints: (points: DataPoint[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({
  children,
  initialData
}: {
  children: ReactNode;
  initialData: DataPoint[];
}) {
  const dataStream = useDataStream(initialData);

  return (
    <DataContext.Provider value={dataStream}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}