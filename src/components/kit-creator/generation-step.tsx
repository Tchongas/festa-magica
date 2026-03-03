"use client";

import { useEffect, useState } from "react";
import { PartyPopper, CheckCircle2, Download, Info, Search, Wand2, Loader2, Edit3, Wallet, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui";
import { ErrorMessage } from "@/components/shared";
import { KitGallery } from "./kit-gallery";
import { useKitCreatorStore } from "@/stores/kit-creator.store";
import { useAuth } from "@/hooks/use-auth";
import { KitItem } from "@/types";
import { downloadAllFiles } from "@/lib/download";
import { MEMBROS_URL } from "@/lib/config";

interface GenerationStepProps {
  onAnalyze: () => Promise<boolean>;
  onUpdateDescriptions: (child: string, theme: string) => void;
  onGenerate: (item: KitItem) => void;
  onRetry: (item: KitItem) => void;
}

export function GenerationStep({ onAnalyze, onUpdateDescriptions, onGenerate, onRetry }: GenerationStepProps) {
  const { userInput, kitItems, error, reset, childDescription, themeDescription, loading } = useKitCreatorStore();
  const { hasActiveSubscription, creditsEnabled, creditsBalance, creditsRequiredForGeneration } = useAuth();
  const [draftChildDescription, setDraftChildDescription] = useState('');
  const [draftThemeDescription, setDraftThemeDescription] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const canConfirm = !!draftChildDescription.trim() && !!draftThemeDescription.trim();
  const hasNoCredits = creditsEnabled && creditsRequiredForGeneration && (creditsBalance ?? 0) <= 0;

  const completedCount = kitItems.filter((i) => i.status === 'completed').length;
  const errorCount = kitItems.filter((i) => i.status === 'error').length;
  const totalCount = kitItems.length;
  const isAllDone = completedCount + errorCount === totalCount;

  useEffect(() => {
    if (childDescription) {
      setDraftChildDescription(childDescription);
    }
    if (themeDescription) {
      setDraftThemeDescription(themeDescription);
    }
    setIsConfirmed(false);
  }, [childDescription, themeDescription]);

  const hasDescriptions = !!childDescription && !!themeDescription;

  const handleAnalyze = async () => {
    if (hasNoCredits) {
      setShowNoCreditsModal(true);
      return;
    }

    const ok = await onAnalyze();
    if (ok) setIsConfirmed(false);
  };

  useEffect(() => {
    if (error?.toLowerCase().includes('créditos insuficientes')) {
      setShowNoCreditsModal(true);
    }
  }, [error]);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onUpdateDescriptions(draftChildDescription.trim(), draftThemeDescription.trim());
    setIsConfirmed(true);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="text-center mb-4 md:mb-10 px-1">
        <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800">
          {isConfirmed ? "Seu Kit de Festa Mágica" : "Confirme os Detalhes"}
        </h2>
        <p className="text-gray-500 mt-2 md:mt-3 text-base md:text-lg">
          Estilo <span className="font-bold text-pink-500">{userInput.style}</span> • Tom{" "}
          <span className="font-bold text-blue-500">{userInput.tone}</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 md:gap-3 flex-wrap">
          {isAllDone ? (
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Kit completo!
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              {completedCount} de {totalCount} itens prontos
            </span>
          )}
        </div>
        {error && <ErrorMessage message={error} />}
      </div>

      {creditsEnabled && (
        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="bg-pink-500 p-2 rounded-xl w-fit">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-pink-400 font-bold">Créditos disponíveis</p>
            <p className="text-lg font-extrabold text-pink-600">
              {typeof creditsBalance === 'number' ? `${creditsBalance} créditos` : 'Indisponível'}
            </p>
            {!hasActiveSubscription && creditsRequiredForGeneration && (
              <p className="text-xs text-pink-500 mt-1">Cada geração consome créditos.</p>
            )}
          </div>
          {hasNoCredits && (
            <a href={MEMBROS_URL} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" variant="gradient">
                Comprar créditos
              </Button>
            </a>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/70 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Análise da IA</h3>
          {loading && (
            <span className="sm:ml-auto flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full self-start sm:self-auto">
              <Loader2 className="w-3 h-3 animate-spin" /> ANALISANDO...
            </span>
          )}
        </div>

        {hasDescriptions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">A Criança</p>
              <div className="relative">
                <textarea
                  value={draftChildDescription}
                  onChange={(e) => setDraftChildDescription(e.target.value)}
                  disabled={isConfirmed}
                  className="w-full rounded-xl p-3 text-sm text-gray-700 bg-white/80 border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none min-h-[120px]"
                  rows={4}
                />
                {!isConfirmed && <Edit3 className="w-4 h-4 absolute top-3 right-3 text-gray-300" />}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2">Atmosfera do Tema</p>
              <div className="relative">
                <textarea
                  value={draftThemeDescription}
                  onChange={(e) => setDraftThemeDescription(e.target.value)}
                  disabled={isConfirmed}
                  className="w-full rounded-xl p-3 text-sm text-gray-700 bg-white/80 border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none min-h-[120px]"
                  rows={4}
                />
                {!isConfirmed && <Edit3 className="w-4 h-4 absolute top-3 right-3 text-gray-300" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-4">Faça a análise antes de gerar os itens.</p>
            <Button variant="gradient" size="lg" onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
              Analisar Magia <Search className="w-4 h-4" />
            </Button>
          </div>
        )}

        {hasDescriptions && !isConfirmed && (
          <div className="mt-5 flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-3 text-center">
              <Info className="w-3 h-3 inline mr-1" /> Você pode editar as descrições antes de confirmar.
            </p>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="secondary" onClick={handleAnalyze} disabled={loading} className="w-full sm:w-auto">
                Reanalisar <Search className="w-4 h-4" />
              </Button>
              <Button variant="gradient" size="lg" onClick={handleConfirm} disabled={!canConfirm} className="w-full sm:w-auto">
                Confirmar e Ver Kit <CheckCircle2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {isConfirmed && (
        <KitGallery
          items={kitItems}
          onGenerate={onGenerate}
          onRetry={onRetry}
          creditsRequiredForGeneration={creditsRequiredForGeneration}
          creditsBalance={creditsBalance}
          onBuyCredits={() => {
            window.location.href = MEMBROS_URL;
          }}
        />
      )}

      {isConfirmed && (
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
          {completedCount > 0 && (
            <Button
              variant="gradient"
              onClick={() =>
                downloadAllFiles(
                  kitItems
                    .filter((i) => i.status === 'completed')
                    .map((i) => ({ imageUrl: i.imageUrl, name: i.type }))
                )
              }
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
      )}

      {showNoCreditsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-100 p-6 relative">
            <button
              onClick={() => setShowNoCreditsModal(false)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="bg-red-100 text-red-600 p-3 rounded-2xl w-fit mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="text-xl font-extrabold text-gray-800 mb-2">Créditos insuficientes</h4>
            <p className="text-sm text-gray-600 mb-4">
              Você não possui saldo suficiente para gerar novos itens agora.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Saldo atual: <span className="font-bold text-pink-600">{Math.max(0, creditsBalance ?? 0)} créditos</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" className="w-full" onClick={() => setShowNoCreditsModal(false)}>
                Fechar
              </Button>
              <a href={MEMBROS_URL} className="w-full">
                <Button variant="gradient" className="w-full">
                  Comprar créditos
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
