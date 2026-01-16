"use client";

import Label from "@/components/Label/Label";
import React, { useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AccountPass = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to change your password');
      router.push('/login');
    }
  }, [router]);

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
    if (!formData.current_password || !formData.password || !formData.password_confirmation) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to change your password');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Password updated successfully');
        // Clear form
        setFormData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        toast.error(data.message || 'Failed to update password');
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          toast.error(errorMessages[0] as string);
        }
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('An error occurred while updating your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* HEADING */}
      <h2 className="text-2xl sm:text-3xl font-semibold">
        Update your password
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="max-w-xl space-y-6">
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              name="current_password"
              value={formData.current_password}
              onChange={handleInputChange}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1.5"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Password must be at least 8 characters long
            </p>
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleInputChange}
              className="mt-1.5"
              required
              minLength={8}
            />
          </div>
          <div className="pt-2">
            <ButtonPrimary type="submit" loading={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </ButtonPrimary>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccountPass;
