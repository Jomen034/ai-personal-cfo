"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { ACCOUNT_TYPES } from "@/lib/constants";

type Account = {
  id: string;
  name: string;
  account_type: string;
  current_balance: number;
  dynamic_balance: number;
};

type Transaction = {
  id: string;
  amount: number;
  transaction_type: "income" | "expense";
  transaction_date: string;
  note: string | null;
  categories: { name: string } | null;
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {};
ACCOUNT_TYPES.forEach((type) => {
  ACCOUNT_TYPE_LABELS[type.value] = type.label;
});

export function AccountList({ accounts, householdId }: { accounts: Account[]; householdId: string }) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const closeDetail = () => {
    setSelectedAccount(null);
    setTransactions([]);
  };

  useEffect(() => {
    if (!selectedAccount) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedAccount]);

  const openDetail = async (account: Account) => {
    setSelectedAccount(account);
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select("id, amount, transaction_type, transaction_date, note, categories(name)")
      .eq("household_id", householdId)
      .eq("account_id", account.id)
      .order("transaction_date", { ascending: false });
    const normalized = (data || []).map((tx: { categories?: unknown }) => ({
      ...tx,
      categories: Array.isArray(tx.categories) ? tx.categories[0] : tx.categories,
    }));
    setTransactions(normalized as Transaction[]);
    setLoading(false);
  };

  return (
    <>
      <div className="account-list">
        {accounts.length === 0 && <p className="muted">Belum ada akun. Tambahkan akun pertama kamu di bawah.</p>}
        {accounts.map((account) => (
          <div className="account-card" key={account.id}>
            <div>
              <strong>{account.name}</strong>
              <p className="muted">{ACCOUNT_TYPE_LABELS[account.account_type] || account.account_type}</p>
            </div>
            <div className="account-meta">
              <strong className={account.dynamic_balance >= 0 ? "income-text" : "expense-text"}>
                {formatRupiah(account.dynamic_balance)}
              </strong>
              <button className="detail-link" type="button" onClick={() => openDetail(account)} aria-label={`Lihat detail ${account.name}`} title="Lihat detail">Detail</button>
            </div>
          </div>
        ))}
      </div>

      {selectedAccount && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetail(); }}>
          <section className="account-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="account-detail-title">
            <button autoFocus className="dialog-close" type="button" onClick={closeDetail} aria-label="Tutup detail" title="Tutup">×</button>
            <p className="eyebrow">Rincian akun</p>
            <h2 id="account-detail-title">{selectedAccount.name}</h2>
            <p className="muted">{ACCOUNT_TYPE_LABELS[selectedAccount.account_type] || selectedAccount.account_type}</p>
            <div className={`detail-amount ${selectedAccount.dynamic_balance >= 0 ? "income-text" : "expense-text"}`}>
              {formatRupiah(selectedAccount.dynamic_balance)}
            </div>
            <div className="section-heading" style={{marginBottom: 12}}>
              <p className="eyebrow">Transaksi</p>
              <span className="muted">{transactions.length} transaksi</span>
            </div>
            {loading && <p className="muted">Memuat transaksi...</p>}
            {!loading && transactions.length === 0 && <p className="muted">Belum ada transaksi untuk akun ini.</p>}
            {!loading && transactions.length > 0 && (
              <div className="transaction-list">
                {transactions.map((tx) => (
                  <div className="transaction-row" key={tx.id}>
                    <div>
                      <strong>{tx.categories?.name || "Tanpa kategori"}</strong>
                      <p>{formatDate(tx.transaction_date)} {tx.note ? `· ${tx.note}` : ""}</p>
                    </div>
                    <div className="transaction-meta">
                      <strong className={tx.transaction_type === "income" ? "income-text" : "expense-text"}>
                        {tx.transaction_type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
