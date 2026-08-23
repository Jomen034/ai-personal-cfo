import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { HouseholdSetup } from "@/components/auth/HouseholdSetup";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const params = await searchParams;
  const setup = params.step === "household";
  return <main className="auth-shell"><section className="auth-panel"><p className="brand-mark">tumara<span>·</span></p>{setup ? <HouseholdSetup /> : <><h1>Mulai bertumbuh.</h1><p className="lede">Buat akun untuk mulai menata keuanganmu.</p><AuthForm mode="signup" /><p className="switch-copy">Sudah punya akun? <Link href="/login">Masuk</Link></p></>}</section><aside className="auth-aside"><span>02 / bersama</span><p>Satu ruang untuk keputusan finansial yang kalian bangun bersama.</p></aside></main>;
}