"use client";

import Link from "next/link";

const OrderSuccessPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-10 text-center shadow-sm">
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
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Continue shopping
          </Link>
          <Link
            href="/account-order"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            View my orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;


