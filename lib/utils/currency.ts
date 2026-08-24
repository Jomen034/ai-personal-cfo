const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number | string) {
  return idrFormatter.format(Number(amount)).replace(/\u00a0/g, " ");
}