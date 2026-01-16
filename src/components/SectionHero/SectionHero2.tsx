"use client";

import React, { FC, useState, useEffect } from "react";
import backgroundLineSvg from "@/images/Moon.svg";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Next from "@/shared/NextPrev/Next";
import Prev from "@/shared/NextPrev/Prev";
import useInterval from "react-use/lib/useInterval";
import useBoolean from "react-use/lib/useBoolean";
import Image from "next/image";
import { HERO2_DEMO_DATA } from "./data";
import { StaticImageData } from "next/image";
import { Route } from "@/routers/types";

export interface SectionHero2Props {
  className?: string;
}

interface Hero2DataType {
  image: string | StaticImageData;
  heading: string;
  subHeading: string;
  btnText: string;
  btnLink: string | Route;
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

let TIME_OUT: NodeJS.Timeout | null = null;

const SectionHero2: FC<SectionHero2Props> = ({ className = "" }) => {
  // =================
  const [indexActive, setIndexActive] = useState(0);
  const [isRunning, toggleIsRunning] = useBoolean(true);
  const [data, setData] = useState<Hero2DataType[]>(HERO2_DEMO_DATA);
  const [loading, setLoading] = useState(true);

  // Fetch module data from API
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/modules/6/data`, {
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
          // Map API data to component format
          const mappedData: Hero2DataType[] = result.data.map((item) => {
            // Extract button text - priority: extra_fields_1 > btnText > button_text > Button Text
            const btnText = item.extra_data?.extra_fields_1 
              || item.extra_data?.btnText 
              || item.extra_data?.button_text 
              || item.extra_data?.['Button Text'] 
              || item.extra_data?.['Button name']
              || 'Explore now';
            
            // Extract button link - priority: extra_fields_2 > btnLink > button_link > Button Link
            const btnLink = item.extra_data?.extra_fields_2 
              || item.extra_data?.btnLink 
              || item.extra_data?.button_link 
              || item.extra_data?.['Button Link']
              || item.extra_data?.['button Link']
              || '/';
            
            // Use first highlight as subHeading if available, otherwise use description
            const subHeading = item.highlights && item.highlights.length > 0 
              ? item.highlights[0] 
              : (item.description || item.extra_data?.subHeading || item.extra_data?.['Sub Heading'] || '');
            
            // Use image from API or fallback
            const imageUrl = item.image || item.extra_data?.image || item.extra_data?.['Image'] || '';

            return {
              image: imageUrl || '/images/hero-right.png', // Fallback image
              heading: item.title,
              subHeading: subHeading,
              btnText: btnText,
              btnLink: btnLink,
            };
          });

          setData(mappedData);
        } else {
          // Keep default data if API returns empty
          setData(HERO2_DEMO_DATA);
        }
      } catch (err) {
        console.error('Error fetching module data:', err);
        // Keep default data on error
        setData(HERO2_DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, []);

  useInterval(
    () => {
      handleAutoNext();
    },
    isRunning ? 5500 : null
  );
  //

  const handleAutoNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0;
      }
      return state + 1;
    });
  };

  const handleClickNext = () => {
    setIndexActive((state) => {
      if (state >= data.length - 1) {
        return 0;
      }
      return state + 1;
    });
    handleAfterClick();
  };

  const handleClickPrev = () => {
    setIndexActive((state) => {
      if (state === 0) {
        return data.length - 1;
      }
      return state - 1;
    });
    handleAfterClick();
  };

  const handleAfterClick = () => {
    toggleIsRunning(false);
    if (TIME_OUT) {
      clearTimeout(TIME_OUT);
    }
    TIME_OUT = setTimeout(() => {
      toggleIsRunning(true);
    }, 1000);
  };
  // =================

  const renderItem = (index: number) => {
    const isActive = indexActive === index;
    const item = data[index];
    if (!isActive) {
      return null;
    }
    return (
      <div
        className={`nc-SectionHero2Item nc-SectionHero2Item--animation flex flex-col-reverse lg:flex-col relative overflow-hidden ${className}`}
        key={index}
      >
        <div className="absolute bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-20 flex justify-center">
          {data.map((_, index) => {
            const isActive = indexActive === index;
            return (
              <div
                key={index}
                onClick={() => {
                  setIndexActive(index);
                  handleAfterClick();
                }}
                className={`relative px-1 py-1.5 cursor-pointer`}
              >
                <div
                  className={`relative w-20 h-1 shadow-sm rounded-md bg-white`}
                >
                  {isActive && (
                    <div
                      className={`nc-SectionHero2Item__dot absolute inset-0 bg-slate-900 rounded-md ${
                        isActive ? " " : " "
                      }`}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Prev
          className="absolute start-1 sm:start-5 top-3/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-slate-700"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickPrev={handleClickPrev}
        />
        <Next
          className="absolute end-1 sm:end-5 top-3/4 sm:top-1/2 sm:-translate-y-1/2 z-10 !text-slate-700"
          btnClassName="w-12 h-12 hover:border-slate-400 dark:hover:border-slate-400"
          svgSize="w-6 h-6"
          onClickNext={handleClickNext}
        />

        {/* BG */}
        <div className="absolute inset-0 bg-[#E3FFE6]">
          <Image
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute w-full h-full object-contain"
            src={backgroundLineSvg}
            alt="hero"
          />
        </div>

        <div className="relative container pb-0 pt-14 sm:pt-20 lg:py-44">
          <div
            className={`relative z-[1] w-full max-w-3xl space-y-8 sm:space-y-14 nc-SectionHero2Item__left`}
          >
            <div className="space-y-5 sm:space-y-6">
              <span className="nc-SectionHero2Item__subheading block text-base md:text-xl text-slate-700 font-medium">
                {item.subHeading}
              </span>
              <h2 className="nc-SectionHero2Item__heading font-semibold text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl !leading-[114%] text-slate-900">
                {item.heading}
              </h2>
            </div>

            <ButtonPrimary
              className="nc-SectionHero2Item__button dark:bg-slate-900"
              sizeClass="py-3 px-6 sm:py-5 sm:px-9"
              href={item.btnLink as Route}
            >
              <span>{item.btnText}</span>
              <span>
                <svg className="w-5 h-5 ms-2.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 22L20 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </ButtonPrimary>
          </div>
          <div className="mt-10 lg:mt-0 lg:absolute end-0 rtl:-end-28 bottom-0 top-0 w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
            {item.image && typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('//')) ? (
              // External URL - use regular img tag
              <img
                className="w-full h-full object-contain object-right-bottom nc-SectionHero2Item__image"
                src={item.image}
                alt={item.heading}
              />
            ) : (
              // Local image - use Next.js Image
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-full object-contain object-right-bottom nc-SectionHero2Item__image"
                src={item.image}
                alt={item.heading}
                priority
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state or empty state
  if (loading) {
    return (
      <div className={`nc-SectionHero2Item flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return null;
  }

  return <>{data.map((_, index) => renderItem(index))}</>;
};

export default SectionHero2;
