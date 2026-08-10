/* ERUA connect — scrittura dei file di dati
   ==================================================================
   Tutti i robot passano da qui. Il punto non è scrivere un file: è non
   riuscire a fare danno.

   Tre garanzie, che vengono da riferimento.md §2.8 e §2.2:

   1. **Scrittura atomica.** Si scrive un file temporaneo, lo si rilegge,
      e solo se si rilegge bene prende il posto di quello buono. Il sito
      non può mai trovarsi davanti a mezzo file. Il temporaneo si
      cancella sempre, anche quando le cose vanno male.

   2. **Il vuoto non si pubblica.** Se una fonte cambia struttura, un
      lettore che non la capisce più restituisce zero elementi. Senza
      controllo, quello zero cancellerebbe la sezione. Qui un risultato
      molto più povero del precedente viene rifiutato: resta in piedi
      l'aggiornamento di ieri, che è vecchio ma vero. L'interruzione di
      un processo automatico non deve fermare l'app (§2.2).

   3. **Ogni file dice di sé.** Numero di versione, quando è stato
      scritto, da quale fonte. §2.9 chiede il numero di versione perché
      al rilascio parte degli utenti ha ancora in cache la versione
      prima: ai file di dati si aggiungono campi, non se ne tolgono.
*/

import fs from 'node:fs';
import path from 'node:path';

export const VERSIONE_DATI = 1;

/* Sotto quale soglia un calo di elementi è sospetto invece che normale.
   0.5 = se arriva meno della metà di quello che c'era, non pubblico. */
const CALO_SOSPETTO = 0.5;

export class RifiutoDiScrivere extends Error {}

/* Legge quello che c'è adesso, per poterlo confrontare. */
function esistente(assoluto) {
  try {
    const t = fs.readFileSync(assoluto, 'utf8');
    const j = JSON.parse(t);
    return Array.isArray(j) ? { elementi: j } : j;
  } catch (err) {
    return null;   // non c'è, o è illeggibile: qualunque cosa è meglio
  }
}

/**
 * @param {string} assoluto      dove va il file
 * @param {Array}  elementi      il contenuto
 * @param {object} intestazione  { fonte, note }
 * @param {object} opzioni       { forza: salta il controllo sul calo }
 */
export function scriviDati(assoluto, elementi, intestazione = {}, opzioni = {}) {
  if (!Array.isArray(elementi)) throw new TypeError('gli elementi devono essere un elenco');

  const prima = esistente(assoluto);
  const quantiPrima = (prima && Array.isArray(prima.elementi)) ? prima.elementi.length : 0;

  if (!elementi.length && quantiPrima) {
    throw new RifiutoDiScrivere(
      `non scrivo: zero elementi, ma ${quantiPrima} c'erano. Resta l'aggiornamento precedente.`);
  }
  if (!opzioni.forza && quantiPrima && elementi.length < quantiPrima * CALO_SOSPETTO) {
    throw new RifiutoDiScrivere(
      `non scrivo: da ${quantiPrima} a ${elementi.length} elementi. ` +
      `Sembra che la fonte sia cambiata, non che il mondo si sia svuotato. ` +
      `Se il calo è vero, rilancia con --forza.`);
  }

  const contenuto = {
    versione: VERSIONE_DATI,
    aggiornato: new Date().toISOString(),
    fonte: intestazione.fonte || null,
    note: intestazione.note || null,
    elementi,
  };

  fs.mkdirSync(path.dirname(assoluto), { recursive: true });
  const temporaneo = assoluto + '.in-scrittura';
  try {
    fs.writeFileSync(temporaneo, JSON.stringify(contenuto, null, 1) + '\n');
    /* rileggo prima di sostituire: se non si rilegge, non lo pubblico */
    const riletto = JSON.parse(fs.readFileSync(temporaneo, 'utf8'));
    if (!Array.isArray(riletto.elementi) || riletto.elementi.length !== elementi.length) {
      throw new RifiutoDiScrivere('il file riletto non corrisponde a quello scritto');
    }
    fs.renameSync(temporaneo, assoluto);
  } finally {
    /* il temporaneo se ne va sempre, anche in caso di errore (§2.8) */
    try { fs.unlinkSync(temporaneo); } catch (err) { /* già rinominato o mai creato */ }
  }

  return { quanti: elementi.length, quantiPrima, byte: fs.statSync(assoluto).size };
}
