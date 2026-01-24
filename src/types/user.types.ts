export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProduct {
  id: string;
  user_id: string;
  product_id: string;
  status: 'active' | 'expired' | 'cancelled';
  activated_at: Date;
  expires_at: Date;
  activation_code: string;
  created_at: Date;
}

export interface AuthState {
  user: User | null;
  subscription: UserProduct | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
}
