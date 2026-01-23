"use client";

import { Info } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl max-w-md mx-auto flex items-center gap-3">
      <Info className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
