/* ERUA connect — leggere una tabella da un PDF
   ==================================================================
   Gli allegati dei bandi Erasmus sono tabelle stampate: nate per essere
   guardate da una persona, non lette da un programma. Non c'è un modo
   elegante di farlo, e chi dice il contrario non ci ha provato.

   **Come funziona.** `pdftotext -layout` conserva le posizioni: una
   colonna che sullo stampato comincia al centimetro tale, nel testo
   comincia al carattere tale. Quindi non si cerca di indovinare i campi
   con delle espressioni — si legge l'intestazione della tabella, si
   ricavano da lì i confini delle colonne, e si tagliano le righe a quei
   confini. È il metodo che regge meglio quando dentro una cella c'è uno
   spazio, o un nome che somiglia a un numero.

   `pdftotext` è un programma a parte, richiamato dalla riga di comando:
   la sua licenza non tocca il nostro codice (riferimento.md §6.7).

   **Quello che non fa.** Non ricostruisce celle unite, non capisce le
   note a piè di pagina, non indovina. Le righe che non tornano vengono
   restituite a parte, contate, e chi chiama decide: qui la scelta è
   sempre stata di non pubblicarle.

   **Quello che si romperà.** Il prossimo anno l'ateneo rifà l'allegato,
   sposta una colonna, e questo smette di leggere. È previsto: il
   controllo sul numero di righe se ne accorge, e le colonne si
   ridichiarano in configurazione senza toccare il programma.
*/

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Il PDF diventa testo che conserva l'impaginazione. */
export function testoDaPdf(datiPdf) {
  const tmp = path.join(os.tmpdir(), `erua-${process.pid}-${Date.now()}.pdf`);
  try {
    fs.writeFileSync(tmp, datiPdf);
    return execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', tmp, '-'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } finally {
    /* il temporaneo se ne va sempre, anche in caso di errore (§2.8) */
    try { fs.unlinkSync(tmp); } catch (err) { /* già sparito */ }
  }
}

/**
 * Ricava i confini delle colonne dall'intestazione della tabella.
 * @param {string} riga      la riga d'intestazione
 * @param {string[]} titoli  i titoli delle colonne, nell'ordine
 * @returns [{ nome, da, a }] oppure null se un titolo non c'è
 */
export function colonneDa(riga, titoli) {
  const posizioni = titoli.map(t => ({ nome: t, da: riga.indexOf(t) }));
  if (posizioni.some(p => p.da < 0)) return null;
  return posizioni.map((p, i) => ({
    nome: p.nome,
    da: p.da,
    a: i + 1 < posizioni.length ? posizioni[i + 1].da : riga.length + 400,
  }));
}

const cella = (riga, c) => (riga.slice(c.da, c.a) || '').replace(/\s+/g, ' ').trim();

/**
 * Legge una tabella a colonne fisse.
 *
 * @param {string} testo        l'uscita di `pdftotext -layout`
 * @param {object} regole
 *   - titoli:     i titoli delle colonne, come compaiono nell'intestazione
 *   - rigaBuona:  dice se una riga è l'inizio di un record
 *   - continua:   dice se una riga è la coda di un record precedente
 *                 (nelle tabelle stampate i nomi lunghi vanno a capo)
 * @returns { record: [{...celle}], scartate: [], colonne }
 */
export function leggiTabella(testo, regole) {
  const righe = String(testo).split('\n');
  const intestazione = righe.find(r => regole.titoli.every(t => r.includes(t)));
  if (!intestazione) return { record: [], scartate: [], colonne: null, motivo: 'intestazione non trovata' };

  const colonne = colonneDa(intestazione, regole.titoli);
  if (!colonne) return { record: [], scartate: [], colonne: null, motivo: 'colonne non riconosciute' };

  const record = [];
  const scartate = [];

  for (const riga of righe) {
    if (!riga.trim()) continue;
    if (riga.includes(regole.titoli[0]) && riga.includes(regole.titoli[1])) continue;   // intestazione ripetuta a ogni pagina

    const celle = {};
    for (const c of colonne) celle[c.nome] = cella(riga, c);

    if (regole.rigaBuona(celle, riga)) { record.push({ ...celle, _riga: riga }); continue; }

    /* Coda di un record precedente: un nome andato a capo. Si attacca a
       quello che c'è, invece di buttarlo. */
    if (record.length && regole.continua && regole.continua(celle, riga)) {
      const ultimo = record[record.length - 1];
      for (const c of colonne) {
        if (celle[c.nome] && regole.attaccabili && regole.attaccabili.includes(c.nome)) {
          ultimo[c.nome] = `${ultimo[c.nome]} ${celle[c.nome]}`.trim();
        }
      }
      continue;
    }

    if (Object.values(celle).some(v => v)) scartate.push(riga);
  }

  return { record, scartate, colonne };
}
