"use client";

import { AccessGate } from '@/components/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <AccessGate>{children}</AccessGate>;
}
