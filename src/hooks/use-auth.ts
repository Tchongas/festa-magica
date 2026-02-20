"use client";

import { useAuthStore } from '@/stores/auth.store';

const MEMBROS_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

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
      window.location.href = MEMBROS_URL;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const redirectToMembros = () => {
    window.location.href = MEMBROS_URL;
  };

  return {
    user,
    subscription,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    logout,
    redirectToMembros,
  };
}
