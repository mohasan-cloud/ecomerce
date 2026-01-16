import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import Link from "next/link";
import { StaticImageData } from "next/image";
import { Route } from "@/routers/types";

export interface CardCategory2Props {
  className?: string;
  ratioClass?: string;
  bgClass?: string;
  featuredImage?: string | StaticImageData;
  name: string;
  desc: string;
  slug?: string;
}

const CardCategory2: FC<CardCategory2Props> = ({
  className = "",
  ratioClass = "aspect-w-1 aspect-h-1",
  bgClass = "bg-orange-50",
  featuredImage = ".",
  name,
  desc,
  slug = "/collection",
}) => {
  return (
    <Link
      href={slug as Route}
      className={`nc-CardCategory2 group ${className}`}
      data-nc-id="CardCategory2"
    >
      <div
        className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg ${bgClass} ${ratioClass}`}
      >
        {/* Logo Section - Top */}
        <div className="relative w-full pt-8 pb-6 px-6 flex justify-center items-center min-h-[140px]">
          <div className="relative w-full max-w-[120px] h-[80px] flex items-center justify-center">
            {featuredImage && featuredImage !== "." && (
              <NcImage
                alt={name}
                containerClassName="w-full h-full flex justify-center items-center"
                src={featuredImage}
                className="object-contain"
                fill
                sizes="120px"
                unoptimized={typeof featuredImage === 'string' && (featuredImage.includes('localhost') || featuredImage.includes('127.0.0.1'))}
              />
            )}
          </div>
        </div>

        {/* Brand Name and Description - Bottom */}
        <div className="px-6 pb-6 text-center">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {name}
          </h2>
          <span className="block text-sm text-neutral-500 dark:text-neutral-400 font-normal">
            {desc}
          </span>
        </div>

        {/* Hover Overlay */}
        <span className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-5 transition-opacity rounded-2xl"></span>
      </div>
    </Link>
  );
};

export default CardCategory2;
