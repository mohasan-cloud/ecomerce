"use client";

import { useEffect } from "react";
import { createGlobalState } from "react-hooks-global-state";

const initialState = { isDarkmode: false };
const { useGlobalState } = createGlobalState(initialState);

export const useThemeMode = () => {
  const [isDarkMode, setIsDarkMode] = useGlobalState("isDarkmode");

  // Load theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (token) {
        // User is logged in, fetch from API
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
            if (data.success && data.data?.user?.theme_preference) {
              const theme = data.data.user.theme_preference;
              if (theme === 'dark') {
                toDark();
              } else {
                toLight();
              }
              // Update localStorage to match
              localStorage.theme = theme;
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching theme preference:', error);
        }
      }
      
      // Fallback to localStorage (for guests or if API fails)
      if (localStorage.theme === "dark") {
        toDark();
      } else {
        toLight();
      }
    };

    loadThemePreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveThemePreference = async (theme: 'light' | 'dark') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Always save to localStorage
    localStorage.theme = theme;
    
    // If user is logged in, save to API
    if (token) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/auth/theme`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ theme_preference: theme }),
        });
      } catch (error) {
        console.error('Error saving theme preference:', error);
        // Continue anyway, localStorage is already saved
      }
    }
  };

  const toDark = () => {
    setIsDarkMode(true);
    const root = document.querySelector("html");
    if (!root) return;
    !root.classList.contains("dark") && root.classList.add("dark");
    saveThemePreference('dark');
  };

  const toLight = () => {
    setIsDarkMode(false);
    const root = document.querySelector("html");
    if (!root) return;
    root.classList.remove("dark");
    saveThemePreference('light');
  };

  function _toogleDarkMode() {
    if (localStorage.theme === "light" || !localStorage.theme) {
      toDark();
    } else {
      toLight();
    }
  }

  return {
    isDarkMode,
    toDark,
    toLight,
    _toogleDarkMode,
  };
};
