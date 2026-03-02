"use client";

import { useKitCreatorStore } from "@/stores/kit-creator.store";
import { useKitGeneration } from "@/hooks/use-kit-generation";
import { StepIndicator } from "./step-indicator";
import { ChildUploadStep } from "./child-upload-step";
import { ThemeStyleStep } from "./theme-style-step";
import { GenerationStep } from "./generation-step";

export function KitCreatorWizard() {
  const { step } = useKitCreatorStore();
  const {
    enterGenerationStep,
    analyzeInputs,
    updateCachedDescriptions,
    generateItemOnDemand,
    retryItem,
  } = useKitGeneration();

  return (
    <div>
      <StepIndicator currentStep={step} />

      {step === 1 && <ChildUploadStep />}
      {step === 2 && <ThemeStyleStep onGenerate={enterGenerationStep} />}
      {step === 3 && (
        <GenerationStep
          onAnalyze={analyzeInputs}
          onUpdateDescriptions={updateCachedDescriptions}
          onGenerate={generateItemOnDemand}
          onRetry={retryItem}
        />
      )}
    </div>
  );
}
