"use client";

import { PartyPopper, ExternalLink, LogIn } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared';

import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from '@/lib/config';

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasActiveSubscription, creditsEnabled, isLoading } = useAuthStore();
  const hasEntitlement = hasActiveSubscription || creditsEnabled;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <LoadingSpinner text="Verificando acesso..." />
      </div>
    );
  }

  if (!isAuthenticated || !hasEntitlement) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-pink-100">
          <CardHeader className="text-center">
            <div className="mx-auto bg-pink-500 p-3 rounded-2xl w-fit mb-4">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Acesso Necessário</CardTitle>
            <CardDescription>
              A ferramenta é gratuita, mas você precisa de créditos para gerar imagens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              variant="gradient"
              size="lg"
              onClick={() => window.location.href = HOTMART_40_CREDITS_URL}
            >
              <ExternalLink className="w-5 h-5" />
              Comprar 40 créditos
            </Button>

            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => window.location.href = HOTMART_200_CREDITS_URL}
            >
              <ExternalLink className="w-5 h-5" />
              Comprar 200 créditos
            </Button>

            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/entrar'}
            >
              <LogIn className="w-5 h-5" />
              Entrar ou Criar conta
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Compre créditos e volte para continuar criando.
              {' '}
              <a href={HOTMART_40_CREDITS_URL} className="text-pink-500 hover:underline">
                Ver pacote de 40 créditos
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
