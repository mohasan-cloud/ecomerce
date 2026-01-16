"use client";

import React, { useEffect, useRef, useState } from "react";
import Heading from "./Heading/Heading";
import CardCategory3 from "./CardCategories/CardCategory3";
import SkeletonCard from "./SkeletonCard";
// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";

interface DiscoverCategory {
  id: number;
  name: string;
  desc: string;
  featuredImage: string;
  color: string;
  slug?: string;
}

const DiscoverMoreSlider = () => {
  const sliderRef = useRef(null);
  const [isShow, setIsShow] = useState(false);
  const [categories, setCategories] = useState<DiscoverCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        // Request all categories (limit=50 to get all)
        const response = await fetch(`${apiUrl}/api/discover-categories?limit=50`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0) return;

    const OPTIONS: Partial<Glide.Options> = {
      perView: 2.8,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          gap: 28,
          perView: 2.5,
        },
        1279: {
          gap: 20,
          perView: 2.15,
        },
        1023: {
          gap: 20,
          perView: 1.6,
        },
        768: {
          gap: 20,
          perView: 1.2,
        },
        500: {
          gap: 20,
          perView: 1,
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
  }, [loading, categories]);

  return (
    <div
      ref={sliderRef}
      className={`nc-DiscoverMoreSlider nc-p-l-container ${
        isShow ? "" : "invisible"
      }`}
    >
      <Heading
        className="mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50 nc-p-r-container "
        desc=""
        rightDescText="Explore our featured collections"
        hasNextPrev
      >
        Discover more
      </Heading>
      <div className="" data-glide-el="track">
        <ul className="glide__slides">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className="glide__slide">
                <SkeletonCard />
              </li>
            ))
          ) : (
            categories.map((item) => (
              <li key={item.id} className="glide__slide">
              <CardCategory3
                name={item.name}
                desc={item.desc}
                featuredImage={item.featuredImage}
                color={item.color}
                categoryId={item.id}
                slug={item.slug}
              />
            </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default DiscoverMoreSlider;
