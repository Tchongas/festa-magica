"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  CircleCheck,
  ExternalLink,
  LogIn,
  Plus,
  Printer,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { HOTMART_40_CREDITS_URL, HOTMART_200_CREDITS_URL } from "@/lib/config";

type StepCard = {
  icon: typeof Camera;
  title: string;
  text: string;
};

const DEMO_CASES = [
  {
    title: "Tema Dinossauro",
    personPhoto: "https://i.postimg.cc/zfhdyMn8/nenemfoto.jpg",
    themePhoto: "https://i.postimg.cc/N0XNKV1c/nenem-tema.jpg",
    results: [
      "https://i.postimg.cc/HLMSrKbP/gerados-nenem-(1).jpg",
      "https://i.postimg.cc/5tzPXG8r/gerados-nenem-(2).jpg",
      "https://i.postimg.cc/3wGLk62c/gerados-nenem-(3).jpg",
      "https://i.postimg.cc/Xv52rhwM/gerados-nenem-(4).jpg",
      "https://i.postimg.cc/g0hMx53C/gerados-nenem-(5).jpg",
      "https://i.postimg.cc/CK8vRtbW/gerados-nenem-(6).jpg",
    ],
  },
  {
    title: "Tema Minnie",
    personPhoto: "https://i.postimg.cc/2SMc8mLZ/crianca-foto.jpg",
    themePhoto: "https://i.postimg.cc/rw3nFcRK/crianca-tema.jpg",
    results: [
      "https://i.postimg.cc/sgq6DyGw/gerado-crianca-(1).jpg",
      "https://i.postimg.cc/132C5PVv/gerado-crianca-(2).jpg",
      "https://i.postimg.cc/4xqLNZHL/gerado-crianca-(3).jpg",
      "https://i.postimg.cc/K8wqvF3p/gerado-crianca-(4).jpg",
    ],
  },
  {
    title: "Tema Roblox",
    personPhoto: "https://i.postimg.cc/kggtFjsC/crianca05.jpg",
    themePhoto: "https://i.postimg.cc/RZZnQPd5/temaroblox05.jpg",
    results: [
      "https://i.postimg.cc/Nf4HXh1Z/Personagem-Principal-(3).png",
      "https://i.postimg.cc/zXjghmCZ/Poses-(2).png",
      "https://i.postimg.cc/DygXGVrh/Expressoes-(1).png",
      "https://i.postimg.cc/sggZ9ncL/Topper-de-Bolo-(4).png",
      "https://i.postimg.cc/3JBvGMXM/Tags-de-Lembrancinha-(2).png",
      "https://i.postimg.cc/FsZLSty4/Adesivos-(1).png",
      "https://i.postimg.cc/cLL8MDm2/Convite-Digital-(1).png",
      "https://i.postimg.cc/wjjscWVn/Convite-Impresso-(1).png",
      "https://i.postimg.cc/sDchWFYs/Numero-da-Idade-(1).png",
      "https://i.postimg.cc/W11J698v/Painel-Decorativo-(1).png",
    ],
  },
];

const FEEDBACK_IMAGES = [
  "https://i.postimg.cc/YCjzPrVs/feedbacks-festa-magica-(1).png",
  "https://i.postimg.cc/c4FcTgD7/feedbacks-festa-magica-(1).png",
  "https://i.postimg.cc/yYLTngfw/feedbacks-festa-magica-(2).png",
  "https://i.postimg.cc/pXsBkh0s/feedbacks-festa-magica-(2).png",
  "https://i.postimg.cc/Z50xQbgj/feedbacks-festa-magica-(3).png",
  "https://i.postimg.cc/RZqLYS8j/feedbacks-festa-magica-(3).png",
  "https://i.postimg.cc/T3hJsdFX/feedbacks-festa-magica-(4).png",
  "https://i.postimg.cc/qvgxFJS4/feedbacks-festa-magica-(4).png",
  "https://i.postimg.cc/vZDtKYkc/feedbacks-festa-magica-(5).png",
  "https://i.postimg.cc/Jzg5CwCz/feedbacks-festa-magica-(6).png",
  "https://i.postimg.cc/P5cQnGnX/feedbacks-festa-magica-(7).png",
];

const FAQ = [
  ["Como devo escolher a foto?", "Escolha uma foto bem iluminada e de frente. Fotos de celular funcionam muito bem."],
  ["Funciona com adultos?", "Sim. Você pode gerar artes para festas infantis, adultas e homenagens."],
  ["Quanto tempo demora?", "O acesso é imediato e a geração leva poucos minutos."],
  ["As artes ficam salvas?", "Ainda não. Gere e baixe no mesmo momento para não perder os arquivos."],
];

const STEP_CARDS: StepCard[] = [
  { icon: Camera, title: "Envie a foto", text: "Envie uma foto frontal e bem iluminada." },
  { icon: Star, title: "Envie o tema", text: "Use uma imagem referencia do tema desejado." },
  { icon: Printer, title: "Baixe o kit", text: "Receba os itens para imprimir ou compartilhar." },
];

