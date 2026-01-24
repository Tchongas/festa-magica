"use client";

import { useAuthStore } from '@/stores/auth.store';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://allanhub.vercel.app/';

export function useAuth() {
  const { 
    user, 
    subscription,
    isLoading, 
    isAuthenticated, 
    hasActiveSubscription,
    logout: storeLogout 
  } = useAuthStore();

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
    window.location.href = `${HUB_URL}`;
  };

  return {
    user,
    subscription,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    logout,
    redirectToHub,
  };
}
