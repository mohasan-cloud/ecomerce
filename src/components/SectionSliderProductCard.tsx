"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import Heading from "@/components/Heading/Heading";
// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import ProductCard from "./ProductCard";
import { useProducts, ApiProduct } from "@/hooks/useProducts";
import SkeletonProductCard from "./SkeletonProductCard";

export interface SectionSliderProductCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  limit?: number;
  categoryId?: number;
  featured?: boolean;
  hasOffers?: boolean;
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = "",
  itemClassName = "",
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = "Special offers & discounts",
  limit = 8,
  categoryId,
  featured = false,
  hasOffers = false,
}) => {
  const { products, loading } = useProducts({ limit, categoryId, featured, hasOffers });
  const sliderRef = useRef(null);

  //
  const [isShow, setIsShow] = useState(false);

  // Get the earliest expiry date from all offers
  const getEarliestExpiryDate = () => {
    if (!hasOffers || products.length === 0) return null;
    
    const dates = products
      .filter(p => p.offer?.endDate)
      .map(p => new Date(p.offer!.endDate!))
      .filter(date => !isNaN(date.getTime()));
    
    if (dates.length === 0) return null;
    
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    return earliestDate;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours <= 0) return null;
      return `Ends in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `Ends in ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const [displaySubHeading, setDisplaySubHeading] = useState(subHeading);

  useEffect(() => {
    const expiryDate = getEarliestExpiryDate();
    const formattedDate = expiryDate ? formatDate(expiryDate) : null;
    
    if (formattedDate) {
      setDisplaySubHeading(`${subHeading} • ${formattedDate}`);
    } else {
      setDisplaySubHeading(subHeading);
    }

    // Update every minute to show real-time countdown
    const interval = setInterval(() => {
      const updatedDate = getEarliestExpiryDate();
      const updatedFormatted = updatedDate ? formatDate(updatedDate) : null;
      
      if (updatedFormatted) {
        setDisplaySubHeading(`${subHeading} • ${updatedFormatted}`);
      } else {
        setDisplaySubHeading(subHeading);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [products, subHeading, hasOffers]);

  useEffect(() => {
    if (loading || products.length === 0) return;

    const OPTIONS: Partial<Glide.Options> = {
      perView: 4,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          perView: 4 - 1,
        },
        1024: {
          gap: 20,
          perView: 4 - 1,
        },
        768: {
          gap: 20,
          perView: 4 - 2,
        },
        640: {
          gap: 20,
          perView: 1.5,
        },
        500: {
          gap: 20,
          perView: 1.3,
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
  }, [sliderRef, loading, products]);

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <div ref={sliderRef} className={`flow-root ${isShow ? "" : "invisible"}`}>
        <Heading
          className={headingClassName}
          fontClass={headingFontClassName}
          rightDescText={displaySubHeading}
          hasNextPrev
        >
          {heading || (hasOffers ? `Special Offers` : featured ? `Featured Products` : `New Arrivals`)}
        </Heading>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
              <li key={index} className={`glide__slide ${itemClassName}`}>
                  <SkeletonProductCard />
                </li>
              ))
            ) : (
              products.map((item) => (
                <li key={item.id} className={`glide__slide ${itemClassName}`}>
                <ProductCard data={item} />
              </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SectionSliderProductCard;
