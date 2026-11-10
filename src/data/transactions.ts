export type Category =
  | "Stipendio"
  | "Freelance"
  | "Casa"
  | "Spesa"
  | "Shopping"
  | "Trasporti"
  | "Tempo libero";
export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  description: string;
  category: Category;
  amount: number;
  status: "Completata" | "In attesa";
}
// Importi in centesimi interi. Dataset deterministico: giugno–novembre 2026.
export const openingBalance = 624000;
export const transactions: Transaction[] = Array.from(
  { length: 6 },
  (_, month) => {
    const prefix = `2026-${String(month + 6).padStart(2, "0")}`;
    const rows: [number, string, string, Category, number][] = [
      [1, "Studio Forma", "Stipendio mensile", "Stipendio", 265000],
      [2, "Affitto casa", "Bonifico ricorrente", "Casa", -78000],
      [3, "Esselunga", "Spesa settimanale", "Spesa", -6850 - month * 210],
      [4, "ATM Milano", "Abbonamento mensile", "Trasporti", -3900],
      [5, "Spotify", "Abbonamento Premium", "Tempo libero", -1099],
      [6, "Enel Energia", "Utenze domestiche", "Casa", -8450 + month * 130],
      [7, "Uniqlo", "Acquisto con carta", "Shopping", -7990 - month * 320],
      [
        8,
        "Officina Digitale",
        "Progetto freelance",
        "Freelance",
        35000 + month * 5000,
      ],
      [9, "Carrefour", "Spesa settimanale", "Spesa", -5730 - month * 90],
      [10, "Osteria del Naviglio", "Cena con amici", "Tempo libero", -4800],
    ];
    return rows.map<Transaction>(
      ([day, merchant, description, category, amount], i) => ({
        id: `${prefix}-${i}`,
        date: `${prefix}-${String(day).padStart(2, "0")}`,
        merchant,
        description,
        category,
        amount,
        status: "Completata",
      }),
    );
  },
)
  .flat()
  .concat([
    {
      id: "pending-1",
      date: "2026-11-10",
      merchant: "Amazon",
      description: "Autorizzazione carta",
      category: "Shopping",
      amount: -4590,
      status: "In attesa",
    },
  ]);
