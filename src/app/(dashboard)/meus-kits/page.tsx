"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, Image as ImageIcon, Plus } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared';
import { useAuthStore } from '@/stores/auth.store';
import { Kit } from '@/types';

export default function MeusKitsPage() {
  const { user } = useAuthStore();
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadKits() {
      if (!user) return;
      
      try {
        // TODO: Implement Supabase kit fetching when needed
        // For now, kits are generated in-memory and not persisted
        setKits([]);
      } catch (error) {
        console.error('Error loading kits:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadKits();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner text="Carregando seus kits..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Meus Kits</h1>
          <p className="text-gray-500 mt-1">Histórico de kits criados</p>
        </div>
        <Link href="/criar">
          <Button>
            <Plus className="w-4 h-4" /> Criar Novo Kit
          </Button>
        </Link>
      </div>

      {kits.length === 0 ? (
        <Card className="border-gray-100">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum kit criado ainda</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Comece criando seu primeiro kit de festa personalizado com IA!
            </p>
            <Link href="/criar">
              <Button variant="gradient" size="lg">
                <Sparkles className="w-5 h-5" /> Criar Meu Primeiro Kit
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit) => (
            <Card key={kit.id} className="border-gray-100 hover:border-pink-200 transition-all hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={kit.status === 'completed' ? 'default' : 'blue'}>
                    {kit.status === 'completed' ? 'Concluído' : 'Em progresso'}
                  </Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {kit.createdAt.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2">
                  Kit {kit.style} - {kit.tone}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {kit.age ? `Idade: ${kit.age}` : 'Festa infantil'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {kit.items.filter(i => i.status === 'completed').length}/{kit.items.length} itens
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
