"use client";

import { useEffect } from "react";
import { useSiteData } from "@/hooks/useSiteData";

const FaviconUpdater = () => {
  const { siteData, loading } = useSiteData();

  useEffect(() => {
    if (!loading && siteData?.settings?.site_favicon) {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      existingLinks.forEach(link => link.remove());

      // Create new favicon link
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = siteData.settings.site_favicon;
      document.head.appendChild(link);
    }
  }, [siteData, loading]);

  return null;
};

export default FaviconUpdater;

