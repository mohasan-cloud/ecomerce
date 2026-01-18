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
  original_price: number;
  discount_amount: number;
  discount_percentage: number;
  subtotal: number;
  selected_attributes?: Record<string, any>;
  selected_attributes_display?: Record<number, {
    name: string;
    values: string[];
  }>;
}

interface CartSetting {
  id: number;
  name: string;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  subtotal: number;
  cart_settings_total: number;
  cart_settings: CartSetting[];
  coupon_code: string | null;
  coupon_discount: number;
  total: number;
  notes: string | null;
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
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;
  const currencySymbol = currency ? getCurrencySymbol(currency) : '$';

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

  const isValidColorCode = (color: string): boolean => {
    // Check if it's a valid hex color code
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const renderProductItem = (item: OrderItem, index: number, orderStatus: string) => {
    return (
      <div key={item.id || index} className="relative flex py-8 sm:py-10 first:pt-0 last:pb-0 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
        {/* Product Thumbnail */}
        <div className="relative h-36 w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {item.product_image ? (
            <Image
              fill
              sizes="300px"
              src={item.product_image}
              alt={item.product_name || 'Product'}
              className="h-full w-full object-contain object-center"
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

        {/* Product Details */}
        <div className="ml-3 sm:ml-6 flex flex-1 flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              {/* Left Side - Product Info */}
              <div className="flex-1 pr-4">
                {/* Product Name */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {item.product_slug ? (
                    <Link href={`/product-detail/${item.product_slug}`} className="hover:text-primary-6000 dark:hover:text-primary-400">
                      {item.product_name || 'Product'}
                    </Link>
                  ) : (
                    item.product_name || 'Product'
                  )}
                </h3>
                
                {/* Attributes */}
                {item.selected_attributes_display && Object.keys(item.selected_attributes_display).length > 0 && (
                  <div className="mt-1.5 sm:mt-2.5 space-y-1">
                    {Object.entries(item.selected_attributes_display).map(([attrId, attrDisplay]) => {
                      if (!attrDisplay || !attrDisplay.values || attrDisplay.values.length === 0) return null;
                      
                      const displayValue = attrDisplay.values[0];
                      const displayValueStr = String(displayValue);
                      const isColorCode = isValidColorCode(displayValueStr);
                      
                      return (
                        <div key={attrId} className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{attrDisplay.name}:</span>
                            {isColorCode ? (
                              <>
                                <div 
                                  className="w-4 h-4 rounded-full border border-slate-300 inline-block flex-shrink-0"
                                  style={{ backgroundColor: displayValueStr }}
                                />
                                <span className="font-medium">{displayValue}</span>
                              </>
                            ) : (
                              <span className="font-medium">{displayValue}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {/* Product Price with Discount */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>Product Price:</span>
                      <div className="flex items-center gap-2">
                        {item.discount_percentage > 0 && item.original_price > item.price && (
                          <span className="text-slate-400 dark:text-slate-500 line-through">
                            {currencySymbol}{item.original_price.toFixed(2)}
                          </span>
                        )}
                        <span className={item.discount_percentage > 0 ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                          {currencySymbol}{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {item.discount_percentage > 0 && (
                      <div className="flex justify-between pl-2">
                        <span className="bg-blue-50 dark:bg-blue-900/20 px-1 rounded text-xs">
                          Discount ({item.discount_percentage.toFixed(0)}%): -{currencySymbol}{item.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total ({item.quantity} × {currencySymbol}{item.price.toFixed(2)}):</span>
                    <span>{currencySymbol}{item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Price Display */}
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold mb-1">
                  {currencySymbol}{item.subtotal.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Qty: {item.quantity}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Price Display */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 sm:hidden">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Qty: {item.quantity}
            </div>
            <div className="flex items-center gap-3">
              {item.product_slug && orderStatus === 'delivered' && (
                <Link
                  href={`/product-detail/${item.product_slug}?review=true`}
                  className="text-sm font-medium text-indigo-600 dark:text-primary-500 hover:underline"
                >
                  Leave review
                </Link>
              )}
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {currencySymbol}{item.subtotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Desktop Leave Review */}
          {item.product_slug && orderStatus === 'delivered' && (
            <div className="hidden sm:flex mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Link
                href={`/product-detail/${item.product_slug}?review=true`}
                className="text-sm font-medium text-indigo-600 dark:text-primary-500 hover:underline"
              >
                Leave review
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOrder = (order: Order) => {
    const isExpanded = expandedOrderId === order.id;

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
              {currencySymbol}{order.total.toFixed(2)}
            </p>
            <ButtonSecondary
              sizeClass="py-2.5 px-4 sm:px-6"
              fontSize="text-sm font-medium"
              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
            >
              {isExpanded ? 'Hide Details' : 'View Order'}
            </ButtonSecondary>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => renderProductItem(item, index, order.status))
          ) : (
            <div className="py-4 text-center text-slate-500 dark:text-slate-400">
              No items found
            </div>
          )}
        </div>

        {/* Expanded Order Details */}
        {isExpanded && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-8 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold mb-6">Order Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Shipping Address */}
              {order.shipping_address && (
                <div>
                  <h4 className="text-base font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                    {order.shipping_address.address}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                    {order.shipping_address.country}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="text-base font-medium mb-2">Contact Information</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {order.contact_name}<br />
                  {order.contact_email}<br />
                  {order.contact_phone}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            {order.payment_method && (
              <div className="mb-6">
                <h4 className="text-base font-medium mb-2">Payment Method</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {order.payment_method.display_name || order.payment_method.name}
                </p>
              </div>
            )}

            {/* Cart Settings */}
            {order.cart_settings && order.cart_settings.length > 0 && (
              <div className="mb-6">
                <h4 className="text-base font-medium mb-3">Additional Services</h4>
                <div className="space-y-2">
                  {order.cart_settings.map((setting) => (
                    <div key={setting.id} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-slate-700 rounded-lg">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{setting.name}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {currencySymbol}{setting.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-base font-medium mb-4">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                  <span>{currencySymbol}{order.subtotal.toFixed(2)}</span>
                </div>
                {order.cart_settings_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Shipping & Others:</span>
                    <span>{currencySymbol}{order.cart_settings_total.toFixed(2)}</span>
                  </div>
                )}
                {order.coupon_discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Discount ({order.coupon_code}):
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      -{currencySymbol}{order.coupon_discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total:</span>
                  <span>{currencySymbol}{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-6">
                <h4 className="text-base font-medium mb-2">Notes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSkeletonOrder = () => {
    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden animate-pulse">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-500/5">
          <div className="flex-1">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
          </div>
          <div className="mt-3 sm:mt-0 flex flex-col items-end gap-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 p-2 sm:p-8 divide-y divide-y-slate-200 dark:divide-slate-700">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex py-4 sm:py-7">
              <div className="h-24 w-16 sm:w-20 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
                <div className="flex flex-1 items-end justify-between mt-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-10 sm:space-y-12">
        <h2 className="text-2xl sm:text-3xl font-semibold">Order History</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((index) => (
            <div key={index}>
              {renderSkeletonOrder()}
            </div>
          ))}
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
