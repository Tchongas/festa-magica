"use client";

import Link from 'next/link';
import { PartyPopper, Menu, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.com';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, hasActiveSubscription } = useAuthStore();

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
          <a href="#precos" className="text-gray-600 hover:text-pink-500 font-medium transition-colors">
            Preços
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && hasActiveSubscription ? (
            <Link href="/criar">
              <Button>Criar Kit</Button>
            </Link>
          ) : (
            <a href={`${HUB_URL}/products/festa-magica`}>
              <Button>
                Adquirir Acesso <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </a>
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
          <a
            href="#precos"
            className="block text-gray-600 hover:text-pink-500 font-medium py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Preços
          </a>
          <hr />
          {isAuthenticated && hasActiveSubscription ? (
            <Link href="/criar" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Criar Kit</Button>
            </Link>
          ) : (
            <a href={`${HUB_URL}/products/festa-magica`} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">
                Adquirir Acesso <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </a>
          )}
        </div>
      )}
    </header>
  );
}
