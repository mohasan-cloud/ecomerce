"use client";

import React, { FC, useEffect, useId, useRef, useState } from "react";
import Heading from "@/components/Heading/Heading";
// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import CardCategory2 from "@/components/CardCategories/CardCategory2";
import { StaticImageData } from "next/image";
import Link from "next/link";

export interface CardCategoryData {
  name: string;
  desc: string;
  img: string | StaticImageData;
  color?: string;
  slug?: string;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  desc?: string;
  color?: string;
}

export interface SectionSliderCategoriesProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  subHeading?: string;
  data?: CardCategoryData[];
}

const SectionSliderCategories: FC<SectionSliderCategoriesProps> = ({
  heading = "Shop by department",
  subHeading = "",
  className = "",
  itemClassName = "",
  data,
}) => {
  const sliderRef = useRef(null);
  const [isShow, setIsShow] = useState(false);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch subcategories from API
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/subcategories?limit=8`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setSubcategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, []);

  // Map subcategories to card format
  const mapSubcategoriesToCards = (): CardCategoryData[] => {
    const colors = [
      "bg-purple-100",      // Lavender/Purple
      "bg-slate-100",       // Light Grey
      "bg-sky-100",         // Light Blue
      "bg-orange-100",      // Light Orange/Peach
      "bg-pink-100",        // Light Pink
      "bg-indigo-100",      // Light Indigo
      "bg-green-100",       // Light Green
      "bg-yellow-100",      // Light Yellow
    ];

    return subcategories.map((subcategory, index) => ({
      name: subcategory.name,
      desc: subcategory.desc || "Shop " + subcategory.name,
      img: subcategory.image || "/images/placeholder.png",
      color: subcategory.color || colors[index % colors.length],
      slug: `/collection?sub_category_id=${subcategory.id}`,
    }));
  };

  const cardData = data || (loading ? [] : mapSubcategoriesToCards());

  useEffect(() => {
    // Only initialize slider when data is loaded
    if (loading || cardData.length === 0) return;

    const OPTIONS: Partial<Glide.Options> = {
      perView: 4,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          perView: 4,
        },
        1024: {
          gap: 20,
          perView: 3.4,
        },
        768: {
          gap: 20,
          perView: 3,
        },
        640: {
          gap: 20,
          perView: 2.3,
        },
        500: {
          gap: 20,
          perView: 1.4,
        },
      },
    };

    if (!sliderRef.current) return;

    let slider = new Glide(sliderRef.current, OPTIONS);
    slider.mount();
    setIsShow(true);
    return () => {
      slider.destroy();
    };
  }, [sliderRef, loading, cardData]);

  if (loading) {
    return (
      <div className={`nc-SectionSliderCategories ${className}`}>
        <Heading desc={subHeading} hasNextPrev>
          {heading}
        </Heading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-w-1 aspect-h-1 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
              <div className="mt-5">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mx-auto mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`nc-SectionSliderCategories ${className}`}>
      <div ref={sliderRef} className={`flow-root ${isShow ? "" : "invisible"}`}>
        <Heading desc={subHeading} hasNextPrev>
          {heading}
        </Heading>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">
            {cardData.length > 0 ? (
              cardData.map((item, index) => (
                <li key={index} className={`glide__slide ${itemClassName}`}>
                  <CardCategory2
                    featuredImage={item.img}
                    name={item.name}
                    desc={item.desc}
                    bgClass={item.color}
                    slug={item.slug || "/collection"}
                  />
                </li>
              ))
            ) : (
              <li className="glide__slide">
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No subcategories available
                  </p>
                </div>
              </li>
            )}
            {cardData.length > 0 && (
              <li className={`glide__slide ${itemClassName}`}>
                <div
                  className={`flex-1 relative w-full h-0 rounded-2xl overflow-hidden group aspect-w-1 aspect-h-1 bg-slate-100`}
                >
                  <div>
                    <div className="absolute inset-y-6 inset-x-10 flex flex-col sm:items-center justify-center">
                      <div className="flex relative text-slate-900">
                        <span className="text-lg font-semibold ">
                          More collections
                        </span>
                        <svg
                          className="absolute left-full w-5 h-5 ml-2 rotate-45 group-hover:scale-110 transition-transform"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18.0701 9.57L12.0001 3.5L5.93005 9.57"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M12 20.4999V3.66992"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-sm mt-1 text-slate-800">
                        Show me more
                      </span>
                    </div>
                  </div>
                  <Link
                    href={"/collection"}
                    className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-10 transition-opacity"
                  ></Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SectionSliderCategories;
