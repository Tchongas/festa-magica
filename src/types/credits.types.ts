export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'trimestral',
    name: 'Plano Trimestral',
    duration_months: 3,
    price: 49.90,
    features: [
      'Acesso ilimitado por 3 meses',
      'Geração ilimitada de kits',
      'Download em alta qualidade',
      'Suporte por email',
    ],
    popular: true,
  },
];
