"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Badge } from '@/components/ui';
import { APIError, fetchCreditsAdminSession, submitAdminCreditsGrant } from '@/services/generation.service';

type GrantReason = 'manual_grant' | 'adjustment';

function normalizeReference(value: string): string {
  return value.trim().slice(0, 120);
}

export default function CreditosAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState<GrantReason>('manual_grant');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      setLoadingSession(true);
      try {
        const session = await fetchCreditsAdminSession();
        setAuthorized(session.authorized);
        setAdminEmail(session.adminEmail || '');
      } catch (err) {
        console.error('Failed to verify admin session:', err);
        setAuthorized(false);
      } finally {
        setLoadingSession(false);
      }
    }

    loadSession();
  }, []);

  const canSubmit = useMemo(() => {
    return !!email.trim() && Number.isInteger(amount) && amount > 0 && !!normalizeReference(referenceId);
  }, [email, amount, referenceId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const result = await submitAdminCreditsGrant({
        email: email.trim().toLowerCase(),
        amount,
        reason,
        referenceId: normalizeReference(referenceId),
        idempotencyKey,
        meta: {
          notes: notes.trim() || null,
          panel: 'credits_admin',
        },
      });

      setSuccess(`Concluído: usuário ${result.userId} agora tem saldo ${result.newBalance} créditos.`);
      setNotes('');
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Erro ao aplicar ajuste de créditos.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingSession) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Card>
          <CardContent className="py-8 flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Validando permissões...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Acesso negado</CardTitle>
            <CardDescription>Seu usuário não está autorizado para ajustes de créditos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/creditos" className="text-sm font-semibold text-pink-600 hover:text-pink-700">
              Voltar para histórico de créditos
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-6">
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-pink-500" /> Painel Admin de Créditos
          </CardTitle>
          <CardDescription>
            Conceda créditos manualmente ou faça ajustes pontuais com rastreabilidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge className="bg-pink-100 text-pink-700">Admin: {adminEmail || 'desconhecido'}</Badge>
          <Badge className="bg-gray-100 text-gray-700">Ações auditadas no ledger</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-pink-500" /> Nova movimentação
          </CardTitle>
          <CardDescription>Use um identificador de referência único para rastreabilidade.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email do usuário</label>
              <Input
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Quantidade de créditos</label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de operação</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as GrantReason)}
                >
                  <option value="manual_grant">Concessão manual</option>
                  <option value="adjustment">Ajuste</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Referência da operação</label>
              <Input
                placeholder="ex: suporte-2026-03-03-001"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Observações (opcional)</label>
              <Textarea
                placeholder="Detalhes da concessão/ajuste para auditoria interna"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>}
            {success && <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">{success}</div>}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" variant="gradient" disabled={!canSubmit || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? 'Aplicando...' : 'Aplicar movimentação'}
              </Button>
              <Link href="/creditos">
                <Button type="button" variant="secondary">Voltar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
