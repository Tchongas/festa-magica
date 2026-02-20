"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verifySession() {
      const { setUser, setSubscription, setLoading } = useAuthStore.getState();
      
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
          setSubscription(data.subscription);
        } else {
          setUser(null);
          setSubscription(null);
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        setUser(null);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  return <>{children}</>;
}
