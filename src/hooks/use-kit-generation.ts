"use client";

import { useCallback, useRef } from 'react';
import { useKitCreatorStore } from '@/stores/kit-creator.store';
import { useAuthStore } from '@/stores/auth.store';
import { APIError, describeChild, describeTheme, fetchCreditsBalance, generateKitImage } from '@/services/generation.service';
import { KitItem, INITIAL_KIT_ITEMS } from '@/types';

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useKitGeneration() {
  const {
    userInput,
    setStep,
    setLoading,
    setError,
    setKitItems,
    updateKitItem,
    setDescriptions,
  } = useKitCreatorStore();

  const {
    user,
    hasActiveSubscription,
    creditsEnabled,
    creditsBalance,
    creditsRequiredForGeneration,
    setCredits,
    setCreditsBalance,
  } = useAuthStore();
  const descriptionsCache = useRef<{ child: string; theme: string } | null>(null);

  const updateCachedDescriptions = useCallback((child: string, theme: string) => {
    descriptionsCache.current = { child, theme };
    setDescriptions(child, theme);
  }, [setDescriptions]);

  const ensureCanGenerate = useCallback((): boolean => {
    if (!userInput.childPhoto) {
      setError("A foto da criança é obrigatória!");
      return false;
    }

    if (!user) {
      setError("Você precisa estar autenticado para gerar kits.");
      return false;
    }

    if (!hasActiveSubscription && !creditsEnabled) {
      setError("A geração está indisponível no momento. Tente novamente em instantes.");
      return false;
    }

    if (creditsEnabled && creditsRequiredForGeneration && creditsBalance == null) {
      setError('Não foi possível validar seu saldo de créditos agora. Atualize a página e tente novamente.');
      return false;
    }

    if (creditsEnabled && creditsRequiredForGeneration && (creditsBalance ?? 0) <= 0) {
      setError("Você está sem créditos. Compre mais créditos para continuar gerando.");
      return false;
    }

    return true;
  }, [
    userInput.childPhoto,
    user,
    hasActiveSubscription,
    creditsEnabled,
    creditsBalance,
    creditsRequiredForGeneration,
    setError,
  ]);

  const ensureDescriptions = useCallback(async (): Promise<{ child: string; theme: string } | null> => {
    if (descriptionsCache.current) {
      return descriptionsCache.current;
    }

    try {
      const childDesc = await describeChild(
        userInput.childPhoto!,
        userInput.childPhotoMimeType || 'image/jpeg'
      );
      const themeDesc = await describeTheme(
        userInput.themePhoto,
        userInput.themePhotoMimeType || 'image/jpeg'
      );

      updateCachedDescriptions(childDesc, themeDesc);
      return { child: childDesc, theme: themeDesc };
    } catch {
      setError("Ocorreu um erro ao processar os dados. Verifique sua conexão.");
      return null;
    }
  }, [userInput, updateCachedDescriptions, setError]);

  const generateSingleItem = useCallback(async (
    item: KitItem,
    childDesc: string,
    themeDesc: string
  ) => {
    updateKitItem(item.id, { status: 'generating' });

    try {
      const result = await generateKitImage(
        item.type,
        childDesc,
        themeDesc,
        userInput.childPhoto!,
        userInput.childPhotoMimeType || 'image/jpeg',
        userInput.age,
        userInput.features,
        userInput.tone,
        userInput.style,
        newIdempotencyKey()
      );

      updateKitItem(item.id, { status: 'completed', imageUrl: result.imageUrl });

      if (creditsEnabled && result.creditsCharged && typeof result.creditsBalance === 'number') {
        setCreditsBalance(result.creditsBalance);
      }

      return true;
    } catch (err) {
      console.error(`Error generating ${item.type}:`, err);

      if (err instanceof APIError && err.code === 'insufficient_credits') {
        setError('Créditos insuficientes para gerar este item.');

        try {
          const refreshed = await fetchCreditsBalance();
          setCredits({
            enabled: refreshed.enabled,
            balance: refreshed.balance,
            requiredForGeneration: refreshed.requiredForGeneration,
          });
        } catch (refreshError) {
          console.error('Failed to refresh credits balance:', refreshError);
        }
      } else if (err instanceof APIError && err.status === 401) {
        setError('Sua sessão expirou. Faça login novamente para continuar gerando.');
      } else if (err instanceof APIError && err.status === 402) {
        setError('Você está sem créditos para concluir essa geração.');
      } else {
        setError('Não foi possível gerar este item agora. Tente novamente em instantes.');
      }

      updateKitItem(item.id, { status: 'error' });
      return false;
    }
  }, [userInput, updateKitItem, creditsEnabled, setCreditsBalance, setCredits, setError]);

  const enterGenerationStep = useCallback(() => {
    if (!ensureCanGenerate()) return;

    descriptionsCache.current = null;
    setError(null);
    setStep(3);
    setKitItems(INITIAL_KIT_ITEMS);
  }, [ensureCanGenerate, setError, setStep, setKitItems]);

  const generateItemOnDemand = useCallback(async (item: KitItem) => {
    if (!ensureCanGenerate()) return;

    setLoading(true);
    setError(null);

    try {
      const descriptions = await ensureDescriptions();
      if (!descriptions) return;
      await generateSingleItem(item, descriptions.child, descriptions.theme);
    } finally {
      setLoading(false);
    }
  }, [ensureCanGenerate, ensureDescriptions, generateSingleItem, setLoading, setError]);

  const analyzeInputs = useCallback(async () => {
    if (!ensureCanGenerate()) return false;

    setLoading(true);
    setError(null);

    try {
      const descriptions = await ensureDescriptions();
      return !!descriptions;
    } finally {
      setLoading(false);
    }
  }, [ensureCanGenerate, ensureDescriptions, setLoading, setError]);

  const retryItem = useCallback(async (item: KitItem) => {
    await generateItemOnDemand(item);
  }, [generateItemOnDemand]);

  return {
    enterGenerationStep,
    analyzeInputs,
    updateCachedDescriptions,
    generateItemOnDemand,
    retryItem,
  };
}
