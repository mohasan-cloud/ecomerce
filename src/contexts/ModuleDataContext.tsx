"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';

export interface ModuleDataItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  sort_order?: number;
  extra_data: Record<string, any>;
  highlights: string[];
}

interface ModuleDataResponse {
  success: boolean;
  data: ModuleDataItem[];
}

interface ModuleDataContextType {
  moduleData: Record<number, ModuleDataItem[]>;
  loading: Record<number, boolean>;
  error: Record<number, string | null>;
  isLoading: boolean;
  refetch: (moduleId?: number) => Promise<void>;
}

const ModuleDataContext = createContext<ModuleDataContextType | undefined>(undefined);

// List of module IDs that need to be fetched
const MODULE_IDS = [6, 9, 10, 11, 12, 13, 14, 16];

export const ModuleDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [moduleData, setModuleData] = useState<Record<number, ModuleDataItem[]>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<Record<number, string | null>>({});

  const fetchModuleData = useCallback(async (moduleId: number) => {
    try {
      setLoading(prev => ({ ...prev, [moduleId]: true }));
      setError(prev => ({ ...prev, [moduleId]: null }));
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/modules/${moduleId}/data`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'force-cache', // Cache the response
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ModuleDataResponse = await response.json();

      if (result.success && result.data) {
        setModuleData(prev => ({ ...prev, [moduleId]: result.data }));
      } else {
        setModuleData(prev => ({ ...prev, [moduleId]: [] }));
      }
    } catch (err) {
      console.error(`Error fetching module ${moduleId} data:`, err);
      let errorMessage = `Error fetching module ${moduleId} data`;
      
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Unable to connect to server. Please check if the API server is running.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(prev => ({ ...prev, [moduleId]: errorMessage }));
      setModuleData(prev => ({ ...prev, [moduleId]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [moduleId]: false }));
    }
  }, []);

  const fetchAllModules = useCallback(async () => {
    // Fetch all modules in parallel
    await Promise.all(MODULE_IDS.map(moduleId => fetchModuleData(moduleId)));
  }, [fetchModuleData]);

  const refetch = useCallback(async (moduleId?: number) => {
    if (moduleId) {
      await fetchModuleData(moduleId);
    } else {
      await fetchAllModules();
    }
  }, [fetchModuleData, fetchAllModules]);

  useEffect(() => {
    fetchAllModules();
  }, []);

  const isLoading = Object.values(loading).some(loading => loading === true);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    moduleData,
    loading,
    error,
    isLoading,
    refetch,
  }), [moduleData, loading, error, isLoading, refetch]);

  return (
    <ModuleDataContext.Provider value={contextValue}>
      {children}
    </ModuleDataContext.Provider>
  );
};

export const useModuleData = (moduleId: number) => {
  const context = useContext(ModuleDataContext);
  if (context === undefined) {
    throw new Error('useModuleData must be used within a ModuleDataProvider');
  }
  
  // Memoize return value to prevent unnecessary re-renders
  return useMemo(() => ({
    data: context.moduleData[moduleId] || [],
    loading: context.loading[moduleId] || false,
    error: context.error[moduleId] || null,
    refetch: () => context.refetch(moduleId),
  }), [context.moduleData[moduleId], context.loading[moduleId], context.error[moduleId], context.refetch, moduleId]);
};

