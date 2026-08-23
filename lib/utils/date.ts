const WIB_TIME_ZONE = "Asia/Jakarta";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: WIB_TIME_ZONE,
  }).format(new Date(`${date}T00:00:00+07:00`));
}

export function getCurrentMonthRange() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const currentMonth = Number(month);
  const nextMonthDate = new Date(Date.UTC(Number(year), currentMonth, 1));
  const nextYear = nextMonthDate.getUTCFullYear();
  const nextMonth = String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0");
  return {
    start: `${year}-${month}-01`,
    end: `${nextYear}-${nextMonth}-01`,
  };
}