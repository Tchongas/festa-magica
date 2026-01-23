"use client";

import { Check, Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { SUBSCRIPTION_PLANS } from '@/types';
import { formatCurrency } from '@/lib/utils';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://allanhub.vercel.app/';

export function PricingSection() {
  return (
    <section id="precos" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
            <Calendar className="w-4 h-4" /> Assinatura
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Acesso Ilimitado por 3 Meses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie quantos kits quiser durante o período da assinatura
          </p>
        </div>

        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className="relative bg-white rounded-3xl p-8 md:p-12 border-2 border-pink-500 shadow-2xl shadow-pink-100 max-w-lg mx-auto"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-pink-500 text-white shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" /> Melhor Valor
              </Badge>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold text-gray-900">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-gray-500">/ {plan.duration_months} meses</span>
              </div>
              <p className="text-pink-500 font-medium mt-2">
                {formatCurrency(plan.price / plan.duration_months)}/mês
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a href={`${HUB_URL}/products/festa-magica`} className="block">
              <Button
                variant="gradient"
                className="w-full"
                size="lg"
              >
                Adquirir no Hub <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>

            <p className="text-center text-xs text-gray-400 mt-4">
              Pagamento seguro via Pix no Hub
            </p>
          </div>
        ))}

        <div className="text-center mt-12">
          <p className="text-gray-500">
            🔒 Compra segura via <strong>Hub</strong> • Pix instantâneo
          </p>
        </div>
      </div>
    </section>
  );
}
