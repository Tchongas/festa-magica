"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PartyPopper, RotateCcw, LogOut, User, Calendar, ExternalLink, Menu, X } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { useKitCreatorStore } from '@/stores/kit-creator.store';
import { useAuth } from '@/hooks/use-auth';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://allanhub.vercel.app/';

export function DashboardHeader() {
  const { step, reset } = useKitCreatorStore();
  const { user, subscription, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const daysRemaining = subscription 
    ? Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <header className="bg-white shadow-sm py-3 px-4 md:py-4 md:px-6 mb-6 md:mb-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-pink-500 p-1.5 md:p-2 rounded-xl">
            <PartyPopper className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
            Festa <span className="text-pink-500">Mágica</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {subscription && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {daysRemaining} dias restantes
              </span>
            </div>
          )}

          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="w-4 h-4" /> Recomeçar
            </Button>
          )}

          <div className="relative group">
            <button className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.split(' ')[0] || 'Usuário'}
              </span>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="font-medium text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {subscription && (
                  <Badge className="mt-2 bg-green-100 text-green-700">
                    Ativo até {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>
              <div className="p-2">
                <a 
                  href={HUB_URL}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Ir para o Hub
                </a>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-2">
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={reset} className="p-2">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <button
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t p-4 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User className="w-5 h-5 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          {subscription && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {daysRemaining} dias restantes
              </span>
            </div>
          )}

          <a 
            href={HUB_URL}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ExternalLink className="w-4 h-4" /> Ir para o Hub
          </a>
          
          <button
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      )}
    </header>
  );
}
