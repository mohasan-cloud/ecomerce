"use client";

import React, { FC, useState, useEffect, useRef } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Logo from "@/shared/Logo/Logo";
import backgroundLineSvg from "@/images/Moon.svg";
import Image from "next/image";
import { Route } from "@/routers/types";
import { useModuleData } from "@/contexts/ModuleDataContext";

export interface SectionPromo2Props {
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

const SectionPromo2: FC<SectionPromo2Props> = ({ className = "lg:pt-10" }) => {
  const [data, setData] = useState<{
    title: string;
    description: string;
    image: string | null;
    buttonText: string;
    buttonLink: string;
  } | null>(null);

  // Get module data from context
  const { data: moduleData, loading } = useModuleData(10);
  const prevDataRef = useRef<string>('');
  const isMountedRef = useRef(true);

  // Map module data to component format
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    const currentDataString = JSON.stringify(moduleData);
    if (prevDataRef.current === currentDataString) {
      return; // Skip if data hasn't changed
    }
    prevDataRef.current = currentDataString;

    if (moduleData && moduleData.length > 0 && isMountedRef.current) {
      // Get first item from module data
      const item = moduleData[0];
      
      // Extract button text from extra_fields_1
      const buttonText = item.extra_data?.extra_fields_1 
        || item.extra_data?.btnText 
        || item.extra_data?.button_text 
        || item.extra_data?.['Button Text']
        || 'Discover more';
      
      // Extract button link from extra_fields_2
      const buttonLink = item.extra_data?.extra_fields_2 
        || item.extra_data?.btnLink 
        || item.extra_data?.button_link 
        || item.extra_data?.['Button Link']
        || '/search';
      
      // Extract description from description, highlights, or extra_data
      const description = item.description 
        || (item.highlights && item.highlights.length > 0 ? item.highlights[0] : '')
        || item.extra_data?.description 
        || item.extra_data?.['Description'] 
        || '';

      if (isMountedRef.current) {
        setData({
          title: item.title || '',
          description: description,
          image: item.image || null,
          buttonText: buttonText,
          buttonLink: buttonLink,
        });
      }
    } else {
      if (isMountedRef.current) {
        setData(null);
      }
    }
    
    // Cleanup function using useRef
    return () => {
      isMountedRef.current = false;
    };
  }, [moduleData]);

  // Show loading state
  if (loading) {
    return (
      <div className={`nc-SectionPromo2 ${className}`}>
        <div className="relative flex flex-col lg:flex-row lg:justify-end bg-yellow-50 dark:bg-slate-800 rounded-2xl sm:rounded-[40px] p-4 pb-0 sm:p-5 sm:pb-0 lg:p-24 animate-pulse">
          <div className="lg:w-[45%] max-w-lg relative">
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-6"></div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!data) {
    return null;
  }

  return (
    <div className={`nc-SectionPromo2 ${className}`}>
      <div className="relative flex flex-col lg:flex-row lg:justify-end bg-yellow-50 dark:bg-slate-800 rounded-2xl sm:rounded-[40px] p-4 pb-0 sm:p-5 sm:pb-0 lg:p-24">
        <div className="absolute inset-0">
          <Image
            fill
            className="absolute w-full h-full object-contain dark:opacity-5"
            src={backgroundLineSvg}
            alt="backgroundLineSvg"
          />
        </div>

        <div className="lg:w-[45%] max-w-lg relative">
          <Logo className="w-28" />
          <h2 className="font-semibold text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl mt-6 sm:mt-10 !leading-[1.13] tracking-tight">
            {data.title.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < data.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>
          <span className="block mt-6 text-slate-500 dark:text-slate-400">
            {data.description}
          </span>
          <div className="flex space-x-2 sm:space-x-5 mt-6 sm:mt-12">
            <ButtonPrimary
              href={data.buttonLink as Route}
              className="dark:bg-slate-200 dark:text-slate-900"
            >
              {data.buttonText}
            </ButtonPrimary>
          </div>
        </div>

        {data.image ? (
          data.image.startsWith('http') || data.image.startsWith('//') ? (
            // External URL - use regular img tag
            <img
              alt={data.title}
              className="relative block lg:absolute lg:left-0 lg:bottom-0 mt-10 lg:mt-0 max-w-xl lg:max-w-[calc(55%-40px)]"
              src={data.image}
            />
          ) : (
            // Local image - use NcImage
            <NcImage
              alt={data.title}
              containerClassName="relative block lg:absolute lg:left-0 lg:bottom-0 mt-10 lg:mt-0 max-w-xl lg:max-w-[calc(55%-40px)]"
              src={data.image}
              sizes="(max-width: 768px) 100vw, 50vw"
              className=""
            />
          )
        ) : null}
      </div>
    </div>
  );
};

export default SectionPromo2;
