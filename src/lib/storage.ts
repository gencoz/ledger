import { transactions } from "../data/transactions";
import { savedStateSchema, type SavedState } from "./schema";
export const storageKey = "ledger.state.v1";
export const initialState = (): SavedState => ({
  version: 1,
  transactions: [...transactions],
  budgets: [],
});
export function loadState(storage: Pick<Storage, "getItem">): {
  state: SavedState;
  warning: string;
} {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return { state: initialState(), warning: "" };
    const parsed = savedStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("Invalid data");
    return { state: parsed.data, warning: "" };
  } catch {
    return {
      state: initialState(),
      warning:
        "I dati salvati non sono disponibili o non sono validi. Stai usando la demo; un nuovo salvataggio sostituirà i dati locali precedenti.",
    };
  }
}
export function saveState(
  state: SavedState,
  storage: Pick<Storage, "setItem">,
): string {
  try {
    storage.setItem(storageKey, JSON.stringify(savedStateSchema.parse(state)));
    return "";
  } catch {
    return "Salvataggio locale non riuscito. Le modifiche restano in questa sessione: esporta il CSV prima di chiudere.";
  }
}
