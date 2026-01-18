"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
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
  selected_attributes: Record<string, any>;
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
    state: string;
    country: string;
    postal_code: string;
  } | null;
  items: OrderItem[];
}

const OrderSuccessPageInner = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { siteData } = useSiteData();
  const currency = siteData?.settings?.system?.currency || null;
  const currencySymbol = currency ? getCurrencySymbol(currency) : '$';
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    // Only allow order_id from URL, not from localStorage
    const orderId = searchParams.get('order_id');
    
    if (orderId && !isNaN(parseInt(orderId))) {
      fetchOrderDetails(parseInt(orderId));
    } else {
      // No valid order_id in URL, redirect to home or show error
      if (isMountedRef.current) {
        setLoading(false);
        toast.error('Invalid order. Please place an order first.');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    }
    
    // Cleanup function using useRef
    return () => {
      isMountedRef.current = false;
    };
  }, [searchParams, router]);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        if (isMountedRef.current) {
          setLoading(false);
        }
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && isMountedRef.current) {
          setOrder(data.data);
        } else {
          // Order not found or invalid
          if (isMountedRef.current) {
            toast.error('Order not found. Please place an order first.');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        }
      } else if (response.status === 401) {
        if (isMountedRef.current) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again');
          router.push('/login');
        }
      } else if (response.status === 404) {
        // Order not found
        if (isMountedRef.current) {
          toast.error('Order not found. Please place an order first.');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (isMountedRef.current) {
        toast.error('Failed to load order details');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const renderProductItem = (item: OrderItem, orderStatus: string) => {
    // Use selected_attributes_display if available, otherwise fallback to selected_attributes
    const attributeTexts: string[] = [];
    
    if (item.selected_attributes_display && Object.keys(item.selected_attributes_display).length > 0) {
      // Use display names from API
      Object.values(item.selected_attributes_display).forEach((attrDisplay) => {
        if (attrDisplay.values && attrDisplay.values.length > 0) {
          const displayText = `${attrDisplay.name}: ${attrDisplay.values.join(', ')}`;
          attributeTexts.push(displayText);
        }
      });
    } else {
      // Fallback: try to extract from selected_attributes (legacy format)
      const attributes = item.selected_attributes || {};
      Object.values(attributes).forEach((values: any) => {
        if (Array.isArray(values) && values.length > 0) {
          attributeTexts.push(String(values[0]));
        }
      });
    }


    return (
      <div key={item.id} className="relative flex py-8 sm:py-10 first:pt-0 last:pb-0 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 mb-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3">
          Order placed successfully
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
          Thank you for your purchase. Your order has been received and is now
          pending confirmation. You will receive an update once it has been
          processed.
        </p>
        
        {order && (
          <div className="mb-6 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-medium">Order Number:</span> #{order.order_number}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">Status:</span>{' '}
              <span className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Continue shopping
          </Link>
          
          {order && (
            <>
              <ButtonPrimary
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="rounded-full"
              >
                {showOrderDetails ? 'Hide Order Details' : 'View Order'}
              </ButtonPrimary>
            </>
          )}
          
          <Link
            href="/account-order"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            View my orders
          </Link>
        </div>

        {showOrderDetails && order && (
          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8 text-left">
            <h2 className="text-xl font-semibold mb-6">Order Details</h2>
            
            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Items</h3>
              <div className="space-y-0">
                {order.items.map((item) => renderProductItem(item, order.status))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                  {order.shipping_address.country}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {order.contact_name}<br />
                {order.contact_email}<br />
                {order.contact_phone}
              </p>
            </div>

            {/* Payment Method */}
            {order.payment_method && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {order.payment_method.display_name || order.payment_method.name}
                </p>
              </div>
            )}

            {/* Cart Settings */}
            {order.cart_settings && order.cart_settings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Additional Services</h3>
                <div className="space-y-2">
                  {order.cart_settings.map((setting) => (
                    <div key={setting.id} className="flex justify-between items-center py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
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
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
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

            {order.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderSuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessPageInner />
    </Suspense>
  );
};

export default OrderSuccessPage;
