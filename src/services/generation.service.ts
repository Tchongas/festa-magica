import { KitItem, KitItemType, INITIAL_KIT_ITEMS } from '@/types';

const API_BASE = '/api/generate';

export async function describeChild(photoBase64: string, mimeType = 'image/jpeg'): Promise<string> {
  const response = await fetch(`${API_BASE}/describe-child`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoBase64, mimeType }),
  });

  if (!response.ok) {
    throw new Error('Erro ao analisar foto da criança');
  }

  const data = await response.json();
  return data.description;
}

export async function describeTheme(themeBase64: string | null, mimeType = 'image/jpeg'): Promise<string> {
  const response = await fetch(`${API_BASE}/describe-theme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeBase64, mimeType }),
  });

  if (!response.ok) {
    throw new Error('Erro ao analisar tema');
  }

  const data = await response.json();
  return data.description;
}

export async function generateKitImage(
  type: KitItemType,
  childDescription: string,
  themeDescription: string,
  childPhotoBase64: string,
  childPhotoMimeType: string,
  age: string,
  tone: string,
  style: string
): Promise<string> {
  const response = await fetch(`${API_BASE}/kit-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      childDescription,
      themeDescription,
      childPhotoBase64,
      childPhotoMimeType,
      age,
      tone,
      style,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao gerar ${type}`);
  }

  const data = await response.json();
  return data.imageUrl;
}
