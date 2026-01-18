"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { getDeviceId } from "@/utils/deviceInfo";

interface Device {
  id: number;
  device_id: string;
  device_name: string;
  device_type: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  ip_address: string;
  has_fcm_token: boolean;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

const AccountDevicesPage = () => {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    // Get current device ID
    const deviceId = getDeviceId();
    if (isMountedRef.current) {
      setCurrentDeviceId(deviceId);
    }
    
    fetchDevices();
    
    // Cleanup function using useRef
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchDevices = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      toast.error('Please login to view your devices');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/user-devices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.devices && isMountedRef.current) {
          setDevices(data.data.devices);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    // Find the device to check if it's the current device
    const device = devices.find(d => d.id === deviceId);
    
    if (device && device.device_id === currentDeviceId) {
      toast.error('You cannot delete your current device');
      return;
    }
    
    if (!confirm('Are you sure you want to remove this device? This will also invalidate the session on that device.')) {
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login');
      return;
    }

    if (isMountedRef.current) {
      setDeleting(deviceId);
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/user-devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (isMountedRef.current) {
          toast.success('Device removed successfully. Session has been invalidated on that device.');
          fetchDevices();
        }
      } else {
        if (isMountedRef.current) {
          toast.error(data.message || 'Failed to remove device');
        }
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      if (isMountedRef.current) {
        toast.error('An error occurred while removing device');
      }
    } finally {
      if (isMountedRef.current) {
        setDeleting(null);
      }
    }
  };
  
  // Check if device is current device
  const isCurrentDevice = (device: Device) => {
    return device.device_id === currentDeviceId;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      case 'desktop':
      default:
        return '💻';
    }
  };

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return '🌐';
      case 'firefox':
        return '🦊';
      case 'safari':
        return '🧭';
      case 'edge':
        return '🔷';
      case 'opera':
        return '🎭';
      default:
        return '🌐';
    }
  };

  if (loading) {
    return (
      <div className="nc-AccountDevicesPage">
        <div className="space-y-10 sm:space-y-12">
          <h2 className="text-2xl sm:text-3xl font-semibold">My Devices</h2>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-AccountDevicesPage">
      <div className="space-y-10 sm:space-y-12">
        {/* HEADING */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">My Devices</h2>
          <ButtonPrimary onClick={fetchDevices} sizeClass="px-4 py-2">
            Refresh
          </ButtonPrimary>
        </div>

        {/* DEVICES LIST */}
        {devices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">
              No devices found. Devices will appear here when you login from different devices.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {device.device_name || 'Unknown Device'}
                        </h3>
                        {isCurrentDevice(device) && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            Current Device
                          </span>
                        )}
                        {device.is_active && !isCurrentDevice(device) && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            Active
                          </span>
                        )}
                        {device.has_fcm_token && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            Notifications Enabled
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                          <span>{getBrowserIcon(device.browser)}</span>
                          <span>
                            {device.browser} {device.browser_version && `(${device.browser_version})`}
                          </span>
                        </div>
                        <div>
                          {device.os} {device.os_version && `(${device.os_version})`}
                        </div>
                        <div>
                          IP: {device.ip_address}
                        </div>
                        {device.last_used_at && (
                          <div>
                            Last used: {new Date(device.last_used_at).toLocaleString()}
                          </div>
                        )}
                        <div className="text-xs text-neutral-500 dark:text-neutral-500">
                          Device ID: {device.device_id.substring(0, 20)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  {isCurrentDevice(device) ? (
                    <button
                      disabled
                      className="ml-4 px-4 py-2 text-sm text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-lg cursor-not-allowed"
                      title="You cannot delete your current device"
                    >
                      Current Device
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      disabled={deleting === device.id}
                      className="ml-4 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === device.id ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDevicesPage;

