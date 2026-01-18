"use client";

import React, { FC, useState, useRef, useEffect, Suspense } from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const PageResetPassInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    token: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Use refs for cleanup and state tracking
  const isMountedRef = useRef(true);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get token and email from URL params
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token) {
      setFormData(prev => ({
        ...prev,
        token: token,
        email: email || "",
      }));
    } else {
      toast.error('Invalid reset link. Please request a new password reset.');
      router.push('/forgot-pass');
    }
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.password_confirmation) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!formData.token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      router.push('/forgot-pass');
      return;
    }

    try {
      isMountedRef.current = true;
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          token: formData.token,
        }),
      });

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (response.ok && data.success) {
        setSuccess(true);
        toast.success(data.message || 'Your password has been reset successfully');
        
        // Redirect to login after 3 seconds
        navigationTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            router.push('/login');
          }
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, []);

  if (success) {
    return (
      <div className={`nc-PageResetPass`} data-nc-id="PageResetPass">
        <div className="container mb-24 lg:mb-32">
          <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
            Password Reset Successful
          </h2>
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Password Reset Successful!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Redirecting to login page...
              </p>
            </div>
            <div className="text-center">
              <ButtonPrimary onClick={() => router.push('/login')}>
                Go to Login
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`nc-PageResetPass`} data-nc-id="PageResetPass">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Reset Password
        </h2>
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center mb-6">
            <p className="text-neutral-600 dark:text-neutral-400">
              Enter your new password below.
            </p>
          </div>
          
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address
              </span>
              <Input
                type="email"
                placeholder="example@example.com"
                className="mt-1"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading || !!formData.email}
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                New Password
              </span>
              <Input 
                type="password" 
                className="mt-1"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
                disabled={loading}
                placeholder="Enter new password (min 8 characters)"
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Confirm Password
              </span>
              <Input 
                type="password" 
                className="mt-1"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                required
                minLength={8}
                disabled={loading}
                placeholder="Confirm new password"
              />
            </label>
            <ButtonPrimary type="submit" loading={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Remember your password? {` `}
            <Link href="/login" className="text-green-600">
              Sign in
            </Link>
            {` / `}
            <Link href="/forgot-pass" className="text-green-600">
              Request new link
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

const PageResetPass = () => {
  return (
    <Suspense
      fallback={
        <div className={`nc-PageResetPass`} data-nc-id="PageResetPass">
          <div className="container mb-24 lg:mb-32">
            <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
              Reset Password
            </h2>
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PageResetPassInner />
    </Suspense>
  );
};

export default PageResetPass;
