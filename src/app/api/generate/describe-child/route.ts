import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, SYSTEM_INSTRUCTION } from '@/lib/gemini/client';
import { verifySession } from '@/lib/auth/verify-session';

export async function POST(request: NextRequest) {
  try {
    const { authenticated } = await verifySession();
    if (!authenticated) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { photoBase64 } = await request.json();

    if (!photoBase64) {
      return NextResponse.json(
        { error: 'Foto da criança é obrigatória' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: photoBase64 } },
            {
              text: "Descreva as características físicas faciais essenciais desta criança para que eu possa recriá-la em estilo ilustrado mantendo a semelhança. Foque em: formato do rosto, olhos, cabelo, sorriso e traços marcantes. Retorne apenas uma descrição técnica curta em português."
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const description = response.text || "Criança alegre com traços infantis suaves.";

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error describing child:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar a foto da criança' },
      { status: 500 }
    );
  }
}
