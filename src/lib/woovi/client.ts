const WOOVI_API_KEY = process.env.WOOVI_API_KEY;
const WOOVI_API_URL = 'https://api.woovi.com/api/v1';

export interface WooviChargeRequest {
  correlationID: string;
  value: number;
  comment?: string;
  customer?: {
    name: string;
    email: string;
    taxID?: string;
  };
  expiresIn?: number;
}

export interface WooviChargeResponse {
  charge: {
    correlationID: string;
    value: number;
    status: string;
    brCode: string;
    pixKey: string;
    qrCodeImage: string;
    expiresAt: string;
    paymentLinkUrl: string;
  };
}

export interface WooviWebhookPayload {
  event: string;
  charge: {
    correlationID: string;
    value: number;
    status: string;
  };
  pix?: {
    value: number;
    time: string;
  };
}

export async function createPixCharge(data: WooviChargeRequest): Promise<WooviChargeResponse> {
  const response = await fetch(`${WOOVI_API_URL}/charge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': WOOVI_API_KEY!,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Woovi error:', error);
    throw new Error('Erro ao criar cobrança Pix');
  }

  return response.json();
}

export async function getChargeStatus(correlationID: string): Promise<WooviChargeResponse> {
  const response = await fetch(`${WOOVI_API_URL}/charge/${correlationID}`, {
    headers: {
      'Authorization': WOOVI_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar status da cobrança');
  }

  return response.json();
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  return true;
}
