import React, { FC } from "react";
import { getCurrencySymbol } from "@/utils/currency";

export interface PricesProps {
  className?: string;
  price?: number;
  finalPrice?: number;
  discountPercentage?: number;
  contentClass?: string;
  currency?: string | null;
}

const Prices: FC<PricesProps> = ({
  className = "",
  price = 33,
  finalPrice,
  discountPercentage,
  contentClass = "py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium",
  currency,
}) => {
  const displayPrice = finalPrice !== undefined ? finalPrice : price;
  const hasDiscount = discountPercentage && discountPercentage > 0;
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className={`${className}`}>
      <div className="flex flex-col">
        {hasDiscount && price !== displayPrice ? (
          <>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center border-2 border-green-500 rounded-lg ${contentClass}`}
              >
                <span className="text-green-500 !leading-none">{currencySymbol}{String(displayPrice.toFixed(2))}</span>
              </div>
              <span className="text-xs text-slate-400 line-through">
                {currencySymbol}{String(price.toFixed(2))}
              </span>
            </div>
            {discountPercentage && (
              <span className="text-xs text-red-500 font-medium mt-0.5">
                Save {discountPercentage.toFixed(0)}%
              </span>
            )}
          </>
        ) : (
      <div
        className={`flex items-center border-2 border-green-500 rounded-lg ${contentClass}`}
      >
            <span className="text-green-500 !leading-none">{currencySymbol}{String(displayPrice.toFixed(2))}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prices;
