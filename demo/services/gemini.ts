
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { KitItemType, IllustrationStyle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

const SYSTEM_INSTRUCTION = `Você é uma IA especializada em criar ILUSTRAÇÕES INFANTIS PROFISSIONAIS para festas, com ALTA CONSISTÊNCIA VISUAL e FACIAL.
OBJETIVO: Gerar um KIT COMPLETO DE FESTA INFANTIL em estilo FOFO e PROFISSIONAL.
REGRAS: Apenas uma criança, rosto alegre, proporções infantis, sem texto nas imagens, sem rostos extras.
Mantenha forte semelhança facial com a criança fornecida.`;

export async function describeChild(photoBase64: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
          { text: "Descreva as características físicas faciais essenciais desta criança para que eu possa recriá-la em estilo ilustrado mantendo a semelhança. Foque em: formato do rosto, olhos, cabelo, sorriso e traços marcantes. Retorne apenas uma descrição técnica curta em português." }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });
  return response.text || "Criança alegre com traços infantis suaves.";
}

export async function describeTheme(themeBase64: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: themeBase64 } },
          { text: "Analise o tema e a atmosfera desta imagem. IMPORTANTE: Se houver personagens ou marcas protegidas por direitos autorais (Disney, super-heróis, etc), NÃO cite nomes próprios. Em vez disso, descreva os elementos visuais originais: paleta de cores, padrões, objetos da natureza ou formas que definem o clima. Retorne apenas uma descrição criativa e genérica em português que capture a essência sem citar marcas." }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });
  return response.text || "Tema festivo colorido e alegre.";
}

export async function generateKitImage(
  type: KitItemType, 
  childDescription: string, 
  themeDescription: string, 
  childPhotoBase64: string,
  age: string,
  tone: string,
  style: IllustrationStyle
): Promise<string> {
  let itemPrompt = "";

  switch (type) {
    case KitItemType.MAIN_CHARACTER:
      itemPrompt = "Corpo inteiro, fundo branco, recorte limpo, postura neutra amigável, personagem central.";
      break;
    case KitItemType.EXPRESSIONS:
      itemPrompt = "Grade de 4 rostos com expressões diferentes: sorrindo, rindo, surpreso e piscando. Fundo branco.";
      break;
    case KitItemType.POSES:
      itemPrompt = "Grade com 3 poses: acenando, pulando de alegria e segurando um balão. Fundo branco.";
      break;
    case KitItemType.CAKE_TOPPER:
      itemPrompt = "Ilustração central com borda branca grossa (die-cut style), alto contraste, ideal para topper de bolo.";
      break;
    case KitItemType.TAGS:
      itemPrompt = "Conjunto de 4 tags circulares e quadradas com elementos simplificados do tema, visual limpo.";
      break;
    case KitItemType.STICKERS:
      itemPrompt = "Conjunto de adesivos fofos, formas simples, poucos detalhes, cores vibrantes do tema.";
      break;
    case KitItemType.DIGITAL_INVITE:
      itemPrompt = "Formato vertical 9:16, composição equilibrada, espaço central livre para texto, bordas decoradas no tema.";
      break;
    case KitItemType.PRINT_INVITE:
      itemPrompt = "Formato horizontal A5, design limpo, sem texto, ilustração nas bordas e personagem no canto.";
      break;
    case KitItemType.AGE_NUMBER:
      itemPrompt = `O número ${age || '1'} estilizado e decorado com elementos do tema, arte em destaque.`;
      break;
    case KitItemType.PANEL:
      itemPrompt = "Cenário panorâmico de fundo para festa, sem rostos, apenas elementos do tema, céu suave, alta resolução.";
      break;
  }

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
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: childPhotoBase64 } },
        { text: fullPrompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: type === KitItemType.DIGITAL_INVITE ? "9:16" : (type === KitItemType.PANEL ? "16:9" : "1:1")
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  
  throw new Error("Falha ao gerar imagem.");
}
