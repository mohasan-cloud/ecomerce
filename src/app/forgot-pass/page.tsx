"use client";

import React, { FC, useState, useRef } from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PageForgotPass = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Use refs for cleanup and state tracking
  const isMountedRef = useRef(true);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      isMountedRef.current = true;
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (response.ok && data.success) {
        setSuccess(true);
        toast.success(data.message || 'Password reset link has been sent to your email');
        
        // Clear email after success
        setEmail("");
      } else {
        toast.error(data.message || 'Failed to send password reset link. Please try again.');
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.error('Forgot password error:', error);
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

  return (
    <div className={`nc-PageForgotPass`} data-nc-id="PageForgotPass">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Forgot Password
        </h2>
        
        {success ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Check Your Email
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                We've sent a password reset link to <strong>{email}</strong>. Please check your email and click on the link to reset your password.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <div className="text-center">
              <ButtonPrimary onClick={() => setSuccess(false)}>
                Send Another Email
              </ButtonPrimary>
            </div>
            <span className="block text-center text-neutral-700 dark:text-neutral-300">
              Remember your password? {` `}
              <Link href="/login" className="text-green-600">
                Sign in
              </Link>
            </span>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-6">
              <p className="text-neutral-600 dark:text-neutral-400">
                Enter your email address and we'll send you a link to reset your password.
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>
              <ButtonPrimary type="submit" loading={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </ButtonPrimary>
            </form>

            {/* ==== */}
            <span className="block text-center text-neutral-700 dark:text-neutral-300">
              Remember your password? {` `}
              <Link href="/login" className="text-green-600">
                Sign in
              </Link>
              {` / `}
              <Link href="/signup" className="text-green-600">
                Sign up
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageForgotPass;
