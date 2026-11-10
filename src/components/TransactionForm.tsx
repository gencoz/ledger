import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Transaction } from "../data/transactions";
import {
  categories,
  parseCents,
  snapshotDate,
  transactionFormSchema,
  type TransactionFormValues,
} from "../lib/schema";
import Modal from "./Modal";
export default function TransactionForm({
  transaction,
  month,
  onSave,
  onClose,
}: {
  transaction?: Transaction;
  month: string;
  onSave: (t: Transaction) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      merchant: transaction?.merchant ?? "",
      description: transaction?.description ?? "",
      date:
        transaction?.date ??
        (month === "2026-11" ? snapshotDate : month + "-10"),
      amount: transaction
        ? (Math.abs(transaction.amount) / 100).toFixed(2).replace(".", ",")
        : "",
      type: transaction && transaction.amount > 0 ? "income" : "expense",
      category: transaction?.category ?? "Spesa",
      status: transaction?.status ?? "Completata",
    },
  });
  const error = (name: keyof TransactionFormValues) =>
    errors[name] ? (
      <span id={`${name}-error`} className="field-error">
        {errors[name]?.message}
      </span>
    ) : null;
  const field = (name: keyof TransactionFormValues) => ({
    ...register(name),
    "aria-label": {
      merchant: "Esercente o beneficiario",
      amount: "Importo (€)",
      date: "Data",
      type: "Tipo",
      category: "Categoria",
      status: "Stato",
      description: "Nota facoltativa",
    }[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  return (
    <Modal
      title={transaction ? "Modifica transazione" : "Nuova transazione"}
      onClose={onClose}
    >
      <p className="modal-intro">
        Demo locale · I movimenti aggiornano subito saldo, grafici e budget.
      </p>
      <form
        noValidate
        onSubmit={handleSubmit((values) =>
          onSave({
            id: transaction?.id ?? crypto.randomUUID(),
            merchant: values.merchant,
            description: values.description,
            date: values.date,
            category: values.category,
            status: values.status,
            amount:
              parseCents(values.amount)! * (values.type === "income" ? 1 : -1),
          }),
        )}
      >
        <div className="form-grid">
          <label className="full">
            Esercente o beneficiario
            <input
              autoFocus
              {...field("merchant")}
              maxLength={80}
              placeholder="Es. Libreria indipendente"
            />
            {error("merchant")}
          </label>
          <label>
            Importo (€)
            <input
              {...field("amount")}
              inputMode="decimal"
              placeholder="0,00"
            />
            {error("amount")}
          </label>
          <label>
            Tipo
            <select {...field("type")}>
              <option value="expense">Uscita</option>
              <option value="income">Entrata</option>
            </select>
            {error("type")}
          </label>
          <label>
            Data
            <input
              {...field("date")}
              type="date"
              min="2026-06-01"
              max={snapshotDate}
            />
            {error("date")}
          </label>
          <label>
            Categoria
            <select {...field("category")}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {error("category")}
          </label>
          <label>
            Stato
            <select {...field("status")}>
              <option>Completata</option>
              <option>In attesa</option>
            </select>
            {error("status")}
          </label>
          <label className="full">
            Nota facoltativa
            <textarea {...field("description")} rows={2} maxLength={160} />
            {error("description")}
          </label>
        </div>
        <p className="form-hint">
          Periodo della demo: 1 giugno – 10 novembre 2026. Importi senza
          separatore delle migliaia.
        </p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Annulla
          </button>
          <button className="export-button" type="submit">
            Salva transazione
          </button>
        </div>
      </form>
    </Modal>
  );
}
