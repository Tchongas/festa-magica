"use client";

import { useAuthStore } from '@/stores/auth.store';
import { MEMBROS_URL } from '@/lib/config';

export function useAuth() {
  const { 
    user, 
    subscription,
    isLoading, 
    isAuthenticated, 
    hasActiveSubscription,
    creditsEnabled,
    creditsBalance,
    creditsRequiredForGeneration,
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

  return {
    user,
    subscription,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    creditsEnabled,
    creditsBalance,
    creditsRequiredForGeneration,
    logout,
  };
}
