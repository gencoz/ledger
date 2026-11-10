import type { Transaction } from "../data/transactions";
import { categories, isValidDate } from "./schema";
export interface Filters {
  query: string;
  categories: string[];
  type: string;
  status: string;
  from: string;
  to: string;
  sort: string;
}
export const emptyFilters: Filters = {
  query: "",
  categories: [],
  type: "all",
  status: "all",
  from: "",
  to: "",
  sort: "date-desc",
};
export function readView(search: string) {
  const p = new URLSearchParams(search);
  const month = p.get("month") ?? "2026-11";
  return {
    month: /^2026-(0[6-9]|1[01])$/.test(month) ? month : "2026-11",
    filters: {
      query: (p.get("q") ?? "").slice(0, 160),
      categories: p
        .getAll("category")
        .filter((c) => categories.some((v) => v === c)),
      type: ["income", "expense"].includes(p.get("type") ?? "")
        ? p.get("type")!
        : "all",
      status: ["Completata", "In attesa"].includes(p.get("status") ?? "")
        ? p.get("status")!
        : "all",
      from: isValidDate(p.get("from") ?? "") ? p.get("from")! : "",
      to: isValidDate(p.get("to") ?? "") ? p.get("to")! : "",
      sort: ["date-asc", "amount-asc", "amount-desc"].includes(
        p.get("sort") ?? "",
      )
        ? p.get("sort")!
        : "date-desc",
    },
  };
}
export function viewSearch(month: string, f: Filters) {
  const p = new URLSearchParams({ month });
  if (f.query) p.set("q", f.query);
  f.categories.forEach((c) => p.append("category", c));
  if (f.type !== "all") p.set("type", f.type);
  if (f.status !== "all") p.set("status", f.status);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.sort !== "date-desc") p.set("sort", f.sort);
  return "?" + p.toString();
}
export function filterTransactions(rows: Transaction[], f: Filters) {
  return rows
    .filter(
      (t) =>
        `${t.merchant} ${t.description} ${t.category}`
          .toLocaleLowerCase("it")
          .includes(f.query.trim().toLocaleLowerCase("it")) &&
        (!f.categories.length || f.categories.includes(t.category)) &&
        (f.type === "all" ||
          (f.type === "income" ? t.amount > 0 : t.amount < 0)) &&
        (f.status === "all" || f.status === t.status) &&
        (!f.from || t.date >= f.from) &&
        (!f.to || t.date <= f.to),
    )
    .sort((a, b) => {
      const order =
        f.sort === "amount-asc"
          ? a.amount - b.amount
          : f.sort === "amount-desc"
            ? b.amount - a.amount
            : f.sort === "date-asc"
              ? a.date.localeCompare(b.date)
              : b.date.localeCompare(a.date);
      return order || a.id.localeCompare(b.id);
    });
}
