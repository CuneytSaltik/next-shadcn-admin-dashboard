"use client";
import { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
