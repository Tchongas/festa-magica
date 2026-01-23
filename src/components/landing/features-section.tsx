"use client";

import { 
  Camera, 
  Wand2, 
  Download, 
  Palette, 
  Zap, 
  Shield,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Envie uma Foto',
    description: 'Basta enviar uma foto do rosto da criança. Nossa IA mantém a semelhança facial.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Wand2,
    title: 'IA Gera a Magia',
    description: 'Escolha o tema e estilo. A IA cria ilustrações únicas em segundos.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Download,
    title: 'Baixe e Use',
    description: 'Receba seu kit completo pronto para imprimir ou compartilhar digitalmente.',
    color: 'bg-blue-100 text-blue-600',
  },
];

const benefits = [
  {
    icon: Palette,
    title: 'Estilos Variados',
    description: 'Cartoon 2D ou 3D estilo Pixar',
  },
  {
    icon: Zap,
    title: 'Super Rápido',
    description: 'Kit completo em menos de 5 minutos',
  },
  {
    icon: Shield,
    title: 'Seguro',
    description: 'Suas fotos não são armazenadas',
  },
  {
    icon: ImageIcon,
    title: 'Alta Qualidade',
    description: 'Imagens prontas para impressão',
  },
];

export function FeaturesSection() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" /> Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Três Passos Simples
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crie convites e decorações personalizadas sem precisar de designer
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:border-pink-200 transition-all hover:scale-105"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                {index + 1}
              </div>
              <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
