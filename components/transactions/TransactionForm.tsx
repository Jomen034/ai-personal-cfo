"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; name: string; type?: string; account_type?: string };

type ParsedResult = {
  transaction_type: "income" | "expense";
  amount: number;
  merchant?: string;
  category_id?: string;
  account_id?: string;
  transaction_date: string;
  confidence: number;
  raw_input: string;
};

export function TransactionForm({ memberId, householdId, accounts, categories }: { memberId: string; householdId: string; accounts: Option[]; categories: Option[] }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const router = useRouter();

  const filteredCategories = categories.filter((category) => category.type === type);

  async function parseNaturalLanguage(input: string) {
    setParsing(true);
    setError("");
    try {
      const res = await fetch("/api/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, household_id: householdId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses");
      setParsed(data);
      if (data.transaction_type) setType(data.transaction_type);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses input");
    } finally {
      setParsing(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const supabase = createClient();

    const payload: Record<string, unknown> = {
      household_id: householdId,
      member_id: memberId,
      account_id: String(data.get("account_id")),
      category_id: String(data.get("category_id")),
      transaction_type: type,
      amount: Number(data.get("amount")),
      transaction_date: String(data.get("transaction_date")),
      note: String(data.get("note") || ""),
    };

    if (parsed?.raw_input) {
      payload.raw_input = parsed.raw_input;
      payload.parsed_confidence = parsed.confidence;
      payload.reviewed_flag = true;
    }

    const { error: insertError } = await supabase.from("transactions").insert(payload);
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/transaksi?saved=1");
    router.refresh();
  }

  return (
    <div className="form-panel">
      <div className="segmented">
        <button type="button" className={type === "expense" ? "selected" : ""} onClick={() => setType("expense")}>Pengeluaran</button>
        <button type="button" className={type === "income" ? "selected" : ""} onClick={() => setType("income")}>Pemasukan</button>
      </div>

      <div className="mt-16">
        <label className="field-label" htmlFor="nl_input">Catat dengan bahasa natural</label>
        <div className="input-group mt-12">
          <input
            id="nl_input"
            name="nl_input"
            placeholder="Contoh: makan siang 50k di warung"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) parseNaturalLanguage(value);
              }
            }}
          />
          <button type="button" className="primary-button" disabled={parsing} onClick={(e) => { const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null); if (input?.value.trim()) parseNaturalLanguage(input.value.trim()); }}>
            {parsing ? "Mengurai..." : "Isi"}
          </button>
        </div>
        <small className="field-hint">Ketik transaksi seperti sehari-hari, lalu klik Isi untuk mengisi form otomatis.</small>
        {parsed && (
          <div className="parse-result mt-16">
            <div className="flex items-center justify-between mb-12">
              <strong>Hasil penguraian</strong>
              <span className="font-body parse-confidence" data-confidence={parsed.confidence >= 0.8 ? "high" : parsed.confidence >= 0.6 ? "medium" : "low"}>
                {parsed.confidence >= 0.8 ? "Sangat mirip" : parsed.confidence >= 0.6 ? "Kemungkinan cocok" : "Perlu dicek"}
              </span>
            </div>
            <div className="parse-result-list">
              <div>Jumlah: <strong>{parsed.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</strong></div>
              {parsed.merchant && <div>Merchant: <strong>{parsed.merchant}</strong></div>}
              <div>Jenis: <strong>{parsed.transaction_type === "income" ? "Pemasukan" : "Pengeluaran"}</strong></div>
              <div>Tanggal: <strong>{parsed.transaction_date}</strong></div>
            </div>
            <div className="mt-16 flex gap-8">
              <button type="button" className="primary-button flex-1" onClick={() => { setParsed(null); }}>Konfirmasi</button>
              <button type="button" className="outline-button flex-1" onClick={() => setParsed(null)}>Batal</button>
            </div>
          </div>
        )}
      </div>

      <form className="form-section mt-24" onSubmit={submit}>
        <label className="field-label amount-field">Jumlah
          <input name="amount" type="number" min="1" step="1" required placeholder="0" />
        </label>
        <div className="form-grid">
          <label className="field-label">Kategori
            <select name="category_id" required>
              <option value="">Pilih kategori</option>
              {filteredCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="field-label">Akun
            <select name="account_id" required>
              <option value="">Pilih akun</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
        </div>
        <label className="field-label">Tanggal
          <input name="transaction_date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
        </label>
        <label className="field-label">Catatan <span className="muted">(opsional)</span>
          <textarea name="note" rows={3} placeholder="Contoh: makan siang bersama" />
        </label>
        {!accounts.length && <p className="error-text">Tambahkan akun terlebih dahulu di halaman Profil.</p>}
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button" disabled={loading || !accounts.length}>{loading ? "Menyimpan..." : "Simpan transaksi"}</button>
      </form>
    </div>
  );
}