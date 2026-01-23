"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  text?: string;
}

export function LoadingSpinner({ className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={cn("w-12 h-12 text-pink-500 animate-spin", className)} />
      {text && (
        <p className="text-pink-600 font-medium animate-pulse mt-2">{text}</p>
      )}
    </div>
  );
}
