import { create } from 'zustand';
import { UserInput, KitItem, INITIAL_KIT_ITEMS, ToneType, IllustrationStyle } from '@/types';

interface KitCreatorState {
  step: number;
  loading: boolean;
  error: string | null;
  userInput: UserInput;
  kitItems: KitItem[];
  childDescription: string | null;
  themeDescription: string | null;
  
  setStep: (step: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserInput: (input: Partial<UserInput>) => void;
  setChildPhoto: (photo: string | null, mimeType?: string | null) => void;
  setThemePhoto: (photo: string | null, mimeType?: string | null) => void;
  setKitItems: (items: KitItem[]) => void;
  updateKitItem: (id: string, updates: Partial<KitItem>) => void;
  setDescriptions: (child: string, theme: string) => void;
  reset: () => void;
}

const initialUserInput: UserInput = {
  childPhoto: null,
  childPhotoMimeType: null,
  themePhoto: null,
  themePhotoMimeType: null,
  age: '',
  features: '',
  tone: 'Fofo',
  style: '2D',
};

export const useKitCreatorStore = create<KitCreatorState>((set) => ({
  step: 1,
  loading: false,
  error: null,
  userInput: initialUserInput,
  kitItems: INITIAL_KIT_ITEMS,
  childDescription: null,
  themeDescription: null,

  setStep: (step) => set({ step }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  setUserInput: (input) => set((state) => ({
    userInput: { ...state.userInput, ...input }
  })),
  
  setChildPhoto: (photo, mimeType) => set((state) => ({
    userInput: { ...state.userInput, childPhoto: photo, childPhotoMimeType: mimeType ?? null }
  })),
  
  setThemePhoto: (photo, mimeType) => set((state) => ({
    userInput: { ...state.userInput, themePhoto: photo, themePhotoMimeType: mimeType ?? null }
  })),
  
  setKitItems: (items) => set({ kitItems: items }),
  
  updateKitItem: (id, updates) => set((state) => ({
    kitItems: state.kitItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  
  setDescriptions: (child, theme) => set({
    childDescription: child,
    themeDescription: theme
  }),
  
  reset: () => set({
    step: 1,
    loading: false,
    error: null,
    userInput: initialUserInput,
    kitItems: INITIAL_KIT_ITEMS,
    childDescription: null,
    themeDescription: null,
  }),
}));
