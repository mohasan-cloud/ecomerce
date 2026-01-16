"use client";

import React, { useState, useEffect, FC } from "react";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";

export interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  onAnswerChange?: (answer: string, token: string) => void;
  className?: string;
  refreshKey?: number;
}

interface CaptchaData {
  question: string;
  token: string;
}

const Captcha: FC<CaptchaProps> = ({ onVerify, onAnswerChange, className = "", refreshKey = 0 }) => {
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCaptcha = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/contact/captcha`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate captcha');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setCaptcha(data.data);
        setUserAnswer("");
      }
    } catch (err) {
      console.error('Error generating captcha:', err);
      setError('Failed to load captcha. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, [refreshKey]);

  useEffect(() => {
    if (captcha && userAnswer && !isNaN(parseInt(userAnswer))) {
      // Basic validation - just check if answer is provided
      // Actual verification happens on server
      onVerify(true);
      if (onAnswerChange) {
        onAnswerChange(userAnswer, captcha.token);
      }
    } else {
      onVerify(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswer, captcha]);

  return (
    <div className={className}>
      <Label>Security Code</Label>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter answer"
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                }}
                className="mt-0"
                required
              />
            </div>
            {captcha && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {captcha.question} = ?
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={generateCaptcha}
              disabled={loading}
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh captcha"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
      {loading && (
        <p className="mt-1 text-xs text-slate-500">Loading captcha...</p>
      )}
    </div>
  );
};

export default Captcha;

