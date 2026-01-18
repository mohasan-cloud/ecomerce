"use client";

// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import Heading from "@/components/Heading/Heading";
import React, { FC, useId, useRef, useState } from "react";
import { useEffect } from "react";
import quotationImg from "@/images/quotation.png";
import quotationImg2 from "@/images/quotation2.png";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useReviews } from "@/hooks/useReviews";
import Link from "next/link";

export interface SectionClientSayProps {
  className?: string;
}

const SectionClientSay: FC<SectionClientSayProps> = ({ className = "" }) => {
  const sliderRef = useRef(null);
  const { reviews, loading } = useReviews({ limit: 10, autoFetch: true });

  const [isShow, setIsShow] = useState(false);
  
  // Use refs for slider instance and mounted state
  const sliderInstanceRef = useRef<Glide | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    const OPTIONS: Partial<Glide.Options> = {
      perView: 1,
    };

    if (!sliderRef.current || !isMountedRef.current) return;

    // Clean up previous slider if exists
    if (sliderInstanceRef.current) {
      try {
        sliderInstanceRef.current.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
      sliderInstanceRef.current = null;
    }

    try {
      const slider = new Glide(sliderRef.current, OPTIONS);
      slider.mount();
      sliderInstanceRef.current = slider;
      
      if (isMountedRef.current) {
        setIsShow(true);
      }
    } catch (e) {
      console.error('Error initializing Glide slider:', e);
    }

    return () => {
      isMountedRef.current = false;
      
      if (sliderInstanceRef.current) {
        try {
          sliderInstanceRef.current.destroy();
        } catch (e) {
          // Ignore error if slider is already destroyed
          console.warn('Error destroying Glide slider:', e);
        } finally {
          sliderInstanceRef.current = null;
        }
      }
    };
  }, [sliderRef]);

  // Re-initialize slider when reviews change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reviews.length === 0 || !sliderRef.current) return;
    
    isMountedRef.current = true;

    // Destroy and recreate slider
    const OPTIONS: Partial<Glide.Options> = {
      perView: 1,
    };
    
    // Clean up previous slider
    if (sliderInstanceRef.current) {
      try {
        sliderInstanceRef.current.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }
      sliderInstanceRef.current = null;
    }
    
    try {
      const slider = new Glide(sliderRef.current, OPTIONS);
      slider.mount();
      sliderInstanceRef.current = slider;
    } catch (e) {
      console.error('Error re-initializing Glide slider:', e);
    }

    return () => {
      isMountedRef.current = false;
      
      if (sliderInstanceRef.current) {
        try {
          sliderInstanceRef.current.destroy();
        } catch (e) {
          // Ignore error if slider is already destroyed
          console.warn('Error destroying Glide slider:', e);
        } finally {
          sliderInstanceRef.current = null;
        }
      }
    };
  }, [reviews]);

  const renderBg = () => {
    return null; // Client images removed
  };

  return (
    <div
      className={`nc-SectionClientSay relative flow-root ${className} `}
      data-nc-id="SectionClientSay"
    >
      <Heading desc="Let's see what people think of Ciseco" isCenter>
        Good news from far away 🥇
      </Heading>
      <div className="relative md:mb-16 max-w-2xl mx-auto">
        {renderBg()}

        <div
          ref={sliderRef}
          className={`mt-12 lg:mt-16 relative ${isShow ? "" : "invisible"}`}
        >
          <Image
            className="opacity-50 md:opacity-100 absolute -mr-16 lg:mr-3 right-full top-1"
            src={quotationImg}
            alt=""
          />
          <Image
            className="opacity-50 md:opacity-100 absolute -ml-16 lg:ml-3 left-full top-1"
            src={quotationImg2}
            alt=""
          />
          <div className="glide__track " data-glide-el="track">
            <ul className="glide__slides ">
              {loading ? (
                <li className="glide__slide flex flex-col items-center text-center">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4 mb-8"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-48"></div>
                  <div className="flex items-center space-x-0.5 mt-3.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                </li>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <li
                    key={review.id}
                    className="glide__slide flex flex-col items-center text-center"
                  >
                    <span className="block text-2xl">{review.comment}</span>
                    <div className="flex items-center gap-3 mt-8">
                      <span className="block text-2xl font-semibold">
                        {review.name}
                      </span>
                      {review.product && (
                        <Link
                          href={`/product-detail/${review.product.slug}`}
                          className="text-sm text-primary-6000 hover:text-primary-7000 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          ({review.product.name})
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center space-x-0.5 mt-3.5 text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-6 h-6 ${
                            star <= review.rating
                              ? 'fill-current'
                              : 'fill-none stroke-current opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="block mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {review.createdAt}
                    </span>
                  </li>
                ))
              ) : (
                <li className="glide__slide flex flex-col items-center text-center">
                  <span className="block text-2xl text-neutral-500 dark:text-neutral-400">
                    No reviews available yet.
                  </span>
                </li>
              )}
            </ul>
          </div>
          {reviews.length > 0 && (
            <div
              className="mt-10 glide__bullets flex items-center justify-center"
              data-glide-el="controls[nav]"
            >
              {reviews.map((review, index) => (
                <button
                  key={review.id}
                  className="glide__bullet w-2 h-2 rounded-full bg-neutral-300 mx-1 focus:outline-none"
                  data-glide-dir={`=${index}`}
                ></button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionClientSay;
