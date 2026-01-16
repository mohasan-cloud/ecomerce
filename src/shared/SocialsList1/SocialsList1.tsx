"use client";

import { SocialType } from "@/shared/SocialsShare/SocialsShare";
import React, { FC } from "react";
import facebook from "@/images/socials/facebook.svg";
import twitter from "@/images/socials/twitter.svg";
import telegram from "@/images/socials/telegram.svg";
import youtube from "@/images/socials/youtube.svg";
// Using telegram as fallback for instagram/linkedin if icons don't exist
const instagram = telegram;
const linkedin = telegram;
import Image from "next/image";
import { useSiteData } from "@/hooks/useSiteData";

export interface SocialsList1Props {
  className?: string;
}

const SocialsList1: FC<SocialsList1Props> = ({ className = "space-y-3" }) => {
  const { siteData } = useSiteData();

  // Build socials array from API data
  const socials: SocialType[] = [];
  
  if (siteData?.settings?.social) {
    const social = siteData.settings.social;
    if (social.facebook) {
      socials.push({ name: "Facebook", icon: facebook, href: social.facebook });
    }
    if (social.instagram) {
      socials.push({ name: "Instagram", icon: instagram, href: social.instagram });
    }
    if (social.twitter) {
      socials.push({ name: "Twitter", icon: twitter, href: social.twitter });
    }
    if (social.linkedin) {
      socials.push({ name: "LinkedIn", icon: linkedin, href: social.linkedin });
    }
    if (social.youtube) {
      socials.push({ name: "Youtube", icon: youtube, href: social.youtube });
    }
    if (social.whatsapp) {
      socials.push({ name: "WhatsApp", icon: telegram, href: `https://wa.me/${social.whatsapp}` });
    }
  }

  // Fallback to default if no API data
  if (socials.length === 0) {
    socials.push(
      { name: "Facebook", icon: facebook, href: "#" },
      { name: "Youtube", icon: youtube, href: "#" },
      { name: "Telegram", icon: telegram, href: "#" },
      { name: "Twitter", icon: twitter, href: "#" }
    );
  }

  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-2xl text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white leading-none space-x-2 group"
        key={index}
      >
        <div className="flex-shrink-0 w-5 ">
          <Image sizes="40px" src={item.icon} alt="" />
        </div>
        <span className="hidden lg:block text-sm">{item.name}</span>
      </a>
    );
  };

  return (
    <div className={`nc-SocialsList1 ${className}`} data-nc-id="SocialsList1">
      {socials.map(renderItem)}
    </div>
  );
};

export default SocialsList1;
