import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, SYSTEM_INSTRUCTION } from '@/lib/gemini/client';
import { verifySession } from '@/lib/auth/verify-session';

export async function POST(request: NextRequest) {
  try {
    const { authenticated } = await verifySession();
    if (!authenticated) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { themeBase64 } = await request.json();

    if (!themeBase64) {
      return NextResponse.json({
        description: "Festa infantil clássica com cores pastéis e balões."
      });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: themeBase64 } },
            {
              text: "Analise o tema e a atmosfera desta imagem. Descreva as cores principais, elementos decorativos e o clima geral para um kit de festa infantil original. Retorne apenas uma descrição curta em português."
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const description = response.text || "Tema festivo colorido e alegre.";

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error describing theme:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar o tema' },
      { status: 500 }
    );
  }
}
