export enum KitItemType {
  MAIN_CHARACTER = 'Personagem Principal',
  EXPRESSIONS = 'Expressões',
  POSES = 'Poses',
  CAKE_TOPPER = 'Topper de Bolo',
  TAGS = 'Tags de Lembrancinha',
  STICKERS = 'Adesivos',
  DIGITAL_INVITE = 'Convite Digital',
  PRINT_INVITE = 'Convite Impresso',
  AGE_NUMBER = 'Número da Idade',
  PANEL = 'Painel Decorativo'
}

export interface KitItem {
  id: string;
  type: KitItemType;
  imageUrl: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  description: string;
}

export type IllustrationStyle = '2D' | '3D';

export type ToneType = 'Fofo' | 'Aventureiro' | 'Mágico' | 'Divertido';

export interface UserInput {
  childPhoto: string | null;
  childPhotoMimeType: string | null;
  themePhoto: string | null;
  themePhotoMimeType: string | null;
  age: string;
  features: string;
  tone: ToneType;
  style: IllustrationStyle;
}

export interface Kit {
  id: string;
  userId: string;
  childDescription: string;
  themeDescription: string;
  style: IllustrationStyle;
  tone: string;
  age: string;
  items: KitItem[];
  createdAt: Date;
  status: 'generating' | 'completed' | 'partial';
}

export const INITIAL_KIT_ITEMS: KitItem[] = Object.values(KitItemType).map((type, index) => ({
  id: `item-${index}`,
  type,
  imageUrl: '',
  status: 'pending' as const,
  description: ''
}));
