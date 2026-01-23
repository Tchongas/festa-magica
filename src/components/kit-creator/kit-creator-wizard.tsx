"use client";

import { useKitCreatorStore } from "@/stores/kit-creator.store";
import { useKitGeneration } from "@/hooks/use-kit-generation";
import { StepIndicator } from "./step-indicator";
import { ChildUploadStep } from "./child-upload-step";
import { ThemeStyleStep } from "./theme-style-step";
import { GenerationStep } from "./generation-step";

export function KitCreatorWizard() {
  const { step } = useKitCreatorStore();
  const { startGeneration, retryItem } = useKitGeneration();

  return (
    <div>
      <StepIndicator currentStep={step} />

      {step === 1 && <ChildUploadStep />}
      {step === 2 && <ThemeStyleStep onGenerate={startGeneration} />}
      {step === 3 && <GenerationStep onRetry={retryItem} />}
    </div>
  );
}
