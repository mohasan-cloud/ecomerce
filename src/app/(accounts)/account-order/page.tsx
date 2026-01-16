"use client";

import Prices from "@/components/Prices";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteData } from "@/hooks/useSiteData";
import { getCurrencySymbol } from "@/utils/currency";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string | null;
  product_slug: string | null;
  product_image: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  selected_attributes?: Record<string, any>;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  subtotal: number;
  cart_settings_total: number;
  coupon_code: string | null;
  coupon_discount: number;
  total: number;
  payment_method: {
    id: number;
    name: string;
    display_name: string;
  } | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string | null;
    country: string;
    postal_code: string;
  } | null;
  items: OrderItem[];
}

const AccountOrder = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } else if (response.status === 401) {
        // User not authenticated
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'confirmed':
      case 'processing':
        return 'text-blue-600 dark:text-blue-400';
      case 'shipped':
        return 'text-purple-600 dark:text-purple-400';
      case 'delivered':
        return 'text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  const renderProductItem = (item: OrderItem, index: number) => {
    const attributes = item.selected_attributes || {};
    const attributeTexts: string[] = [];
    
    // Extract attribute values for display
    Object.values(attributes).forEach((values: any) => {
      if (Array.isArray(values) && values.length > 0) {
        attributeTexts.push(String(values[0]));
      }
    });

    return (
      <div key={item.id || index} className="flex py-4 sm:py-7 last:pb-0 first:pt-0">
        <div className="relative h-24 w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {item.product_image ? (
            <Image
              fill
              sizes="100px"
              src={item.product_image}
              alt={item.product_name || 'Product'}
              className="h-full w-full object-cover object-center"
              unoptimized={item.product_image.includes('localhost') || item.product_image.includes('127.0.0.1')}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}
          {item.product_slug && (
            <Link href={`/product-detail/${item.product_slug}`} className="absolute inset-0"></Link>
          )}
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="text-base font-medium line-clamp-1">
                  {item.product_slug ? (
                    <Link href={`/product-detail/${item.product_slug}`}>
                      {item.product_name || 'Product'}
                    </Link>
                  ) : (
                    item.product_name || 'Product'
                  )}
                </h3>
                {attributeTexts.length > 0 && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {attributeTexts.map((attr, idx) => (
                      <span key={idx}>
                        {attr}
                        {idx < attributeTexts.length - 1 && (
                          <span className="mx-2 border-l border-slate-200 dark:border-slate-700 h-4"></span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <Prices 
                className="mt-0.5 ml-2" 
                price={item.price}
                currency={currency}
              />
            </div>
          </div>
          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-gray-500 dark:text-slate-400 flex items-center">
              <span className="hidden sm:inline-block">Qty</span>
              <span className="inline-block sm:hidden">x</span>
              <span className="ml-2">{item.quantity}</span>
            </p>

            <div className="flex">
              {item.product_slug && (
                <Link
                  href={`/product-detail/${item.product_slug}`}
                  className="font-medium text-indigo-600 dark:text-primary-500 hover:underline"
                >
                  Leave review
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrder = (order: Order) => {
    return (
      <div key={order.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden z-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-500/5">
          <div>
            <p className="text-lg font-semibold">#{order.order_number}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 sm:mt-2">
              <span>{formatDate(order.created_at)}</span>
              <span className="mx-2">·</span>
              <span className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </p>
            {order.payment_method && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Payment: {order.payment_method.display_name}
              </p>
            )}
          </div>
          <div className="mt-3 sm:mt-0 flex flex-col items-end gap-2">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {getCurrencySymbol(currency)}{order.total.toFixed(2)}
            </p>
            <ButtonSecondary
              sizeClass="py-2.5 px-4 sm:px-6"
              fontSize="text-sm font-medium"
            >
              View Order
            </ButtonSecondary>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8 divide-y divide-y-slate-200 dark:divide-slate-700">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => renderProductItem(item, index))
          ) : (
            <div className="py-4 text-center text-slate-500 dark:text-slate-400">
              No items found
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-10 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Loading orders...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-10 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-lg mb-2">No orders found</p>
          <p className="text-sm">You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* HEADING */}
      <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
      {orders.map(renderOrder)}
    </div>
  );
};

export default AccountOrder;
