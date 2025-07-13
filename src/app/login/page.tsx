"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/"); // Giriş başarılıysa ana sayfaya yönlendir
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto p-6">
      <h2 className="mb-4 text-lg font-bold">Giriş Yap</h2>
      <input
        className="border px-3 py-2 w-full mb-2"
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        className="border px-3 py-2 w-full mb-2"
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Giriş</button>
    </form>
  );
}
