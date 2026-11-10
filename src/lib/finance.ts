import { openingBalance, type Transaction } from "../data/transactions";
export const currency = (cents: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
export function summarize(rows: Transaction[]) {
  const settled = rows.filter((t) => t.status === "Completata");
  const income = settled.reduce((sum, t) => sum + Math.max(t.amount, 0), 0);
  const expenses = settled.reduce((sum, t) => sum + Math.max(-t.amount, 0), 0);
  return {
    income,
    expenses,
    savings: income - expenses,
    rate: income ? ((income - expenses) / income) * 100 : 0,
  };
}
export function balanceAt(rows: Transaction[], month: string) {
  return (
    openingBalance +
    rows
      .filter((t) => t.status === "Completata" && t.date.slice(0, 7) <= month)
      .reduce((sum, t) => sum + t.amount, 0)
  );
}
export function spendingByCategory(rows: Transaction[]) {
  const totals = new Map<string, number>();
  rows
    .filter((t) => t.status === "Completata" && t.amount < 0)
    .forEach((t) =>
      totals.set(t.category, (totals.get(t.category) ?? 0) - t.amount),
    );
  return Array.from(totals, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value,
  );
}
