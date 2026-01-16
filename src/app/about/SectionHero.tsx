"use client";

import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Image from "next/image";
import NcImage from "@/shared/NcImage/NcImage";
import { Route } from "@/routers/types";

export interface SectionHeroProps {
  className?: string;
}

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
const HeroSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row space-y-14 lg:space-y-0 lg:space-x-10 items-center relative text-center lg:text-left animate-pulse">
      <div className="w-screen max-w-full xl:max-w-lg space-y-5 lg:space-y-7">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
      </div>
      <div className="flex-grow w-full">
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
};

const SectionHero: FC<SectionHeroProps> = ({
  className = "",
}) => {
  const [data, setData] = useState<{
    heading: string;
    subHeading: string;
    image: string | null;
    buttonText: string;
    buttonLink: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch module data from API
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/modules/11/data`, {
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
          // Get first item from module data
          const item = result.data[0];
          
          // Extract button text from extra_fields_1
          const buttonText = item.extra_data?.extra_fields_1 
            || item.extra_data?.btnText 
            || item.extra_data?.button_text 
            || item.extra_data?.['Button Text']
            || '';
          
          // Extract button link from extra_fields_2
          const buttonLink = item.extra_data?.extra_fields_2 
            || item.extra_data?.btnLink 
            || item.extra_data?.button_link 
            || item.extra_data?.['Button Link']
            || '/';
          
          // Extract description from description, highlights, or extra_data
          const description = item.description 
            || (item.highlights && item.highlights.length > 0 ? item.highlights[0] : '')
            || item.extra_data?.description 
            || item.extra_data?.['Description'] 
            || '';

          setData({
            heading: item.title || '',
            subHeading: description,
            image: item.image || null,
            buttonText: buttonText,
            buttonLink: buttonLink,
          });
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('Error fetching module data:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, []);

  // Show skeleton loading
  if (loading) {
    return (
      <div
        className={`nc-SectionHero relative ${className}`}
        data-nc-id="SectionHero"
      >
        <HeroSkeleton />
      </div>
    );
  }

  // Show empty state if no data
  if (!data) {
    return null;
  }

  return (
    <div
      className={`nc-SectionHero relative ${className}`}
      data-nc-id="SectionHero"
    >
      <div className="flex flex-col lg:flex-row space-y-14 lg:space-y-0 lg:space-x-10 items-center relative text-center lg:text-left">
        <div className="w-screen max-w-full xl:max-w-lg space-y-5 lg:space-y-7">
          <h2 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100">
            {data.heading}
          </h2>
          <span className="block text-base xl:text-lg text-neutral-600 dark:text-neutral-400">
            {data.subHeading}
          </span>
          {data.buttonText && (
            <ButtonPrimary href={data.buttonLink as Route}>
              {data.buttonText}
            </ButtonPrimary>
          )}
        </div>
        {data.image && (
          <div className="flex-grow">
            {data.image.startsWith('http') || data.image.startsWith('//') ? (
              // External URL - use regular img tag
              <img 
                className="w-full rounded-lg" 
                src={data.image} 
                alt={data.heading}
              />
            ) : (
              // Local image - use Next.js Image
              <Image 
                className="w-full rounded-lg" 
                src={data.image} 
                alt={data.heading}
                width={800}
                height={600}
                priority
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHero;
