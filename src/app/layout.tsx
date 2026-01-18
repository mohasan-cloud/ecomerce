import localFont from "next/font/local";
import "./globals.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";
import "rc-slider/assets/index.css";
import "@glidejs/glide/dist/css/glide.core.css";
import Footer from "@/shared/Footer/Footer";
import SiteHeader from "@/app/SiteHeader";
import CommonClient from "./CommonClient";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import { ModuleDataProvider } from "@/contexts/ModuleDataContext";
import { generateMetadata as getDefaultMetadata } from "@/utils/getMetadata";
import FaviconUpdater from "./FaviconUpdater";
import NotificationPermission from "@/components/NotificationPermission";
import SWRProvider from "./SWRProvider";
import "@/utils/globalErrorHandler"; // Import global error handler
import type { Metadata } from "next";

const poppins = localFont({
  src: [
    {
      path: "../fonts/Poppins/Poppins-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Poppins/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Poppins/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Poppins/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Poppins/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-poppins",
});

// Generate default metadata from API
export async function generateMetadata(): Promise<Metadata> {
  return await getDefaultMetadata('default');
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <html lang="en" dir="" className={poppins.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
        <SWRProvider>
          <SiteDataProvider>
            <ModuleDataProvider>
              <FaviconUpdater />
              <CartProvider>
                <WishlistProvider>
                  <SiteHeader />
                  {children}
                  <CommonClient />
                  <NotificationPermission />
                  <Footer />
                </WishlistProvider>
              </CartProvider>
            </ModuleDataProvider>
          </SiteDataProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