export function HomepageRemix() {
  const { isAuthenticated, hasActiveSubscription, creditsEnabled } = useAuthStore();
  const canCreate = isAuthenticated && (hasActiveSubscription || creditsEnabled);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      <div className="sticky top-0 z-[60] border-b border-pink-300 bg-pink-600 px-4 py-2 text-center text-sm font-bold text-white">
        Oferta ativa: app grátis, você paga somente os créditos para gerar imagens.
      </div>

      <section className="bg-festa-gradient px-4 pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 font-semibold text-purple-700">
              <Sparkles className="h-4 w-4" /> Transformacao instantanea com IA
            </div>
            <h1 className="font-fredoka text-4xl font-bold leading-tight md:text-6xl">
              Transforme a foto de qualquer pessoa no personagem do seu tema em minutos
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Sem designer, sem complicacao e sem pagar caro. Gere 10 artes diferentes prontas para imprimir ou enviar no
              WhatsApp.
            </p>

            <ul className="mt-6 space-y-3 text-gray-700">
              {[
                "Envie a foto da pessoa + referencia do tema",
                "Nao precisa saber usar IA",
                "Ideal para uso pessoal ou profissional",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CircleCheck className="h-5 w-5 text-green-500" /> {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {canCreate ? (
                <Link href="/criar">
                  <Button size="lg" className="uppercase">Criar kit agora</Button>
                </Link>
              ) : (
                <>
                  <Link href="/entrar"><Button size="lg" variant="outline"><LogIn className="h-4 w-4" /> Entrar</Button></Link>
                  <a href={HOTMART_40_CREDITS_URL}><Button size="lg">Comprar 40 creditos <ExternalLink className="h-4 w-4" /></Button></a>
                  <a href={HOTMART_200_CREDITS_URL}><Button size="lg" variant="outline">Comprar 200 creditos <ExternalLink className="h-4 w-4" /></Button></a>
                </>
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="aspect-[9/16] overflow-hidden rounded-3xl border border-purple-100 bg-black shadow-2xl">
              <iframe
                src="https://player.vimeo.com/video/1154119457?autoplay=0&loop=0&autopause=0"
                className="h-full w-full"
                title="Festa Magica IA Demo"
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
            <div className="absolute -left-8 bottom-16 hidden rounded-2xl border bg-white p-4 shadow-xl md:flex md:items-center md:gap-2">
              <Printer className="h-5 w-5 text-green-600" /> Pronto para imprimir
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:py-20">
        <div className="mx-auto w-full max-w-7xl space-y-14">
          {DEMO_CASES.map((c) => (
            <div key={c.title} className="rounded-[2rem] border border-purple-100 bg-white p-5 shadow-lg md:p-8">
              <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                <div className="grid grid-cols-2 gap-3 lg:col-span-4">
                  <img src={c.personPhoto} alt="Pessoa" className="rounded-2xl" referrerPolicy="no-referrer" />
                  <img src={c.themePhoto} alt="Tema" className="rounded-2xl" referrerPolicy="no-referrer" />
                </div>
                <div className="hidden justify-center lg:col-span-1 lg:flex"><Plus className="h-7 w-7 text-pink-500" /></div>
                <div className="lg:col-span-7">
                  <p className="mb-3 font-fredoka text-xl text-purple-600">{c.title}</p>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                    {c.results.map((img) => (
                      <img key={img} src={img} alt="Resultado" className="rounded-xl border border-gray-100" referrerPolicy="no-referrer" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-festa-gradient px-4 py-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8 text-center">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1 text-sm font-bold text-pink-700"><Users className="h-4 w-4" /> + de 2000 usuarios satisfeitos</p>
            <h2 className="font-fredoka text-3xl font-bold md:text-5xl">O que estao dizendo</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {FEEDBACK_IMAGES.map((img) => (
              <img key={img} src={img} alt="Feedback" className="rounded-2xl border border-white/70 bg-white p-1 shadow-md" referrerPolicy="no-referrer" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-3">
          {STEP_CARDS.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-purple-100 bg-white p-7 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <step.icon className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold uppercase text-purple-500">Passo {index + 1}</p>
              <h3 className="mt-1 font-fredoka text-2xl font-bold">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-purple-600 px-4 py-20 text-white">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="text-center font-fredoka text-4xl font-bold">Escolha seu pacote de creditos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 text-gray-900">
              <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase text-gray-500"><User className="h-4 w-4" /> Pacote essencial</p>
              <p className="text-5xl font-bold text-purple-600">40</p>
              <p className="mb-6 font-semibold">creditos para gerar imagens</p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Compra unica</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Acesso imediato</li>
              </ul>
              <a href={HOTMART_40_CREDITS_URL}><Button className="w-full">Comprar 40 creditos</Button></a>
            </div>

            <div className="rounded-3xl bg-white p-8 text-gray-900">
              <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase text-gray-500"><Briefcase className="h-4 w-4" /> Pacote profissional</p>
              <p className="text-5xl font-bold text-pink-500">200</p>
              <p className="mb-6 font-semibold">creditos para alto volume</p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Melhor custo por geracao</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Ideal para uso profissional</li>
              </ul>
              <a href={HOTMART_200_CREDITS_URL}><Button className="w-full">Comprar 200 creditos</Button></a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="mb-8 text-center font-fredoka text-4xl font-bold">Duvidas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-purple-100 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {q} <ChevronDown className="h-4 w-4" />
                </summary>
                <p className="mt-3 text-gray-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 px-4 py-14 text-center">
        <div className="mx-auto w-full max-w-7xl">
          <p className="font-fredoka text-3xl font-bold text-purple-600">Festa Magica IA</p>
          <p className="mt-2 text-gray-500">Inteligencia artificial para momentos inesqueciveis.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={HOTMART_40_CREDITS_URL}><Button size="sm">40 creditos</Button></a>
            <a href={HOTMART_200_CREDITS_URL}><Button size="sm" variant="outline">200 creditos</Button></a>
            <Link href="/entrar"><Button size="sm" variant="ghost">Entrar</Button></Link>
          </div>
        </div>
      </footer>

      <a href="#pricing" className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-pink-500 px-5 py-4 text-center font-bold text-white shadow-2xl md:hidden">
        Ver planos e precos <ArrowRight className="ml-2 inline h-4 w-4" />
      </a>
    </div>
  );
}
