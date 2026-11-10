# Ledger — Portfolio fintech · v1.0

Una dashboard personale per leggere i movimenti, gestire le transazioni e seguire i budget mensili. Demo frontend completa in italiano, con importi in euro e dati simulati.

**React · TypeScript strict · Vite · Tailwind CSS · Recharts · React Hook Form · Zod · Vitest · Testing Library**

## Avvio rapido

Usa Node.js 24 LTS e npm. Il progetto è stato verificato con Node 24.4.1.

```bash
npm ci
npm run dev
```

Apri http://127.0.0.1:5173 o l'indirizzo mostrato da Vite.

```bash
npm run check       # TypeScript, build e tutti i test
npm test            # test unitari e d'integrazione
npm run test:watch  # test durante lo sviluppo
npm run format      # Prettier
npm run build       # produce dist/
npm run preview     # serve la build localmente
```

## Cosa puoi fare

- Leggere saldo, entrate, uscite, risparmio e distribuzione delle spese.
- Esplorare sei mesi con grafici e una tabella testuale alternativa.
- Creare e modificare transazioni con validazione, confermare l'eliminazione e vedere subito i riepiloghi aggiornati.
- Cercare per esercente/nota/categoria, selezionare più categorie, tipo, stato e intervallo date; ordinare e paginare.
- Riaprire la stessa vista tramite il link: mese e filtri sono nell'URL.
- Esportare tutte le righe filtrate in CSV, anche oltre la pagina corrente.
- Impostare budget per categoria e mese, vedere residuo e soglie 80%/100% con indicazioni testuali.
- Ritrovare transazioni e budget dopo il reload, con salvataggio locale versionato e validato.
- Ripristinare la demo dopo conferma.

**KPI, grafici e budget rappresentano l'intero mese selezionato. I filtri riguardano soltanto la tabella e il CSV.** Cambiare mese azzera i filtri; salvare una transazione apre il suo mese e azzera i filtri per renderla visibile.

## Percorso demo per un colloquio

1. Mostra novembre: distingui saldo cumulativo, entrate/uscite mensili e risparmio netto.
2. Crea una spesa da 12,50 € e osserva il ricalcolo di KPI e categorie.
3. Ricarica: il movimento rimane. Modificalo in “In attesa”: resta in tabella ma esce dai riepiloghi.
4. Filtra per categoria e stato; copia il link della vista ed esporta il CSV.
5. Imposta un budget Spesa di 100 €: compare il superamento. Cambia mese per mostrare l'indipendenza dei budget.
6. Mostra un errore di validazione e spiega i test che impediscono regressioni.

## Architettura

```text
src/
  App.tsx                    Composizione, stato e coordinamento delle modifiche
  App.test.tsx               Flussi React con Testing Library
  components/
    Charts.tsx              Grafici caricati in un modulo separato
    TransactionTable.tsx    Filtri, tabella e paginazione
    TransactionForm.tsx     Form tipizzato con validazione Zod
    Budgets.tsx             Limiti mensili e avanzamento
    Modal.tsx               Dialog nativo, focus ed Escape
  data/transactions.ts      Dataset iniziale e tipi
  lib/
    finance.ts              Calcoli e formattazione
    schema.ts               Validazione, date e parsing degli importi
    storage.ts              Lettura/scrittura dello stato locale v1
    filters.ts              Filtri, ordinamento e serializzazione URL
    csv.ts                  Export e protezione dei campi testuali
    *.test.ts               Test delle regole di dominio
  styles.css                Tailwind e stile responsive
.github/workflows/ci.yml     Installazione, build e test per GitHub
```

Lo stato è locale al componente principale. Non servono uno store globale o un router per questa dashboard a sezioni. I calcoli sono funzioni pure, indipendenti da React; persistenza ed export hanno moduli separati. La pipeline presuppone che questa cartella sia la radice del repository.

## Precisione dei dati

- Importi in **centesimi interi**. Il form accetta `12,50` e `12.50`, senza separatori delle migliaia; rifiuta più di due decimali e importi fuori limite.
- Saldo iniziale: **6.240,00 €** al 1 giugno 2026. Saldo del mese = iniziale + tutti i movimenti completati fino a quel mese.
- Risparmio = entrate − uscite. Il tasso vale zero in assenza di entrate; un saldo mensile negativo ha un messaggio dedicato.
- Le transazioni in attesa sono escluse da KPI, grafici e budget.
- Snapshot demo fisso: **1 giugno – 10 novembre 2026**. Il form permette soltanto questo periodo. Novembre è parziale; il dataset sintetico concentra i movimenti nei primi dieci giorni di ogni mese.
- CSV con BOM UTF-8, separatore `;`, decimali con virgola, escaping di virgolette/nuove righe e neutralizzazione delle formule nei campi testuali.

## Persistenza e limiti

Lo stato è salvato in `localStorage` alla chiave `ledger.state.v1`. Un payload non valido o di versione sconosciuta non manda in crash l'app: viene mostrata la demo con un avviso. Non viene sovrascritto automaticamente finché non si effettua una modifica. Se la scrittura fallisce, un avviso indica che le modifiche resteranno solo nella sessione.

Il link della vista contiene i filtri, **non i dati**: chi lo apre altrove vede il proprio dataset locale. I dati non sono sincronizzati tra dispositivi o schede; evitare modifiche concorrenti in più schede. Il CSV esporta le transazioni, non i budget, e non è un backup reimportabile. Per la v1 è previsto un massimo di 10.000 transazioni salvate.

Nessun backend, login o collegamento bancario. Nessuna operazione finanziaria reale. Questa è la versione completa della **demo portfolio locale**, non un servizio bancario di produzione.

## Qualità e accessibilità

14 test su calcoli, parsing, storage, filtri, CSV e flussi di creazione/modifica/eliminazione/budget. Focus visibile, campi etichettati, errori associati ai campi, dialog nativo con Escape, conferme delle azioni distruttive, regioni live, skip link e dati testuali alternativi ai grafici. Layout verificato su desktop, tablet e mobile; tabella con scroll indipendente.

Risultati e limiti: [VERIFICATION.md](../VERIFICATION.md). Non è dichiarata una conformità WCAG completa.

## Pubblicazione e prossime evoluzioni

La build `dist/` può essere pubblicata su hosting statico con comando `npm run build`, directory di output `dist`. I filtri usano query string e la navigazione usa ancore: non servono riscritture per route interne. Nessun deployment è stato effettuato da questa sessione.

Per una v2: suite E2E Playwright e audit axe nel browser, import/export JSON completo, sincronizzazione multi-scheda, periodi dinamici, API con stati loading/error e autenticazione. Per un backend, ricalcolare gli importi lato server e aggiungere autorizzazioni, audit trail e idempotenza.

Riferimenti: [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite), [Vite](https://vite.dev/guide/).
