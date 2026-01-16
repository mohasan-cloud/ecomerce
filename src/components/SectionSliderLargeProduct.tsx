"use client";

import React, { FC, useEffect, useId, useRef, useState } from "react";
import Heading from "@/components/Heading/Heading";
// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import CollectionCard from "./CollectionCard";
import CollectionCard2 from "./CollectionCard2";
import { useProducts, ApiProduct } from "@/hooks/useProducts";
import { useSiteData } from "@/hooks/useSiteData";
import Link from "next/link";

export interface SectionSliderLargeProductProps {
  className?: string;
  itemClassName?: string;
  cardStyle?: "style1" | "style2";
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = "",
  cardStyle = "style2",
}) => {
  const sliderRef = useRef(null);

  const [isShow, setIsShow] = useState(false);
  
  // Fetch featured products
  const { products, loading } = useProducts({
    limit: 6,
    featured: true,
    sortBy: 'latest',
  });

  // Fetch currency from site data
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  useEffect(() => {
    // Only initialize slider when products are loaded
    if (loading || products.length === 0) return;

    const OPTIONS: Partial<Glide.Options> = {
      perView: 3,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          gap: 28,
          perView: 2.5,
        },
        1024: {
          gap: 20,
          perView: 2.15,
        },
        768: {
          gap: 20,
          perView: 1.5,
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
  }, [sliderRef, loading, products]);

  const MyCollectionCard =
    cardStyle === "style1" ? CollectionCard : CollectionCard2;

  // Map API products to card format
  const mapProductToCard = (product: ApiProduct) => {
    // Prepare images array: main image + gallery images (max 3)
    const images = [
      product.image,
      ...(product.galleryImages || []).slice(0, 3)
    ];
    
    // If we don't have enough images, duplicate the main image
    while (images.length < 4) {
      images.push(product.image);
    }

    return {
      name: product.name,
      price: product.price, // Original price
      finalPrice: product.finalPrice, // Price after discount
      discountPercentage: product.discountPercentage, // Discount percentage
      imgs: images.slice(0, 4), // CollectionCard2 needs 4 images
      description: product.description || product.category?.name || '',
      slug: product.slug,
      rating: product.rating,
      numberOfReviews: product.numberOfReviews,
    };
  };

  if (loading) {
    return (
      <div className={`nc-SectionSliderLargeProduct ${className}`}>
        <Heading isCenter={false} hasNextPrev>
          Chosen by our experts
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-w-8 aspect-h-5 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
              <div className="grid grid-cols-3 gap-2.5 mt-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 sm:h-28 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
                ))}
              </div>
              <div className="mt-5">
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cardProducts = products.map(mapProductToCard);

  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <div ref={sliderRef} className={`flow-root ${isShow ? "" : "invisible"}`}>
        <Heading isCenter={false} hasNextPrev>
          Chosen by our experts
        </Heading>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides">
            {cardProducts.length > 0 ? (
              cardProducts.map((product, index) => (
                <li className={`glide__slide`} key={index}>
                  <div className="relative">
                    <MyCollectionCard
                      name={product.name}
                      price={product.price}
                      finalPrice={product.finalPrice}
                      discountPercentage={product.discountPercentage}
                      imgs={product.imgs}
                      description={product.description}
                      rating={product.rating}
                      numberOfReviews={product.numberOfReviews}
                      currency={currency || undefined}
                    />
                    <Link href={`/product-detail/${product.slug}`} className="absolute inset-0 z-10"></Link>
                  </div>
                </li>
              ))
            ) : (
              <li className="glide__slide">
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No featured products available
                  </p>
                </div>
              </li>
            )}

            {cardProducts.length > 0 && (
              <li className={`glide__slide`}>
                <Link href={"/collection?featured=true"} className="block relative group">
                  <div className="relative rounded-2xl overflow-hidden h-[410px]">
                    <div className="h-[410px] bg-black/5 dark:bg-neutral-800"></div>
                    <div className="absolute inset-y-6 inset-x-10  flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center relative">
                        <span className="text-xl font-semibold">More items</span>
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
                          />
                          <path
                            d="M12 20.4999V3.66992"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-sm mt-1">Show me more</span>
                    </div>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SectionSliderLargeProduct;
