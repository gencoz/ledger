import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  amountSchema,
  expenseCategories,
  parseCents,
  type Budget,
} from "../lib/schema";
import { currency, spendingByCategory } from "../lib/finance";
import type { Transaction } from "../data/transactions";
import Modal from "./Modal";
const formSchema = z.object({
  category: z.enum(expenseCategories),
  amount: amountSchema,
});
function BudgetForm({
  budget,
  onClose,
  onSave,
}: {
  budget: Budget;
  onClose: () => void;
  onSave: (b: Budget) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: budget.category,
      amount: budget.limit
        ? (budget.limit / 100).toFixed(2).replace(".", ",")
        : "",
    },
  });
  return (
    <Modal title="Imposta budget mensile" onClose={onClose}>
      <p className="modal-intro">
        Limite per {budget.month}. Un nuovo limite sostituisce quello della
        stessa categoria e dello stesso mese.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit((v) =>
          onSave({
            ...budget,
            category: v.category,
            limit: parseCents(v.amount)!,
          }),
        )}
      >
        <div className="form-grid">
          <label>
            Categoria
            <select {...register("category")}>
              {expenseCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Limite (€)
            <input
              autoFocus
              {...register("amount")}
              aria-label="Limite (€)"
              inputMode="decimal"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? "budget-error" : undefined}
            />
            {errors.amount && (
              <span id="budget-error" className="field-error">
                {errors.amount.message}
              </span>
            )}
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Annulla
          </button>
          <button className="export-button">Salva budget</button>
        </div>
      </form>
    </Modal>
  );
}
export default function Budgets({
  month,
  rows,
  budgets,
  onSave,
  onRemove,
}: {
  month: string;
  rows: Transaction[];
  budgets: Budget[];
  onSave: (b: Budget) => void;
  onRemove: (b: Budget) => void;
}) {
  const [editing, setEditing] = useState<Budget | null>(null);
  const spending = spendingByCategory(rows);
  const active = budgets.filter((b) => b.month === month);
  return (
    <section id="budgets" className="panel budget-panel">
      <div className="table-heading">
        <div>
          <h2>Un piano per il tuo mese</h2>
          <p>
            Budget per categoria · Solo spese completate del mese selezionato.
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => setEditing({ month, category: "Spesa", limit: 0 })}
        >
          Imposta budget
        </button>
      </div>
      {active.length ? (
        <div className="budget-grid">
          {active.map((b) => {
            const spent =
              spending.find((s) => s.name === b.category)?.value ?? 0;
            const percentage = Math.round((spent / b.limit) * 100);
            const remaining = b.limit - spent;
            return (
              <article className="budget-card" key={b.category}>
                <div className="flex justify-between gap-2">
                  <h3>{b.category}</h3>
                  <span
                    className={`budget-state ${spent >= b.limit ? "over" : ""}`}
                  >
                    {spent >= b.limit
                      ? "Limite raggiunto"
                      : spent >= b.limit * 0.8
                        ? "Vicino al limite"
                        : "In linea"}
                  </span>
                </div>
                <p>
                  <strong>{currency(spent)}</strong> di {currency(b.limit)}
                </p>
                <progress
                  aria-label={`Budget ${b.category}`}
                  value={Math.min(spent, b.limit)}
                  max={b.limit}
                />
                <p className={remaining < 0 ? "field-error" : ""}>
                  {remaining < 0 ? "Oltre il budget di" : "Disponibili"}{" "}
                  {currency(Math.abs(remaining))} · {percentage}%
                </p>
                <div className="flex gap-3">
                  <button
                    className="text-button"
                    aria-label={`Modifica budget ${b.category}`}
                    onClick={() => setEditing(b)}
                  >
                    Modifica
                  </button>
                  <button
                    className="text-button"
                    aria-label={`Rimuovi budget ${b.category}`}
                    onClick={() => onRemove(b)}
                  >
                    Rimuovi
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="budget-empty">
          <p>Nessun budget per questo mese.</p>
          <span>
            Parti da una categoria: scegli quanto vuoi spendere e segui i tuoi
            progressi.
          </span>
        </div>
      )}
      {editing && (
        <BudgetForm
          budget={editing}
          onClose={() => setEditing(null)}
          onSave={(b) => {
            onSave(b);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
