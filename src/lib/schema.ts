import { z } from "zod";

export const categories = [
  "Stipendio",
  "Freelance",
  "Casa",
  "Spesa",
  "Shopping",
  "Trasporti",
  "Tempo libero",
] as const;
export const expenseCategories = [
  "Casa",
  "Spesa",
  "Shopping",
  "Trasporti",
  "Tempo libero",
] as const;
export const snapshotDate = "2026-11-10";
export const isValidDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
export const dateSchema = z
  .string()
  .refine(isValidDate, "Inserisci una data valida.")
  .refine(
    (v) => v >= "2026-06-01" && v <= snapshotDate,
    "Scegli una data tra il 1 giugno e il 10 novembre 2026.",
  );
// Parsing testuale: nessuna moltiplicazione di numeri decimali in virgola mobile.
export function parseCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && cents <= 100000000 ? cents : null;
}
export const amountSchema = z
  .string()
  .refine(
    (v) => parseCents(v) !== null,
    "Inserisci un importo tra 0,01 e 1.000.000 €, con massimo due decimali e senza separatore delle migliaia.",
  );
export const transactionFormSchema = z
  .object({
    merchant: z
      .string()
      .trim()
      .min(2, "Inserisci almeno 2 caratteri.")
      .max(80, "Massimo 80 caratteri."),
    description: z.string().trim().max(160, "Massimo 160 caratteri."),
    date: dateSchema,
    amount: amountSchema,
    type: z.enum(["income", "expense"]),
    category: z.enum(categories),
    status: z.enum(["Completata", "In attesa"]),
  })
  .refine(
    (v) =>
      (v.type === "income") ===
      (v.category === "Stipendio" || v.category === "Freelance"),
    {
      path: ["category"],
      message: "Scegli una categoria coerente con il tipo di movimento.",
    },
  );
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export const storedTransactionSchema = z
  .object({
    id: z.string().min(1).max(100),
    date: dateSchema,
    merchant: z.string().trim().min(2).max(80),
    description: z.string().max(160),
    category: z.enum(categories),
    amount: z
      .number()
      .int()
      .min(-100000000)
      .max(100000000)
      .refine((v) => v !== 0),
    status: z.enum(["Completata", "In attesa"]),
  })
  .refine(
    (v) =>
      v.amount > 0 ===
      (v.category === "Stipendio" || v.category === "Freelance"),
  );
export const budgetSchema = z.object({
  month: z.string().regex(/^2026-(0[6-9]|1[01])$/),
  category: z.enum(expenseCategories),
  limit: z.number().int().positive().max(100000000),
});
export type Budget = z.infer<typeof budgetSchema>;
export const savedStateSchema = z.object({
  version: z.literal(1),
  transactions: z
    .array(storedTransactionSchema)
    .max(10000)
    .refine((rows) => new Set(rows.map((t) => t.id)).size === rows.length),
  budgets: z
    .array(budgetSchema)
    .max(100)
    .refine(
      (rows) =>
        new Set(rows.map((b) => `${b.month}:${b.category}`)).size ===
        rows.length,
    ),
});
export type SavedState = z.infer<typeof savedStateSchema>;
