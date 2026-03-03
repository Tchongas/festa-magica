import { create } from 'zustand';
import { User, UserProduct } from '@/types';

interface AuthStoreState {
  user: User | null;
  subscription: UserProduct | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  creditsEnabled: boolean;
  creditsBalance: number | null;
  creditsRequiredForGeneration: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: UserProduct | null) => void;
  setCredits: (payload: { enabled: boolean; balance: number | null; requiredForGeneration: boolean }) => void;
  setCreditsBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  subscription: null,
  isLoading: true,
  isAuthenticated: false,
  hasActiveSubscription: false,
  creditsEnabled: false,
  creditsBalance: null,
  creditsRequiredForGeneration: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false,
  }),

  setSubscription: (subscription) => set({
    subscription,
    hasActiveSubscription: subscription?.status === 'active',
  }),

  setCredits: ({ enabled, balance, requiredForGeneration }) => set({
    creditsEnabled: enabled,
    creditsBalance: balance,
    creditsRequiredForGeneration: requiredForGeneration,
  }),

  setCreditsBalance: (balance) => set((state) => ({
    creditsBalance: state.creditsEnabled ? Math.max(0, balance) : state.creditsBalance,
  })),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => set({
    user: null,
    subscription: null,
    isAuthenticated: false,
    hasActiveSubscription: false,
    creditsEnabled: false,
    creditsBalance: null,
    creditsRequiredForGeneration: false,
  }),
}));
