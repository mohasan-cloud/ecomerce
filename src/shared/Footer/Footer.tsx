"use client";

import Logo from "@/shared/Logo/Logo";
import SocialsList1 from "@/shared/SocialsList1/SocialsList1";
import { CustomLink } from "@/data/types";
import React from "react";
import { useSiteData } from "@/hooks/useSiteData";
import Link from "next/link";

export interface WidgetFooterMenu {
  id: string;
  title: string;
  menus: CustomLink[];
}

const Footer: React.FC = () => {
  const { siteData, loading } = useSiteData();

  // Create footer menus from API pages (supporting submenus)
  const createFooterMenus = (pages: any[]): WidgetFooterMenu[] => {
    return pages.map((page) => ({
      id: String(page.id),
      title: page.title,
      menus: page.children && page.children.length > 0
        ? page.children.map((child: any) => ({
            href: child.href,
            label: child.title,
          }))
        : page.href
        ? [{ href: page.href, label: page.title }]
        : [],
    })).filter(menu => menu.menus.length > 0);
  };

  const footerMenus: WidgetFooterMenu[] = siteData?.footer_pages
    ? createFooterMenus(siteData.footer_pages)
    : [];

  const renderWidgetMenuItem = (menu: WidgetFooterMenu, index: number) => {
    return (
      <div key={index} className="text-sm">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-200">
          {menu.title}
        </h2>
        <ul className="mt-5 space-y-4">
          {menu.menus.map((item, index) => (
            <li key={index}>
              <Link
                className="text-neutral-6000 dark:text-neutral-300 hover:text-black dark:hover:text-white"
                href={item.href}
                prefetch={true}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Skeleton loading component
  const FooterSkeleton = () => {
    return (
      <div className="nc-Footer relative py-20 lg:pt-28 lg:pb-24 border-t border-neutral-200 dark:border-neutral-700">
        <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10">
          <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
            <div className="col-span-2 md:col-span-1">
              <div className="h-12 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2 flex items-center md:col-span-3">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-sm">
              <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-5"></div>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <li key={j} className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <FooterSkeleton />;
  }

  return (
    <div className="nc-Footer relative py-20 lg:pt-28 lg:pb-24 border-t border-neutral-200 dark:border-neutral-700">
      <div className="container grid grid-cols-2 gap-y-10 gap-x-5 sm:gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-10 ">
        <div className="grid grid-cols-4 gap-5 col-span-2 md:col-span-4 lg:md:col-span-1 lg:flex lg:flex-col">
          <div className="col-span-2 md:col-span-1">
            <Logo type="footer" />
          </div>
          <div className="col-span-2 flex items-center md:col-span-3">
            <SocialsList1 className="flex items-center space-x-2 lg:space-x-0 lg:flex-col lg:space-y-3 lg:items-start" />
          </div>
        </div>
        {footerMenus.map(renderWidgetMenuItem)}
        {(siteData?.settings?.footer_text || siteData?.settings?.copyright_text) && (
          <div className="col-span-2 md:col-span-4 lg:col-span-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            {siteData?.settings?.footer_text && (
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {siteData.settings.footer_text}
              </div>
            )}
            {siteData?.settings?.copyright_text && (
              <div className="text-xs text-neutral-500 dark:text-neutral-500">
                {siteData.settings.copyright_text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Footer;
