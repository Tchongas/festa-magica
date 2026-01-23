"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setSubscription, setLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function verifySession() {
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
  }, [setUser, setSubscription, setLoading]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <LoadingSpinner text="Carregando..." />
      </div>
    );
  }

  return <>{children}</>;
}
