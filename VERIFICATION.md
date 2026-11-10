# Verifica Ledger 1.0

Verificata il 10 novembre 2026, Node 24.4.1, npm 11.4.2.

## Controlli automatici eseguiti

- `npm run check`: TypeScript strict, build Vite e 14 test superati in 3 file.
- 4 test delle aggregazioni finanziarie: saldo storico, categorie, movimenti in attesa, mesi senza entrate.
- 7 test di dominio: parsing monetario, date e categorie, storage non valido/non disponibile, filtri URL e CSV.
- 3 test d'integrazione React: creazione → persistenza → modifica → cancellazione; ricerca, paginazione e filtri; budget e separazione dei mesi.
- Installazione dipendenze: audit npm con 0 vulnerabilità segnalate.

## Controlli nel browser eseguiti

- Creazione di un movimento da 12,50 €: uscite passate da 1.192,69 a 1.205,19 €.
- Reload: movimento ancora presente e modificabile.
- Budget Spesa di 100 €: superamento visualizzato anche come testo.
- Cancellazione del solo movimento di verifica e rimozione del budget di verifica al termine.
- CSV dopo ricerca Spotify: download riuscito e contenuto verificato.
- Dialog su mobile: campo iniziale focalizzato, scroll interno, chiusura con Escape.
- Layout a 360, 768 e 1440 px: nessun overflow orizzontale della pagina; tabella scorrevole nel proprio contenitore.
- Nessun errore di console rilevato nella verifica finale.

## Limiti delle verifiche

I test React usano jsdom e sostituiscono i grafici con componenti minimi: i grafici reali sono stati verificati nel browser. Non è inclusa una suite Playwright automatizzata né una certificazione WCAG. La pipeline GitHub è predisposta ma non è stata eseguita su un repository remoto.

La build separa il codice dell'app (~370 kB prima di gzip) da Recharts (~407 kB). Tutti i chunk sono sotto la soglia di avviso di 500 kB. I grafici sono presenti nella dashboard iniziale, quindi la divisione migliora la separazione e la cache ma non elimina il loro download alla prima visita. Rollup segnala due annotazioni di commenti di Zod non riconosciute: le rimuove e completa la build.
