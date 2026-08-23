"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createClient();
    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    if (isSignup && !result.data.session) {
      setError("Cek email kamu untuk mengonfirmasi akun, lalu masuk kembali.");
      setLoading(false); return;
    }
    router.push(isSignup ? "/signup?step=household" : "/dashboard");
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-4">
    <label className="field-label">Email<input name="email" type="email" required autoComplete="email" placeholder="nama@email.com" /></label>
    <label className="field-label">Kata sandi<input name="password" type="password" required minLength={6} autoComplete={isSignup ? "new-password" : "current-password"} placeholder="Minimal 6 karakter" /></label>
    {error && <p className="error-text">{error}</p>}
    <button className="primary-button w-full" disabled={loading}>{loading ? "Memproses..." : isSignup ? "Buat akun" : "Masuk"}</button>
  </form>;
}