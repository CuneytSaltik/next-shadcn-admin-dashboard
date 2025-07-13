"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setChecking(false);
      if (!user) router.replace("/login");
    });
  }, [router]);

  if (checking) {
    // <div>Yükleniyor...</div> yerine null döndürürsen hiç flicker olmaz
    return null;
  }
  if (!user) return null;

  return <>{children}</>;
}
