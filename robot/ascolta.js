/* ERUA connect — robot delle puntate
   ==================================================================
   Legge il feed pubblico del canale dell'alleanza e riscrive
   `dati/ascolta.json`.

       node robot/ascolta.js            aggiorna
       node robot/ascolta.js --prova    mostra cosa farebbe, non scrive

   **Perché non serve l'accesso al canale.** YouTube pubblica per ogni
   canale un feed leggibile senza chiave e senza account. Titolo, data e
   identificativo del video sono già tutto quello che la sezione usa.
   L'accesso al canale servirebbe per le cose private — statistiche,
   caricamenti — che qui non c'entrano.

   Non è solo comodità: §6.3 distingue l'incorporazione col componente
   ufficiale (conforme) dall'automazione tramite interfacce non
   ufficiali (esclusa dall'esercizio). Un feed che la piattaforma
   pubblica da sé sta dalla parte giusta.

   **Limite dichiarato.** Il feed dà le ultime 15 pubblicazioni. Basta a
   restare aggiornati, non a ricostruire l'archivio: il canale ne ha di
   più. Le puntate già presenti non vengono buttate — si uniscono alle
   nuove — quindi l'archivio si costruisce col tempo, e chi volesse
   recuperarlo tutto in un colpo dovrebbe passare dall'interfaccia
   ufficiale con una chiave.
*/

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { scarica } from './comune/rete.js';
import { leggiFeed, soloTesto } from './comune/feed.js';
import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'ascolta';

/* La configurazione è quella dell'applicazione: una sola, come chiede
   §2.4. La leggo come modulo, non ne tengo una copia qui. */
const { CONFIG } = await import(path.join(RADICE, 'configurazione.js'));

function esistenti() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(RADICE, 'dati', 'ascolta.json'), 'utf8'));
    return Array.isArray(j) ? j : (j.elementi || []);
  } catch (err) { return []; }
}

/* Da voce del feed a puntata, nella forma che la sezione già usa. */
function puntata(voce, indice) {
  return {
    id: 'yt-' + voce.id,
    t: voce.titolo,
    /* il numero di episodio, se il titolo lo dichiara */
    s: (/\bEp\.?\s*(\d+)/i.exec(voce.titolo) || /Episode\s*(\d+)/i.exec(voce.titolo))
      ? `ERUA Podcast · Episode ${(/\bEp\.?\s*(\d+)/i.exec(voce.titolo) || /Episode\s*(\d+)/i.exec(voce.titolo))[1]}`
      : 'ERUA Podcast',
    u: CONFIG.siglaAlleanza,
    data: voce.data,
    yt: voce.id,
    n: soloTesto(voce.sommario, 200),
    v: indice === 0 ? 1 : 0,
    /* Provenienza, su ogni singolo elemento. Serve a §6.5/P7 il giorno
       in cui una macchina scriverà una di queste righe: la casella c'è
       già, e chi legge sa sempre da dove viene quello che vede. */
    origine: {
      fonte: CONFIG.fonti.canaleVideo.nome,
      url: 'https://www.youtube.com/watch?v=' + voce.id,
      letto: new Date().toISOString().slice(0, 10),
      generato: null,        // { sistema, data, verificato:false } quando lo sarà
    },
  };
}

async function gira({ prova = false } = {}) {
  const avvio = Date.now();
  const canale = CONFIG.fonti.canaleVideo;

  const xml = await scarica(canale.feed);
  const voci = leggiFeed(xml);
  console.log(`feed letto: ${voci.length} video sul canale`);

  const puntate = voci.filter(v => canale.riconosciPuntata.test(v.titolo));
  console.log(`di cui puntate del podcast: ${puntate.length}`);
  if (voci.length && !puntate.length) {
    console.log('  (nessuna riconosciuta: controlla `riconosciPuntata` in configurazione.js)');
  }

  /* Le puntate già presenti restano: il feed ne mostra 15, l'archivio è
     più lungo. Le nuove hanno la precedenza in caso di stesso video. */
  const vecchie = esistenti();
  const perVideo = new Map();
  for (const p of vecchie) if (p.yt) perVideo.set(p.yt, p);
  puntate.forEach((v, i) => perVideo.set(v.id, puntata(v, i)));

  const tutte = [...perVideo.values()]
    .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
  /* solo la più recente porta il segno "ultima puntata" */
  tutte.forEach((p, i) => { p.v = i === 0 ? 1 : 0; });

  console.log(`totale dopo l'unione con l'archivio: ${tutte.length}`);
  if (prova) {
    console.log('\n--prova: non scrivo niente. Prime tre:');
    for (const p of tutte.slice(0, 3)) console.log(`  ${p.data || '????-??-??'}  ${p.t.slice(0, 70)}`);
    return { esito: 'saltato', quanti: tutte.length, messaggio: 'prova' };
  }

  const esito = scriviDati(
    path.join(RADICE, 'dati', 'ascolta.json'),
    tutte,
    { fonte: canale.nome, note: 'Feed pubblico del canale. Le ultime 15 pubblicazioni; l\'archivio si conserva.' });

  console.log(`scritto: ${esito.quanti} puntate (prima ${esito.quantiPrima}), ${Math.round(esito.byte / 1024)} KB`);
  return { esito: 'fatto', quanti: esito.quanti, durataSecondi: Math.round((Date.now() - avvio) / 1000) };
}

/* ── avvio ─────────────────────────────────────────────────────────── */
const prova = process.argv.includes('--prova');
try {
  const r = await gira({ prova });
  if (!prova) segnala(NOME, r);
} catch (err) {
  const grave = !(err instanceof RifiutoDiScrivere);
  console.error(`${NOME}: ${err.message}`);
  if (!prova) segnala(NOME, { esito: grave ? 'errore' : 'saltato', messaggio: err.message });
  process.exit(grave ? 1 : 0);
}
