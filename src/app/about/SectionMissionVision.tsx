"use client";

import React, { FC, useState, useEffect } from "react";
import Badge from "@/shared/Badge/Badge";

interface ModuleDataResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    description: string;
    image: string | null;
    extra_data: Record<string, any>;
    highlights: string[];
  }>;
}

// Skeleton Loading Component
const MissionVisionSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
      {[1, 2].map((item) => (
        <div key={item} className="p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SectionMissionVision: FC = () => {
  const [missionData, setMissionData] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);
  const [visionData, setVisionData] = useState<{
    title: string;
    description: string;
    icon: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch both Mission and Vision data in parallel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Fetch both APIs in parallel
        const [missionResponse, visionResponse] = await Promise.all([
          fetch(`${apiUrl}/api/modules/12/data`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${apiUrl}/api/modules/13/data`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }),
        ]);

        // Process Mission data
        if (missionResponse.ok && isMounted) {
          const result: ModuleDataResponse = await missionResponse.json();
          if (result.success && result.data && result.data.length > 0) {
            const item = result.data[0];
            const description = item.description 
              || (item.highlights && item.highlights.length > 0 ? item.highlights[0] : '')
              || item.extra_data?.description 
              || item.extra_data?.['Description'] 
              || '';
            
            if (isMounted) {
              setMissionData({
                title: item.title || 'Our Mission',
                description: description,
                icon: item.extra_data?.icon || item.extra_data?.['Icon'] || '🎯',
              });
            }
          }
        }

        // Process Vision data
        if (visionResponse.ok && isMounted) {
          const result: ModuleDataResponse = await visionResponse.json();
          if (result.success && result.data && result.data.length > 0) {
            const item = result.data[0];
            const description = item.description 
              || (item.highlights && item.highlights.length > 0 ? item.highlights[0] : '')
              || item.extra_data?.description 
              || item.extra_data?.['Description'] 
              || '';
            
            if (isMounted) {
              setVisionData({
                title: item.title || 'Our Vision',
                description: description,
                icon: item.extra_data?.icon || item.extra_data?.['Icon'] || '🌟',
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching mission/vision data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Show skeleton loading
  if (loading) {
    return <MissionVisionSkeleton />;
  }

  // Show empty state if no data
  if (!missionData && !visionData) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      {/* Mission Card */}
      {missionData && (
        <div className="p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Badge color="purple" name={missionData.icon} />
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {missionData.title}
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {missionData.description}
          </p>
        </div>
      )}

      {/* Vision Card */}
      {visionData && (
        <div className="p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Badge color="indigo" name={visionData.icon} />
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {visionData.title}
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {visionData.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default SectionMissionVision;

