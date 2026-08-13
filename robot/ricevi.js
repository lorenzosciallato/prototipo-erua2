/* ERUA connect — ricevere dati da fuori (n8n, o qualunque altra cosa)
   ==================================================================
       node robot/ricevi.js notizie < roba.json
       node robot/ricevi.js ascolta --file /tmp/puntate.json
       node robot/ricevi.js notizie --prova < roba.json

   **A che serve.** I robot in questa cartella fanno due mestieri: vanno
   a prendere i dati, e li scrivono con tutte le cautele del caso. Questo
   file fa **solo il secondo**. Serve quando è qualcun altro ad andare a
   prenderli — tipicamente n8n, che sa gestire orari, riprove e soprattutto
   le autorizzazioni OAuth, quelle che servono per leggere dal canale
   YouTube i video non elencati.

   **Perché non lasciar scrivere direttamente a n8n.** Perché le cautele
   non sono un dettaglio, e in un'interfaccia grafica non si rileggono e
   non si collaudano. Passando di qui, qualunque cosa arrivi da fuori
   riceve lo stesso trattamento dei dati raccolti in casa:

   - **il vuoto non si pubblica**: se arrivano zero elementi, o molti
     meno di prima, si rifiuta e resta l'aggiornamento precedente;
   - **la forma si controlla**: gli elementi senza i campi che la sezione
     usa vengono scartati e contati, non pubblicati a metà;
   - **la scrittura è atomica**: il sito non vede mai mezzo file;
   - **la provenienza si scrive**: da dove viene, quando, e la casella
     per dire se l'ha prodotto una macchina (§6.5);
   - **l'esito finisce nel registro**, così il silenzio si nota.

   Chi manda i dati non deve sapere niente di tutto questo. Manda un
   elenco JSON e legge il codice d'uscita: 0 fatto, 1 rifiutato.
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* La forma minima che ogni sezione si aspetta. Non è una validazione
   completa e non vuole esserlo: controlla che ci sia quello **senza cui
   la sezione si romperebbe a schermo**, e lascia passare il resto.
   Un elenco di campi obbligatori troppo lungo fa scartare dati buoni. */
const FORME = {
  notizie: {
    file: 'dati/notizie.json',
    obbligatori: ['u', 't', 'l'],
    descrizione: 'ateneo, titolo, collegamento',
  },
  ascolta: {
    file: 'dati/ascolta.json',
    obbligatori: ['id', 't', 'yt'],
    descrizione: 'identificativo, titolo, video',
  },
  didattica: {
    file: 'dati/didattica.json',
    obbligatori: [],
    descrizione: 'oggetto con gruppi, corsi, approfondimenti',
    oggetto: true,
  },
  studenti: {
    file: 'dati/studenti.json',
    obbligatori: ['id', 'tit'],
    descrizione: 'identificativo, titolo',
  },
};

function leggiIngresso(daFile) {
  if (daFile) return fs.readFileSync(daFile, 'utf8');
  /* da standard input: è così che n8n passa il risultato di un nodo */
  try { return fs.readFileSync(0, 'utf8'); }
  catch (err) { throw new Error('niente in ingresso: passa un file con --file oppure scrivi su standard input'); }
}

function main() {
  const argomenti = process.argv.slice(2);
  const sezione = argomenti.find(a => !a.startsWith('--'));
  const prova = argomenti.includes('--prova');
  const forza = argomenti.includes('--forza');
  const i = argomenti.indexOf('--file');
  const daFile = i > -1 ? argomenti[i + 1] : null;

  if (!sezione || !FORME[sezione]) {
    console.error(`Uso: node robot/ricevi.js <sezione> [--file f] [--prova] [--forza]`);
    console.error(`Sezioni: ${Object.keys(FORME).join(', ')}`);
    process.exit(2);
  }
  const forma = FORME[sezione];

  let dentro;
  try {
    dentro = JSON.parse(leggiIngresso(daFile));
  } catch (err) {
    console.error(`ingresso illeggibile: ${err.message}`);
    segnala(`ricevi:${sezione}`, { esito: 'errore', messaggio: 'ingresso illeggibile' });
    process.exit(1);
  }

  /* n8n manda spesso [{json:{...}}, ...]: si accetta anche quella forma,
     invece di costringere chi monta il flusso a rimappare. */
  if (Array.isArray(dentro) && dentro.length && dentro[0] && typeof dentro[0] === 'object' && 'json' in dentro[0]) {
    dentro = dentro.map(x => x.json);
  }
  if (!Array.isArray(dentro) && dentro && Array.isArray(dentro.elementi)) dentro = dentro.elementi;

  if (forma.oggetto) {
    if (Array.isArray(dentro) || typeof dentro !== 'object') {
      console.error(`${sezione} vuole un oggetto (${forma.descrizione}), è arrivato un elenco`);
      process.exit(1);
    }
  } else if (!Array.isArray(dentro)) {
    console.error(`${sezione} vuole un elenco di elementi, è arrivato ${typeof dentro}`);
    process.exit(1);
  }

  const oggi = new Date().toISOString().slice(0, 10);
  let scartati = 0;
  let elementi = dentro;

  if (!forma.oggetto) {
    elementi = dentro.filter(e => {
      const buono = e && typeof e === 'object' && forma.obbligatori.every(c => e[c] != null && e[c] !== '');
      if (!buono) scartati++;
      return buono;
    }).map(e => ({
      ...e,
      /* la provenienza si scrive comunque: chi ha mandato i dati può
         averla omessa, ma il sito deve poter dire da dove vengono */
      origine: {
        fonte: 'ricevuto da un processo esterno',
        letto: oggi,
        generato: null,
        ...(e.origine || {}),
      },
    }));
  }

  const quanti = forma.oggetto ? Object.keys(elementi).length : elementi.length;
  console.log(`${sezione}: ${quanti} elementi accettati` +
    (scartati ? `, ${scartati} scartati perché manca ${forma.descrizione}` : ''));

  if (prova) {
    console.log('--prova: non scrivo niente.');
    return { esito: 'saltato', quanti, messaggio: 'prova' };
  }

  const esito = scriviDati(
    path.join(RADICE, forma.file),
    forma.oggetto ? [] : elementi,
    { fonte: 'processo esterno (n8n)',
      note: scartati ? `${scartati} elementi scartati perché incompleti.` : null },
    { forza });

  console.log(`scritto: ${esito.quanti} (prima ${esito.quantiPrima}), ${Math.round(esito.byte / 1024)} KB`);
  return { esito: 'fatto', quanti: esito.quanti, messaggio: scartati ? `${scartati} scartati` : null };
}

try {
  const r = main();
  if (r && r.esito !== 'saltato') segnala(`ricevi:${process.argv[2]}`, r);
} catch (err) {
  const grave = !(err instanceof RifiutoDiScrivere);
  console.error(err.message);
  segnala(`ricevi:${process.argv[2]}`, { esito: grave ? 'errore' : 'saltato', messaggio: err.message });
  process.exit(1);
}
