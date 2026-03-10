"use client";

import { ExternalLink, LogIn } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from '@/lib/config';
import { useAuthStore } from '@/stores/auth.store';

export function CTASection() {
  const { isAuthenticated, hasActiveSubscription, creditsEnabled } = useAuthStore();
  const canCreate = isAuthenticated && (hasActiveSubscription || creditsEnabled);

  return (
    <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          Pronto para Criar a Festa dos Sonhos?
        </h2>

        <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
          Junte-se a milhares de pais que já transformaram fotos em convites mágicos. 
          Comece agora e surpreenda seus convidados!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {canCreate ? (
            <Link href="/criar">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100 shadow-2xl text-lg px-10"
              >
                Criar Kit
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/entrar">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/50 text-white hover:bg-white/20 text-lg px-10"
                >
                  <LogIn className="w-5 h-5" /> Entrar / Criar conta
                </Button>
              </Link>
              <a href={HOTMART_40_CREDITS_URL}>
                <Button
                  size="lg"
                  className="bg-white text-pink-600 hover:bg-gray-100 shadow-2xl text-lg px-10"
                >
                  Comprar 40 créditos <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href={HOTMART_200_CREDITS_URL}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/50 text-white hover:bg-white/20 text-lg px-10"
                >
                  Comprar 200 créditos <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
