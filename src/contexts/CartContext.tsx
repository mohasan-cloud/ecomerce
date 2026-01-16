"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
    price: number;
    stockQuantity?: number | null;
    inStock?: boolean;
    attributes?: Array<{
      id: number;
      name: string;
      input_type: string;
      is_required: boolean;
      show_in_checkout?: boolean;
      values: Array<{
        id: number;
        value: string;
        backend_value?: string | null;
        price?: number | null;
      }>;
    }>;
  };
  quantity: number;
  selectedAttributes?: Record<number, number[] | string[]>; // Selected attribute values: { attributeId: [valueId1, valueId2] } - can be number[] (IDs) or string[] (legacy)
  color?: { id: number; name: string; code: string } | null;
  size?: { id: number; name: string } | null;
  price: number; // Base product price without attributes
  priceWithAttributes?: number; // Price including attribute prices
  finalPrice: number; // Final price after discount
  discountPercentage: number;
  discountAmount: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  processing: boolean;
  total: number;
  addToCart: (productId: number, quantity?: number, attributes?: Record<number, (number | string)[]>) => Promise<{ success: boolean; message: string }>;
  updateQuantity: (cartId: number, quantity: number) => Promise<{ success: boolean }>;
  removeFromCart: (cartId: number) => Promise<{ success: boolean }>;
  refetch: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
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
      }
      
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/cart`, {
        headers,
      });
      
      if (!response.ok) {
        console.error('Failed to fetch cart:', response.status, response.statusText);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1, attributes?: Record<number, (number | string)[]>) => {
    try {
      setProcessing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const sessionId = getSessionId();
      
      // Normalize attributes - ensure keys are strings for JSON, values can be number[] or string[]
      const normalizedAttributes: Record<string, (number | string)[]> = {};
      if (attributes) {
        Object.keys(attributes).forEach(key => {
          normalizedAttributes[String(key)] = attributes[Number(key)];
        });
      }
      
      const requestBody = {
        product_id: productId,
        quantity,
        attributes: normalizedAttributes,
      };
      
      console.log('Adding to cart:', requestBody);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        console.error('Failed to add to cart:', response.status, response.statusText);
        return { success: false, message: 'Failed to add to cart' };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return { success: false, message: 'Invalid response from server' };
      }
      
      const data = await response.json();
      if (data.success) {
        await fetchCart();
        return { success: true, message: data.message || 'Added to cart' };
      }
      return { success: false, message: data.message || 'Failed to add to cart' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'An error occurred' };
    } finally {
      setProcessing(false);
    }
  };

  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const sessionId = getSessionId();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/cart/${cartId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        console.error('Failed to update cart:', response.status, response.statusText);
        return { success: false };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return { success: false };
      }
      
      const data = await response.json();
      if (data.success) {
        await fetchCart();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false };
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const sessionId = getSessionId();
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
      
      const response = await fetch(`${apiUrl}/api/cart/${cartId}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        console.error('Failed to remove from cart:', response.status, response.statusText);
        return { success: false };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        return { success: false };
      }
      
      const data = await response.json();
      if (data.success) {
        await fetchCart();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false };
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ items, loading, processing, total, addToCart, updateQuantity, removeFromCart, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

