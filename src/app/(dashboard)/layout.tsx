"use client";

import { DashboardHeader, Footer, ProtectedRoute } from '@/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <DashboardHeader />
        <main className="max-w-6xl mx-auto px-6 pb-12">
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
