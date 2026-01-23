"use client";

import { Image as ImageIcon, Cuboid, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import { ImageUpload } from "@/components/shared";
import { useKitCreatorStore } from "@/stores/kit-creator.store";
import { TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IllustrationStyle, ToneType } from "@/types";

interface ThemeStyleStepProps {
  onGenerate: () => void;
}

export function ThemeStyleStep({ onGenerate }: ThemeStyleStepProps) {
  const { userInput, setUserInput, setThemePhoto, setStep } = useKitCreatorStore();

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <Badge variant="blue">Passo 2</Badge>
        <CardTitle>Qual o tema e estilo?</CardTitle>
        <CardDescription>
          Personalize a atmosfera da sua festa.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <ImageUpload
              id="theme-upload"
              value={userInput.themePhoto}
              onChange={setThemePhoto}
              label="Referência de Tema (Opcional)"
              placeholder="Carregar Referência"
              accentColor="blue"
            />

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">
                  Estilo da Ilustração
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setUserInput({ style: '2D' })}
                    className={cn(
                      "py-4 px-2 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-2",
                      userInput.style === '2D'
                        ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-100"
                        : "bg-white text-gray-500 border-gray-100 hover:border-blue-200"
                    )}
                  >
                    <ImageIcon className="w-5 h-5" />
                    Cartoon 2D
                  </button>
                  <button
                    onClick={() => setUserInput({ style: '3D' })}
                    className={cn(
                      "py-4 px-2 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-2",
                      userInput.style === '3D'
                        ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-100"
                        : "bg-white text-gray-500 border-gray-100 hover:border-blue-200"
                    )}
                  >
                    <Cuboid className="w-5 h-5" />
                    Estilo 3D Pixar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">
                  Tom do Visual
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setUserInput({ tone: t as ToneType })}
                      className={cn(
                        "py-3 rounded-2xl font-bold border-2 transition-all",
                        userInput.tone === t
                          ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-100"
                          : "bg-white text-gray-500 border-gray-100 hover:border-indigo-200"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Voltar
            </Button>
            <Button variant="gradient" size="lg" onClick={onGenerate}>
              Criar Kit Mágico! <Sparkles className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
