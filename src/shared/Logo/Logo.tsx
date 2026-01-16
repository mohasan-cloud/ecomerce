"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteData } from "@/hooks/useSiteData";

export interface LogoProps {
  img?: string;
  imgLight?: string;
  className?: string;
  type?: "header" | "footer";
}

const Logo: React.FC<LogoProps> = ({
  img,
  imgLight,
  className = "flex-shrink-0",
  type = "header",
}) => {
  const { siteData, loading } = useSiteData();

  // Determine which logo to use based on type
  let logoUrl: string | null = null;
  let logoLightUrl: string | null = null;

  if (!loading && siteData?.settings) {
    if (type === "footer") {
      logoUrl = siteData.settings.footer_logo || siteData.settings.site_logo;
    } else {
      // For header, prefer header_logo, fallback to site_logo
      logoUrl = siteData.settings.header_logo || siteData.settings.site_logo;
      // For dark mode, use white_logo if available, otherwise use black_logo or color_logo
      logoLightUrl = siteData.settings.white_logo || siteData.settings.black_logo || siteData.settings.color_logo;
    }
  }

  // Use provided props if API data is not available or still loading
  const displayLogo = img || logoUrl;
  const displayLogoLight = imgLight || logoLightUrl;

  return (
    <Link
      href="/"
      className={`ttnc-logo inline-block text-slate-600 ${className}`}
    >
      {loading ? (
        <div className="h-8 sm:h-10 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
      ) : displayLogo ? (
        <>
          <Image
            className={`block h-8 sm:h-10 w-auto ${
              displayLogoLight ? "dark:hidden" : ""
            }`}
            src={displayLogo}
            alt="Logo"
            sizes="200px"
            priority
            width={120}
            height={40}
            unoptimized={displayLogo.startsWith('http')}
          />
          {displayLogoLight && (
            <Image
              className="hidden h-8 sm:h-10 w-auto dark:block"
              src={displayLogoLight}
              alt="Logo-Light"
              sizes="200px"
              priority
              width={120}
              height={40}
              unoptimized={displayLogoLight.startsWith('http')}
            />
          )}
        </>
      ) : (
        <span className="text-lg font-semibold">Logo</span>
      )}
    </Link>
  );
};

export default Logo;
