# Stato del lavoro — ERUA connect

Questo file risponde a una domanda sola: **a che punto siamo e cosa manca.**
La parte descrittiva la aggiorno io a ogni intervento sul codice di presentazione;
il blocco finale è timbrato automaticamente e riporta solo dati misurati.

Regole permanenti e quadro completo: `riferimento.md`. Sintesi operativa: `CLAUDE.md`.

---

## Dove siamo

**Momento zero non superato.** Nessun ente ha ancora assunto per iscritto la
titolarità del trattamento, quindi niente utenti reali: si collauda solo con
account propri (`riferimento.md` §7.0).

Esiste un **prototipo di presentazione**: `index.html`, un unico file che contiene
struttura, stile, comportamento, dati della rivista e immagini incorporate in
base64. Le sezioni presenti sono rivista, didattica (vetrina), notizie, sociale,
messaggistica e profilo. I testi lunghi sono segnaposto: titoli, autori e alcune
fotografie sono veri, il corpo degli articoli no.

Non esiste ancora nessuna componente a database: niente PostgreSQL, niente
policy di riga (RLS), niente accesso via collegamento monouso. Tutto quello che
si vede gira nel browser.

## Cosa manca, in ordine

1. **Scorporare `index.html`.** Il file monolitico va diviso secondo
   `riferimento.md` §2.4: un file di configurazione, un file di testi per lingua,
   un file di dati per sezione, un modulo di codice per sezione. Farlo dopo
   costa una riscrittura, non una modifica.
2. **Togliere le immagini base64 dal codice.** Sono la ragione per cui il file
   pesa oltre 800 KB: ogni salvataggio ne riscrive una copia intera nella
   cronologia di git.
3. **Base di dati e autorizzazione.** Prima le policy di riga con il collaudo che
   deve fallire (`riferimento.md` §3.2), poi le funzioni che le usano.
4. **Documenti per l'attivazione** (§7.3), predisposti prima, pubblicati quando
   l'ente assume la titolarità.

## Da collaudare

Nulla di collaudato finora: non esistono prove automatiche. Il primo collaudo da
scrivere è quello di autorizzazione descritto in §3.2 — il tentativo, da parte di
un utente, di leggere i dati di un altro, che deve fallire.

## Automatismi attivi

- **Salvataggio automatico:** ogni modifica a un file `.html`, `.css` o `.js`
  viene registrata in un commit e mandata su GitHub.
- **Controllo dei segreti (P4):** gira prima di ogni salvataggio; se trova una
  credenziale nel codice, blocca commit e pubblicazione.
  Si lancia anche a mano: `.claude/hooks/cerca-segreti.sh`

<!-- TIMBRO AUTOMATICO — aggiornato dal salvataggio automatico, non modificare a mano -->

## Registro automatico

Ultimo salvataggio: **10/08/2026 alle 20:22** — file toccato: `moduli/ascolta.js`

| File | Righe | Peso |
|:--|--:|--:|
| `configurazione.js` | 177 | 12K |
| `index.html` | 5356 | 796K |
| `moduli/ascolta.js` | 135 | 8.0K |
| `moduli/notizie.js` | 101 | 8.0K |
| `moduli/nucleo.js` | 231 | 12K |

<!-- fine timbro automatico -->
