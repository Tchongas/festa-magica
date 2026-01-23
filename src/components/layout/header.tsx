"use client";

import { PartyPopper, RotateCcw, Coins } from "lucide-react";
import { Button } from "@/components/ui";
import { useKitCreatorStore } from "@/stores/kit-creator.store";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";

export function Header() {
  const { step, reset } = useKitCreatorStore();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white shadow-sm py-4 px-6 mb-8 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-pink-500 p-2 rounded-xl">
          <PartyPopper className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Festa <span className="text-pink-500">Mágica</span>
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-full">
            <Coins className="w-4 h-4 text-pink-500" />
            <span className="font-bold text-pink-600">{user.credits}</span>
            <span className="text-sm text-gray-500">créditos</span>
          </div>
        )}

        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4" /> Recomeçar
          </Button>
        )}
      </div>
    </header>
  );
}
