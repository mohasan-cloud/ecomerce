"use client";

import React, { FC, useState, useEffect } from "react";
import Heading from "@/components/Heading/Heading";

interface ModuleDataResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    description: string;
    image: string | null;
    extra_data: Record<string, any>;
    highlights: string[];
    sort_order: number | null;
  }>;
}

interface CoreValue {
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

// Skeleton Loading Component
const CoreValuesSkeleton = () => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
        >
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mt-2"></div>
        </div>
      ))}
    </div>
  );
};

const SectionCoreValues: FC = () => {
  const [values, setValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Core Values data from Module ID 14
  useEffect(() => {
    const fetchCoreValues = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/modules/14/data`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ModuleDataResponse = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // Sort data by sort_order first, then by id
          const sortedData = [...result.data].sort((a, b) => {
            const sortA = a.sort_order ?? 0;
            const sortB = b.sort_order ?? 0;
            if (sortA !== sortB) {
              return sortA - sortB;
            }
            return a.id - b.id;
          });

          // Map API data to component format
          const mappedValues: CoreValue[] = sortedData.map((item) => {
            // Extract icon from extra_data
            const icon = item.extra_data?.icon 
              || item.extra_data?.['Icon'] 
              || item.extra_data?.extra_fields_1
              || '💎';
            
            // Extract description from description, highlights, or extra_data
            const description = item.description 
              || (item.highlights && item.highlights.length > 0 ? item.highlights[0] : '')
              || item.extra_data?.description 
              || item.extra_data?.['Description'] 
              || '';

            return {
              icon: icon,
              title: item.title || '',
              description: description,
              sort_order: item.sort_order ?? 0,
            };
          });

          setValues(mappedValues);
        } else {
          setValues([]);
        }
      } catch (err) {
        console.error('Error fetching core values data:', err);
        setValues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoreValues();
  }, []);

  // Show skeleton loading
  if (loading) {
    return (
      <div className="relative">
        <Heading
          desc="These principles guide everything we do and shape our company culture"
        >
          💎 Our Core Values
        </Heading>
        <CoreValuesSkeleton />
      </div>
    );
  }

  // Show empty state if no data
  if (!values || values.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Heading
        desc="These principles guide everything we do and shape our company culture"
      >
        💎 Our Core Values
      </Heading>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {values.map((value, index) => (
          <div
            key={index}
            className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">{value.icon}</div>
            <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {value.title}
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionCoreValues;

