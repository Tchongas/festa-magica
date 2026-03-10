"use client";

import Link from 'next/link';
import { PartyPopper, Menu, X, ExternalLink, LogIn } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';

import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from '@/lib/config';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, hasActiveSubscription, creditsEnabled } = useAuthStore();
  const canCreate = isAuthenticated && (hasActiveSubscription || creditsEnabled);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-xl">
            <PartyPopper className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Festa <span className="text-pink-500">Mágica</span>
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-gray-600 hover:text-pink-500 font-medium transition-colors">
            Como Funciona
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {canCreate ? (
            <Link href="/criar">
              <Button>Criar Kit</Button>
            </Link>
          ) : (
            <>
              <Link href="/entrar">
                <Button variant="outline">
                  <LogIn className="w-4 h-4" /> Entrar / Criar conta
                </Button>
              </Link>
              <a href={HOTMART_40_CREDITS_URL}>
                <Button>
                  Comprar 40 créditos <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </a>
              <a href={HOTMART_200_CREDITS_URL}>
                <Button variant="outline">
                  Comprar 200 créditos <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t p-6 space-y-4">
          <a
            href="#como-funciona"
            className="block text-gray-600 hover:text-pink-500 font-medium py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Como Funciona
          </a>
          <hr />
          {canCreate ? (
            <Link href="/criar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Criar Kit</Button>
            </Link>
          ) : (
            <div className="space-y-2">
              <Link href="/entrar" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" variant="outline">
                  <LogIn className="w-4 h-4" /> Entrar / Criar conta
                </Button>
              </Link>
              <a href={HOTMART_40_CREDITS_URL} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">
                  Comprar 40 créditos <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </a>
              <a href={HOTMART_200_CREDITS_URL} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" variant="outline">
                  Comprar 200 créditos <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
