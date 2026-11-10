import { describe, it, expect } from "vitest";
import { summarize, balanceAt, spendingByCategory } from "./finance";
import {
  openingBalance,
  transactions,
  type Transaction,
} from "../data/transactions";
const row = (
  amount: number,
  status: Transaction["status"] = "Completata",
): Transaction => ({
  id: "test",
  date: "2026-11-01",
  merchant: "Test",
  description: "Test",
  category: "Casa",
  amount,
  status,
});
describe("calcoli finanziari", () => {
  it("calcola il netto ed esclude le autorizzazioni in attesa", () => {
    expect(
      summarize([row(10000), row(-3000), row(-9000, "In attesa")]),
    ).toEqual({ income: 10000, expenses: 3000, savings: 7000, rate: 70 });
  });
  it("gestisce mesi vuoti e senza entrate", () => {
    expect(summarize([])).toEqual({
      income: 0,
      expenses: 0,
      savings: 0,
      rate: 0,
    });
    expect(summarize([row(-100)]).rate).toBe(0);
  });
  it("il saldo storico non include mesi futuri o movimenti in attesa", () => {
    expect(balanceAt([row(100), row(-50, "In attesa")], "2026-10")).toBe(
      openingBalance,
    );
    expect(balanceAt([row(100), row(-50, "In attesa")], "2026-11")).toBe(
      openingBalance + 100,
    );
  });
  it("riconcilia categorie, KPI e saldo del dataset", () => {
    const november = transactions.filter((t) => t.date.startsWith("2026-11"));
    expect(
      spendingByCategory(november).reduce((sum, c) => sum + c.value, 0),
    ).toBe(summarize(november).expenses);
    expect(
      balanceAt(transactions, "2026-11") - balanceAt(transactions, "2026-10"),
    ).toBe(summarize(november).savings);
    expect(transactions.every((t) => Number.isSafeInteger(t.amount))).toBe(
      true,
    );
  });
});
