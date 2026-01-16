"use client";

import React, { useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AccountBilling = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    company_name: "",
    tax_id: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Please login to access billing information');
        router.push('/login');
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

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            const userData = data.data.user;
            setFormData({
              address: userData.address || "",
              city: userData.city || "",
              state: userData.state || "",
              country: userData.country || "",
              postal_code: userData.postal_code || "",
              company_name: userData.company_name || "",
              tax_id: userData.tax_id || "",
            });
          }
        } else if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again');
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to update billing information');
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
        toast.success(data.message || 'Billing information updated successfully');
        // Update localStorage with new data
        if (data.data?.user) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            const updatedUser = { ...user, ...data.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          // Dispatch event to update header
          window.dispatchEvent(new Event('auth-change'));
        }
      } else {
        toast.error(data.message || 'Failed to update billing information');
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          toast.error(errorMessages[0] as string);
        }
      }
    } catch (error) {
      console.error('Error updating billing information:', error);
      toast.error('An error occurred while updating your billing information');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 sm:space-y-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* HEADING */}
      <h2 className="text-2xl sm:text-3xl font-semibold">Billing Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl space-y-6">
          {/* Billing Address */}
          <div>
            <Label>Billing Address</Label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1.5"
              placeholder="Enter your billing address"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>City</Label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1.5"
                placeholder="City"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1.5"
                placeholder="State"
              />
            </div>
          </div>

          {/* Country and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Country</Label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="mt-1.5"
                placeholder="Country"
              />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="mt-1.5"
                placeholder="Postal Code"
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4">Company Information (Optional)</h3>
            <div className="space-y-6">
              <div>
                <Label>Company Name</Label>
                <Input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label>Tax ID / VAT Number</Label>
                <Input
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  placeholder="Tax ID or VAT Number"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ButtonPrimary type="submit" loading={updating}>
              {updating ? 'Updating...' : 'Update Billing Information'}
            </ButtonPrimary>
          </div>
        </div>
      </form>

      {/* Information Section */}
      <div className="max-w-2xl prose prose-slate dark:prose-invert mt-10">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {`When you receive a payment for an order, we call that payment to you a
          "payout." Our secure payment system supports several payout methods,
          which can be set up below.`}
          <br />
          <br />
          To get paid, you need to set up a payout method. Payouts are typically
          released about 24 hours after a guest's scheduled time. The time it takes for the
          funds to appear in your account depends on your payout method.{` `}
          <a href="#" className="text-primary-6000 hover:text-primary-500">Learn more</a>
        </span>
      </div>
    </div>
  );
};

export default AccountBilling;
