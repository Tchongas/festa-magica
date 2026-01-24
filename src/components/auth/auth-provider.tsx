"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [initialized, setInitialized] = useState(false);
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
        setInitialized(true);
      }
    }

    verifySession();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <LoadingSpinner text="Carregando..." />
      </div>
    );
  }

  return <>{children}</>;
}
