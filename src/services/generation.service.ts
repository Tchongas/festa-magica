import { KitItemType } from '@/types';

const API_BASE = '/api/generate';

async function postJSON<T>(endpoint: string, body: unknown, errorMsg: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function describeChild(photoBase64: string, mimeType = 'image/jpeg'): Promise<string> {
  const data = await postJSON<{ description: string }>(
    'describe-child',
    { photoBase64, mimeType },
    'Erro ao analisar foto da criança'
  );
  return data.description;
}

export async function describeTheme(themeBase64: string | null, mimeType = 'image/jpeg'): Promise<string> {
  const data = await postJSON<{ description: string }>(
    'describe-theme',
    { themeBase64, mimeType },
    'Erro ao analisar tema'
  );
  return data.description;
}

export async function generateKitImage(
  type: KitItemType,
  childDescription: string,
  themeDescription: string,
  childPhotoBase64: string,
  childPhotoMimeType: string,
  age: string,
  features: string,
  tone: string,
  style: string
): Promise<string> {
  const data = await postJSON<{ imageUrl: string }>(
    'kit-image',
    { type, childDescription, themeDescription, childPhotoBase64, childPhotoMimeType, age, features, tone, style },
    `Erro ao gerar ${type}`
  );
  return data.imageUrl;
}
