import { StarIcon } from "@heroicons/react/24/solid";
import { productImgs } from "@/contains/fakeData";
import React, { FC } from "react";
import NcImage from "@/shared/NcImage/NcImage";
import Prices from "./Prices";
import Link from "next/link";
import { StaticImageData } from "next/image";

export interface CollectionCard2Props {
  className?: string;
  imgs?: (string | StaticImageData)[];
  name?: string;
  price?: number;
  finalPrice?: number;
  discountPercentage?: number;
  description?: string;
  rating?: number;
  numberOfReviews?: number;
  currency?: string;
}

const CollectionCard2: FC<CollectionCard2Props> = ({
  className,
  imgs = [productImgs[9], productImgs[10], productImgs[11], productImgs[8]],
  name = "Product Name",
  description = "Product Description",
  price,
  finalPrice,
  discountPercentage,
  rating,
  numberOfReviews = 0,
  currency,
}) => {
  return (
    <div className={`CollectionCard2 group relative ${className}`}>
      <div className="relative flex flex-col">
        <div className="relative aspect-w-8 aspect-h-5 bg-neutral-100 rounded-2xl overflow-hidden">
          <NcImage
            className="object-contain w-full h-full rounded-2xl"
            src={imgs[0]}
            alt={name || ""}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={typeof imgs[0] === 'string' && (imgs[0].includes('localhost') || imgs[0].includes('127.0.0.1'))}
          />
        </div>
        <div className="grid grid-cols-3 gap-2.5 mt-2.5">
          <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden">
            <NcImage
              className="object-cover w-full h-full rounded-2xl"
              src={imgs[1]}
              alt={name || ""}
              fill
              sizes="150px"
              unoptimized={typeof imgs[1] === 'string' && (imgs[1].includes('localhost') || imgs[1].includes('127.0.0.1'))}
            />
          </div>
          <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden">
            <NcImage
              className="object-cover w-full h-full rounded-2xl"
              src={imgs[2]}
              alt={name || ""}
              fill
              sizes="150px"
              unoptimized={typeof imgs[2] === 'string' && (imgs[2].includes('localhost') || imgs[2].includes('127.0.0.1'))}
            />
          </div>
          <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden">
            <NcImage
              className="object-cover w-full h-full rounded-2xl"
              src={imgs[3]}
              alt={name || ""}
              fill
              sizes="150px"
              unoptimized={typeof imgs[3] === 'string' && (imgs[3].includes('localhost') || imgs[3].includes('127.0.0.1'))}
            />
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex justify-between">
        {/* TITLE */}
        <div className="flex-1">
          <h2 className="font-semibold text-lg sm:text-xl ">{name}</h2>
          {/* AUTHOR */}
          <div className="mt-3 flex items-center text-slate-500 dark:text-slate-400">
            <span className="text-sm ">
              <span className="line-clamp-1">{description}</span>
            </span>
            <span className="h-5 mx-1 sm:mx-2 border-l border-slate-200 dark:border-slate-700"></span>
            {rating !== undefined && rating > 0 && (
              <>
                <StarIcon className="w-4 h-4 text-orange-400" />
                <span className="text-sm ml-1 ">
                  <span className="line-clamp-1">
                    {typeof rating === 'number' ? rating.toFixed(1) : '0.0'} ({numberOfReviews || 0} {numberOfReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
        <Prices 
          className="mt-0.5 sm:mt-1 ml-4" 
          price={price} 
          finalPrice={finalPrice}
          discountPercentage={discountPercentage}
          currency={currency}
        />
      </div>
      {/* Link removed - will be handled by parent component */}
    </div>
  );
};

export default CollectionCard2;
