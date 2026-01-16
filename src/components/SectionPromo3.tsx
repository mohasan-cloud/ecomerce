"use client";

import React, { FC, useState, useEffect } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import backgroundLineSvg from "@/images/BackgroundLine.svg";
import Badge from "@/shared/Badge/Badge";
import Input from "@/shared/Input/Input";
import ButtonCircle from "@/shared/Button/ButtonCircle";
import { ArrowSmallRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export interface SectionPromo3Props {
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
    sort_order: number | null;
  }>;
}

// Skeleton Loading Component
const Promo3Skeleton = () => {
  return (
    <div className="relative flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-800 rounded-2xl sm:rounded-[40px] p-4 pb-0 sm:p-5 sm:pb-0 lg:p-24 animate-pulse">
      <div className="lg:w-[50%] max-w-lg relative">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-5"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-10"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="mt-10 h-12 bg-slate-200 dark:bg-slate-700 rounded-full w-full max-w-sm"></div>
      </div>
      <div className="flex-grow mt-10 lg:mt-0">
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
};

const SectionPromo3: FC<SectionPromo3Props> = ({ className = "lg:pt-10" }) => {
  const [data, setData] = useState<{
    title: string;
    description: string;
    image: string | null;
    highlights: string[];
    emailPlaceholder: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch module data from API
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/modules/16/data`, {
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
          
          // Extract highlights - check multiple sources and ensure it's an array
          let highlights: string[] = [];
          
          // First check item.highlights (direct array)
          if (item.highlights && Array.isArray(item.highlights) && item.highlights.length > 0) {
            highlights = item.highlights.filter(h => h && h.trim() !== '');
          }
          // Then check extra_data.highlights
          else if (item.extra_data?.highlights) {
            if (Array.isArray(item.extra_data.highlights)) {
              highlights = item.extra_data.highlights.filter((h: any) => h && String(h).trim() !== '');
            } else if (typeof item.extra_data.highlights === 'string') {
              // If it's a JSON string, try to parse it
              try {
                const parsed = JSON.parse(item.extra_data.highlights);
                if (Array.isArray(parsed)) {
                  highlights = parsed.filter((h: any) => h && String(h).trim() !== '');
                }
              } catch (e) {
                // If not JSON, treat as single item
                highlights = [item.extra_data.highlights];
              }
            }
          }

          console.log('Highlights data:', highlights);

          // Extract email placeholder from extra_data
          const emailPlaceholder = item.extra_data?.email_placeholder 
            || item.extra_data?.['Email Placeholder']
            || item.extra_data?.emailPlaceholder
            || item.extra_data?.placeholder
            || item.extra_data?.['Placeholder']
            || 'Enter your email';

          setData({
            title: item.title || '',
            description: item.description || '',
            image: item.image || null,
            highlights: highlights,
            emailPlaceholder: emailPlaceholder,
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
      <div className={`nc-SectionPromo3 ${className}`}>
        <Promo3Skeleton />
      </div>
    );
  }

  // Show empty state if no data
  if (!data) {
    return null;
  }

  // Badge colors array for variety
  const badgeColors = ['purple', 'indigo', 'red', 'yellow', 'green'];

  return (
    <div className={`nc-SectionPromo3 ${className}`}>
      <div className="relative flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-800 rounded-2xl sm:rounded-[40px] p-4 pb-0 sm:p-5 sm:pb-0 lg:p-24">
        <div className="absolute inset-0">
          <Image
            fill
            className="absolute w-full h-full object-contain object-bottom dark:opacity-5"
            src={backgroundLineSvg}
            alt="backgroundLineSvg"
          />
        </div>

        <div className="lg:w-[50%] max-w-lg relative">
          <h2 className="font-semibold text-4xl md:text-5xl">
            {data.title}
          </h2>
          <span className="block mt-5 text-neutral-500 dark:text-neutral-400">
            {data.description}
          </span>
          {data.highlights && data.highlights.length > 0 && (
            <ul className="space-y-4 mt-10">
              {data.highlights.map((highlight, index) => {
                const badgeNumber = String(index + 1).padStart(2, '0');
                const badgeColor = badgeColors[index % badgeColors.length] as 'purple' | 'indigo' | 'red' | 'yellow' | 'green' | undefined;
                return (
                  <li key={index} className="flex items-center space-x-4">
                    <Badge color={badgeColor} name={badgeNumber} />
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {highlight}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <form className="mt-10 relative max-w-sm">
            <Input
              required
              aria-required
              placeholder={data.emailPlaceholder}
              type="email"
              rounded="rounded-full"
            />
            <ButtonCircle
              type="submit"
              className="absolute transform top-1/2 -translate-y-1/2 right-1"
            >
              <ArrowSmallRightIcon className="w-6 h-6" />
            </ButtonCircle>
          </form>
        </div>

        {data.image && (
          data.image.startsWith('http') || data.image.startsWith('//') ? (
            // External URL - use regular img tag
            <img
              alt={data.title}
              className="relative block lg:absolute lg:right-0 lg:bottom-0 mt-10 lg:mt-0 max-w-lg lg:max-w-[calc(50%-40px)] rounded-lg"
              src={data.image}
            />
          ) : (
            // Local image - use NcImage
            <NcImage
              alt={data.title}
              containerClassName="relative block lg:absolute lg:right-0 lg:bottom-0 mt-10 lg:mt-0 max-w-lg lg:max-w-[calc(50%-40px)]"
              src={data.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              className=""
            />
          )
        )}
      </div>
    </div>
  );
};

export default SectionPromo3;
