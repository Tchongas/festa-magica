import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getGeminiClient } from '@/lib/gemini/client';
import { KitItemType } from '@/types';
import { verifySession } from '@/lib/auth/verify-session';
import { resolveCreditsPolicy } from '@/lib/credits/policy';
import {
  markGenerationFailedAndRefund,
  markGenerationSucceeded,
  reserveCreditsForGeneration,
} from '@/lib/credits/service';
import { CREDITS_COST_PER_IMAGE, CREDITS_FEATURE_ENABLED } from '@/lib/config';

const schema = z.object({
  type: z.nativeEnum(KitItemType),
  childDescription: z.string().min(1).max(2000),
  themeDescription: z.string().max(2000).optional().default(''),
  childPhotoBase64: z.string().min(1),
  childPhotoMimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']).default('image/jpeg'),
  age: z.string().max(50).optional().default(''),
  features: z.string().max(500).optional().default(''),
  tone: z.string().max(50).optional().default('Fofo'),
  style: z.enum(['2D', '3D']).default('2D'),
});

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
  let creditsAttemptId: string | null = null;

  try {
    const { authenticated, userId, hasActiveSubscription } = await verifySession({
      requireSubscription: !CREDITS_FEATURE_ENABLED,
    });

    if (!authenticated || !userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const policy = resolveCreditsPolicy({ hasActiveSubscription: !!hasActiveSubscription });

    if (!hasActiveSubscription && !policy.allowWithoutSubscription) {
      return NextResponse.json({ error: 'Acesso ativo necessário' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados insuficientes para geração' },
        { status: 400 }
      );
    }
    const {
      type,
      childDescription,
      themeDescription,
      childPhotoBase64,
      childPhotoMimeType,
      age,
      features,
      tone,
      style,
    } = parsed.data;

    const idempotencyKey = request.headers.get('x-idempotency-key')?.trim() || '';
    let creditsBalance: number | null = null;

    if (policy.requiresCredits) {
      if (!idempotencyKey) {
        return NextResponse.json(
          { error: 'Idempotency key obrigatória', code: 'missing_idempotency_key' },
          { status: 400 }
        );
      }

      try {
        const reserve = await reserveCreditsForGeneration({
          userId,
          kitItemType: type,
          cost: CREDITS_COST_PER_IMAGE,
          idempotencyKey,
        });

        creditsAttemptId = reserve.attemptId;
        creditsBalance = reserve.newBalance;
      } catch (reserveError) {
        if ((reserveError as Error).message === 'insufficient_credits') {
          return NextResponse.json(
            {
              error: 'Você não possui créditos suficientes para gerar este item.',
              code: 'insufficient_credits',
              details: {
                required: CREDITS_COST_PER_IMAGE,
                balance: 0,
              },
            },
            { status: 402 }
          );
        }

        if ((reserveError as Error).message === 'invalid_idempotency') {
          return NextResponse.json(
            { error: 'Idempotency key inválida', code: 'invalid_idempotency' },
            { status: 400 }
          );
        }

        throw reserveError;
      }
    }

    const ai = getGeminiClient();

    const itemPrompt = getItemPrompt(type as KitItemType, age);
    
    const styleDescription = style === '3D'
      ? "Estilo 3D DISNEY PIXAR, renderização de alta qualidade, iluminação fofa, texturas suaves, profundidade de campo, render octane."
      : "Estilo CARTOON 2D FOFO, traço limpo, contorno fino, cores chapadas com sombreamento leve, arte vetorial.";

    const fullPrompt = `Crie uma ilustração de kit de festa: ${type}. 
IDENTIDADE: Criança (${childDescription}), idade ${age || 'toddler'}, tom ${tone}. 
DETALHES: ${features || 'Sem detalhes adicionais.'}
ESTILO: ${styleDescription}.
TEMA: ${themeDescription}.
REQUISITO ESPECÍFICO: ${itemPrompt}.
Mantenha consistência facial absoluta com a foto de referência enviada. Fundo neutro e iluminação suave.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: childPhotoMimeType, data: childPhotoBase64 } },
          { text: fullPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: getAspectRatio(type as KitItemType),
        },
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (part?.inlineData?.data) {
      const imageUrl = `data:image/png;base64,${part.inlineData.data}`;

      if (creditsAttemptId) {
        try {
          await markGenerationSucceeded(creditsAttemptId);
        } catch (markError) {
          console.error('Error marking generation success:', markError);
        }
      }

      return NextResponse.json({
        imageUrl,
        credits: {
          charged: policy.requiresCredits,
          balance: creditsBalance,
        },
      });
    }

    throw new Error("Falha ao gerar imagem.");
  } catch (error) {
    if (creditsAttemptId) {
      try {
        await markGenerationFailedAndRefund(creditsAttemptId, 'model_generation_failed');
      } catch (refundError) {
        console.error('Error refunding credits after generation failure:', refundError);
      }
    }

    console.error('Error generating kit image:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar imagem do kit' },
      { status: 500 }
    );
  }
}
