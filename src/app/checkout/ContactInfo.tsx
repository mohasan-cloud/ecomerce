import Label from "@/components/Label/Label";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Checkbox from "@/shared/Checkbox/Checkbox";
import Input from "@/shared/Input/Input";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

interface Props {
  isActive: boolean;
  onOpenActive: () => void;
  onCloseActive: () => void;
}

// Generate a strong random password for auto-created accounts
const generateRandomPassword = () => {
  const random = Math.random().toString(36).slice(2, 10); // 8 chars
  // Ensure it has upper, lower, digit and symbol
  return `Ab${random}1!`;
};

const ContactInfo: FC<Props> = ({ isActive, onCloseActive, onOpenActive }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Contact form fields
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [emailNews, setEmailNews] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (token && userStr) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.user) {
              const userData = data.data.user;
              setUser(userData);
              // Pre-fill contact form with user data
              setContactName(userData.name || "");
              setContactEmail(userData.email || "");
              setContactPhone(userData.phone || "");
            }
          } else if (response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to localStorage
          if (userStr) {
            try {
              const parsedUser = JSON.parse(userStr);
              setUser(parsedUser);
              setContactName(parsedUser.name || "");
              setContactEmail(parsedUser.email || "");
              setContactPhone(parsedUser.phone || "");
            } catch (e) {
              setUser(null);
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }

    setLoginLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setUser(data.data.user);
        setContactName(data.data.user.name || "");
        setContactEmail(data.data.user.email || "");
        setContactPhone(data.data.user.phone || "");
        setShowLogin(false);
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'));
        
        toast.success("Login successful!");
      } else {
        toast.error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "An error occurred during login.");
    } finally {
      setLoginLoading(false);
    }
  };

  const renderAccount = () => {
    if (loading) {
      return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-0 p-6">
          <div className="text-center text-slate-500 dark:text-slate-400">Loading...</div>
        </div>
      );
    }

    return (
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden z-0">
        {/* Header - Always show */}
        <div className="flex flex-col sm:flex-row items-start p-6">
          <span className="hidden sm:block">
            <svg
              className="w-6 h-6 text-slate-700 dark:text-slate-400 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8">
            <h3 className="text-slate-700 dark:text-slate-300 flex">
              <span className="uppercase tracking-tight">CONTACT INFO</span>
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
            {user ? (
              <div className="font-semibold mt-1 text-sm">
                <span>{user.name}</span>
                {user.phone && (
                  <span className="ml-3 tracking-tighter">{user.phone}</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your contact information
              </div>
            )}
          </div>
          <button
            className="py-2 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 mt-5 sm:mt-0 sm:ml-auto text-sm font-medium rounded-lg"
            onClick={() => onOpenActive()}
          >
            {isActive ? "Hide" : user ? "Change" : "Add"}
          </button>
        </div>

        {/* Content Section */}
        <div
          className={`border-t border-slate-200 dark:border-slate-700 px-6 py-7 space-y-4 sm:space-y-6 ${
            isActive ? "block" : "hidden"
          }`}
        >

          {showLogin && !user ? (
            // Login Form
            <div className="space-y-4">
              <div className="flex justify-between flex-wrap items-baseline">
                <h3 className="text-lg font-semibold">Log in</h3>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-sm text-primary-500 font-medium hover:text-primary-600"
                >
                  Back to contact form
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="max-w-lg">
                  <Label className="text-sm">Email address</Label>
                  <Input
                    className="mt-1.5"
                    type="email"
                    placeholder="example@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="max-w-lg">
                  <Label className="text-sm">Password</Label>
                  <Input
                    className="mt-1.5"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row pt-2">
                  <ButtonPrimary
                    type="submit"
                    className="sm:!px-7 shadow-none"
                    loading={loginLoading}
                  >
                    {loginLoading ? "Logging in..." : "Log in"}
                  </ButtonPrimary>
                  <ButtonSecondary
                    className="mt-3 sm:mt-0 sm:ml-3"
                    onClick={() => {
                      setShowLogin(false);
                      setLoginEmail("");
                      setLoginPassword("");
                    }}
                  >
                    Cancel
                  </ButtonSecondary>
                </div>
              </form>
            </div>
          ) : (
            // Contact Form
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between flex-wrap items-baseline">
                <h3 className="text-lg font-semibold">Contact information</h3>
                {!user && (
                  <span className="block text-sm my-1 md:my-0">
                    Do not have an account?{` `}
                    <button
                      onClick={() => setShowLogin(true)}
                      className="text-primary-500 font-medium hover:text-primary-600"
                    >
                      Log in
                    </button>
                  </span>
                )}
              </div>
              
              <div className="max-w-lg">
                <Label className="text-sm">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-1.5"
                  type="text"
                  placeholder="Enter your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              
              <div className="max-w-lg">
                <Label className="text-sm">Email address <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-1.5"
                  type="email"
                  placeholder="example@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="max-w-lg">
                <Label className="text-sm">Phone number <span className="text-red-500">*</span></Label>
                <Input
                  className="mt-1.5"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Checkbox
                  className="!text-sm"
                  name="emailNews"
                  label="Email me news and offers"
                  defaultChecked={emailNews}
                  onChange={(checked) => setEmailNews(checked)}
                />
              </div>

              {/* ============ */}
              <div className="flex flex-col sm:flex-row pt-6">
                <ButtonPrimary
                  className="sm:!px-7 shadow-none"
                  onClick={async () => {
                    if (!contactName || !contactEmail || !contactPhone) {
                      toast.error("Please fill in all required fields");
                      return;
                    }

                    // If user is not logged in, check if email exists, then register or login
                    if (!user) {
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                        const password = generateRandomPassword();

                        // First, try to register (this will tell us if email exists)
                        const registerResponse = await fetch(`${apiUrl}/api/auth/register`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                          },
                          body: JSON.stringify({
                            name: contactName,
                            email: contactEmail,
                            phone: contactPhone,
                            password,
                            password_confirmation: password,
                          }),
                        });

                        const registerData = await registerResponse.json();

                        // If registration successful (new user created)
                        if (registerResponse.ok && registerData.success && registerData.data?.token) {
                          // Save auth token & user in localStorage
                          localStorage.setItem('auth_token', registerData.data.token);
                          localStorage.setItem('user', JSON.stringify(registerData.data.user));

                          setUser(registerData.data.user);
                          setContactName(registerData.data.user.name || contactName);
                          setContactEmail(registerData.data.user.email || contactEmail);
                          setContactPhone(registerData.data.user.phone || contactPhone);

                          // Notify other parts of the app that auth state changed
                          window.dispatchEvent(new Event('auth-change'));

                          toast.success("Account created successfully!");
                        } 
                        // If email already exists (422 validation error)
                        else if (registerResponse.status === 422 && registerData.errors?.email) {
                          // User exists - show login form with email pre-filled
                          toast("An account with this email already exists. Please log in to continue.");
                          setShowLogin(true);
                          setLoginEmail(contactEmail);
                          // Don't proceed to next step, let user login first
                          return;
                        } else {
                          // Other registration errors
                          const message =
                            registerData?.message ||
                            (registerData?.errors && Object.values<string[]>(registerData.errors)[0]?.[0]) ||
                            "Could not create account. You can continue as guest.";
                          toast.error(message);
                        }
                      } catch (error: any) {
                        console.error('Registration/Login error:', error);
                        // Do not block checkout if registration fails
                        toast.error(error?.message || "Could not process account. You can continue as guest.");
                      }
                    }

                    // Proceed to next step (Shipping)
                    onCloseActive();
                  }}
                >
                  Save and next to Shipping
                </ButtonPrimary>
                <ButtonSecondary
                  className="mt-3 sm:mt-0 sm:ml-3"
                  onClick={() => onCloseActive()}
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

  return renderAccount();
};

export default ContactInfo;
