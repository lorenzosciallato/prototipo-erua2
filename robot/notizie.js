/* ERUA connect — robot delle notizie
   ==================================================================
   Legge i feed degli atenei e riscrive `dati/notizie.json`.

       node robot/notizie.js            aggiorna
       node robot/notizie.js --prova    mostra cosa farebbe, non scrive

   **Cosa prende, e cosa non prende.** §6.2 è netto: dei testi delle
   notizie istituzionali il rischio è contenuto — gli enti hanno
   interesse a diffonderle — ma le **immagini** hanno licenza intestata
   all'ateneo e non estensibile a chi ripubblica, e le banche immagini
   hanno rilevamento automatico e prassi di richiesta di pagamento.
   Quindi: titolo, ente, estratto breve, collegamento alla fonte. Le
   immagini non si copiano mai, nemmeno quando il feed le offre.
   L'elemento visivo accanto alla notizia lo genera l'applicazione —
   colore, simbolo, sigla dell'ateneo.

   **Aggiornamento parziale.** Solo un ateneo su nove pubblica oggi un
   feed. Gli altri non vengono cancellati: le loro notizie restano come
   sono, e il robot dice quali ha saltato. Meglio un elenco per metà
   vecchio che una sezione mezza vuota. Quando si troverà il feed di un
   altro ateneo, basta scriverlo in `configurazione.js`: qui non si
   tocca niente.
*/

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { scaricaTutte } from './comune/rete.js';
import { leggiFeed, soloTesto } from './comune/feed.js';
import { leggiPagina } from './comune/pagina.js';
import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'notizie';
const PER_ATENEO = 12;      // quante tenerne per ciascuno

const { CONFIG } = await import(path.join(RADICE, 'configurazione.js'));

function esistenti() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(RADICE, 'dati', 'notizie.json'), 'utf8'));
    return Array.isArray(j) ? j : (j.elementi || []);
  } catch (err) { return []; }
}

/* Da voce del feed a notizia, nella forma che la sezione già usa.
   Nessun campo per le immagini: non è una dimenticanza (§6.2). */
function notizia(voce, fonte) {
  return {
    u: fonte.uni,
    t: voce.titolo,
    d: voce.data,
    s: soloTesto(voce.sommario, 200),
    l: voce.collegamento,
    origine: {
      fonte: fonte.sito,
      url: voce.collegamento,
      letto: new Date().toISOString().slice(0, 10),
      generato: null,     // nessuna macchina ha scritto questo testo
    },
  };
}

async function gira({ prova = false } = {}) {
  const avvio = Date.now();
  const fonti = CONFIG.fonti.notizie;

  const esiti = await scaricaTutte(fonti);

  const fresche = new Map();     // sigla ateneo → notizie nuove
  const saltati = [], falliti = [];

  for (const e of esiti) {
    if (e.saltata) { saltati.push(e.fonte.uni); continue; }
    if (e.errore)  { falliti.push(`${e.fonte.uni} (${e.errore})`); continue; }
    const voci = leggiFeed(e.testo);
    if (!voci.length) { falliti.push(`${e.fonte.uni} (feed illeggibile)`); continue; }
    fresche.set(e.fonte.uni, voci.slice(0, PER_ATENEO).map(v => notizia(v, e.fonte)));
    console.log(`  ${e.fonte.uni.padEnd(8)} ${voci.length} voci lette`);
  }

  if (saltati.length) console.log(`\nsenza feed dichiarato, non toccati: ${saltati.join(', ')}`);
  if (falliti.length) console.log(`non raggiunti, non toccati: ${falliti.join(', ')}`);

  /* Chi ha dato notizie nuove viene sostituito; chi no resta com'era. */
  const vecchie = esistenti();
  const tenute = vecchie.filter(n => !fresche.has(n.u));
  const tutte = [...[...fresche.values()].flat(), ...tenute]
    .sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));

  console.log(`\ntotale: ${tutte.length} (${tutte.length - tenute.length} aggiornate, ${tenute.length} conservate)`);

  if (prova) {
    console.log('\n--prova: non scrivo niente. Prime tre:');
    for (const n of tutte.slice(0, 3)) console.log(`  ${n.d}  ${n.u.padEnd(8)} ${n.t.slice(0, 62)}`);
    return { esito: 'saltato', quanti: tutte.length, messaggio: 'prova' };
  }

  const esito = scriviDati(
    path.join(RADICE, 'dati', 'notizie.json'),
    tutte,
    { fonte: 'siti istituzionali degli atenei',
      note: 'Titolo, ente, estratto e collegamento alla fonte. Nessuna immagine copiata (§6.2).' });

  console.log(`scritto: ${esito.quanti} notizie (prima ${esito.quantiPrima}), ${Math.round(esito.byte / 1024)} KB`);
  return {
    esito: 'fatto',
    quanti: esito.quanti,
    messaggio: saltati.length ? `senza feed: ${saltati.join(' ')}` : null,
    durataSecondi: Math.round((Date.now() - avvio) / 1000),
  };
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
