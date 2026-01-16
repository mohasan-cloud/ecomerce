"use client";

import React, { FC, useState } from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PageSignUp = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !passwordConfirmation) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let response;
      let data;
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        console.log('Attempting to register user at:', `${apiUrl}/api/auth/register`);
        
        // Get current theme preference
        const currentTheme = typeof window !== 'undefined' ? (localStorage.theme || 'light') : 'light';

        response = await fetch(`${apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Theme-Preference': currentTheme,
          },
          body: JSON.stringify({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            phone: phone || null,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

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
        clearTimeout(timeoutId);
        
        // Network error or CORS issue
        let errorMessage = 'Unknown error';
        let errorName = '';
        
        try {
          errorMessage = fetchError?.message || fetchError?.toString() || String(fetchError) || 'Unknown error';
          errorName = fetchError?.name || '';
        } catch (e) {
          errorMessage = 'Network request failed';
        }
        
        // Check if it's an abort error (timeout)
        if (fetchError?.name === 'AbortError' || errorName === 'AbortError') {
          toast.error('Request timed out. Please check your connection and try again.');
          setLoading(false);
          return;
        }
        
        // Log error separately to avoid serialization issues
        console.error('=== Fetch Error ===');
        console.error('API URL:', apiUrl);
        console.error('Error Name:', errorName);
        console.error('Error Message:', errorMessage);
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
          fetchError?.name === 'TypeError';
        
        if (isNetworkError) {
          toast.error(`Cannot connect to server at ${apiUrl}. Please ensure: 1) Laravel server is running (php artisan serve), 2) Server is accessible at http://localhost:8000, 3) No firewall is blocking the connection.`);
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
          
          // Dispatch custom event to update header
          window.dispatchEvent(new Event('auth-change'));
        }
        toast.success(data.message || "Registration successful!");
        router.push('/');
        router.refresh();
      } else {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          toast.error((errorMessages[0] as string) || "Registration failed");
        } else {
          toast.error(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`nc-PageSignUp `} data-nc-id="PageSignUp">
      <div className="container mb-24 lg:mb-32">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Signup
        </h2>
        <div className="max-w-md mx-auto space-y-6 ">
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Full Name <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                placeholder="John Doe"
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                Email address <span className="text-red-500">*</span>
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
              <span className="text-neutral-800 dark:text-neutral-200">
                Phone Number
              </span>
              <Input
                type="tel"
                placeholder="+1234567890"
                className="mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Password <span className="text-red-500">*</span>
              </span>
              <Input 
                type="password" 
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="block">
              <span className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                Confirm Password <span className="text-red-500">*</span>
              </span>
              <Input 
                type="password" 
                className="mt-1"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <ButtonPrimary type="submit" loading={loading}>
              {loading ? "Creating account..." : "Continue"}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            Already have an account? {` `}
            <Link className="text-green-600" href="/login">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageSignUp;
