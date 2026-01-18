"use client";

import React from "react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";
import Logo from "@/shared/Logo/Logo";
import { Disclosure } from "@/app/headlessui";
import { NavItemType } from "./NavigationItem";
import SocialsList from "@/shared/SocialsList/SocialsList";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import SwitchDarkMode from "@/shared/SwitchDarkMode/SwitchDarkMode";
import Link from "next/link";
import { useSiteData } from "@/hooks/useSiteData";

export interface NavMobileProps {
  onClickClose?: () => void;
}

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

const NavMobile: React.FC<NavMobileProps> = ({
  onClickClose,
}) => {
  const { siteData, loading } = useSiteData();

  // Convert API pages to navigation items
  const navigationItems: NavItemType[] = siteData?.header_pages?.map(convertPageToNavItem) || [];
  
  const _renderMenuChild = (
    item: NavItemType,
    itemClass = " pl-3 text-neutral-900 dark:text-neutral-200 font-medium "
  ) => {
    return (
      <ul className="nav-mobile-sub-menu pl-6 pb-1 text-base">
        {item.children?.map((i, index) => (
          <Disclosure key={index} as="li">
            {({ open }) => (
              <>
                {i.children ? (
                  <>
                    <Disclosure.Button
                      className={`flex w-full items-center text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-0.5 pr-4 ${itemClass}`}
                    >
                      <span className="py-2.5 flex-grow text-left">{i.name}</span>
                      <ChevronDownIcon
                        className={`ml-2 h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel>
                      {_renderMenuChild(
                        i,
                        "pl-3 text-slate-600 dark:text-slate-400 "
                      )}
                    </Disclosure.Panel>
                  </>
                ) : (
                  <Link
                    href={{
                      pathname: i.href || undefined,
                    }}
                    className={`flex text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-0.5 pr-4 ${itemClass}`}
                    onClick={onClickClose}
                  >
                    <span className="py-2.5 block w-full">{i.name}</span>
                  </Link>
                )}
              </>
            )}
          </Disclosure>
        ))}
      </ul>
    );
  };

  const _renderItem = (item: NavItemType, index: number) => {
    return (
      <Disclosure
        key={index}
        as="li"
        className="text-slate-900 dark:text-white"
      >
        {({ open }) => (
          <>
            {item.children ? (
              <>
                <Disclosure.Button className="flex w-full items-center py-2.5 px-4 font-medium uppercase tracking-wide text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <span className="flex-grow text-left">{item.name}</span>
                  <ChevronDownIcon
                    className={`ml-2 h-4 w-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </Disclosure.Button>
                <Disclosure.Panel>{_renderMenuChild(item)}</Disclosure.Panel>
              </>
            ) : (
              <Link
                className="flex w-full items-center py-2.5 px-4 font-medium uppercase tracking-wide text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                href={{
                  pathname: item.href || undefined,
                }}
                onClick={onClickClose}
              >
                <span className="block w-full">{item.name}</span>
              </Link>
            )}
          </>
        )}
      </Disclosure>
    );
  };


  return (
    <div className="overflow-y-auto w-full h-screen py-2 transition transform shadow-lg ring-1 dark:ring-neutral-700 bg-white dark:bg-neutral-900 divide-y-2 divide-neutral-100 dark:divide-neutral-800">
      <div className="py-6 px-5">
        <Logo />
        <div className="flex flex-col mt-5 text-slate-600 dark:text-slate-300 text-sm">
          {siteData?.settings?.site_tagline && (
            <span>
              {siteData.settings.site_tagline}
            </span>
          )}

          <div className="flex justify-between items-center mt-4">
            <SocialsList 
              itemClass="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xl" 
              socialLinks={siteData?.settings?.social}
            />
            <span className="block">
              <SwitchDarkMode className="bg-neutral-100 dark:bg-neutral-800" />
            </span>
          </div>
        </div>
        <span className="absolute right-2 top-2 p-1">
          <ButtonClose onClick={onClickClose} />
        </span>
      </div>
      {loading ? (
        <div className="flex flex-col py-6 px-2 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg mx-4"></div>
            </div>
          ))}
        </div>
      ) : navigationItems.length > 0 ? (
        <ul className="flex flex-col py-6 px-2 space-y-1">
          {navigationItems.map(_renderItem)}
        </ul>
      ) : null}
    </div>
  );
};

export default NavMobile;
