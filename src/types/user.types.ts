export interface User {
  id: string;
  hub_user_id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: Date;
  expires_at: Date;
  activation_code?: string;
  created_at: Date;
}

export interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
}
