"use client";

import { PartyPopper, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { ErrorMessage } from "@/components/shared";
import { KitGallery } from "./kit-gallery";
import { useKitCreatorStore } from "@/stores/kit-creator.store";
import { KitItem } from "@/types";

interface GenerationStepProps {
  onRetry: (item: KitItem) => void;
}

export function GenerationStep({ onRetry }: GenerationStepProps) {
  const { userInput, kitItems, error, reset } = useKitCreatorStore();

  const completedCount = kitItems.filter((i) => i.status === 'completed').length;
  const errorCount = kitItems.filter((i) => i.status === 'error').length;
  const totalCount = kitItems.length;
  const isAllDone = completedCount + errorCount === totalCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800">Seu Kit de Festa Mágica</h2>
        <p className="text-gray-500 mt-2 md:mt-3 text-base md:text-lg">
          Estilo <span className="font-bold text-pink-500">{userInput.style}</span> • Tom{" "}
          <span className="font-bold text-blue-500">{userInput.tone}</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {isAllDone ? (
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Kit completo!
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full text-sm font-bold">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              {completedCount} de {totalCount} itens prontos
            </span>
          )}
        </div>
        {error && <ErrorMessage message={error} />}
      </div>

      <KitGallery items={kitItems} onRetry={onRetry} />

      <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[40px] shadow-lg border-2 border-pink-50 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="bg-pink-100 p-2 md:p-3 rounded-xl md:rounded-2xl flex-shrink-0">
            <PartyPopper className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-gray-800 text-sm md:text-base">Dica Festa Mágica:</h4>
            <p className="text-xs md:text-sm text-gray-500">
              Para melhores resultados, use papel fotográfico fosco acima de 180g.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {isAllDone && completedCount > 0 && (
            <Button
              variant="gradient"
              onClick={() => {
                kitItems
                  .filter((i) => i.status === 'completed')
                  .forEach((i, idx) => {
                    setTimeout(() => {
                      const link = document.createElement('a');
                      link.href = i.imageUrl;
                      link.download = `${i.type}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }, idx * 200);
                  });
              }}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4" /> Baixar Todos
            </Button>
          )}
          <Button variant="secondary" onClick={reset} className="w-full sm:w-auto">
            Criar Outro Kit
          </Button>
        </div>
      </div>
    </div>
  );
}
