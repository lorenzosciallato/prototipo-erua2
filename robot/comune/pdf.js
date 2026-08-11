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
 * Legge una tabella a colonne fisse dove **una voce occupa più righe**.
 *
 * È il caso normale negli allegati dei bandi: il codice sta su una riga,
 * il nome dell'ateneo su quella dopo (e magari va a capo un'altra volta),
 * le lingue richieste su una terza. Leggere riga per riga dà risultati
 * che sembrano giusti e non lo sono — un pezzo di un ateneo attaccato a
 * quello prima.
 *
 * Quindi si lavora a blocchi: una riga apre una voce nuova, e tutto ciò
 * che segue fino alla prossima apertura appartiene a quella voce. Dentro
 * il blocco, ogni colonna si ricompone secondo la sua regola: il nome si
 * concatena, il numero si prende dove compare.
 *
 * @param {string} testo   l'uscita di `pdftotext -layout`
 * @param {object} regole
 *   - titoli:      i titoli delle colonne come compaiono nell'intestazione
 *   - colonne:     confini dichiarati a mano, [{nome, da, a}]. Servono
 *                  quando l'intestazione non è allineata al corpo — e
 *                  succede: in un allegato che ho letto, il codice e la
 *                  materia stavano venti caratteri più a sinistra del
 *                  loro titolo. Fidarsi dell'intestazione dava zero
 *                  risultati senza nessun errore, che è il modo peggiore
 *                  di sbagliare.
 *   - apre:        (celle, riga) => vero se qui comincia una voce nuova
 *   - unisci:      { colonna: 'concatena' | 'primo' } — come ricomporla
 *   - valida:      (voce) => vero se la voce ricomposta è utilizzabile
 * @returns { record, scartate, colonne }
 */
export function leggiTabella(testo, regole) {
  const righe = String(testo).split('\n');

  let colonne = regole.colonne || null;
  if (!colonne) {
    const intestazione = righe.find(r => regole.titoli.every(t => r.includes(t)));
    if (!intestazione) return { record: [], scartate: [], colonne: null, motivo: 'intestazione non trovata' };
    colonne = colonneDa(intestazione, regole.titoli);
    if (!colonne) return { record: [], scartate: [], colonne: null, motivo: 'colonne non riconosciute' };
  }

  const blocchi = [];
  let corrente = null;

  for (const riga of righe) {
    if (!riga.trim()) continue;
    /* l'intestazione si ripete a ogni pagina: non è un dato */
    if (regole.titoli && regole.titoli.every(t => riga.includes(t))) continue;

    const celle = {};
    for (const c of colonne) celle[c.nome] = cella(riga, c);

    if (regole.apre(celle, riga)) { corrente = { righe: [celle], testo: [riga] }; blocchi.push(corrente); }
    else if (corrente) { corrente.righe.push(celle); corrente.testo.push(riga); }
  }

  const record = [];
  const scartate = [];

  for (const b of blocchi) {
    const voce = {};
    for (const c of colonne) {
      const valori = b.righe.map(r => r[c.nome]).filter(Boolean);
      const modo = (regole.unisci && regole.unisci[c.nome]) || 'primo';
      voce[c.nome] = modo === 'concatena' ? valori.join(' ').replace(/\s+/g, ' ').trim() : (valori[0] || '');
    }
    voce._righe = b.testo.length;
    if (!regole.valida || regole.valida(voce)) record.push(voce);
    else scartate.push(b.testo[0]);
  }

  return { record, scartate, colonne };
}

/**
 * Raggruppa le righe in blocchi, senza interpretarle.
 *
 * Serve quando le colonne non tengono: un nome lungo sborda nella
 * colonna accanto, e tagliare a posizione fissa mette il paese dentro il
 * nome o viceversa. In quei casi conviene che sia chi conosce la fonte a
 * estrarre i campi — di solito con un'espressione ancorata alla **fine**
 * della riga, dove i numeri stanno sempre — e che questo file si limiti
 * a dire dove comincia e finisce una voce.
 *
 * @param {string} testo   l'uscita di `pdftotext -layout`
 * @param {function} apre  (riga) => vero se qui comincia una voce nuova
 * @param {function} salta (riga) => vero se la riga non è un dato
 * @returns [[riga, ...]]
 */
export function raggruppaBlocchi(testo, apre, salta = () => false) {
  const blocchi = [];
  let corrente = null;
  for (const riga of String(testo).split('\n')) {
    if (!riga.trim() || salta(riga)) continue;
    if (apre(riga)) { corrente = [riga]; blocchi.push(corrente); }
    else if (corrente) corrente.push(riga);
  }
  return blocchi;
}
