import { create } from 'zustand';
import { User, Subscription } from '@/types';

interface AuthStoreState {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  subscription: null,
  isLoading: true,
  isAuthenticated: false,
  hasActiveSubscription: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false,
  }),

  setSubscription: (subscription) => set({
    subscription,
    hasActiveSubscription: subscription?.status === 'active' && 
      new Date(subscription.expires_at) > new Date(),
  }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => set({
    user: null,
    subscription: null,
    isAuthenticated: false,
    hasActiveSubscription: false,
  }),
}));
