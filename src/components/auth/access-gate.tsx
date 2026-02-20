"use client";

import { PartyPopper, ExternalLink } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared';

const MEMBROS_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasActiveSubscription, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <LoadingSpinner text="Verificando acesso..." />
      </div>
    );
  }

  if (!isAuthenticated || !hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-pink-100">
          <CardHeader className="text-center">
            <div className="mx-auto bg-pink-500 p-3 rounded-2xl w-fit mb-4">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Acesso Necessário</CardTitle>
            <CardDescription>
              Você precisa ter acesso ao Festa Mágica para usar esta ferramenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              variant="gradient"
              size="lg"
              onClick={() => window.location.href = MEMBROS_URL}
            >
              <ExternalLink className="w-5 h-5" />
              Adquira ou Acesse
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Adquira seu acesso em{' '}
              <a href={MEMBROS_URL} className="text-pink-500 hover:underline">
                membros.allanfulcher.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
