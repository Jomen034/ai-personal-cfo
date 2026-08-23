"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const supabase = createClient();
      const result = isSignup
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message === "Invalid login credentials" ? "Email atau kata sandi tidak sesuai." : result.error.message);
        return;
      }
      if (isSignup && !result.data.session) {
        setError("Cek email kamu untuk mengonfirmasi akun, lalu masuk kembali.");
        return;
      }
      router.push(isSignup ? "/signup?step=household" : "/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi gangguan saat masuk. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="space-y-4">
    <label className="field-label">Email<input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="nama@email.com" /></label>
    <label className="field-label">Kata sandi<input name="password" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? "new-password" : "current-password"} placeholder="Minimal 6 karakter" /></label>
    {error && <p className="error-text">{error}</p>}
    <button type="submit" className="primary-button w-full" disabled={loading}>{loading ? "Memproses..." : isSignup ? "Buat akun" : "Masuk"}</button>
  </form>;
}