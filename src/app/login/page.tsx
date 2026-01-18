"use client";

import React, { FC, useState, useRef } from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getDeviceInfo } from "@/utils/deviceInfo";

const PageLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Use refs for cleanup and state tracking
  const isMountedRef = useRef(true);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      isMountedRef.current = true;
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let response;
      let data;
      
      // Get session ID for wishlist sync
      const getSessionId = () => {
        if (typeof window === 'undefined') return null;
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
          localStorage.setItem('session_id', sessionId);
        }
        return sessionId;
      };

      const sessionId = getSessionId();

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };

        // Add session ID header for wishlist sync
        if (sessionId) {
          headers['X-Session-ID'] = sessionId;
        }

        // Add theme preference header to sync theme on login
        const currentTheme = typeof window !== 'undefined' ? (localStorage.theme || 'light') : 'light';
        headers['X-Theme-Preference'] = currentTheme;

        // Get device info
        const deviceInfo = getDeviceInfo();

        response = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email,
            password,
            device_info: deviceInfo,
          }),
        });

        // Check if response is ok
        if (!response.ok) {
          // Try to parse error response
          try {
            data = await response.json();
          } catch {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        } else {
          data = await response.json();
        }
      } catch (fetchError: any) {
        // Network error or CORS issue
        let errorMessage = 'Unknown error';
        let errorName = '';
        
        try {
          errorMessage = fetchError?.message || fetchError?.toString() || String(fetchError) || 'Unknown error';
          errorName = fetchError?.name || '';
        } catch (e) {
          errorMessage = 'Network request failed';
        }
        
        // Log error separately to avoid serialization issues
        console.error('=== Fetch Error ===');
        console.error('API URL:', apiUrl);
        console.error('Error Name:', errorName);
        console.error('Error Message:', errorMessage);
        console.error('Error Object:', fetchError);
        console.error('Error Type:', typeof fetchError);
        if (fetchError?.stack) {
          console.error('Stack:', fetchError.stack);
        }
        console.error('==================');
        
        // Check if it's a network error
        const isNetworkError = 
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') || 
          errorMessage.includes('TypeError') ||
          errorName === 'TypeError' ||
          fetchError?.name === 'TypeError' ||
          !fetchError; // If error is null/undefined, it's likely a network issue
        
        if (isNetworkError) {
          toast.error(`Unable to connect to server at ${apiUrl}. Please check: 1) Laravel server is running (php artisan serve), 2) Server is accessible, 3) No firewall blocking the connection.`);
        } else {
          toast.error('An error occurred: ' + errorMessage);
        }
        setLoading(false);
        return;
      }

      if (data.success) {
        // Store token in localStorage
        if (data.data?.token) {
          localStorage.setItem('auth_token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          
          // Sync theme preference from user account
          if (data.data.user?.theme_preference) {
            localStorage.theme = data.data.user.theme_preference;
            // Apply theme immediately
            const root = document.querySelector("html");
            if (root) {
              if (data.data.user.theme_preference === 'dark') {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            }
          }
          
          // Dispatch custom event to update header and trigger notification setup
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-change'));
          }
        }
        toast.success(data.message || "Login successful!");
        
        // Add small delay before navigation to let cleanup complete and notification setup
        // Use ref for timeout cleanup
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        
        navigationTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            router.push('/');
            router.refresh();
          }
        }, 200);
      } else {
        toast.error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "An error occurred during login.");
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
    <div className={`nc-PageLogin`} data-nc-id="PageLogin">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Login
        </h2>
        <div className="max-w-md mx-auto space-y-6">
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
              />
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Password
                <Link href="/forgot-pass" className="text-sm text-green-600">
                  Forgot password?
                </Link>
              </span>
              <Input 
                type="password" 
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <ButtonPrimary type="submit" loading={loading}>
              {loading ? "Logging in..." : "Continue"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            New user? {` `}
            <Link className="text-green-600" href="/signup">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;
