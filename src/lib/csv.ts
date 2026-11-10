import type { Transaction } from "../data/transactions";
function cell(value: string) {
  // Neutralizza formule di foglio di calcolo nei campi di testo inseriti dall'utente.
  const safe = /^[\s]*[=+@\-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function toCsv(rows: Transaction[]) {
  return (
    "\uFEFFData;Esercente;Descrizione;Categoria;Importo EUR;Stato\r\n" +
    rows
      .map((t) =>
        [
          cell(t.date),
          cell(t.merchant),
          cell(t.description),
          cell(t.category),
          (t.amount / 100).toFixed(2).replace(".", ","),
          cell(t.status),
        ].join(";"),
      )
      .join("\r\n")
  );
}
export function downloadCsv(rows: Transaction[], month: string) {
  const url = URL.createObjectURL(
    new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `ledger-${month}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
