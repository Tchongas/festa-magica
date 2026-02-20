"use client";

import { Camera, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { icon: Camera, label: "Foto" },
  { icon: Palette, label: "Estilo" },
  { icon: Sparkles, label: "Criar" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-12 max-w-md mx-auto">
      <div className="relative flex justify-between items-center">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 z-0" />
        <div
          className={cn(
            "absolute top-5 left-0 h-1 bg-pink-500 z-0 transition-all duration-500",
            currentStep === 1 && "w-0",
            currentStep === 2 && "w-1/2",
            currentStep === 3 && "w-full"
          )}
        />
        {steps.map((step, index) => {
          const Icon = step.icon;
          const stepNumber = index + 1;
          const isActive = currentStep >= stepNumber;
          return (
            <div key={stepNumber} className="flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                    : "bg-white text-gray-400 border-2 border-gray-200"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-xs font-bold transition-colors",
                  isActive ? "text-pink-500" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
