"use client";

import React, { FC, useState } from "react";
import LikeButton from "./LikeButton";
import Prices from "./Prices";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import BagIcon from "./BagIcon";
import toast from "react-hot-toast";
import { Transition } from "@/app/headlessui";
import ModalQuickView from "./ModalQuickView";
import ProductStatus from "./ProductStatus";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NcImage from "@/shared/NcImage/NcImage";
import { ApiProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSiteData } from "@/hooks/useSiteData";

export interface ProductCardProps {
  className?: string;
  data: ApiProduct;
  isLiked?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({
  className = "",
  data,
  isLiked,
}) => {
  const {
    name,
    price,
    finalPrice,
    discountPercentage,
    description,
    image,
    rating,
    id,
    numberOfReviews,
    status,
    inStock,
    slug,
    category,
    subCategory,
  } = data;

  const [showModalQuickView, setShowModalQuickView] = useState(false);
  const router = useRouter();
  const { addToCart, processing: cartProcessing } = useCart();
  const { toggleWishlist, isInWishlist, processing: wishlistProcessing } = useWishlist();
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  const notifyAddTocart = async () => {
    const result = await addToCart(id);
    if (result.success) {
    toast.custom(
      (t) => (
        <Transition
          appear
          show={t.visible}
          as="div"
          className="p-4 max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-200"
          enter="transition-all duration-150"
          enterFrom="opacity-0 translate-x-20"
          enterTo="opacity-100 translate-x-0"
          leave="transition-all duration-150"
          leaveFrom="opacity-100 translate-x-0"
          leaveTo="opacity-0 translate-x-20"
        >
          <p className="block text-base font-semibold leading-none">
            Added to cart!
          </p>
          <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
          {renderProductCartOnNotify()}
        </Transition>
      ),
      {
        position: "top-right",
        id: String(id) || "product-detail",
        duration: 3000,
      }
    );
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleWishlist(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const renderProductCartOnNotify = () => {
    return (
      <div className="flex ">
        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 relative">
          <Image
            width={80}
            height={96}
            src={image}
            alt={name}
            className="object-cover object-center w-full h-full"
            unoptimized={typeof image === 'string' && (image.startsWith('http://localhost') || image.startsWith('http://127.0.0.1'))}
          />
        </div>

        <div className="ms-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="text-base font-medium ">{name}</h3>
              </div>
              <Prices 
                price={price} 
                finalPrice={finalPrice}
                discountPercentage={discountPercentage}
                className="mt-0.5"
                currency={currency}
              />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-slate-400">Qty 1</p>

            <div className="flex">
              <button
                type="button"
                className="font-medium text-primary-6000 dark:text-primary-500 "
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/cart");
                }}
              >
                View cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderGroupButtons = () => {
    if (!inStock) return null;
    
    return (
      <div className="absolute bottom-0 group-hover:bottom-4 inset-x-1 flex justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <ButtonPrimary
          className="shadow-lg"
          fontSize="text-xs"
          sizeClass="py-2 px-4"
          onClick={() => notifyAddTocart()}
          disabled={cartProcessing}
        >
          <BagIcon className="w-3.5 h-3.5 mb-0.5" />
          <span className="ms-1">{cartProcessing ? 'Adding...' : 'Add to bag'}</span>
        </ButtonPrimary>
        <ButtonSecondary
          className="ms-1.5 bg-white hover:!bg-gray-100 hover:text-slate-900 transition-colors shadow-lg"
          fontSize="text-xs"
          sizeClass="py-2 px-4"
          onClick={() => setShowModalQuickView(true)}
        >
          <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
          <span className="ms-1">Quick view</span>
        </ButtonSecondary>
      </div>
    );
  };

  return (
    <>
      <div
        className={`nc-ProductCard relative flex flex-col bg-transparent ${className}`}
      >
        <Link href={`/product-detail/${slug || id}`} className="absolute inset-0"></Link>

        <div className="relative flex-shrink-0 bg-slate-50 dark:bg-slate-300 rounded-3xl overflow-hidden z-1 group">
          <Link href={`/product-detail/${slug || id}`} className="block">
            <NcImage
              containerClassName="flex aspect-w-11 aspect-h-12 w-full h-0"
              src={image}
              className="object-cover w-full h-full drop-shadow-xl"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              alt={name}
              unoptimized={typeof image === 'string' && (image.startsWith('http://localhost') || image.startsWith('http://127.0.0.1'))}
            />
          </Link>
          {status && <ProductStatus status={status as any} />}
          <LikeButton 
            liked={isInWishlist(id)} 
            className="absolute top-3 end-3 z-10"
            onClick={handleToggleWishlist}
            disabled={wishlistProcessing}
          />
          {renderGroupButtons()}
        </div>

        <div className="space-y-4 px-2.5 pt-5 pb-2.5">
          <div>
            {(category || subCategory) && (
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Link 
                    href={`/collection?category=${category.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                  >
                    {category.name}
                  </Link>
                )}
                {subCategory && (
                  <Link 
                    href={`/collection?subcategory=${subCategory.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {subCategory.name}
                  </Link>
                )}
              </div>
            )}
            <h2 className="nc-ProductCard__title text-base font-semibold transition-colors">
              {name}
            </h2>
            <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2`}>
              {description}
            </p>
          </div>

          <div className="flex justify-between items-end ">
            <Prices 
              price={price} 
              finalPrice={finalPrice}
              discountPercentage={discountPercentage}
              currency={currency}
            />
            <div className="flex items-center mb-0.5">
              <StarIcon className="w-5 h-5 pb-[1px] text-amber-400" />
              <span className="text-sm ms-1 text-slate-500 dark:text-slate-400">
                {typeof rating === 'number' ? rating.toFixed(1) : (typeof rating === 'string' ? parseFloat(rating).toFixed(1) : "0.0")} ({numberOfReviews || 0} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICKVIEW */}
      <ModalQuickView
        show={showModalQuickView}
        onCloseModalQuickView={() => setShowModalQuickView(false)}
        productData={data}
      />
    </>
  );
};

export default ProductCard;
