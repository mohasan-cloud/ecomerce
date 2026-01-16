"use client";

import React, { FC, useState, useEffect } from "react";
import Heading from "@/shared/Heading/Heading";
import Nav from "@/shared/Nav/Nav";
import NavItem from "@/shared/NavItem/NavItem";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import TabFiltersAPI from "@/components/TabFiltersAPI";
import type { FilterState } from "@/components/TabFiltersAPI";
import { Transition } from "@/app/headlessui";
import Input from "@/shared/Input/Input";

export interface HeaderFilterSectionProps {
  className?: string;
  onGenderChange?: (genderId: number | null) => void;
  onSearchChange?: (searchQuery: string) => void;
  onFilterChange?: (filters: FilterState) => void;
  selectedGenderId?: number | null;
  searchQuery?: string;
}

interface Gender {
  id: number;
  name: string;
}

const HeaderFilterSection: FC<HeaderFilterSectionProps> = ({
  className = "mb-12",
  onGenderChange,
  onSearchChange,
  onFilterChange,
  selectedGenderId,
  searchQuery = "",
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [tabActive, setTabActive] = useState("All items");
  const [genders, setGenders] = useState<Gender[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Fetch genders from API
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/genders`);
        const data = await response.json();

        if (data.success && data.data) {
          setGenders(data.data);
        }
      } catch (error) {
        console.error('Error fetching genders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenders();
  }, []);

  // Sync tabActive with selectedGenderId prop
  useEffect(() => {
    if (selectedGenderId === null) {
      setTabActive("All items");
    } else {
      const selectedGender = genders.find(g => g.id === selectedGenderId);
      if (selectedGender) {
        setTabActive(selectedGender.name);
      }
    }
  }, [selectedGenderId, genders]);

  // Sync localSearchQuery with searchQuery prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle gender tab click
  const handleGenderClick = (genderId: number | null, genderName: string) => {
    setTabActive(genderName);
    if (onGenderChange) {
      onGenderChange(genderId);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className={`flex flex-col relative ${className}`}>
      <Heading>{`What's trending now`}</Heading>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0 lg:space-x-2 ">
        <Nav
          className="sm:space-x-2"
          containerClassName="relative flex w-full overflow-x-auto text-sm md:text-base hiddenScrollbar"
        >
          <NavItem
            isActive={tabActive === "All items"}
            onClick={() => handleGenderClick(null, "All items")}
          >
            All items
          </NavItem>
          {loading ? (
            <div className="px-3 py-2 text-sm text-neutral-500">Loading...</div>
          ) : (
            genders.map((gender) => (
              <NavItem
                key={gender.id}
                isActive={tabActive === gender.name || selectedGenderId === gender.id}
                onClick={() => handleGenderClick(gender.id, gender.name)}
              >
                {gender.name}
              </NavItem>
            ))
          )}
        </Nav>
        
        {/* Search Input */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4"
              rounded="rounded-full"
            />
          </div>
        </div>
        <span className="block flex-shrink-0">
          <ButtonPrimary
            className="w-full !pr-16"
            sizeClass="pl-4 py-2.5 sm:pl-6"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <svg className={`w-6 h-6`} viewBox="0 0 24 24" fill="none">
              <path
                d="M14.3201 19.07C14.3201 19.68 13.92 20.48 13.41 20.79L12.0001 21.7C10.6901 22.51 8.87006 21.6 8.87006 19.98V14.63C8.87006 13.92 8.47006 13.01 8.06006 12.51L4.22003 8.47C3.71003 7.96 3.31006 7.06001 3.31006 6.45001V4.13C3.31006 2.92 4.22008 2.01001 5.33008 2.01001H18.67C19.78 2.01001 20.6901 2.92 20.6901 4.03V6.25C20.6901 7.06 20.1801 8.07001 19.6801 8.57001"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.07 16.52C17.8373 16.52 19.27 15.0873 19.27 13.32C19.27 11.5527 17.8373 10.12 16.07 10.12C14.3027 10.12 12.87 11.5527 12.87 13.32C12.87 15.0873 14.3027 16.52 16.07 16.52Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.87 17.12L18.87 16.12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="block truncate ml-2.5">Filter</span>
            <span className="absolute top-1/2 -translate-y-1/2 right-5">
              <ChevronDownIcon
                className={`w-5 h-5 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </span>
          </ButtonPrimary>
        </span>
      </div>

      <Transition
        show={isOpen}
        enter="transition-opacity duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        as="div"
      >
        <div>
        <div className="w-full border-b border-neutral-200 dark:border-neutral-700 my-8"></div>
        <TabFiltersAPI onFilterChange={onFilterChange} />
        </div>
      </Transition>
    </div>
  );
};

export default HeaderFilterSection;
