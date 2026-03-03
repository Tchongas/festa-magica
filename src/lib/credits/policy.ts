import { CREDITS_FEATURE_ENABLED } from '@/lib/config';

export interface CreditsPolicyInput {
  hasActiveSubscription: boolean;
}

export interface CreditsPolicyDecision {
  enabled: boolean;
  requiresCredits: boolean;
  creditsOptional: boolean;
  allowWithoutSubscription: boolean;
}

export function resolveCreditsPolicy({ hasActiveSubscription }: CreditsPolicyInput): CreditsPolicyDecision {
  void hasActiveSubscription;

  if (!CREDITS_FEATURE_ENABLED) {
    return {
      enabled: false,
      requiresCredits: false,
      creditsOptional: false,
      allowWithoutSubscription: false,
    };
  }

  return {
    enabled: true,
    requiresCredits: true,
    creditsOptional: false,
    allowWithoutSubscription: true,
  };
}
