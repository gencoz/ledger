// @vitest-environment jsdom
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import App from "./App";
import { storageKey } from "./lib/storage";
vi.mock("./components/Charts", () => ({
  CashflowChart: () => <div>Grafico flussi</div>,
  SpendingChart: () => <div>Grafico categorie</div>,
}));
beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);
describe("flussi della dashboard", () => {
  it("crea, persiste, modifica ed elimina un movimento aggiornando i riepiloghi", async () => {
    const user = userEvent.setup();
    const app = render(<App />);
    await user.click(screen.getByRole("button", { name: "Nuova transazione" }));
    const dialog = within(screen.getByRole("dialog"));
    await user.click(dialog.getByRole("button", { name: "Salva transazione" }));
    expect(
      await dialog.findByText("Inserisci almeno 2 caratteri."),
    ).toBeVisible();
    await user.type(
      dialog.getByLabelText("Esercente o beneficiario"),
      "Libreria test",
    );
    await user.type(dialog.getByLabelText("Importo (€)"), "12,50");
    await user.click(dialog.getByRole("button", { name: "Salva transazione" }));
    expect(await screen.findByText("Libreria test")).toBeVisible();
    expect(
      JSON.parse(localStorage.getItem(storageKey)!).transactions,
    ).toHaveLength(62);
    expect(
      screen.getByRole("region", { name: "Riepilogo finanziario" }),
    ).toHaveTextContent("1205,19");
    app.unmount();
    render(<App />);
    expect(screen.getByText("Libreria test")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Modifica Libreria test" }),
    );
    const edit = within(screen.getByRole("dialog"));
    await user.clear(edit.getByLabelText("Importo (€)"));
    await user.type(edit.getByLabelText("Importo (€)"), "20");
    await user.click(edit.getByRole("button", { name: "Salva transazione" }));
    expect(
      screen.getByRole("region", { name: "Riepilogo finanziario" }),
    ).toHaveTextContent("1212,69");
    await user.click(
      screen.getByRole("button", { name: "Elimina Libreria test" }),
    );
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Annulla",
      }),
    );
    expect(screen.getByText("Libreria test")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Elimina Libreria test" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Elimina transazione" }),
    );
    expect(screen.queryByText("Libreria test")).not.toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem(storageKey)!).transactions,
    ).toHaveLength(61);
  });
  it("filtra, azzera, pagina e conserva la vista nell’URL", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Successiva" }));
    expect(screen.getByText("Studio Forma")).toBeVisible();
    await user.type(screen.getByLabelText("Cerca transazioni"), "Spotify");
    expect(screen.getByText("Spotify")).toBeVisible();
    expect(screen.queryByText("Amazon")).not.toBeInTheDocument();
    expect(window.location.search).toContain("q=Spotify");
    await user.click(screen.getByRole("button", { name: "Azzera filtri" }));
    await user.selectOptions(screen.getByLabelText("Stato"), "In attesa");
    expect(screen.getByText("Amazon")).toBeVisible();
    expect(screen.queryByText("Spotify")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Cerca transazioni"), "zzz");
    expect(screen.getByText("Nessuna transazione trovata")).toBeVisible();
    expect(screen.getByRole("button", { name: "Esporta CSV" })).toBeDisabled();
  });
  it("mantiene budget separati per mese e segnala il superamento", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Imposta budget" }));
    await user.type(
      within(screen.getByRole("dialog")).getByLabelText("Limite (€)"),
      "100",
    );
    await user.click(screen.getByRole("button", { name: "Salva budget" }));
    expect(screen.getByText(/Oltre il budget di/)).toHaveTextContent("40,80");
    await user.selectOptions(
      screen.getByLabelText("Mese di riferimento"),
      "2026-10",
    );
    expect(screen.getByText("Nessun budget per questo mese.")).toBeVisible();
    await user.selectOptions(
      screen.getByLabelText("Mese di riferimento"),
      "2026-11",
    );
    expect(
      screen.getByRole("progressbar", { name: "Budget Spesa" }),
    ).toBeVisible();
  });
});
