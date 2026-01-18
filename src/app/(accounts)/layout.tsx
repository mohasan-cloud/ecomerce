"use client";

import { Route } from "@/routers/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FC } from "react";

export interface CommonLayoutProps {
  children?: React.ReactNode;
}

const pages: {
  name: string;
  link: Route;
}[] = [
  {
    name: "Account info",
    link: "/account",
  },
  {
    name: "Save lists",
    link: "/account-savelists",
  },
  {
    name: " My order",
    link: "/account-order",
  },
  {
    name: "Change password",
    link: "/account-password",
  },
  {
    name: "Change Billing",
    link: "/account-billing",
  },
  {
    name: "My Devices",
    link: "/account-devices",
  },
];

const CommonLayout: FC<CommonLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; email?: string; city?: string; state?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();

    // Listen for auth changes
    if (typeof window !== 'undefined') {
      const handleAuthChange = () => {
        fetchUserData();
      };

      window.addEventListener('auth-change', handleAuthChange);

      return () => {
        try {
          if (typeof window !== 'undefined') {
            window.removeEventListener('auth-change', handleAuthChange);
          }
        } catch (e) {
          // Ignore error if window is not available
          console.warn('Error removing event listener:', e);
        }
      };
    }
  }, []);

  const location = user?.city && user?.state 
    ? `${user.city}, ${user.state}` 
    : user?.city || user?.state || '';

  return (
    <div className="nc-AccountCommonLayout container">
      <div className="mt-14 sm:mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="max-w-2xl">
            <h2 className="text-3xl xl:text-4xl font-semibold">Account</h2>
            {loading ? (
              <div className="mt-4 h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
            ) : user ? (
              <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">
                <span className="text-slate-900 dark:text-slate-200 font-semibold">
                  {user.name || 'User'},
                </span>{" "}
                {user.email || ''}{location ? ` · ${location}` : ''}
              </span>
            ) : (
              <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">
                Please login to view your account
              </span>
            )}
          </div>
          <hr className="mt-10 border-slate-200 dark:border-slate-700"></hr>

          <div className="flex space-x-8 md:space-x-14 overflow-x-auto hiddenScrollbar">
            {pages.map((item, index) => {
              return (
                <Link
                  key={index}
                  href={item.link}
                  className={`block py-5 md:py-8 border-b-2 flex-shrink-0 text-sm sm:text-base ${
                    pathname === item.link
                      ? "border-primary-500 font-medium text-slate-900 dark:text-slate-200"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <hr className="border-slate-200 dark:border-slate-700"></hr>
        </div>
      </div>
      <div className="max-w-4xl mx-auto pt-14 sm:pt-26 pb-24 lg:pb-32">
        {children}
      </div>
    </div>
  );
};

export default CommonLayout;
