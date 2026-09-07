"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Option = { id: string; name: string; type?: string; account_type?: string };

type ParsedResult = {
  transaction_type: "income" | "expense" | "transfer";
  amount: number;
  merchant?: string;
  category_id?: string;
  account_id?: string;
  destination_account_id?: string;
  transfer_type?: "internal" | "external" | null;
  transaction_date: string;
  confidence: number;
  raw_input: string;
  category_name?: string;
  account_name?: string;
  destination_account_name?: string;
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
        body: JSON.stringify({
          input,
          household_id: householdId,
          accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
          categories: categories.map((c) => ({ id: c.id, name: c.name })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses");
      const enriched = {
        ...data,
        category_name: data.category_id ? categories.find((c) => c.id === data.category_id)?.name : undefined,
        account_name: data.account_id ? accounts.find((a) => a.id === data.account_id)?.name : undefined,
        destination_account_name: data.destination_account_id ? accounts.find((a) => a.id === data.destination_account_id)?.name : undefined,
      } as ParsedResult;
      setParsed(enriched);
      if (data.transaction_type === "transfer") {
        setType("expense");
      } else if (data.transaction_type) {
        setType(data.transaction_type);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses input");
    } finally {
      setParsing(false);
    }
  }

  function applyParsedToForm() {
    if (!parsed) return;
    const form = document.getElementById("transaction-form") as HTMLFormElement | null;
    if (!form) return;
    const amountInput = form.querySelector('input[name="amount"]') as HTMLInputElement | null;
    const categorySelect = form.querySelector('select[name="category_id"]') as HTMLSelectElement | null;
    const accountSelect = form.querySelector('select[name="account_id"]') as HTMLSelectElement | null;
    const dateInput = form.querySelector('input[name="transaction_date"]') as HTMLInputElement | null;
    if (amountInput && parsed.amount) amountInput.value = String(parsed.amount);
    if (categorySelect && parsed.category_id) categorySelect.value = parsed.category_id;
    if (accountSelect && parsed.account_id) accountSelect.value = parsed.account_id;
    if (dateInput && parsed.transaction_date) dateInput.value = parsed.transaction_date;
    setType(parsed.transaction_type === "transfer" ? "expense" : parsed.transaction_type);
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

    if (parsed?.transfer_type) {
      payload.transaction_type = "expense";
      payload.transfer_type = parsed.transfer_type;
      if (parsed.destination_account_id) {
        payload.destination_account_id = parsed.destination_account_id;
      }
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
              {parsed.merchant && <div>Deskripsi: <strong>{parsed.merchant}</strong></div>}
              {parsed.category_name && <div>Kategori: <strong>{parsed.category_name}</strong></div>}
              {parsed.account_name && <div>Akun: <strong>{parsed.account_name}</strong></div>}
              {parsed.destination_account_name && <div>Ke akun: <strong>{parsed.destination_account_name}</strong></div>}
              <div>Jenis: <strong>{parsed.transaction_type === "income" ? "Pemasukan" : parsed.transaction_type === "transfer" ? "Transfer" : "Pengeluaran"}</strong></div>
              <div>Tanggal: <strong>{parsed.transaction_date}</strong></div>
            </div>
            <div className="mt-16 flex parse-result-actions">
              <button type="button" className="primary-button flex-1" onClick={() => { setParsed(null); }}>Konfirmasi</button>
              <button type="button" className="outline-button flex-1" onClick={applyParsedToForm}>Perbaiki</button>
              <button type="button" className="outline-button flex-1" onClick={() => setParsed(null)}>Batal</button>
            </div>
          </div>
        )}
      </div>

      <form id="transaction-form" className="form-section mt-24" onSubmit={submit}>
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