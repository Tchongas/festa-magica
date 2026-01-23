"use client";

import { KitItemType } from '@/types';

const kitItems = [
  { type: KitItemType.MAIN_CHARACTER, emoji: '👤' },
  { type: KitItemType.DIGITAL_INVITE, emoji: '📱' },
  { type: KitItemType.PRINT_INVITE, emoji: '💌' },
  { type: KitItemType.CAKE_TOPPER, emoji: '🎂' },
  { type: KitItemType.STICKERS, emoji: '🏷️' },
  { type: KitItemType.TAGS, emoji: '🎁' },
  { type: KitItemType.PANEL, emoji: '🖼️' },
  { type: KitItemType.AGE_NUMBER, emoji: '🔢' },
  { type: KitItemType.EXPRESSIONS, emoji: '😊' },
  { type: KitItemType.POSES, emoji: '🕺' },
];

export function KitShowcaseSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
            Kit Completo
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Tudo que Você Precisa para a Festa
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cada kit inclui 10 itens personalizados com o rosto da criança
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {kitItems.map((item) => (
            <div
              key={item.type}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-pink-300 transition-all hover:scale-105 text-center"
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h4 className="font-bold text-gray-800 text-sm">{item.type}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
