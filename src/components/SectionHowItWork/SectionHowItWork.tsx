"use client";

import React, { FC, useState, useEffect } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import VectorImg from "@/images/VectorHIW.svg";
import Badge from "@/shared/Badge/Badge";
import Image from "next/image";
import { useSiteData } from "@/hooks/useSiteData";

export interface SectionHowItWorkProps {
  className?: string;
}

interface HowItWorkItem {
  id: number;
  img: string;
  imgDark: string;
  title: string;
  desc: string;
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
    sort_order: number | null;
  }>;
}

// Skeleton Loading Component
const HowItWorkSkeleton = () => {
  return (
    <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-16 xl:gap-20">
      <Image
        className="hidden md:block absolute inset-x-0 top-5"
        src={VectorImg}
        alt="vector"
      />
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="relative flex flex-col items-center max-w-xs mx-auto animate-pulse"
        >
          <div className="mb-4 sm:mb-10 max-w-[140px] mx-auto">
            <div className="w-[140px] h-[140px] bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          </div>
          <div className="text-center mt-auto space-y-5 w-full">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 mx-auto"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mx-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SectionHowItWork: FC<SectionHowItWorkProps> = ({
  className = "",
}) => {
  const [data, setData] = useState<HowItWorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleDataFetched, setModuleDataFetched] = useState(false);
  const { siteData } = useSiteData();

  // Get site logo as fallback
  const getSiteLogo = () => {
    if (siteData?.settings) {
      return siteData.settings.site_logo 
        || siteData.settings.header_logo 
        || siteData.settings.color_logo 
        || null;
    }
    return null;
  };

  // Fetch module data from API (only once)
  useEffect(() => {
    if (moduleDataFetched) return;

    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/modules/9/data`, {
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
          const siteLogo = getSiteLogo();
          
          // Sort data by extra_fields_1 (number count) first, then by sort_order, then by id
          const sortedData = [...result.data].sort((a, b) => {
            // Get extra_fields_1 as number
            const extraField1A = a.extra_data?.extra_fields_1 
              ? parseInt(a.extra_data.extra_fields_1, 10) 
              : (a.sort_order ?? 0);
            const extraField1B = b.extra_data?.extra_fields_1 
              ? parseInt(b.extra_data.extra_fields_1, 10) 
              : (b.sort_order ?? 0);
            
            // If extra_fields_1 values are different, sort by that
            if (!isNaN(extraField1A) && !isNaN(extraField1B) && extraField1A !== extraField1B) {
              return extraField1A - extraField1B;
            }
            
            // Fallback to sort_order if extra_fields_1 is not available
            const sortA = a.sort_order ?? 0;
            const sortB = b.sort_order ?? 0;
            if (sortA !== sortB) {
              return sortA - sortB;
            }
            
            // Final fallback to id
            return a.id - b.id;
          });

          // Map API data to component format
          const mappedData: HowItWorkItem[] = sortedData.map((item) => {
            // Extract image from API or extra_data, fallback to site logo
            const imageUrl = item.image 
              || item.extra_data?.image 
              || item.extra_data?.['Image'] 
              || siteLogo
              || '';
            
            // Extract title from title or extra_data
            const title = item.title || item.extra_data?.title || item.extra_data?.['Title'] || '';
            
            // Extract description from description, highlights, or extra_data
            const desc = item.description 
              || (item.highlights && item.highlights.length > 0 ? item.highlights[0] : '')
              || item.extra_data?.description 
              || item.extra_data?.['Description'] 
              || '';

            return {
              id: item.id,
              img: imageUrl,
              imgDark: imageUrl, // Same image for dark mode
              title: title,
              desc: desc,
            };
          });

          setData(mappedData);
          setModuleDataFetched(true);
        } else {
          setData([]);
          setModuleDataFetched(true);
        }
      } catch (err) {
        console.error('Error fetching module data:', err);
        setData([]);
        setModuleDataFetched(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleDataFetched, siteData]);

  // Update images when siteData becomes available (for fallback logo)
  useEffect(() => {
    if (siteData && data.length > 0) {
      const siteLogo = getSiteLogo();
      if (siteLogo) {
        setData(prevData => 
          prevData.map(item => ({
            ...item,
            img: item.img || siteLogo,
            imgDark: item.imgDark || siteLogo,
          }))
        );
      }
    }
  }, [siteData]);
  // Show skeleton loading
  if (loading) {
    return (
      <div className={`nc-SectionHowItWork ${className}`}>
        <HowItWorkSkeleton />
      </div>
    );
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`nc-SectionHowItWork ${className}`}>
      <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-16 xl:gap-20">
        <Image
          className="hidden md:block absolute inset-x-0 top-5"
          src={VectorImg}
          alt="vector"
        />
        {data.map((item, index: number) => (
          <div
            key={item.id}
            className="relative flex flex-col items-center max-w-xs mx-auto"
          >
            {item.img ? (
              item.img.startsWith('http') || item.img.startsWith('//') ? (
                // External URL - use regular img tag
                <img
                  className="mb-4 sm:mb-10 max-w-[140px] mx-auto rounded-3xl"
                  src={item.img}
                  alt={item.title}
                />
              ) : (
                // Local image - use NcImage
                <NcImage
                  containerClassName="mb-4 sm:mb-10 max-w-[140px] mx-auto"
                  className="rounded-3xl"
                  src={item.img}
                  sizes="150px"
                  alt={item.title}
                />
              )
            ) : (
              // No image - show placeholder or nothing
              <div className="mb-4 sm:mb-10 max-w-[140px] mx-auto w-[140px] h-[140px] bg-slate-200 dark:bg-slate-700 rounded-3xl flex items-center justify-center">
                <span className="text-slate-400 text-xs">No Image</span>
              </div>
            )}
            <div className="text-center mt-auto space-y-5">
              <Badge
                name={`Step ${index + 1}`}
                color={
                  !index
                    ? "red"
                    : index === 1
                    ? "indigo"
                    : index === 2
                    ? "yellow"
                    : "purple"
                }
              />
              <h3 className="text-base font-semibold">{item.title}</h3>
              <span className="block text-slate-600 dark:text-slate-400 text-sm leading-6">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHowItWork;
