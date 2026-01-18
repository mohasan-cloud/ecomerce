import { avatarColors } from "@/contains/contants";
import React, { FC } from "react";
import VerifyIcon from "@/components/VerifyIcon";
import Image, { StaticImageData } from "next/image";

export interface AvatarProps {
  containerClassName?: string;
  sizeClass?: string;
  radius?: string;
  imgUrl?: string | StaticImageData | null;
  userName?: string;
  hasChecked?: boolean;
  hasCheckedClass?: string;
}

const Avatar: FC<AvatarProps> = ({
  containerClassName = "ring-1 ring-white dark:ring-neutral-900",
  sizeClass = "h-6 w-6 text-sm",
  radius = "rounded-full",
  imgUrl,
  userName,
  hasChecked,
  hasCheckedClass = "w-4 h-4 bottom-1 -right-0.5",
}) => {
  // Only use imgUrl if it's a valid string or StaticImageData
  const hasImage = imgUrl && (
    (typeof imgUrl === 'string' && imgUrl.trim() !== '') ||
    (typeof imgUrl === 'object' && imgUrl !== null)
  );
  
  const url = hasImage ? imgUrl : null;
  const name = userName || "U";
  const firstLetter = name.trim()[0]?.toUpperCase() || "U";
  
  const _setBgColor = (name: string) => {
    const backgroundIndex = Math.floor(
      name.charCodeAt(0) % avatarColors.length
    );
    return avatarColors[backgroundIndex];
  };

  return (
    <div
      className={`wil-avatar relative flex-shrink-0 inline-flex items-center justify-center text-neutral-100 uppercase font-semibold shadow-inner ${radius} ${sizeClass} ${containerClassName}`}
      style={{ backgroundColor: url ? undefined : _setBgColor(name) }}
    >
      {url && (
        <Image
          fill
          sizes="100px"
          className={`absolute inset-0 w-full h-full object-cover ${radius}`}
          src={url}
          alt={name}
          unoptimized={typeof url === 'string' && (url.includes('localhost') || url.includes('127.0.0.1'))}
        />
      )}
      {!url && (
        <span className="wil-avatar__name relative z-10">{firstLetter}</span>
      )}

      {hasChecked && (
        <span className={`  text-white  absolute  ${hasCheckedClass}`}>
          <VerifyIcon className="" />
        </span>
      )}
    </div>
  );
};

export default Avatar;
