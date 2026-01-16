"use client";

import Label from "@/components/Label/Label";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import Radio from "@/shared/Radio/Radio";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PaymentMethod {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  status: 'enabled' | 'disabled';
  configuration?: {
    publishable_key?: string;
    secret_key?: string;
    merchant_id?: string;
    account_number?: string;
    password?: string;
  };
  icon?: string;
  order: number;
}

interface PaymentMethodProps {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  onOrderConfirm?: () => void;
  selectedCartSettings?: Record<number, number>;
  onPaymentMethodChange?: (method: PaymentMethod | null, formData: {
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCVC?: string;
    phoneNumber?: string;
  }) => void;
}

const PaymentMethod: FC<PaymentMethodProps> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  onOrderConfirm,
  selectedCartSettings = {},
  onPaymentMethodChange,
}) => {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  
  // Form fields for different payment methods
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/payment-settings`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setPaymentMethods(data.data);
          // Set first method as default
          const firstMethod = data.data[0];
          setSelectedMethod(firstMethod);
          // Notify parent component
          if (onPaymentMethodChange) {
            onPaymentMethodChange(firstMethod, {});
          }
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // Reset form fields when changing method
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCVC("");
    setPhoneNumber("");
    // Notify parent component
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method, {});
    }
  };

  // Helper to notify parent about payment method + form data
  const emitPaymentChange = (overrides: Partial<{
    cardNumber: string;
    cardName: string;
    cardExpiry: string;
    cardCVC: string;
    phoneNumber: string;
  }> = {}) => {
    if (!selectedMethod || !onPaymentMethodChange) return;
    onPaymentMethodChange(selectedMethod, {
      cardNumber,
      cardName,
      cardExpiry,
      cardCVC,
      phoneNumber,
      ...overrides,
    });
  };

  const renderPaymentMethodOption = (method: PaymentMethod) => {
    const active = selectedMethod?.id === method.id;
    const methodId = `payment-${method.id}`;

    return (
      <div key={method.id} className="flex items-start space-x-4 sm:space-x-6">
        <Radio
          className="pt-3.5"
          name="payment-method"
          id={methodId}
          defaultChecked={active}
          onChange={() => handleMethodChange(method)}
        />
        <div className="flex-1">
          <label
            htmlFor={methodId}
            className="flex items-center space-x-4 sm:space-x-6 cursor-pointer"
          >
            <div
              className={`p-2.5 rounded-xl border-2 ${
                active
                  ? "border-slate-600 dark:border-slate-300"
                  : "border-gray-200 dark:border-slate-600"
              }`}
            >
              {getPaymentIcon(method.name)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{method.display_name}</p>
              {method.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                  {method.description}
                </p>
              )}
            </div>
          </label>

          {/* Payment Method Specific Forms */}
          <div className={`mt-6 mb-4 space-y-3 sm:space-y-5 ${active ? "block" : "hidden"}`}>
            {method.name === 'stripe' && renderStripeForm()}
            {method.name === 'cash_on_delivery' && renderCashOnDelivery()}
            {method.name === 'easypaisa' && renderEasypaisaForm(method)}
            {method.name === 'jazzcash' && renderJazzcashForm(method)}
          </div>
        </div>
      </div>
    );
  };

  const renderStripeForm = () => {
    // Helper to mask card number for preview
    const formatCardNumber = (num: string) => {
      const digits = num.replace(/[^0-9]/g, "").slice(0, 16);
      const groups = digits.match(/.{1,4}/g) || [];
      const formatted = groups.join(" ");
      if (!formatted) return "•••• •••• •••• ••••";
      const pad = "•••• •••• •••• ••••".slice(formatted.length);
      return formatted + pad;
    };

    const previewName = cardName || "CARD HOLDER";
    const previewExpiry = cardExpiry || "MM/YY";

    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
          <div className="space-y-4">
            <div className="max-w-lg">
              <Label className="text-sm">Card number</Label>
              <Input
                autoComplete="off"
                className="mt-1.5"
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setCardNumber(value);
                  emitPaymentChange({ cardNumber: value });
                }}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="max-w-lg">
              <Label className="text-sm">Name on Card</Label>
              <Input
                autoComplete="off"
                className="mt-1.5"
                value={cardName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCardName(value);
                  emitPaymentChange({ cardName: value });
                }}
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="sm:w-2/3">
                <Label className="text-sm">Expiration date (MM/YY)</Label>
                <Input
                  autoComplete="off"
                  className="mt-1.5"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCardExpiry(value);
                    emitPaymentChange({ cardExpiry: value });
                  }}
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm">CVC</Label>
                <Input
                  autoComplete="off"
                  className="mt-1.5"
                  placeholder="CVC"
                  value={cardCVC}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCardCVC(value);
                    emitPaymentChange({ cardCVC: value });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Small card preview */}
          <div className="mt-4 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-50 shadow-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start text-xs uppercase tracking-wider text-slate-300">
                <span>Credit Card</span>
                <span className="text-[10px] bg-slate-800/70 px-2 py-0.5 rounded-full">Secure</span>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-mono tracking-[0.15em] mb-3">
                  {formatCardNumber(cardNumber)}
                </div>
                <div className="flex justify-between items-center text-[11px] sm:text-xs">
                  <div className="flex flex-col">
                    <span className="text-slate-400">Card Holder</span>
                    <span className="font-semibold truncate max-w-[150px]">{previewName}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-slate-400">Expires</span>
                    <span className="font-semibold">{previewExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderCashOnDelivery = () => {
    return (
      <div className="text-sm text-slate-600 dark:text-slate-400">
        <p>You will pay cash when your order is delivered.</p>
        <p className="mt-2">No additional information required.</p>
      </div>
    );
  };

  const renderEasypaisaForm = (method: PaymentMethod) => {
    const config = method.configuration || {};
    return (
      <div className="space-y-4">
        <div className="max-w-lg">
          <Label className="text-sm">Phone Number <span className="text-red-500">*</span></Label>
          <Input
            autoComplete="off"
            className="mt-1.5"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value;
              setPhoneNumber(value);
              emitPaymentChange({ phoneNumber: value });
            }}
            placeholder="03XX-XXXXXXX"
            required
          />
        </div>
        {config.account_number && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Send payment to Easypaisa account:
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {config.account_number}
            </p>
            {config.merchant_id && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Merchant ID: {config.merchant_id}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderJazzcashForm = (method: PaymentMethod) => {
    const config = method.configuration || {};
    return (
      <div className="space-y-4">
        <div className="max-w-lg">
          <Label className="text-sm">Phone Number <span className="text-red-500">*</span></Label>
          <Input
            autoComplete="off"
            className="mt-1.5"
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value;
              setPhoneNumber(value);
              emitPaymentChange({ phoneNumber: value });
            }}
            placeholder="03XX-XXXXXXX"
            required
          />
        </div>
        {config.merchant_id && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Jazzcash Merchant Information:
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Merchant ID: {config.merchant_id}
            </p>
          </div>
        )}
      </div>
    );
  };

  const getPaymentIcon = (methodName: string) => {
    switch (methodName) {
      case 'stripe':
        return (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
            <path d="M2 12.6101H19" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 10.28V17.43C18.97 20.28 18.19 21 15.22 21H5.78003C2.76003 21 2 20.2501 2 17.2701V10.28C2 7.58005 2.63 6.71005 5 6.57005C5.24 6.56005 5.50003 6.55005 5.78003 6.55005H15.22C18.24 6.55005 19 7.30005 19 10.28Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 6.73V13.72C22 16.42 21.37 17.29 19 17.43V10.28C19 7.3 18.24 6.55 15.22 6.55H5.78003C5.50003 6.55 5.24 6.56 5 6.57C5.03 3.72 5.81003 3 8.78003 3H18.22C21.24 3 22 3.75 22 6.73Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.25 17.8101H6.96997" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.10986 17.8101H12.5499" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'cash_on_delivery':
        return (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
            <path d="M18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H6.26C4.19 22 2.5 20.31 2.5 18.24V11.51C2.5 9.44001 4.19 7.75 6.26 7.75H17.74C19.81 7.75 21.5 9.44001 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 12.4101V7.8401C2.5 6.6501 3.23 5.59006 4.34 5.17006L12.28 2.17006C13.52 1.70006 14.85 2.62009 14.85 3.95009V7.75008" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22.5588 13.9702V16.0302C22.5588 16.5802 22.1188 17.0302 21.5588 17.0502H19.5988C18.5188 17.0502 17.5288 16.2602 17.4388 15.1802C17.3788 14.5502 17.6188 13.9602 18.0388 13.5502C18.4088 13.1702 18.9188 12.9502 19.4788 12.9502H21.5588C22.1188 12.9702 22.5588 13.4202 22.5588 13.9702Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'easypaisa':
      case 'jazzcash':
        return (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.99998 3H8.99998C7.04998 8.84 7.04998 15.16 8.99998 21H7.99998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 3C16.95 8.84 16.95 15.16 15 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 9.0001C8.84 7.0501 15.16 7.0501 21 9.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none">
            <path d="M3.60127 10.239L10.2413 3.599C12.3613 1.479 13.4213 1.469 15.5213 3.569L20.4313 8.479C22.5313 10.579 22.5213 11.639 20.4013 13.759L13.7613 20.399C11.6413 22.519 10.5813 22.529 8.48127 20.429L3.57127 15.519C1.47127 13.419 1.47127 12.369 3.60127 10.239Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const renderPaymentMethod = () => {
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
                d="M3.92969 15.8792L15.8797 3.9292"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.1013 18.2791L12.3013 17.0791"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.793 15.5887L16.183 13.1987"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.60127 10.239L10.2413 3.599C12.3613 1.479 13.4213 1.469 15.5213 3.569L20.4313 8.479C22.5313 10.579 22.5213 11.639 20.4013 13.759L13.7613 20.399C11.6413 22.519 10.5813 22.529 8.48127 20.429L3.57127 15.519C1.47127 13.419 1.47127 12.369 3.60127 10.239Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 21.9985H22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8 flex-1">
            <h3 className="text-slate-700 dark:text-slate-400 flex">
              <span className="uppercase tracking-tight">PAYMENT METHOD</span>
              {isActive && (
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  className="w-5 h-5 ml-3 text-slate-900"
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
            ) : selectedMethod ? (
              <div className="mt-1">
                <div className="font-semibold text-sm">
                  <span>{selectedMethod.display_name}</span>
                  {selectedMethod.name === 'easypaisa' || selectedMethod.name === 'jazzcash' ? (
                    <span className="ml-3 text-slate-500">Mobile Payment</span>
                  ) : selectedMethod.name === 'stripe' ? (
                    <span className="ml-3 text-slate-500">Card Payment</span>
                  ) : null}
                </div>
                {selectedMethod.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedMethod.description}
                  </p>
                )}
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                No payment methods available
              </div>
            ) : null}
          </div>
          <button
            className="py-2 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 mt-5 sm:mt-0 sm:ml-auto text-sm font-medium rounded-lg"
            onClick={onOpenActive}
          >
            {isActive ? "Hide" : selectedMethod ? "Change" : "Select"}
          </button>
        </div>

        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Loading payment methods...
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No payment methods available. Please contact support.
            </div>
          ) : (
            <>
              {paymentMethods.map(renderPaymentMethodOption)}
              {/* Confirm/Cancel buttons removed as per requirement.
                  Order confirmation is handled outside the payment method section. */}
            </>
          )}
        </div>
      </div>
    );
  };

  return renderPaymentMethod();
};

export default PaymentMethod;
