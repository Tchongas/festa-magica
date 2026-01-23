"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://allanhub.vercel.app/';

export function useAuth() {
  const router = useRouter();
  const { 
    user, 
    subscription,
    isLoading, 
    isAuthenticated, 
    hasActiveSubscription,
    setUser, 
    setSubscription,
    setLoading,
    logout: storeLogout 
  } = useAuthStore();

  const verifySession = useCallback(async () => {
    setLoading(true);
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
  }, [setUser, setSubscription, setLoading]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      storeLogout();
      window.location.href = HUB_URL;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const redirectToHub = () => {
    window.location.href = `${HUB_URL}/products/festa-magica`;
  };

  const activateCode = async (code: string, hubUserId: string, email: string, name?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, hubUserId, email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      await verifySession();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao ativar código. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    subscription,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    logout,
    redirectToHub,
    activateCode,
    verifySession,
  };
}
