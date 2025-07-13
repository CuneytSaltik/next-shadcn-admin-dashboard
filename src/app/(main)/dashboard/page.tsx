"use client";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      {/* ...dashboard içeriğin buraya... */}
    </AuthGuard>
  );
}
