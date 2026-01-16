import React, { FC } from "react";
import facebook from "@/images/socials/facebook.svg";
import twitter from "@/images/socials/twitter.svg";
import telegram from "@/images/socials/telegram.svg";
import youtube from "@/images/socials/youtube.svg";
import Image from "next/image";

export interface SocialsListProps {
  className?: string;
  itemClass?: string;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
    whatsapp?: string | null;
  };
}

const SocialsList: FC<SocialsListProps> = ({
  className = "",
  itemClass = "block w-6 h-6",
  socialLinks,
}) => {
  const socials = [];

  if (socialLinks?.facebook) {
    socials.push({ name: "Facebook", icon: facebook, href: socialLinks.facebook });
  }
  if (socialLinks?.instagram) {
    socials.push({ name: "Instagram", icon: telegram, href: socialLinks.instagram }); // Using telegram icon as placeholder
  }
  if (socialLinks?.twitter) {
    socials.push({ name: "Twitter", icon: twitter, href: socialLinks.twitter });
  }
  if (socialLinks?.linkedin) {
    socials.push({ name: "LinkedIn", icon: telegram, href: socialLinks.linkedin }); // Using telegram icon as placeholder
  }
  if (socialLinks?.youtube) {
    socials.push({ name: "Youtube", icon: youtube, href: socialLinks.youtube });
  }
  if (socialLinks?.whatsapp) {
    socials.push({ name: "WhatsApp", icon: telegram, href: `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}` });
  }

  // If no social links provided, show demo links
  const displaySocials = socials.length > 0 ? socials : [
    { name: "Facebook", icon: facebook, href: "#" },
    { name: "Twitter", icon: twitter, href: "#" },
    { name: "Youtube", icon: youtube, href: "#" },
    { name: "Telegram", icon: telegram, href: "#" },
  ];

  return (
    <nav
      className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-6000 dark:text-neutral-300 ${className}`}
    >
      {displaySocials.map((item, i) => (
        <a
          key={i}
          className={`${itemClass}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
        >
          <Image sizes="40px" src={item.icon} alt={item.name} />
        </a>
      ))}
    </nav>
  );
};

export default SocialsList;
