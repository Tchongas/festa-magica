"use client";

import { Star, ExternalLink, LogIn } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from '@/lib/config';
import { useAuthStore } from '@/stores/auth.store';

export function HeroSection() {
  const { isAuthenticated, hasActiveSubscription, creditsEnabled } = useAuthStore();
  const canCreate = isAuthenticated && (hasActiveSubscription || creditsEnabled);

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 opacity-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-8">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          Convites de Festa Infantil
          <br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Criados com Magia e IA
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Transforme a foto do seu filho em ilustrações incríveis para convites, 
          toppers de bolo, adesivos e muito mais. Tudo personalizado em minutos!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {canCreate ? (
            <Link href="/criar">
              <Button variant="gradient" size="lg" className="text-lg px-8">
                Criar Kit
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/entrar">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <LogIn className="w-5 h-5" /> Entrar / Criar conta
                </Button>
              </Link>
              <a href={HOTMART_40_CREDITS_URL}>
                <Button variant="gradient" size="lg" className="text-lg px-8">
                  Comprar 40 créditos <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href={HOTMART_200_CREDITS_URL}>
                <Button variant="outline" size="lg" className="text-lg px-8">
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
