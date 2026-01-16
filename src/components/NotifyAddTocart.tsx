import React, { FC } from "react";
import { Transition } from "@/app/headlessui";
import Prices from "@/components/Prices";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

interface Props {
  show: boolean;
  productImage: string | StaticImageData;
  productName?: string;
  productPrice?: number;
  finalPrice?: number;
  discountPercentage?: number;
  variantActive: number;
  sizeSelected: string;
  qualitySelected: number;
  colors?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  selectedAttributes?: Record<number, (number | string)[]>;
  productAttributes?: Array<{
    id: number;
    name: string;
    input_type: string;
    values: Array<{
      id: number;
      value: string;
      backend_value?: string | null;
      price?: number | null;
    }>;
  }>;
}

const NotifyAddTocart: FC<Props> = ({
  show,
  productImage,
  productName,
  productPrice,
  finalPrice,
  discountPercentage,
  variantActive,
  qualitySelected,
  sizeSelected,
  colors,
  selectedAttributes,
  productAttributes,
}) => {
  const colorName = colors && colors[variantActive] ? colors[variantActive].name : 'Default';

  // Helper function to check if a string is a valid color code
  const isValidColorCode = (str: string): boolean => {
    if (!str) return false;
    // Check for hex color (#FFFFFF or FFFFFF)
    const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
    // Check for rgb/rgba format
    const rgbPattern = /^rgba?\(/i;
    return hexPattern.test(str) || rgbPattern.test(str);
  };

  const renderSelectedAttributes = () => {
    if (!selectedAttributes || !productAttributes || Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    return (
      <div className="mt-2 space-y-1">
        {Object.entries(selectedAttributes).map(([attrId, values]) => {
          const attribute = productAttributes.find(a => a.id === Number(attrId));
          if (!attribute || !values || values.length === 0) return null;
          
          const selectedValue = values[0];
          const valueDetails = attribute.values?.find(v => 
            v.id === Number(selectedValue) || v.value === selectedValue
          );
          const displayValue = valueDetails?.backend_value || valueDetails?.value || selectedValue;
          const isColorCode = isValidColorCode(String(displayValue));
          
          return (
            <div key={attrId} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">{attribute.name}:</span>
              {isColorCode ? (
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: String(displayValue) }}
                  />
                  <span>{valueDetails?.value || displayValue}</span>
                </div>
              ) : (
                <span>{displayValue}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderProductCartOnNotify = () => {
    return (
      <div className="flex ">
        <div className="h-24 w-20 relative flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={productImage}
            alt={productName || "Product"}
            fill
            sizes="100px"
            className="h-full w-full object-contain object-center"
            unoptimized={typeof productImage === 'string' && (productImage.includes('localhost') || productImage.includes('127.0.0.1'))}
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="text-base font-medium ">{productName || "Product"}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {colorName && (
                    <>
                      <span>{colorName}</span>
                      {sizeSelected && (
                        <>
                          <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
                          <span>{sizeSelected}</span>
                        </>
                      )}
                    </>
                  )}
                  {!colorName && sizeSelected && <span>{sizeSelected}</span>}
                </p>
                {renderSelectedAttributes()}
              </div>
              {productPrice !== undefined && (
                <Prices 
                  price={productPrice} 
                  finalPrice={finalPrice}
                  discountPercentage={discountPercentage}
                  className="mt-0.5" 
                />
              )}
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-slate-400">{`Qty ${qualitySelected}`}</p>

            <div className="flex">
              <Link
                href="/cart"
                className="font-medium text-primary-6000 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
              >
                View cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Transition
      appear
      show={show}
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
      <hr className=" border-slate-200 dark:border-slate-700 my-4" />
      {renderProductCartOnNotify()}
    </Transition>
  );
};

export default NotifyAddTocart;
