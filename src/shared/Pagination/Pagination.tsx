import { CustomLink } from "@/data/types";
import React, { FC } from "react";
import twFocusClass from "@/utils/twFocusClass";
import Link from "next/link";

const DEMO_PAGINATION: CustomLink[] = [
  {
    label: "1",
    href: "/",
  },
  {
    label: "2",
    href: "/",
  },
  {
    label: "3",
    href: "/",
  },
  {
    label: "4",
    href: "/",
  },
];

export interface PaginationProps {
  className?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ 
  className = "",
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  // If no pagination props provided, use demo data
  const isDemoMode = !onPageChange;
  
  const renderItem = (pag: CustomLink, index: number) => {
    if (index === 0) {
      return (
        <span
          key={index}
          className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-6000 text-white ${twFocusClass()}`}
        >
          {pag.label}
        </span>
      );
    }
    // RETURN UNACTIVE PAGINATION
    return (
      <Link
        key={index}
        className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
        href={pag.href}
      >
        {pag.label}
      </Link>
    );
  };

  const renderDynamicItem = (page: number) => {
    const isActive = page === currentPage;
    
    if (isActive) {
      return (
        <span
          key={page}
          className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-primary-6000 text-white ${twFocusClass()}`}
        >
          {page}
        </span>
      );
    }
    
    return (
      <button
        key={page}
        onClick={() => onPageChange?.(page)}
        className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
      >
        {page}
      </button>
    );
  };

  const renderDynamicPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex w-11 h-11 items-center justify-center"
          >
            ...
          </span>
        );
      }
      return renderDynamicItem(page as number);
    });
  };

  if (isDemoMode) {
  return (
    <nav
      className={`nc-Pagination inline-flex space-x-1 text-base font-medium ${className}`}
    >
      {DEMO_PAGINATION.map(renderItem)}
      </nav>
    );
  }

  return (
    <nav
      className={`nc-Pagination inline-flex space-x-1 text-base font-medium ${className}`}
    >
      {/* Previous button */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
        >
          ‹
        </button>
      )}
      
      {renderDynamicPagination()}
      
      {/* Next button */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          className={`inline-flex w-11 h-11 items-center justify-center rounded-full bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-6000 dark:text-neutral-400 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-700 ${twFocusClass()}`}
        >
          ›
        </button>
      )}
    </nav>
  );
};

export default Pagination;
