"use client";

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader2, Mail, KeyRound, UserRound } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input } from '@/components/ui';

const DEFAULT_REDIRECT_PATH = '/criar';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function EntrarPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-pink-100">
        <CardContent className="py-10">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<EntrarPageFallback />}>
      <EntrarPageContent />
    </Suspense>
  );
}

function EntrarPageContent() {
  const searchParams = useSearchParams();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const error = searchParams.get('error');
  const redirectTo = searchParams.get('redirect_to');
  const isBusy = isLoadingGoogle || isSubmittingEmail;

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    const url = redirectTo
      ? `/api/auth/google?redirect_to=${encodeURIComponent(redirectTo)}`
      : '/api/auth/google';
    window.location.href = url;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setMessage(null);

    if (!email.trim() || !password.trim()) {
      setEmailError('Preencha email e senha.');
      return;
    }

    if (mode === 'register' && password.trim().length < 6) {
      setEmailError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: mode === 'register' ? name : undefined,
          redirect_to: redirectTo || DEFAULT_REDIRECT_PATH,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.error || 'Erro ao autenticar com email');
        return;
      }

      if (data.requires_email_confirmation) {
        setMessage(data.message || 'Conta criada. Verifique seu email para confirmar o cadastro.');
        setMode('login');
        return;
      }

      window.location.href = data.redirect_to || DEFAULT_REDIRECT_PATH;
    } catch {
      setEmailError('Erro ao autenticar com email. Tente novamente.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const topError =
    error === 'auth_failed'
      ? 'Falha na autenticação. Tente novamente.'
      : error === 'oauth_failed'
        ? 'Falha no login com Google. Tente novamente.'
        : error === 'no_product'
          ? 'Este email não possui o produto Festa Mágica em sua conta.'
          : error === 'no_active_access'
            ? 'Você possui o produto, mas seu acesso não está ativo no momento.'
            : error
              ? 'Erro ao fazer login. Tente novamente.'
              : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-pink-100">
        <CardHeader className="text-center">
          <div className="mx-auto bg-pink-500 p-3 rounded-2xl w-fit mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Entrar no Festa Mágica</CardTitle>
          <CardDescription>
            Use Google ou email e senha para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topError && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {topError}
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 shadow-sm"
            disabled={isBusy}
            type="button"
          >
            {isLoadingGoogle ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecionando para Google...
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5 text-[#4285F4]" />
                Continuar com Google
              </>
            )}
          </Button>

          <p className="mt-2 mb-4 text-center text-xs text-gray-500">
            Recomendado para contas já existentes e acesso mais rápido.
          </p>

          <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
            <div className="h-px flex-1 bg-gray-200" />
            <span>ou use email e senha</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="mb-4 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setEmailError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Entrar com Email
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setEmailError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-xs text-gray-500">Nome (opcional)</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="pl-9"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs text-gray-500">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-9"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Senha</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  className="pl-9"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
              </div>
            </div>

            {emailError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {emailError}
              </div>
            )}

            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2">
                {message}
              </div>
            )}

            <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isBusy}>
              {isSubmittingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : mode === 'login' ? 'Entrar com Email' : 'Criar conta com Email'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Cadastre somente o email que já comprou o Festa Mágica.
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
              ← Voltar para o início
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
