"use client";

import { useEffect, useState, useRef } from "react";
import { getDeviceInfo } from "@/utils/deviceInfo";

interface NotificationSettings {
  project_id?: string;
  api_key?: string;
  auth_domain?: string;
  storage_bucket?: string;
  messaging_sender_id?: string;
  app_id?: string;
  vapid_key?: string;
  status: boolean;
}

export default function NotificationPermission() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  
  // Use useRef for cleanup and state tracking
  const isMountedRef = useRef(true);
  const messagingRef = useRef<any>(null);
  const authChangeHandlerRef = useRef<(() => void) | null>(null);

  // Check if user is logged in
  const isLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  };

  // Fetch notification settings from API
  const fetchNotificationSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${apiUrl}/api/notification-settings`, {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
      if (data.success && data.data && isMountedRef.current) {
        setSettings(data.data);
        return data.data;
      } else {
        console.warn('Notification settings API returned unsuccessful response:', data);
      }
      } else {
        console.warn(`Notification settings API returned status ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      // Handle different types of errors gracefully
      if (error.name === 'AbortError') {
        console.warn('Notification settings request timed out');
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        console.warn('Network error fetching notification settings. This is normal if the backend is not running.');
      } else {
        console.error('Error fetching notification settings:', error);
      }
      
      // Return null to indicate failure, but don't throw - allow component to continue
      return null;
    }
    return null;
  };

  // Initialize Firebase Messaging
  const initializeFirebase = async (firebaseSettings: NotificationSettings) => {
    if (typeof window === 'undefined') return null;

    try {
      // Dynamically import Firebase with error handling
      const firebaseApp = await import('firebase/app' as any).catch(() => null);
      const firebaseMessaging = await import('firebase/messaging' as any).catch(() => null);
      
      if (!firebaseApp || !firebaseMessaging) {
        console.warn('Firebase package not installed. Please run: npm install firebase');
        // Fallback: use basic Notification API if Firebase is not available
        if (Notification.permission === 'granted') {
          const simpleToken = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await saveTokenToServer(simpleToken);
        }
        return null;
      }

      const { initializeApp, getApps } = firebaseApp;
      const { getMessaging, getToken, onMessage, isSupported } = firebaseMessaging;

      // Check if messaging is supported
      if (isSupported && !isSupported()) {
        console.warn('Firebase Messaging is not supported in this browser');
        return null;
      }

      // Check if Firebase is already initialized
      let app;
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
      } else {
        const firebaseConfig = {
          apiKey: firebaseSettings.api_key,
          authDomain: firebaseSettings.auth_domain,
          projectId: firebaseSettings.project_id,
          storageBucket: firebaseSettings.storage_bucket,
          messagingSenderId: firebaseSettings.messaging_sender_id,
          appId: firebaseSettings.app_id,
        };

        // Validate required config
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
          console.error('Firebase config is incomplete. Missing required fields.');
          return null;
        }

        app = initializeApp(firebaseConfig);
      }

      // Register service worker for Firebase messaging BEFORE getting messaging instance
      let serviceWorkerRegistration = null;
      if ('serviceWorker' in navigator) {
        try {
          // Register service worker
          serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/',
          });
          console.log('Service worker registered successfully');
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('Service worker is ready');
        } catch (swError: any) {
          console.warn('Service worker registration error:', swError);
          // Continue even if service worker registration fails - Firebase might still work
        }
      }

      const messaging = getMessaging(app);

      // Request permission and get token
      if (Notification.permission === 'granted') {
        try {
          // Get FCM token with proper options
          const tokenOptions: any = {};
          if (firebaseSettings.vapid_key) {
            tokenOptions.vapidKey = firebaseSettings.vapid_key;
          }
          
          // Add service worker registration if available
          if (serviceWorkerRegistration) {
            tokenOptions.serviceWorkerRegistration = serviceWorkerRegistration;
          }

          console.log('Requesting FCM token with options:', { 
            hasVapidKey: !!firebaseSettings.vapid_key,
            hasServiceWorker: !!serviceWorkerRegistration 
          });
          
          const token = await getToken(messaging, tokenOptions);

          if (token) {
            console.log('✅ FCM Token generated successfully:', token.substring(0, 30) + '...');
            const saveResult = await saveTokenToServer(token);
            if (saveResult) {
              console.log('FCM token saved successfully');
            } else {
              console.warn('Token generated but failed to save');
            }
          } else {
            console.warn('❌ No FCM token returned. Check VAPID key configuration.');
          }
        } catch (error: any) {
          console.error('❌ Error getting FCM token:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack,
          });
          // Silently fail - no toast messages
        }
      }

      // Handle foreground messages
      onMessage(messaging, (payload: any) => {
        console.log('Message received:', payload);
        // Silently handle foreground messages - no toast
        if (payload.notification) {
          console.log('Notification received:', payload.notification.title || 'New notification');
        }
      });

      return messaging;
    } catch (error: any) {
      console.error('Error initializing Firebase:', error);
      // Silently fail - no toast messages
      return null;
    }
  };

  // Save FCM token to server
  const saveTokenToServer = async (token: string): Promise<boolean> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const authToken = localStorage.getItem('auth_token');

      if (!authToken) {
        console.warn('User not logged in, cannot save FCM token');
        return false;
      }

      // Get device info
      const deviceInfo = getDeviceInfo();

      const response = await fetch(`${apiUrl}/api/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          token,
          device_id: deviceInfo.device_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('FCM token saved successfully to server');
        return true;
      } else {
        console.error('Error saving FCM token:', data.message);
        return false;
      }
    } catch (error: any) {
      console.error('Error saving FCM token to server:', error);
      return false;
    }
  };

  // Request notification permission (removed - no longer used)
  // Token will be generated silently if permission is already granted

  // Initialize on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    isMountedRef.current = true;

    // Check if notifications are supported and user is logged in
    if ('Notification' in window && 'serviceWorker' in navigator && isLoggedIn()) {
      // Fetch settings and initialize silently
      fetchNotificationSettings()
        .then((firebaseSettings) => {
          if (!isMountedRef.current) return;
          
          if (firebaseSettings && firebaseSettings.status) {
            // Auto-initialize if permission is already granted (silently)
            if (Notification.permission === 'granted') {
              initializeFirebase(firebaseSettings).then(messaging => {
                if (messaging && isMountedRef.current) {
                  messagingRef.current = messaging;
                }
              });
            }
            // If permission is not granted, don't request it - just silently skip
          }
        })
        .catch((error) => {
          // Handle any errors silently
          if (!isMountedRef.current) return;
          console.warn('Error in notification settings initialization:', error);
        });
    }

    // Listen for auth changes (when user logs in)
    const handleAuthChange = async () => {
      if (!isMountedRef.current || !isLoggedIn()) return;
      
      // Fetch fresh settings
      const freshSettings = await fetchNotificationSettings();
      if (!isMountedRef.current) return;
      
      if (freshSettings && freshSettings.status) {
        // Wait a bit for page to stabilize after login
        setTimeout(async () => {
          if (!isMountedRef.current) return;
          
          // Check permission first
          if (Notification.permission === 'granted') {
            // Permission already granted, generate token immediately
            const messaging = await initializeFirebase(freshSettings);
            if (messaging && isMountedRef.current) {
              messagingRef.current = messaging;
            }
          } else if (Notification.permission === 'default') {
            // Permission not asked yet, but don't auto-request
            // Silently skip - no popup, no banner
            console.log('Notification permission not granted yet. Skipping token generation.');
          }
        }, 1500);
      }
    };

    // Store handler in ref for cleanup
    authChangeHandlerRef.current = handleAuthChange;

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-change', handleAuthChange);
    }

    // Cleanup function using refs
    return () => {
      isMountedRef.current = false;
      
      if (typeof window !== 'undefined' && authChangeHandlerRef.current) {
        try {
          window.removeEventListener('auth-change', authChangeHandlerRef.current);
        } catch (e) {
          // Ignore cleanup errors
        } finally {
          authChangeHandlerRef.current = null;
        }
      }
      
      // Clean up messaging if exists
      if (messagingRef.current) {
        messagingRef.current = null;
      }
    };
  }, [settings]);

  // Component doesn't render anything - just silently generates FCM token
  // Token is generated automatically if:
  // 1. User is logged in
  // 2. Notification permission is already granted
  // 3. Settings are enabled
  return null;
}


