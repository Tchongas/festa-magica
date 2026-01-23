"use client";

import { Baby, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/shared";
import { useKitCreatorStore } from "@/stores/kit-creator.store";

export function ChildUploadStep() {
  const { userInput, setUserInput, setChildPhoto, setStep } = useKitCreatorStore();

  const canProceed = !!userInput.childPhoto;

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <Badge>Passo 1</Badge>
        <CardTitle>Quem é a estrela da festa?</CardTitle>
        <CardDescription>
          Nossa IA manterá a semelhança facial em estilo ilustrado!
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <ImageUpload
              id="child-upload"
              value={userInput.childPhoto}
              onChange={setChildPhoto}
              label="Foto da Criança (Obrigatória)"
              placeholder="Carregar Foto"
              accentColor="pink"
            />

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                  <Baby className="w-4 h-4 text-pink-500" /> Idade da Criança
                </label>
                <Input
                  type="text"
                  placeholder="Ex: 2 anos"
                  value={userInput.age}
                  onChange={(e) => setUserInput({ age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                  <Sparkles className="w-4 h-4 text-pink-500" /> Detalhes Marcantes
                </label>
                <Textarea
                  placeholder="Ex: Cabelos cacheados, usa óculos, franjinha..."
                  rows={3}
                  value={userInput.features}
                  onChange={(e) => setUserInput({ features: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => canProceed && setStep(2)}
              disabled={!canProceed}
              className={!canProceed ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : ""}
            >
              Próximo Passo <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
