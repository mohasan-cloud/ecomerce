"use client";

import Label from "@/components/Label/Label";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import Radio from "@/shared/Radio/Radio";
import Select from "@/shared/Select/Select";
import toast from "react-hot-toast";

interface ShippingAddressData {
  id?: number;
  first_name: string;
  last_name: string;
  address: string;
  apt_suite?: string;
  city: string;
  state?: string;
  country: string;
  postal_code: string;
  address_type: 'home' | 'office';
  is_default?: boolean;
}

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
}

const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

const ShippingAddress: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
}) => {
  const [addresses, setAddresses] = useState<ShippingAddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<ShippingAddressData>({
    first_name: '',
    last_name: '',
    address: '',
    apt_suite: '',
    city: '',
    state: '',
    country: 'United States',
    postal_code: '',
    address_type: 'home',
    is_default: false,
  });

  // Fetch addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const sessionId = getSessionId();
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Always send session_id, even for logged-in users (for addresses saved before login)
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }

      const response = await fetch(`${apiUrl}/api/shipping-addresses`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAddresses(data.data || []);
          // Select default address if available
          const defaultAddress = data.data?.find((addr: ShippingAddressData) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.data?.length > 0) {
            setSelectedAddressId(data.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.address || 
        !formData.city || !formData.country || !formData.postal_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const sessionId = getSessionId();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Always send session_id, even for logged-in users
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }

      const url = selectedAddressId && !showNewForm
        ? `${apiUrl}/api/shipping-addresses/${selectedAddressId}`
        : `${apiUrl}/api/shipping-addresses`;
      
      const method = selectedAddressId && !showNewForm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Shipping address saved successfully!");
        await fetchAddresses();
        setShowNewForm(false);
        setFormData({
          first_name: '',
          last_name: '',
          address: '',
          apt_suite: '',
          city: '',
          state: '',
          country: 'United States',
          postal_code: '',
          address_type: 'home',
          is_default: false,
        });
        onCloseActive();
      } else {
        toast.error(data.message || "Failed to save address");
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error("An error occurred while saving the address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const sessionId = getSessionId();
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Always send session_id, even for logged-in users
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }

      const response = await fetch(`${apiUrl}/api/shipping-addresses/${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Address deleted successfully!");
        await fetchAddresses();
        if (selectedAddressId === id) {
          setSelectedAddressId(null);
        }
      } else {
        toast.error(data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error("An error occurred while deleting the address");
    }
  };

  const handleSelectAddress = (id: number) => {
    setSelectedAddressId(id);
    const address = addresses.find(addr => addr.id === id);
    if (address) {
      setFormData({
        first_name: address.first_name,
        last_name: address.last_name,
        address: address.address,
        apt_suite: address.apt_suite || '',
        city: address.city,
        state: address.state || '',
        country: address.country,
        postal_code: address.postal_code,
        address_type: address.address_type,
        is_default: address.is_default || false,
      });
      setShowNewForm(false);
    }
  };

  const handleNewAddress = () => {
    setShowNewForm(true);
    setSelectedAddressId(null);
    setFormData({
      first_name: '',
      last_name: '',
      address: '',
      apt_suite: '',
      city: '',
      state: '',
      country: 'United States',
      postal_code: '',
      address_type: 'home',
      is_default: false,
    });
  };

  const getDisplayAddress = (address: ShippingAddressData) => {
    const parts = [
      address.address,
      address.apt_suite,
      address.city,
      address.state,
      address.country,
      address.postal_code,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const renderShippingAddress = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="p-6 flex flex-col sm:flex-row items-start">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1401 15.0701V13.11C12.1401 10.59 14.1801 8.54004 16.7101 8.54004H18.6701"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.62012 8.55005H7.58014C10.1001 8.55005 12.1501 10.59 12.1501 13.12V13.7701V17.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.14008 6.75L5.34009 8.55L7.14008 10.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.8601 6.75L18.6601 8.55L16.8601 10.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <div className="sm:ml-8 flex-1">
            <h3 className="text-slate-700 dark:text-slate-300 flex">
              <span className="uppercase">SHIPPING ADDRESS</span>
              {isActive && (
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5 ml-3 text-slate-900 dark:text-slate-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </h3>
            {loading ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Loading...</div>
            ) : selectedAddress ? (
              <div className="font-semibold mt-1 text-sm">
                <span>{getDisplayAddress(selectedAddress)}</span>
                {selectedAddress.is_default && (
                  <span className="ml-2 text-xs text-primary-6000">(Default)</span>
                )}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                No address saved. Add an address below.
              </div>
            ) : null}
          </div>
          <button
            className="py-2 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 mt-5 sm:mt-0 sm:ml-auto text-sm font-medium rounded-lg"
            onClick={onOpenActive}
          >
            {isActive ? "Hide" : selectedAddress ? "Change" : "Add"}
          </button>
        </div>
        
        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-4 sm:space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >
          {/* Saved Addresses List */}
          {!loading && addresses.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-base font-semibold">Saved Addresses</h4>
              <div className="space-y-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-primary-6000 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    onClick={() => handleSelectAddress(address.id!)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="selected-address"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleSelectAddress(address.id!)}
                            className="w-4 h-4 text-primary-6000 focus:ring-primary-6000 border-slate-300 dark:border-slate-600"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {address.first_name} {address.last_name}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {getDisplayAddress(address)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 dark:text-slate-500">
                                {address.address_type === 'home' ? 'Home' : 'Office'}
                              </span>
                              {address.is_default && (
                                <span className="text-xs text-primary-6000 font-medium">Default</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address.id!);
                        }}
                        className="ml-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleNewAddress}
                className="text-sm text-primary-6000 hover:text-primary-700 font-medium"
              >
                + Add New Address
              </button>
            </div>
          )}

          {/* Address Form */}
          {(showNewForm || addresses.length === 0 || (selectedAddressId && !showNewForm)) && (
            <div className="space-y-4 sm:space-y-6">
              {!showNewForm && addresses.length > 0 && (
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-semibold">
                    {selectedAddressId ? 'Edit Address' : 'Add New Address'}
                  </h4>
                  {selectedAddressId && (
                    <button
                      onClick={handleNewAddress}
                      className="text-sm text-primary-6000 hover:text-primary-700 font-medium"
                    >
                      + Add New
                    </button>
                  )}
                </div>
              )}

              {/* ============ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                <div>
                  <Label className="text-sm">First name <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-1.5"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Last name <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-1.5"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ============ */}
              <div className="sm:flex space-y-4 sm:space-y-0 sm:space-x-3">
                <div className="flex-1">
                  <Label className="text-sm">Address <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    type="text"
                    required
                  />
                </div>
                <div className="sm:w-1/3">
                  <Label className="text-sm">Apt, Suite</Label>
                  <Input
                    className="mt-1.5"
                    value={formData.apt_suite}
                    onChange={(e) => setFormData({ ...formData, apt_suite: e.target.value })}
                  />
                </div>
              </div>

              {/* ============ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                <div>
                  <Label className="text-sm">City <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-1.5"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Country <span className="text-red-500">*</span></Label>
                  <Select
                    className="mt-1.5"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Pakistan">Pakistan</option>
                  </Select>
                </div>
              </div>

              {/* ============ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                <div>
                  <Label className="text-sm">State/Province</Label>
                  <Input
                    className="mt-1.5"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Postal code <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-1.5"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* ============ */}
              <div>
                <Label className="text-sm">Address type</Label>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Radio
                    label={`<span class="text-sm font-medium">Home <span class="font-light">(All Day Delivery)</span></span>`}
                    id="Address-type-home"
                    name="Address-type"
                    defaultChecked={formData.address_type === 'home'}
                    onChange={(value) => {
                      if (value === 'Address-type-home') {
                        setFormData({ ...formData, address_type: 'home' });
                      }
                    }}
                  />
                  <Radio
                    label={`<span class="text-sm font-medium">Office <span class="font-light">(Delivery <span class="font-medium">9 AM - 5 PM</span>)</span> </span>`}
                    id="Address-type-office"
                    name="Address-type"
                    defaultChecked={formData.address_type === 'office'}
                    onChange={(value) => {
                      if (value === 'Address-type-office') {
                        setFormData({ ...formData, address_type: 'office' });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Set as default checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default || false}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-primary-6000 focus:ring-primary-6000 border-slate-300 dark:border-slate-600 rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Set as default address
                  </span>
                </label>
              </div>

              {/* ============ */}
              <div className="flex flex-col sm:flex-row pt-6">
                <ButtonPrimary
                  className="sm:!px-7 shadow-none"
                  onClick={handleSave}
                  loading={saving}
                >
                  {saving ? "Saving..." : "Save and next to Payment"}
                </ButtonPrimary>
                <ButtonSecondary
                  className="mt-3 sm:mt-0 sm:ml-3"
                  onClick={() => {
                    setShowNewForm(false);
                    setSelectedAddressId(null);
                    onCloseActive();
                  }}
                >
                  Cancel
                </ButtonSecondary>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return renderShippingAddress();
};

export default ShippingAddress;
