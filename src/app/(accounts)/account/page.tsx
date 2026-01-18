"use client";

import Label from "@/components/Label/Label";
import React, { FC, useState, useEffect, useRef } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Textarea from "@/shared/Textarea/Textarea";
import { avatarImgs } from "@/contains/fakeData";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  date_of_birth?: string;
  gender?: string;
  bio?: string;
}

const AccountPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Use refs for cleanup and state tracking
  const isMountedRef = useRef(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    date_of_birth: "",
    gender: "",
    bio: "",
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        if (isMountedRef.current) {
          toast.error('Please login to access your account');
          router.push('/login');
        }
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!isMountedRef.current) return;

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user && isMountedRef.current) {
            const userData = data.data.user;
            setUser(userData);
            setFormData({
              name: userData.name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              address: userData.address || "",
              city: userData.city || "",
              state: userData.state || "",
              country: userData.country || "",
              postal_code: userData.postal_code || "",
              date_of_birth: userData.date_of_birth || "",
              gender: userData.gender || "",
              bio: userData.bio || "",
            });
          }
        } else if (response.status === 401) {
          if (isMountedRef.current) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            toast.error('Session expired. Please login again');
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMountedRef.current) {
          toast.error('Failed to load user data');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    
    // Cleanup function using useRef
    return () => {
      isMountedRef.current = false;
    };
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to upload avatar');
      router.push('/login');
      return;
    }

    setUploadingAvatar(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${apiUrl}/api/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Avatar updated successfully');
        
        // Update user state with new avatar
        if (data.data?.user?.avatar) {
          setUser(prev => prev ? { ...prev, avatar: data.data.user.avatar } : null);
          
          // Update localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userObj.avatar = data.data.user.avatar;
            localStorage.setItem('user', JSON.stringify(userObj));
          }
          
          // Dispatch event to update header
          window.dispatchEvent(new Event('auth-change'));
        }
      } else {
        toast.error(data.message || 'Failed to upload avatar');
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          toast.error(errorMessages[0] as string);
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('An error occurred while uploading avatar');
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to update your profile');
      router.push('/login');
      return;
    }

    setUpdating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Profile updated successfully');
        // Update user state with new data
        if (data.data?.user) {
          setUser(data.data.user);
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(data.data.user));
          // Dispatch event to update header
          window.dispatchEvent(new Event('auth-change'));
        }
      } else {
        toast.error(data.message || 'Failed to update profile');
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          toast.error(errorMessages[0] as string);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="nc-AccountPage">
        <div className="space-y-10 sm:space-y-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="flex flex-col md:flex-row">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-grow mt-10 md:mt-0 md:pl-16 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="nc-AccountPage">
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">Unable to load user data</p>
        </div>
      </div>
    );
  }

  // Get avatar URL - handle Next.js image imports (which are objects) and string URLs
  let avatarSrc: string | any = '/images/placeholder.png';
  
  if (user?.avatar) {
    if (typeof user.avatar === 'string' && user.avatar.trim() !== '') {
      avatarSrc = user.avatar;
    }
  } else if (avatarImgs && avatarImgs[2]) {
    // avatarImgs contains Next.js image imports (objects), use directly
    avatarSrc = avatarImgs[2];
  }
  
  // Check if it's a localhost URL (only for string URLs)
  const isLocalhost = typeof avatarSrc === 'string' && (avatarSrc.includes('localhost') || avatarSrc.includes('127.0.0.1'));

  return (
    <div className={`nc-AccountPage `}>
      <div className="space-y-10 sm:space-y-12">
        {/* HEADING */}
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Account information
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row">
            <div className="flex-shrink-0 flex items-start">
              {/* AVATAR */}
              <div className="relative rounded-full overflow-hidden flex">
                <Image
                  src={avatarSrc}
                  alt="avatar"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover z-0"
                  unoptimized={isLocalhost}
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-neutral-50 z-10">
                    <svg
                      className="animate-spin h-8 w-8 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="mt-2 text-xs">Uploading...</span>
                  </div>
                )}
                {!uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-neutral-50 cursor-pointer">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.5 5H7.5C6.83696 5 6.20107 5.26339 5.73223 5.73223C5.26339 6.20107 5 6.83696 5 7.5V20M5 20V22.5C5 23.163 5.26339 23.7989 5.73223 24.2678C6.20107 24.7366 6.83696 25 7.5 25H22.5C23.163 25 23.7989 24.7366 24.2678 24.2678C24.7366 23.7989 25 23.163 25 22.5V17.5M5 20L10.7325 14.2675C11.2013 13.7988 11.8371 13.5355 12.5 13.5355C13.1629 13.5355 13.7987 13.7988 14.2675 14.2675L17.5 17.5M25 12.5V17.5M25 17.5L23.0175 15.5175C22.5487 15.0488 21.9129 14.7855 21.25 14.7855C20.5871 14.7855 19.9513 15.0488 19.4825 15.5175L17.5 17.5M17.5 17.5L20 20M22.5 5H27.5M25 2.5V7.5M17.5 10H17.5125"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="mt-1 text-xs">Change Image</span>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </div>
            </div>
            <div className="flex-grow mt-10 md:mt-0 md:pl-16 max-w-3xl space-y-6">
              <div>
                <Label>Full name</Label>
                <Input
                  className="mt-1.5"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* ---- */}
              <div>
                <Label>Email</Label>
                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                    <i className="text-2xl las la-envelope"></i>
                  </span>
                  <Input
                    className="!rounded-l-none"
                    type="email"
                    value={formData.email}
                    disabled
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              {/* ---- */}
              <div className="max-w-lg">
                <Label>Date of birth</Label>
                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                    <i className="text-2xl las la-calendar"></i>
                  </span>
                  <Input
                    className="!rounded-l-none"
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {/* ---- */}
              <div>
                <Label>Address</Label>
                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                    <i className="text-2xl las la-map-signs"></i>
                  </span>
                  <Input
                    className="!rounded-l-none"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* ---- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>City</Label>
                  <Input
                    className="mt-1.5"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    className="mt-1.5"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
              </div>

              {/* ---- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Country</Label>
                  <Input
                    className="mt-1.5"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input
                    className="mt-1.5"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="Postal Code"
                  />
                </div>
              </div>

              {/* ---- */}
              <div>
                <Label>Gender</Label>
                <Select
                  className="mt-1.5"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>

              {/* ---- */}
              <div>
                <Label>Phone number</Label>
                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                    <i className="text-2xl las la-phone-volume"></i>
                  </span>
                  <Input
                    className="!rounded-l-none"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              {/* ---- */}
              <div>
                <Label>About you</Label>
                <Textarea
                  className="mt-1.5"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
              <div className="pt-2">
                <ButtonPrimary type="submit" loading={updating}>
                  {updating ? 'Updating...' : 'Update account'}
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
