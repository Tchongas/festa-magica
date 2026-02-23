"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PartyPopper } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.session) {
        setError('Email ou senha inválidos.');
        return;
      }

      const accessToken = data.session.access_token;

      const response = await fetch('/api/auth/native-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        if (response.status === 403) {
          await supabase.auth.signOut();
          setError('Sua conta não possui assinatura ativa para este produto.');
          return;
        }
        await supabase.auth.signOut();
        setError(body?.error || 'Falha no login.');
        return;
      }

      router.push('/criar');
      router.refresh();
    } catch (err) {
      setError('Falha no login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-pink-100">
        <CardHeader className="text-center">
          <div className="mx-auto bg-pink-500 p-3 rounded-2xl w-fit mb-4">
            <PartyPopper className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Use seu email e senha cadastrados no Hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-400">
            <Link href="/" className="text-pink-500 hover:underline">
              Voltar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
