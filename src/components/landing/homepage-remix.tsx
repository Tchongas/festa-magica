"use client";

import Link from "next/link";
import { ExternalLink, LogIn, PartyPopper, Sparkles, Wand2, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from "@/lib/config";

const steps = [
  {
    title: "Envie a foto da criança",
    description: "Use uma foto nítida e frontal para manter semelhança facial nas artes.",
    icon: Sparkles,
  },
  {
    title: "Descreva o tema da festa",
    description: "Dinossauro, princesa, super-herói, anime, futebol e muito mais.",
    icon: Wand2,
  },
  {
    title: "Gere e baixe seu kit",
    description: "Receba os itens prontos para imprimir ou compartilhar no WhatsApp.",
    icon: Download,
  },
];

const kitItems = [
  "Personagem Principal",
  "Convite Digital",
  "Convite Impresso",
  "Topper de Bolo",
  "Adesivos",
  "Tags de Lembrancinha",
  "Painel Decorativo",
  "Número da Idade",
  "Expressões",
  "Poses",
];

export function HomepageRemix() {
  const { isAuthenticated, hasActiveSubscription, creditsEnabled } = useAuthStore();
  const canCreate = isAuthenticated && (hasActiveSubscription || creditsEnabled);

  return (
    <div className="min-h-screen bg-[#fff8fd] text-slate-900">
      <div className="sticky top-0 z-50 border-b border-pink-200 bg-pink-600 px-4 py-2 text-center text-sm font-bold text-white">
        A ferramenta é gratuita — você paga apenas pelos créditos para gerar imagens.
      </div>

      <header className="sticky top-9 z-40 border-b border-pink-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-pink-500 p-2 text-white">
              <PartyPopper className="h-5 w-5" />
            </div>
            <h1 className="font-fredoka text-xl font-bold md:text-2xl">
              Festa <span className="text-pink-500">Mágica</span>
            </h1>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            {canCreate ? (
              <Link href="/criar">
                <Button className="uppercase tracking-wide">Criar Kit</Button>
              </Link>
            ) : (
              <>
                <Link href="/entrar">
                  <Button variant="outline" className="uppercase tracking-wide">
                    <LogIn className="h-4 w-4" /> Entrar
                  </Button>
                </Link>
                <a href={HOTMART_40_CREDITS_URL}>
                  <Button className="uppercase tracking-wide">
                    40 créditos <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-14 md:px-6 md:pb-24 md:pt-20">
          <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />
          <div className="absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-pink-600">
                <Sparkles className="h-4 w-4" /> IA para festas infantis
              </p>

              <h2 className="font-fredoka text-4xl font-bold leading-tight md:text-6xl">
                Transforme fotos em
                <span className="block bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  kits completos de festa
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Crie artes em poucos minutos com o rosto da criança no tema da festa. O app é grátis para entrar,
                e cada geração usa créditos.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {canCreate ? (
                  <Link href="/criar">
                    <Button size="lg" variant="gradient" className="w-full sm:w-auto">
                      Criar meu kit agora
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/entrar">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        <LogIn className="h-5 w-5" /> Entrar / Criar conta
                      </Button>
                    </Link>
                    <a href={HOTMART_40_CREDITS_URL}>
                      <Button size="lg" className="w-full sm:w-auto">
                        Comprar 40 créditos <ExternalLink className="h-5 w-5" />
                      </Button>
                    </a>
                    <a href={HOTMART_200_CREDITS_URL}>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        Comprar 200 créditos <ExternalLink className="h-5 w-5" />
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-purple-100 bg-white p-5 shadow-2xl">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "from-pink-400 to-rose-500",
                  "from-violet-400 to-purple-500",
                  "from-blue-400 to-cyan-500",
                  "from-amber-400 to-orange-500",
                ].map((gradient, index) => (
                  <div
                    key={gradient}
                    className={`rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-lg`}
                  >
                    <p className="font-fredoka text-xl font-bold">Arte {index + 1}</p>
                    <p className="text-sm text-white/90">Preview de item do kit</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-slate-500">
                O kit inclui 10 itens prontos para imprimir ou enviar digitalmente.
              </p>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="bg-white px-4 py-20 md:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <h3 className="text-center font-fredoka text-3xl font-bold md:text-4xl">Como funciona</h3>
            <p className="mt-3 text-center text-slate-600">
              Processo simples para criar kits personalizados com a sua criança no tema escolhido.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.title} className="rounded-3xl border border-pink-100 bg-[#fff8fd] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <step.icon className="h-7 w-7 text-pink-500" />
                    <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <h4 className="font-fredoka text-xl font-bold">{step.title}</h4>
                  <p className="mt-2 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6">
          <div className="mx-auto w-full max-w-6xl rounded-[2rem] bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-white md:p-12">
            <h3 className="font-fredoka text-3xl font-bold md:text-4xl">Itens gerados no seu kit</h3>
            <p className="mt-2 text-white/90">Cada geração entrega um pacote completo para sua festa.</p>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
              {kitItems.map((item) => (
                <div key={item} className="rounded-2xl bg-white/15 p-4 text-sm font-semibold backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/25 bg-white/10 p-4 text-sm text-white/95">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 shrink-0" />
                <p>
                  Importante: as imagens não ficam salvas por enquanto. Gere e baixe no mesmo momento para não perder
                  seus arquivos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-pink-100 bg-white px-4 py-12 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="font-fredoka text-2xl font-bold text-slate-900">
              Festa <span className="text-pink-500">Mágica</span>
            </p>
            <p className="text-sm text-slate-500">Convites e kits de festa com IA, em minutos.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={HOTMART_40_CREDITS_URL}>
              <Button size="sm">Comprar 40 créditos</Button>
            </a>
            <a href={HOTMART_200_CREDITS_URL}>
              <Button size="sm" variant="outline">
                Comprar 200 créditos
              </Button>
            </a>
            <Link href="/entrar">
              <Button size="sm" variant="ghost">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
