"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PartyPopper, ExternalLink, Key } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingSpinner } from '@/components/shared';
import { useState } from 'react';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.com';

export function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasActiveSubscription, isLoading } = useAuthStore();
  const [showActivation, setShowActivation] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            {!showActivation ? (
              <>
                <Button
                  className="w-full"
                  variant="gradient"
                  size="lg"
                  onClick={() => window.location.href = `${HUB_URL}/products/festa-magica`}
                >
                  <ExternalLink className="w-5 h-5" />
                  Ir para o Hub
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ou</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowActivation(true)}
                >
                  <Key className="w-4 h-4" />
                  Tenho um código de ativação
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Código de Ativação
                  </label>
                  <Input
                    placeholder="FM-XXXX-XXXX-XXXX"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg tracking-wider"
                  />
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                </div>

                <Button
                  className="w-full"
                  variant="gradient"
                  disabled={activating || activationCode.length < 10}
                  onClick={async () => {
                    setActivating(true);
                    setError(null);
                    try {
                      const response = await fetch('/api/auth/activate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: activationCode }),
                      });
                      const data = await response.json();
                      if (!response.ok) {
                        setError(data.error || 'Código inválido');
                      } else {
                        window.location.reload();
                      }
                    } catch (err) {
                      setError('Erro ao ativar. Tente novamente.');
                    } finally {
                      setActivating(false);
                    }
                  }}
                >
                  {activating ? 'Ativando...' : 'Ativar Código'}
                </Button>

                <Button
                  className="w-full"
                  variant="ghost"
                  onClick={() => {
                    setShowActivation(false);
                    setActivationCode('');
                    setError(null);
                  }}
                >
                  Voltar
                </Button>
              </>
            )}

            <p className="text-center text-xs text-gray-400 mt-4">
              Adquira seu acesso em{' '}
              <a href={HUB_URL} className="text-pink-500 hover:underline">
                hub.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
