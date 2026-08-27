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

type FilterType = "all" | "income" | "expense";

export function TransactionList({ transactions, members }: { transactions: Transaction[]; members: { id: string; display_name: string }[] }) {
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selected]);

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.transaction_type !== typeFilter) return false;
    if (memberFilter !== "all" && tx.household_members?.display_name !== memberFilter) return false;
    return true;
  });

  const chips: { label: string; value: FilterType }[] = [
    { label: "Semua", value: "all" },
    { label: "Pemasukan", value: "income" },
    { label: "Pengeluaran", value: "expense" },
  ];

  return (
    <>
      <div className="filter-bar">
        <div className="filter-chips">
          {chips.map((chip) => (
            <button key={chip.value} type="button" className={`chip ${typeFilter === chip.value ? "active" : ""}`} onClick={() => setTypeFilter(chip.value)}>
              {chip.label}
            </button>
          ))}
        </div>
        {members.length > 1 && (
          <div className="filter-chips">
            <button type="button" className={`chip ${memberFilter === "all" ? "active" : ""}`} onClick={() => setMemberFilter("all")}>Semua orang</button>
            {members.map((member) => (
              <button key={member.id} type="button" className={`chip ${memberFilter === member.display_name ? "active" : ""}`} onClick={() => setMemberFilter(member.display_name)}>
                {member.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state compact"><h2>Tidak ada transaksi.</h2><p className="muted">Coba ubah filter atau catat transaksi pertamamu.</p></div>
      ) : (
        <div className="transaction-list">
          {filtered.map((transaction) => {
            const category = transaction.categories;
            const account = transaction.accounts;
            return <article className="transaction-row" key={transaction.id}>
              <div><strong>{category?.name || "Tanpa kategori"}</strong><p>{transaction.note || account?.name || "Tanpa catatan"}</p></div>
              <div className="transaction-meta"><time>{formatDate(transaction.transaction_date)}</time><strong className={transaction.transaction_type === "income" ? "income-text" : "expense-text"}>{transaction.transaction_type === "income" ? "+" : "-"}{formatRupiah(transaction.amount)}</strong><button className="detail-link" type="button" onClick={() => setSelected(transaction)} aria-label={`Lihat detail ${category?.name || "transaksi"}`} title="Lihat detail">Detail</button></div>
            </article>;
          })}
        </div>
      )}

      {selected && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section className="transaction-dialog" role="dialog" aria-modal="true" aria-labelledby="transaction-dialog-title">
          <button autoFocus className="dialog-close" type="button" onClick={() => setSelected(null)} aria-label="Tutup detail" title="Tutup">×</button>
          <p className="eyebrow">Rincian transaksi</p><h2 id="transaction-dialog-title">{selected.categories?.name || "Transaksi"}</h2>
          <div className={`detail-amount ${selected.transaction_type === "income" ? "income-text" : "expense-text"}`}>{selected.transaction_type === "income" ? "+" : "-"}{formatRupiah(selected.amount)}</div>
          <dl className="detail-list"><DetailRow label="Jenis" value={selected.transaction_type === "income" ? "Pemasukan" : "Pengeluaran"} /><DetailRow label="Kategori" value={selected.categories?.name || "Tanpa kategori"} /><DetailRow label="Akun" value={selected.accounts?.name || "Tanpa akun"} /><DetailRow label="Tanggal" value={formatDate(selected.transaction_date)} /><DetailRow label="Dicatat oleh" value={selected.household_members?.display_name || "Tidak diketahui"} /><DetailRow label="Catatan" value={selected.note || "Tidak ada catatan"} /></dl>
        </section>
      </div>}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
