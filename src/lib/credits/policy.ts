import { CREDITS_CHARGE_SUBSCRIBERS, CREDITS_FEATURE_ENABLED, CREDITS_MODE } from '@/lib/config';

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
  if (!CREDITS_FEATURE_ENABLED) {
    return {
      enabled: false,
      requiresCredits: false,
      creditsOptional: false,
      allowWithoutSubscription: false,
    };
  }

  if (CREDITS_MODE === 'credits_only') {
    return {
      enabled: true,
      requiresCredits: true,
      creditsOptional: false,
      allowWithoutSubscription: true,
    };
  }

  if (CREDITS_MODE === 'hybrid') {
    const requiresCredits = CREDITS_CHARGE_SUBSCRIBERS || !hasActiveSubscription;

    return {
      enabled: true,
      requiresCredits,
      creditsOptional: hasActiveSubscription && !CREDITS_CHARGE_SUBSCRIBERS,
      allowWithoutSubscription: true,
    };
  }

  return {
    enabled: false,
    requiresCredits: false,
    creditsOptional: false,
    allowWithoutSubscription: false,
  };
}
