import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Sprout,
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  ChevronDown,
  Download,
  ArrowUp,
  ShieldCheck,
  Plus,
  Target,
} from "lucide-react";
import type { Transaction } from "./data/transactions";
import { initialState, loadState, saveState } from "./lib/storage";
import type { SavedState } from "./lib/schema";
import {
  emptyFilters,
  filterTransactions,
  readView,
  viewSearch,
} from "./lib/filters";
import { downloadCsv } from "./lib/csv";
import TransactionForm from "./components/TransactionForm";
import Budgets from "./components/Budgets";
import Modal from "./components/Modal";
import {
  balanceAt,
  currency,
  spendingByCategory,
  summarize,
} from "./lib/finance";
const CashflowChart = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.CashflowChart })),
);
const SpendingChart = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.SpendingChart })),
);
import TransactionTable from "./components/TransactionTable";
const months = [
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
];
export default function App() {
  const [loaded] = useState(() => {
    try {
      return loadState(window.localStorage);
    } catch {
      return {
        state: initialState(),
        warning: "Il salvataggio locale non è disponibile in questo browser.",
      };
    }
  });
  const [state, setState] = useState(loaded.state);
  const [warning, setWarning] = useState(loaded.warning);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState(() => readView(window.location.search));
  const { month, filters } = view;
  const [editing, setEditing] = useState<Transaction | "new" | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [resetting, setResetting] = useState(false);
  const transactions = state.transactions;
  useEffect(() => {
    const sync = () => setView(readView(window.location.search));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      viewSearch(month, filters) + window.location.hash,
    );
  }, [month, filters]);
  function commit(next: SavedState, message: string) {
    setState(next);
    try {
      setWarning(saveState(next, window.localStorage));
    } catch {
      setWarning(
        "Salvataggio non disponibile: le modifiche resteranno solo in questa sessione.",
      );
    }
    setNotice(message);
  }
  function saveTransaction(t: Transaction) {
    commit(
      {
        ...state,
        transactions:
          editing === "new"
            ? [...transactions, t]
            : transactions.map((row) => (row.id === t.id ? t : row)),
      },
      "Transazione salvata.",
    );
    setView({ month: t.date.slice(0, 7), filters: { ...emptyFilters } });
    setEditing(null);
  }
  const rows = transactions.filter((t) => t.date.startsWith(month));
  const totals = summarize(rows);
  const filtered = filterTransactions(rows, filters);
  const series = months
    .map((name, i) => {
      const key = `2026-${String(i + 6).padStart(2, "0")}`;
      return {
        name: name.slice(0, 3),
        key,
        ...summarize(transactions.filter((t) => t.date.startsWith(key))),
      };
    })
    .filter((d) => d.key <= month);
  const cards = [
    {
      label: "Saldo disponibile",
      value: balanceAt(transactions, month),
      icon: Wallet,
      note: "Saldo iniziale + movimenti contabilizzati",
      featured: true,
    },
    {
      label: "Entrate del mese",
      value: totals.income,
      icon: ArrowDownLeft,
      note: "Stipendio e progetti freelance",
    },
    {
      label: "Uscite del mese",
      value: totals.expenses,
      icon: ArrowUpRight,
      note: "Solo transazioni completate",
    },
    {
      label: "Risparmio del mese",
      value: totals.savings,
      icon: Sprout,
      note: `${totals.rate.toFixed(1).replace(".", ",")}% delle entrate messe da parte`,
    },
  ];
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Vai al contenuto
      </a>
      <aside className="sidebar">
        <a className="brand" href="#main">
          <span className="brand-mark">l.</span>ledger
          <span className="brand-dot">®</span>
        </a>
        <div className="workspace">
          <span className="avatar">AL</span>
          <div>
            Spazio personale<small>Account demo</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">IL TUO SPAZIO</div>
        <nav aria-label="Navigazione principale">
          <a href="#main" className="active">
            <LayoutDashboard size={18} />
            Panoramica
          </a>
          <a href="#transactions">
            <ArrowLeftRight size={18} />
            Transazioni
          </a>
          <a href="#analytics">
            <ChartNoAxesCombined size={18} />
            Analisi
          </a>
          <a href="#budgets">
            <Target size={18} />
            Budget
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <ShieldCheck size={21} />
            <strong>Un po’ più di chiarezza.</strong>
            <p>
              Le tue finanze, tutte in un posto. Esplora Ledger con dati
              simulati.
            </p>
            <span>VERSIONE PORTFOLIO · 1.0</span>
          </div>
          <div className="profile">
            <span className="avatar">AL</span>
            <div>
              Alex Lombardi<small>Profilo dimostrativo</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            Spazio personale <span className="mx-3 text-stone-300">/</span>{" "}
            <strong>Panoramica</strong>
          </span>
          <span className="demo-badge">
            <span /> Modalità demo
          </span>
        </header>
        <main id="main">
          {warning && (
            <div role="alert" className="storage-warning">
              {warning}
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">LE TUE FINANZE, IN CHIARO</div>
              <h1>Ogni movimento conta.</h1>
              <p>Ecco come stanno andando le tue finanze, Alex.</p>
            </div>
            <div className="heading-actions">
              <label className="month-select">
                <span className="sr-only">Mese di riferimento</span>
                <select
                  value={month}
                  onChange={(e) =>
                    setView({
                      month: e.target.value,
                      filters: { ...emptyFilters },
                    })
                  }
                >
                  {months.map((m, i) => (
                    <option
                      key={m}
                      value={`2026-${String(i + 6).padStart(2, "0")}`}
                    >
                      {m} 2026
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="secondary-button"
                disabled={!filtered.length}
                onClick={() => downloadCsv(filtered, month)}
              >
                <Download size={16} />
                Esporta CSV
              </button>
              <button
                className="export-button"
                onClick={() => setEditing("new")}
              >
                <Plus size={16} />
                Nuova transazione
              </button>
            </div>
          </div>
          <section aria-label="Riepilogo finanziario" className="kpi-grid">
            {cards.map((card) => (
              <article
                className={`kpi ${card.featured ? "featured" : ""}`}
                key={card.label}
              >
                <div className="flex items-center justify-between">
                  <span>{card.label}</span>
                  <card.icon size={19} />
                </div>
                <strong>{currency(card.value)}</strong>
                <p>
                  {card.featured ? (
                    <>
                      <span className="balance-dot" /> Saldo contabilizzato del
                      mese
                    </>
                  ) : (
                    card.note
                  )}
                </p>
              </article>
            ))}
          </section>
          <div id="analytics" className="analytics-grid">
            <section className="panel cashflow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2>Il tuo flusso di cassa</h2>
                  <p>Un passo indietro, per vedere più lontano.</p>
                </div>
                <div className="legend">
                  <span>
                    <i />
                    Entrate
                  </span>
                  <span>
                    <i />
                    Uscite
                  </span>
                </div>
              </div>
              <div className="chart-summary">
                <strong>{currency(totals.savings)}</strong>
                <span>
                  <ArrowUp size={13} /> risparmio netto del mese
                </span>
              </div>
              <Suspense
                fallback={
                  <div className="chart-loading" role="status">
                    Caricamento grafico…
                  </div>
                }
              >
                <CashflowChart data={series} />
              </Suspense>
              <details className="chart-details">
                <summary>Visualizza i dati del grafico</summary>
                <table>
                  <thead>
                    <tr>
                      <th>Mese</th>
                      <th>Entrate</th>
                      <th>Uscite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {series.map((d) => (
                      <tr key={d.key}>
                        <td>{d.name}</td>
                        <td>{currency(d.income)}</td>
                        <td>{currency(d.expenses)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </section>
            <section className="panel spending">
              <h2>Dove vanno i tuoi soldi</h2>
              <p>Le uscite, categoria per categoria.</p>
              <Suspense
                fallback={
                  <div className="chart-loading" role="status">
                    Caricamento grafico…
                  </div>
                }
              >
                <SpendingChart
                  data={spendingByCategory(rows)}
                  total={totals.expenses}
                />
              </Suspense>
            </section>
          </div>
          <div className="insight">
            <span className="insight-icon">
              <Sprout size={21} />
            </span>
            <p>
              <strong>
                {totals.savings < 0
                  ? "Tieni d’occhio il tuo equilibrio."
                  : "Stai dando spazio ai tuoi progetti."}
              </strong>{" "}
              {totals.savings < 0
                ? `Le uscite superano le entrate di ${currency(-totals.savings)}.`
                : totals.income
                  ? `Questo mese hai risparmiato il ${Math.round(totals.rate)}% delle entrate.`
                  : "Nessuna entrata contabilizzata in questo mese."}
            </p>
            <span className="insight-tag">Il tuo mese in breve</span>
          </div>
          <TransactionTable
            key={month}
            rows={filtered}
            total={rows.length}
            filters={filters}
            onFilters={(filters) => setView({ ...view, filters })}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
          <Budgets
            key={`budget-${month}`}
            month={month}
            rows={rows}
            budgets={state.budgets}
            onSave={(b) =>
              commit(
                {
                  ...state,
                  budgets: [
                    ...state.budgets.filter(
                      (v) => v.month !== b.month || v.category !== b.category,
                    ),
                    b,
                  ],
                },
                "Budget salvato.",
              )
            }
            onRemove={(b) =>
              commit(
                {
                  ...state,
                  budgets: state.budgets.filter(
                    (v) => v.month !== b.month || v.category !== b.category,
                  ),
                },
                "Budget rimosso.",
              )
            }
          />
          <div className="data-settings">
            <span>Demo locale · Modifiche salvate in questo browser.</span>
            <button className="text-button" onClick={() => setResetting(true)}>
              Ripristina dati demo
            </button>
          </div>
          <footer className="page-footer">
            <span>Ledger · Progettato per fare chiarezza.</span>
            <span>Dati simulati · Aggiornati al 10 novembre 2026</span>
          </footer>
        </main>
      </div>
      <div className="notice" role="status" aria-live="polite">
        {notice && (
          <>
            <span>{notice}</span>
            <button aria-label="Chiudi notifica" onClick={() => setNotice("")}>
              ×
            </button>
          </>
        )}
      </div>
      {editing && (
        <TransactionForm
          transaction={editing === "new" ? undefined : editing}
          month={month}
          onSave={saveTransaction}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <Modal
          title="Eliminare questa transazione?"
          onClose={() => setDeleting(null)}
        >
          <p className="modal-intro">
            {deleting.merchant} · {currency(deleting.amount)}. Saldo e budget
            verranno ricalcolati.
          </p>
          <div className="modal-actions">
            <button
              autoFocus
              className="secondary-button"
              onClick={() => setDeleting(null)}
            >
              Annulla
            </button>
            <button
              className="danger-button"
              onClick={() => {
                commit(
                  {
                    ...state,
                    transactions: transactions.filter(
                      (t) => t.id !== deleting.id,
                    ),
                  },
                  "Transazione eliminata.",
                );
                setDeleting(null);
              }}
            >
              Elimina transazione
            </button>
          </div>
        </Modal>
      )}
      {resetting && (
        <Modal
          title="Ripristinare la demo?"
          onClose={() => setResetting(false)}
        >
          <p className="modal-intro">
            Le transazioni personali e tutti i budget locali saranno sostituiti
            dai dati iniziali. Questa operazione non si può annullare.
          </p>
          <div className="modal-actions">
            <button
              autoFocus
              className="secondary-button"
              onClick={() => setResetting(false)}
            >
              Annulla
            </button>
            <button
              className="danger-button"
              onClick={() => {
                commit(initialState(), "Dati demo ripristinati.");
                setView({ month: "2026-11", filters: { ...emptyFilters } });
                setResetting(false);
              }}
            >
              Ripristina demo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
