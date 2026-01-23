"use client";

import { PartyPopper } from "lucide-react";
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-800">Seu Kit de Festa Mágica</h2>
        <p className="text-gray-500 mt-3 text-lg">
          Estilo <span className="font-bold text-pink-500">{userInput.style}</span> • Tema{" "}
          <span className="font-bold text-blue-500">{userInput.tone}</span>
        </p>
        {error && <ErrorMessage message={error} />}
      </div>

      <KitGallery items={kitItems} onRetry={onRetry} />

      <div className="bg-white p-8 rounded-[40px] shadow-lg border-2 border-pink-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-pink-100 p-3 rounded-2xl">
            <PartyPopper className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Dica Festa Mágica:</h4>
            <p className="text-sm text-gray-500">
              Para melhores resultados, use papel fotográfico fosco acima de 180g.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={reset}>
          Criar Outro Kit
        </Button>
      </div>
    </div>
  );
}
