"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownLeft, ArrowUpRight, Loader2, Search, ShieldCheck, Wallet } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea, Badge } from '@/components/ui';
import { APIError, AdminWalletView, fetchAdminWalletByEmail, fetchCreditsAdminSession, updateAdminWalletBalance } from '@/services/generation.service';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

export default function CreditosAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [wallet, setWallet] = useState<AdminWalletView | null>(null);
  const [targetBalance, setTargetBalance] = useState(0);
  const [description, setDescription] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      setLoadingSession(true);
      try {
        const session = await fetchCreditsAdminSession();
        setAuthorized(session.authorized);
        setDeniedReason(session.reason || null);
        setAdminEmail(session.adminEmail || '');
      } catch (err) {
        console.error('Failed to verify admin session:', err);
        setAuthorized(false);
        setDeniedReason(null);
      } finally {
        setLoadingSession(false);
      }
    }

    loadSession();
  }, []);

  const balanceDelta = useMemo(() => {
    if (!wallet) return 0;
    return targetBalance - wallet.balance;
  }, [wallet, targetBalance]);

  const canSubmit = useMemo(() => {
    if (!wallet) return false;
    return Number.isInteger(targetBalance)
      && targetBalance >= 0
      && description.trim().length >= 3
      && targetBalance !== wallet.balance;
  }, [wallet, targetBalance, description]);

  async function handleLookup(event: FormEvent) {
    event.preventDefault();
    if (!lookupEmail.trim()) return;

    setLoadingWallet(true);
    setError(null);
    setSuccess(null);

    try {
      const loadedWallet = await fetchAdminWalletByEmail(lookupEmail);
      setWallet(loadedWallet);
      setTargetBalance(loadedWallet.balance);
      setDescription('');
      setReferenceId('');
      setSuccess(`Carteira carregada para ${loadedWallet.email}. Saldo atual: ${loadedWallet.balance} créditos.`);
    } catch (err) {
      setWallet(null);
      if (err instanceof APIError) {
        if (err.status === 401) {
          setAuthorized(false);
          setDeniedReason('unauthenticated');
        }
        setError(err.message);
      } else {
        setError('Erro ao buscar carteira por email.');
      }
    } finally {
      setLoadingWallet(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || !wallet) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const idempotencyKey = crypto.randomUUID();
      const result = await updateAdminWalletBalance({
        userId: wallet.userId,
        targetBalance,
        description: description.trim(),
        referenceId: referenceId.trim() || undefined,
        idempotencyKey,
      });

      const refreshedWallet = await fetchAdminWalletByEmail(wallet.email);
      setWallet(refreshedWallet);
      setTargetBalance(refreshedWallet.balance);
      setDescription('');
      setReferenceId('');
      setSuccess(
        `Saldo atualizado: ${result.previousBalance} → ${result.newBalance} créditos (${result.delta >= 0 ? '+' : ''}${result.delta}).`
      );
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 401) {
          setAuthorized(false);
          setDeniedReason('unauthenticated');
        }
        setError(err.message);
      } else {
        setError('Erro ao atualizar carteira de créditos.');
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
    const denialMessage =
      deniedReason === 'not_google_auth'
        ? 'Seu usuário está na allowlist, mas o acesso admin exige login via Google.'
        : 'Seu usuário não está autorizado para ajustes de créditos.';

    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Acesso negado</CardTitle>
            <CardDescription>{denialMessage}</CardDescription>
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
            Busque a carteira por email, edite o saldo final e registre a descrição da movimentação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge className="bg-pink-100 text-pink-700">Admin: {adminEmail || 'desconhecido'}</Badge>
          <Badge className="bg-gray-100 text-gray-700">Ações auditadas no ledger</Badge>
        </CardContent>
      </Card>

      {error && !wallet && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>
      )}
      {success && !wallet && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">{success}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-pink-500" /> Buscar carteira
          </CardTitle>
          <CardDescription>Informe o email do usuário para carregar saldo e histórico.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email do usuário</label>
              <Input
                type="email"
                placeholder="usuario@email.com"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="gradient" disabled={!lookupEmail.trim() || loadingWallet}>
              {loadingWallet ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loadingWallet ? 'Buscando...' : 'Buscar carteira'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-pink-500" /> Editar carteira
            </CardTitle>
            <CardDescription>
              {wallet.name || wallet.email} • saldo atual: <strong>{wallet.balance} créditos</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Novo saldo final</label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={targetBalance}
                  onChange={(e) => setTargetBalance(Math.max(0, Number(e.target.value) || 0))}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ajuste calculado automaticamente: {balanceDelta >= 0 ? '+' : ''}{balanceDelta} créditos.
                </p>
                {targetBalance === wallet.balance && (
                  <p className="mt-1 text-xs text-gray-400">Informe um saldo diferente do atual para salvar.</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Descrição da movimentação</label>
                <Textarea
                  placeholder="Ex: ajuste após atendimento #1234"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Referência (opcional)</label>
                <Input
                  placeholder="ex: suporte-2026-03-04-001"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                />
              </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>}
            {success && <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">{success}</div>}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" variant="gradient" disabled={!canSubmit || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? 'Salvando...' : 'Salvar novo saldo'}
              </Button>
              <Link href="/creditos">
                <Button type="button" variant="secondary">Voltar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
        </Card>
      )}

      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico recente</CardTitle>
            <CardDescription>Últimas movimentações desta carteira, incluindo descrição quando informada.</CardDescription>
          </CardHeader>
          <CardContent>
            {wallet.history.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum histórico encontrado.</p>
            ) : (
              <div className="space-y-3">
                {wallet.history.map((entry) => {
                  const isCredit = entry.direction === 'credit';
                  return (
                    <div key={entry.id} className="border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-amber-700" />
                          )}
                          {entry.reason}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                        <p className="text-xs text-gray-500">Ref: {entry.referenceId || 'sem referência'}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {entry.description || 'Sem descrição registrada.'}
                        </p>
                      </div>
                      <Badge className={isCredit ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                        {isCredit ? '+' : '-'}{entry.amount}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
