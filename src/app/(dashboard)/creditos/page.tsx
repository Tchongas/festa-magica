"use client";

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { fetchCreditsAdminSession, fetchCreditsLedger, CreditsLedgerEntry } from '@/services/generation.service';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR');
}

function formatReason(reason: string): string {
  const map: Record<string, string> = {
    purchase: 'Compra',
    manual_grant: 'Concessão manual',
    generation: 'Geração',
    refund: 'Reembolso',
    adjustment: 'Ajuste',
    reversal: 'Reversão',
  };

  return map[reason] || reason;
}

export default function CreditosPage() {
  const { creditsBalance } = useAuth();
  const [entries, setEntries] = useState<CreditsLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManageCredits, setCanManageCredits] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [data, adminSession] = await Promise.all([
          fetchCreditsLedger(100),
          fetchCreditsAdminSession().catch(() => ({ authorized: false })),
        ]);
        setEntries(data);
        setCanManageCredits(!!adminSession.authorized);
      } catch (err) {
        console.error('Failed to load credits ledger:', err);
        setError('Não foi possível carregar o histórico de créditos.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const hasEntries = useMemo(() => entries.length > 0, [entries]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Wallet className="w-6 h-6 text-pink-500" /> Créditos
          </CardTitle>
          <CardDescription>Saldo e histórico de movimentações da sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3">
              <span className="text-sm text-pink-500 font-semibold">Saldo atual</span>
              <span className="text-xl font-extrabold text-pink-600">
                {typeof creditsBalance === 'number' ? `${creditsBalance} créditos` : 'Indisponível'}
              </span>
            </div>

            {canManageCredits && (
              <Link
                href="/creditos/admin"
                className="text-sm font-semibold text-pink-600 hover:text-pink-700"
              >
                Abrir painel de ajustes de créditos →
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Créditos</CardTitle>
          <CardDescription>Últimas movimentações (crédito e débito).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
            </div>
          )}

          {!loading && error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>
          )}

          {!loading && !error && !hasEntries && (
            <div className="text-sm text-gray-500">Nenhuma movimentação de créditos encontrada.</div>
          )}

          {!loading && !error && hasEntries && (
            <div className="space-y-3">
              {entries.map((entry) => {
                const isCredit = entry.direction === 'credit';
                return (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-pink-100 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={isCredit ? 'bg-green-100 p-2 rounded-lg' : 'bg-amber-100 p-2 rounded-lg'}>
                        {isCredit ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-amber-700" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{formatReason(entry.reason)}</p>
                        <p className="text-xs text-gray-500 truncate">{entry.referenceId || 'Sem referência'}</p>
                        <p className="text-xs text-gray-400">{formatDate(entry.createdAt)}</p>
                      </div>
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
    </div>
  );
}
