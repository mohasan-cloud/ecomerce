import React, { FC } from "react";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { CATS_DISCOVER } from "./data";
import { Route } from "@/routers/types";

export interface CardCategory3Props {
  className?: string;
  featuredImage?: StaticImageData | string;
  name?: string;
  desc?: string;
  color?: string;
  categoryId?: number;
  slug?: string;
}

const CardCategory3: FC<CardCategory3Props> = ({
  className = "",
  featuredImage = CATS_DISCOVER[2].featuredImage,
  name = CATS_DISCOVER[2].name,
  desc = CATS_DISCOVER[2].desc,
  color = CATS_DISCOVER[2].color,
  categoryId,
  slug,
}) => {
  const href = categoryId 
    ? `/collection?category_id=${categoryId}` 
    : slug 
    ? `/collection?category=${slug}` 
    : "/collection";

  return (
    <Link
      href={href as Route}
      className={`nc-CardCategory3 block ${className}`}
    >
      <div
        className={`relative w-full aspect-w-16 aspect-h-11 sm:aspect-h-9 h-0 rounded-2xl overflow-hidden group ${color}`}
      >
        <div>
          <div className="absolute inset-5 sm:inset-8">
            {featuredImage ? (
              <div className="absolute end-0 top-0 w-1/2 max-w-[260px] h-full">
                <div className="relative w-full h-full bg-white dark:bg-white/90 rounded-xl p-4 shadow-lg">
            <Image
                    alt={name || "Category"}
                    src={featuredImage}
                    fill
                    className="object-contain drop-shadow-xl"
                    sizes="(max-width: 768px) 50vw, 260px"
                    unoptimized={typeof featuredImage === 'string' && (featuredImage.startsWith('http://localhost') || featuredImage.startsWith('http://127.0.0.1'))}
                    onError={(e) => {
                      try {
                        const target = e.currentTarget;
                        if (target && target.parentElement) {
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                          }
                        }
                      } catch (error) {
                        // Ignore error if element is already removed
                        console.warn('Error handling image error:', error);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="absolute end-0 top-0 w-1/2 max-w-[260px] h-full bg-white dark:bg-white/90 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
        </div>
        <span className="opacity-0 group-hover:opacity-40 absolute inset-0 bg-black/10 transition-opacity"></span>

        <div>
          <div className="absolute inset-5 sm:inset-8 flex flex-col">
            <div className="max-w-xs">
              <span className={`block mb-2 text-sm text-slate-700`}>
                {name}
              </span>
              {desc && (
                <h2
                  className={`text-xl md:text-2xl text-slate-900 font-semibold`}
                  dangerouslySetInnerHTML={{ __html: desc }}
                ></h2>
              )}
            </div>
            <div className="mt-auto">
              <ButtonSecondary
                sizeClass="py-3 px-4 sm:py-3.5 sm:px-6"
                fontSize="text-sm font-medium"
                className="nc-shadow-lg"
              >
                Show me all
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardCategory3;
