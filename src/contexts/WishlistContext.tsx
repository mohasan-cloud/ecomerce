"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
    price: number;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  processing: boolean;
  toggleWishlist: (productId: number) => Promise<{ success: boolean; inWishlist: boolean; message: string }>;
  isInWishlist: (productId: number) => boolean;
  refetch: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const sessionId = getSessionId();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/wishlist`, {
        headers,
      });
      
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: number) => {
    try {
      setProcessing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const sessionId = getSessionId();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/wishlist/toggle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchWishlist(); // Refresh the list
        return { success: true, inWishlist: data.inWishlist, message: data.message };
      }
      return { success: false, inWishlist: false, message: 'Failed to update wishlist' };
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { success: false, inWishlist: false, message: 'An error occurred' };
    } finally {
      setProcessing(false);
    }
  };

  const isInWishlist = (productId: number) => {
    return items.some(item => item.product.id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Listen for auth changes to refresh wishlist after login
  useEffect(() => {
    const handleAuthChange = () => {
      // Refresh wishlist when user logs in/out
      fetchWishlist();
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <WishlistContext.Provider value={{ items, loading, processing, toggleWishlist, isInWishlist, refetch: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

