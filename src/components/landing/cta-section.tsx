"use client";

import { Sparkles, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';

const MEMBROS_URL = process.env.NEXT_PUBLIC_HUB_URL || 'https://membros.allanfulcher.com/';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
          <Calendar className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Acesso ilimitado por 3 meses</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          Pronto para Criar a Festa dos Sonhos?
        </h2>

        <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
          Junte-se a milhares de pais que já transformaram fotos em convites mágicos. 
          Comece agora e surpreenda seus convidados!
        </p>

        <a href={MEMBROS_URL}>
          <Button
            size="lg"
            className="bg-white text-pink-600 hover:bg-gray-100 shadow-2xl text-lg px-10"
          >
            Adquira ou Acesse <ExternalLink className="w-5 h-5 ml-2" />
          </Button>
        </a>
      </div>
    </section>
  );
}
