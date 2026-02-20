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

  const startGeneration = useCallback(async () => {
    if (!userInput.childPhoto) {
      setError("A foto da criança é obrigatória!");
      return;
    }

    if (!user || !hasActiveSubscription) {
      setError("Você precisa ter uma assinatura ativa para gerar kits.");
      return;
    }

    setLoading(true);
    setError(null);
    setStep(3);
    setKitItems(INITIAL_KIT_ITEMS);

    try {
      const childDesc = await describeChild(
        userInput.childPhoto,
        userInput.childPhotoMimeType || 'image/jpeg'
      );
      const themeDesc = await describeTheme(
        userInput.themePhoto,
        userInput.themePhotoMimeType || 'image/jpeg'
      );

      descriptionsCache.current = { child: childDesc, theme: themeDesc };
      setDescriptions(childDesc, themeDesc);

      const CONCURRENCY = 3;
      const items = [...INITIAL_KIT_ITEMS];
      const chunks: KitItem[][] = [];
      for (let i = 0; i < items.length; i += CONCURRENCY) {
        chunks.push(items.slice(i, i + CONCURRENCY));
      }
      for (const chunk of chunks) {
        await Promise.all(chunk.map((item) => generateSingleItem(item, childDesc, themeDesc)));
      }
    } catch (err) {
      setError("Ocorreu um erro ao processar os dados. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [userInput, user, hasActiveSubscription, setStep, setLoading, setError, setKitItems, setDescriptions, generateSingleItem]);

  const retryItem = useCallback(async (item: KitItem) => {
    if (!userInput.childPhoto || !descriptionsCache.current || !user || !hasActiveSubscription) {
      setError("Você precisa ter uma assinatura ativa.");
      return;
    }

    await generateSingleItem(
      item,
      descriptionsCache.current.child,
      descriptionsCache.current.theme
    );
  }, [userInput, user, hasActiveSubscription, generateSingleItem, setError]);

  return {
    startGeneration,
    retryItem,
  };
}
