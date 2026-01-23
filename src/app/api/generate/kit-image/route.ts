import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini/client';
import { KitItemType, IllustrationStyle } from '@/types';

function getItemPrompt(type: KitItemType, age: string): string {
  switch (type) {
    case KitItemType.MAIN_CHARACTER:
      return "Corpo inteiro, fundo branco, recorte limpo, postura neutra amigável, personagem central.";
    case KitItemType.EXPRESSIONS:
      return "Grade de 4 rostos com expressões diferentes: sorrindo, rindo, surpreso e piscando. Fundo branco.";
    case KitItemType.POSES:
      return "Grade com 3 poses: acenando, pulando de alegria e segurando um balão. Fundo branco.";
    case KitItemType.CAKE_TOPPER:
      return "Ilustração central com borda branca grossa (die-cut style), alto contraste, ideal para topper de bolo.";
    case KitItemType.TAGS:
      return "Conjunto de 4 tags circulares e quadradas com elementos simplificados do tema, visual limpo.";
    case KitItemType.STICKERS:
      return "Conjunto de adesivos fofos, formas simples, poucos detalhes, cores vibrantes do tema.";
    case KitItemType.DIGITAL_INVITE:
      return "Formato vertical 9:16, composição equilibrada, espaço central livre para texto, bordas decoradas no tema.";
    case KitItemType.PRINT_INVITE:
      return "Formato horizontal A5, design limpo, sem texto, ilustração nas bordas e personagem no canto.";
    case KitItemType.AGE_NUMBER:
      return `O número ${age || '1'} estilizado e decorado com elementos do tema, arte em destaque.`;
    case KitItemType.PANEL:
      return "Cenário panorâmico de fundo para festa, sem rostos, apenas elementos do tema, céu suave, alta resolução.";
    default:
      return "Ilustração infantil fofa e colorida.";
  }
}

function getAspectRatio(type: KitItemType): string {
  if (type === KitItemType.DIGITAL_INVITE) return "9:16";
  if (type === KitItemType.PANEL) return "16:9";
  return "1:1";
}

export async function POST(request: NextRequest) {
  try {
    const {
      type,
      childDescription,
      themeDescription,
      childPhotoBase64,
      age,
      tone,
      style
    } = await request.json();

    if (!childPhotoBase64 || !childDescription) {
      return NextResponse.json(
        { error: 'Dados insuficientes para geração' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const itemPrompt = getItemPrompt(type as KitItemType, age);
    
    const styleDescription = style === '3D'
      ? "Estilo 3D DISNEY PIXAR, renderização de alta qualidade, iluminação fofa, texturas suaves, profundidade de campo, render octane."
      : "Estilo CARTOON 2D FOFO, traço limpo, contorno fino, cores chapadas com sombreamento leve, arte vetorial.";

    const fullPrompt = `Crie uma ilustração de kit de festa: ${type}. 
IDENTIDADE: Criança (${childDescription}), idade ${age || 'toddler'}, tom ${tone}. 
ESTILO: ${styleDescription}.
TEMA: ${themeDescription}.
REQUISITO ESPECÍFICO: ${itemPrompt}.
Mantenha consistência facial absoluta com a foto de referência enviada. Fundo neutro e iluminação suave.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: childPhotoBase64 } },
          { text: fullPrompt }
        ]
      },
      config: {
        responseModalities: ['image', 'text'],
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (part?.inlineData?.data) {
      const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      return NextResponse.json({ imageUrl });
    }

    throw new Error("Falha ao gerar imagem.");
  } catch (error) {
    console.error('Error generating kit image:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar imagem do kit' },
      { status: 500 }
    );
  }
}
