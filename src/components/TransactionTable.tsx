import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Transaction } from "../data/transactions";
import { currency, dateLabel } from "../lib/finance";
import { categories } from "../lib/schema";
import { emptyFilters, type Filters } from "../lib/filters";
export default function TransactionTable({
  rows,
  total,
  filters,
  onFilters,
  onEdit,
  onDelete,
}: {
  rows: Transaction[];
  total: number;
  filters: Filters;
  onFilters: (f: Filters) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / 8));
  const current = Math.min(page, pageCount);
  function change(update: Partial<Filters>) {
    setPage(1);
    onFilters({ ...filters, ...update });
  }
  return (
    <section id="transactions" className="panel scroll-mt-5">
      <div className="table-heading">
        <div>
          <h2>Le tue transazioni</h2>
          <p>
            I filtri e il CSV riguardano la tabella. KPI e budget mostrano
            l’intero mese.
          </p>
        </div>
        <label className="search">
          <Search size={16} />
          <input
            value={filters.query}
            onChange={(e) => change({ query: e.target.value })}
            placeholder="Cerca transazione…"
            aria-label="Cerca transazioni"
          />
        </label>
      </div>
      <div className="filters">
        <label>
          Tipo
          <select
            value={filters.type}
            onChange={(e) => change({ type: e.target.value })}
          >
            <option value="all">Tutti i movimenti</option>
            <option value="income">Entrate</option>
            <option value="expense">Uscite</option>
          </select>
        </label>
        <label>
          Stato
          <select
            value={filters.status}
            onChange={(e) => change({ status: e.target.value })}
          >
            <option value="all">Tutti gli stati</option>
            <option>Completata</option>
            <option>In attesa</option>
          </select>
        </label>
        <label>
          Dal
          <input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => change({ from: e.target.value })}
          />
        </label>
        <label>
          Al
          <input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => change({ to: e.target.value })}
          />
        </label>
        <label>
          Ordina per
          <select
            value={filters.sort}
            onChange={(e) => change({ sort: e.target.value })}
          >
            <option value="date-desc">Data: più recenti</option>
            <option value="date-asc">Data: meno recenti</option>
            <option value="amount-desc">Importo decrescente</option>
            <option value="amount-asc">Importo crescente</option>
          </select>
        </label>
        <button
          className="text-button"
          onClick={() => {
            setPage(1);
            onFilters({ ...emptyFilters });
          }}
        >
          Azzera filtri
        </button>
        <fieldset className="category-filters">
          <legend>Categorie</legend>
          {categories.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={filters.categories.includes(c)}
                onChange={(e) =>
                  change({
                    categories: e.target.checked
                      ? [...filters.categories, c]
                      : filters.categories.filter((v) => v !== c),
                  })
                }
              />
              {c}
            </label>
          ))}
        </fieldset>
      </div>
      {filters.from && filters.to && filters.from > filters.to && (
        <p role="alert" className="filter-error">
          La data iniziale deve precedere quella finale.
        </p>
      )}
      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Tabella transazioni scorrevole"
      >
        <table>
          <caption className="sr-only">
            Transazioni del mese selezionato, importi in euro
          </caption>
          <thead>
            <tr>
              <th scope="col">Transazione</th>
              <th scope="col">Categoria</th>
              <th scope="col">Data</th>
              <th scope="col">Stato</th>
              <th scope="col" className="text-right">
                Importo
              </th>
              <th scope="col">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice((current - 1) * 8, current * 8).map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span
                      className={`merchant-icon ${t.amount > 0 ? "income" : ""}`}
                    >
                      {t.amount > 0 ? (
                        <ArrowDownLeft size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}
                    </span>
                    <div className="merchant-name">
                      {t.merchant}
                      <small>{t.description}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category">{t.category}</span>
                </td>
                <td className="whitespace-nowrap text-stone-500">
                  {dateLabel(t.date)}
                </td>
                <td>
                  <span
                    className={`status ${t.status === "In attesa" ? "pending" : ""}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td
                  className={`text-right whitespace-nowrap font-semibold ${t.amount > 0 ? "text-emerald-800" : ""}`}
                >
                  {t.amount > 0 ? "+" : ""}
                  {currency(t.amount)}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      className="icon-button"
                      aria-label={`Modifica ${t.merchant}`}
                      onClick={() => onEdit(t)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Elimina ${t.merchant}`}
                      onClick={() => onDelete(t)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state" role="status">
            <h3>Nessuna transazione trovata</h3>
            <p>Modifica i filtri o aggiungi un movimento in questo mese.</p>
          </div>
        )}
      </div>
      <footer className="table-footer pagination">
        <span aria-live="polite">
          {rows.length} di {total} transazioni · Pagina {current} di {pageCount}
        </span>
        <div>
          <button
            className="secondary-button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Precedente
          </button>
          <button
            className="secondary-button"
            disabled={current >= pageCount}
            onClick={() => setPage(current + 1)}
          >
            Successiva
          </button>
        </div>
      </footer>
    </section>
  );
}
