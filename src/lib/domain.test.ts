import { describe, it, expect } from "vitest";
import { parseCents, savedStateSchema, transactionFormSchema } from "./schema";
import { initialState, loadState, saveState } from "./storage";
import {
  emptyFilters,
  filterTransactions,
  readView,
  viewSearch,
} from "./filters";
import { toCsv } from "./csv";
import { transactions } from "../data/transactions";

describe("validazione monetaria e dati persistenti", () => {
  it("accetta virgola e punto senza arrotondamenti impliciti", () => {
    expect(parseCents("0,29")).toBe(29);
    expect(parseCents(" 12.3 ")).toBe(1230);
    for (const invalid of [
      "0",
      "-1",
      "1.234",
      "1e3",
      "1,000.00",
      "1000000.01",
      "NaN",
      "",
    ])
      expect(parseCents(invalid)).toBeNull();
  });
  it("rifiuta date inesistenti e categorie incoerenti", () => {
    const valid = {
      merchant: "Test",
      description: "",
      date: "2026-11-10",
      amount: "12,50",
      type: "expense",
      category: "Spesa",
      status: "Completata",
    };
    expect(transactionFormSchema.safeParse(valid).success).toBe(true);
    expect(
      transactionFormSchema.safeParse({ ...valid, date: "2026-06-31" }).success,
    ).toBe(false);
    expect(
      transactionFormSchema.safeParse({ ...valid, category: "Stipendio" })
        .success,
    ).toBe(false);
  });
  it("gestisce JSON corrotto, versioni sconosciute e ID duplicati senza crash", () => {
    expect(loadState({ getItem: () => "{" }).warning).toBeTruthy();
    expect(
      loadState({ getItem: () => JSON.stringify({ version: 99 }) }).warning,
    ).toBeTruthy();
    const state = initialState();
    state.transactions.push(state.transactions[0]);
    expect(savedStateSchema.safeParse(state).success).toBe(false);
  });
  it("segnala quota storage e legge i dati salvati validi", () => {
    expect(
      saveState(initialState(), {
        setItem: () => {
          throw new Error("quota");
        },
      }),
    ).toContain("non riuscito");
    expect(
      loadState({ getItem: () => JSON.stringify(initialState()) }).state,
    ).toEqual(initialState());
  });
});
describe("filtri e CSV", () => {
  it("combina categorie, tipo, stato e intervallo senza mutare il dataset", () => {
    const before = JSON.stringify(transactions);
    const found = filterTransactions(transactions, {
      ...emptyFilters,
      categories: ["Spesa"],
      type: "expense",
      status: "Completata",
      from: "2026-11-01",
      to: "2026-11-10",
      sort: "amount-asc",
    });
    expect(found).toHaveLength(2);
    expect(found[0].amount).toBeLessThan(found[1].amount);
    expect(JSON.stringify(transactions)).toBe(before);
    expect(
      filterTransactions(transactions, {
        ...emptyFilters,
        query: "non esiste",
      }),
    ).toHaveLength(0);
  });
  it("riproduce filtri URL e ignora valori non validi", () => {
    const filters = {
      ...emptyFilters,
      query: "Casa & spesa",
      categories: ["Casa", "Spesa"],
      from: "2026-10-01",
    };
    expect(readView(viewSearch("2026-10", filters))).toEqual({
      month: "2026-10",
      filters,
    });
    expect(readView("?month=bad&from=invalid&type=oops").month).toBe("2026-11");
  });
  it("protegge testo CSV con formule, separatori, virgolette e nuove righe", () => {
    const csv = toCsv([
      {
        ...transactions[0],
        merchant: '=HYPERLINK("x")',
        description: "Una; nota\nseconda riga",
        amount: -1234,
      },
    ]);
    expect(csv).toContain('"\'=HYPERLINK(""x"")"');
    expect(csv).toContain('"Una; nota\nseconda riga"');
    expect(csv).toContain(";-12,34;");
  });
});
