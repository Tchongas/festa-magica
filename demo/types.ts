
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

export interface UserInput {
  childPhoto: string | null;
  themePhoto: string | null;
  age: string;
  features: string;
  tone: string;
  style: IllustrationStyle;
}
