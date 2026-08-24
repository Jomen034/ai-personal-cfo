"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

type Transaction = {
  id: string;
  amount: number;
  transaction_type: "income" | "expense";
  transaction_date: string;
  note: string | null;
  categories: { name: string } | null;
  accounts: { name: string } | null;
  household_members: { display_name: string } | null;
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  if (!transactions.length) {
    return <div className="empty-state compact"><h2>Belum ada transaksi.</h2><p className="muted">Catat transaksi pertamamu untuk melihat ritme keuangan household.</p></div>;
  }

  return <>
    <div className="transaction-list">{transactions.map((transaction) => {
      const category = transaction.categories;
      const account = transaction.accounts;
      return <article className="transaction-row" key={transaction.id}>
        <div><strong>{category?.name || "Tanpa kategori"}</strong><p>{transaction.note || account?.name || "Tanpa catatan"}</p></div>
        <div className="transaction-meta"><time>{formatDate(transaction.transaction_date)}</time><strong className={transaction.transaction_type === "income" ? "income-text" : "expense-text"}>{transaction.transaction_type === "income" ? "+" : "-"}{formatRupiah(transaction.amount)}</strong><button className="detail-link" type="button" onClick={() => setSelected(transaction)} aria-label={`Lihat detail ${category?.name || "transaksi"}`} title="Lihat detail">Detail</button></div>
      </article>;
    })}</div>
    {selected && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section className="transaction-dialog" role="dialog" aria-modal="true" aria-labelledby="transaction-dialog-title">
        <button autoFocus className="dialog-close" type="button" onClick={() => setSelected(null)} aria-label="Tutup detail" title="Tutup">×</button>
        <p className="eyebrow">Rincian transaksi</p><h2 id="transaction-dialog-title">{selected.categories?.name || "Transaksi"}</h2>
        <div className={`detail-amount ${selected.transaction_type === "income" ? "income-text" : "expense-text"}`}>{selected.transaction_type === "income" ? "+" : "-"}{formatRupiah(selected.amount)}</div>
        <dl className="detail-list"><DetailRow label="Jenis" value={selected.transaction_type === "income" ? "Pemasukan" : "Pengeluaran"} /><DetailRow label="Kategori" value={selected.categories?.name || "Tanpa kategori"} /><DetailRow label="Akun" value={selected.accounts?.name || "Tanpa akun"} /><DetailRow label="Tanggal" value={formatDate(selected.transaction_date)} /><DetailRow label="Dicatat oleh" value={selected.household_members?.display_name || "Tidak diketahui"} /><DetailRow label="Catatan" value={selected.note || "Tidak ada catatan"} /></dl>
      </section>
    </div>}
  </>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }