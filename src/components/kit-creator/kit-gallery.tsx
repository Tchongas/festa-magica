"use client";

import { Download, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { KitItem } from "@/types";
import { cn } from "@/lib/utils";

interface KitGalleryProps {
  items: KitItem[];
  onRetry: (item: KitItem) => void;
}

export function KitGallery({ items, onRetry }: KitGalleryProps) {
  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border-4 border-white transition-all hover:scale-[1.02]"
        >
          <div className="aspect-square relative bg-pink-50 flex items-center justify-center">
            {item.status === 'generating' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-2" />
                <p className="text-pink-600 font-medium animate-pulse">Criando arte...</p>
              </div>
            )}

            {item.status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-red-600 font-bold mb-3">Erro na geração</p>
                <button
                  onClick={() => onRetry(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors font-bold text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </button>
              </div>
            )}

            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.type}
                className="w-full h-full object-contain"
              />
            ) : (
              item.status !== 'error' && <ImageIcon className="w-16 h-16 text-pink-200" />
            )}
          </div>

          <div className="p-3 md:p-4 flex items-center justify-between bg-white">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-800 text-base md:text-lg leading-tight truncate">{item.type}</h3>
              <div className="flex items-center gap-1 mt-1">
                {item.status === 'completed' ? (
                  <span className="text-xs flex items-center gap-1 text-green-500 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Concluído
                  </span>
                ) : item.status === 'error' ? (
                  <span className="text-xs text-red-400 font-medium">Falhou</span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Aguardando...</span>
                )}
              </div>
            </div>

            {item.status === 'completed' && (
              <button
                onClick={() => handleDownload(item.imageUrl, item.type)}
                className="p-2 md:p-3 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-500 hover:text-white transition-colors flex-shrink-0 ml-2"
                title="Download"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
