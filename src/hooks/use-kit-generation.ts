"use client";

import { useCallback, useRef } from 'react';
import { useKitCreatorStore } from '@/stores/kit-creator.store';
import { useAuthStore } from '@/stores/auth.store';
import { describeChild, describeTheme, generateKitImage } from '@/services/generation.service';
import { KitItem, INITIAL_KIT_ITEMS } from '@/types';

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

  const { user, hasActiveSubscription } = useAuthStore();
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

    if (!user || !hasActiveSubscription) {
      setError("Você precisa ter uma assinatura ativa para gerar kits.");
      return false;
    }

    return true;
  }, [userInput.childPhoto, user, hasActiveSubscription, setError]);

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
      const imageUrl = await generateKitImage(
        item.type,
        childDesc,
        themeDesc,
        userInput.childPhoto!,
        userInput.childPhotoMimeType || 'image/jpeg',
        userInput.age,
        userInput.features,
        userInput.tone,
        userInput.style
      );

      updateKitItem(item.id, { status: 'completed', imageUrl });
      return true;
    } catch (err) {
      console.error(`Error generating ${item.type}:`, err);
      updateKitItem(item.id, { status: 'error' });
      return false;
    }
  }, [userInput, updateKitItem]);

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
