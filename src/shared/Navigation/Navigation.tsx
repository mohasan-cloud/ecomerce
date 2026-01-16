"use client";

import React from "react";
import NavigationItem from "./NavigationItem";
import { useSiteData } from "@/hooks/useSiteData";
import { NavItemType } from "./NavigationItem";
import ncNanoId from "@/utils/ncNanoId";

// Skeleton loading component
const NavigationSkeleton = () => {
  return (
    <ul className="nc-Navigation flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="animate-pulse">
          <div className="h-10 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
        </li>
      ))}
    </ul>
  );
};

// Convert API page to NavItemType
const convertPageToNavItem = (page: any): NavItemType => {
  const hasChildren = page.children && page.children.length > 0;
  
  return {
    id: String(page.id),
    href: page.href as any,
    name: page.title,
    type: hasChildren ? "dropdown" : undefined,
    children: hasChildren ? page.children.map(convertPageToNavItem) : undefined,
  };
};

function Navigation() {
  const { siteData, loading } = useSiteData();

  if (loading) {
    return <NavigationSkeleton />;
  }

  // Convert API pages to navigation items (removed dummy data)
  const navigationItems: NavItemType[] = siteData?.header_pages?.map(convertPageToNavItem) || [];

  if (navigationItems.length === 0) {
    return null;
  }

  return (
    <ul className="nc-Navigation flex items-center">
      {navigationItems.map((item) => (
        <NavigationItem key={item.id} menuItem={item} />
      ))}
    </ul>
  );
}

export default Navigation;
