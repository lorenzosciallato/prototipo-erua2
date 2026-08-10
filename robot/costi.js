/* ERUA connect — robot del costo della vita
   ==================================================================
       node robot/costi.js            aggiorna
       node robot/costi.js --prova    mostra cosa farebbe, non scrive

   **Perché questi numeri e non altri.** La domanda dello studente è
   «con la borsa ci sto dentro?». Rispondere con una cifra inventata —
   «a Vilnius servono 700 € al mese» — sarebbe facile e sbagliato: nessuno
   può sapere quanto spende una persona che non conosce, e chi si fida di
   quella cifra prende una decisione da un anno di vita.

   Quindi qui non si stima niente. Si prendono i **livelli comparativi
   dei prezzi** che Eurostat pubblica per ogni paese: quanto costa una
   cosa lì rispetto alla media europea. Da due indici si ricava un
   confronto onesto — «l'alloggio a Vilnius costa il 36% meno che a
   Macerata» — che è aritmetica su dati ufficiali, non una previsione.

   L'altra metà della risposta, la cifra in euro, è la **borsa Erasmus+**:
   è ufficiale, sta nel bando, e la mette il robot dei bandi.

   Fonte: Eurostat, `prc_ppp_ind`, livelli comparativi dei prezzi con
   UE27 = 100. Interfaccia pubblica, nessuna chiave, licenza di riuso
   con attribuzione — che è il motivo per cui la fonte compare nella
   scheda e non solo qui dentro.
*/

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scarica } from './comune/rete.js';
import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'costi';

const EUROSTAT = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_ppp_ind';

/* Le quattro voci che pesano sul mese di uno studente. I codici sono
   quelli della classificazione europea dei consumi. */
const VOCI = [
  { cod: 'A0104', id: 'alloggio',  it: 'Alloggio e utenze',   en: 'Housing and utilities' },
  { cod: 'A0101', id: 'spesa',     it: 'Spesa alimentare',    en: 'Groceries' },
  { cod: 'A0107', id: 'trasporti', it: 'Trasporti',           en: 'Transport' },
  { cod: 'A0111', id: 'fuori',     it: 'Mangiare fuori',      en: 'Eating out' },
];

/* Eurostat pubblica con un ritardo di un anno o due: si prova dall'anno
   più recente all'indietro e si prende il primo che ha dei dati. Non si
   fissa un anno nel codice, che diventerebbe vecchio da solo. */
const ANNI = [2025, 2024, 2023];

async function prendiVoce(cod, anno) {
  const url = `${EUROSTAT}?format=JSON&lang=EN&na_item=PLI_EU27_2020&ppp_cat=${cod}&time=${anno}`;
  const j = JSON.parse(await scarica(url));
  const geo = j.dimension && j.dimension.geo && j.dimension.geo.category;
  if (!geo) return null;
  const valori = {};
  for (const [codice, posizione] of Object.entries(geo.index)) {
    const v = j.value[posizione];
    if (v != null) valori[codice] = { nome: geo.label[codice], indice: v };
  }
  return Object.keys(valori).length ? valori : null;
}

async function gira({ prova = false } = {}) {
  const avvio = Date.now();

  /* un anno solo per tutte le voci: confrontare indici di anni diversi
     darebbe differenze che non esistono */
  let anno = null, raccolto = null;
  for (const a of ANNI) {
    const prima = await prendiVoce(VOCI[0].cod, a);
    if (prima) { anno = a; raccolto = { [VOCI[0].id]: prima }; break; }
    console.log(`  ${a}: non ancora pubblicato`);
  }
  if (!anno) throw new Error('Eurostat non ha dati per nessuno degli anni provati');
  console.log(`anno di riferimento: ${anno}`);

  for (const v of VOCI.slice(1)) {
    const d = await prendiVoce(v.cod, anno);
    if (!d) throw new Error(`voce ${v.id} mancante per il ${anno}: non pubblico numeri a metà`);
    raccolto[v.id] = d;
  }

  /* un elemento per paese, con tutte le voci accanto */
  const paesi = new Set();
  for (const v of Object.values(raccolto)) for (const c of Object.keys(v)) paesi.add(c);

  const elementi = [...paesi].map(codice => {
    const voci = {};
    for (const v of VOCI) {
      const d = raccolto[v.id][codice];
      if (d) voci[v.id] = d.indice;
    }
    return {
      paese: codice,
      nome: (raccolto.alloggio[codice] || raccolto.spesa[codice] || {}).nome || codice,
      voci,
      completo: Object.keys(voci).length === VOCI.length,
    };
  })
    .filter(p => Object.keys(p.voci).length)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  console.log(`paesi: ${elementi.length}, di cui completi: ${elementi.filter(p => p.completo).length}`);

  if (prova) {
    console.log('\n--prova: non scrivo niente. Alcuni paesi:');
    for (const p of elementi.filter(x => ['IT', 'ES', 'LT', 'BG', 'DE'].includes(x.paese)))
      console.log(`  ${p.nome.padEnd(12)} alloggio ${String(p.voci.alloggio).padStart(5)}  spesa ${String(p.voci.spesa).padStart(5)}  trasporti ${String(p.voci.trasporti).padStart(5)}`);
    return { esito: 'saltato', quanti: elementi.length, messaggio: 'prova' };
  }

  const esito = scriviDati(
    path.join(RADICE, 'dati', 'costi.json'),
    elementi,
    { fonte: `Eurostat — livelli comparativi dei prezzi (prc_ppp_ind), ${anno}, UE27 = 100`,
      note: 'Indici, non cifre in euro: servono a confrontare due paesi, non a stimare una spesa. ' +
            'Riuso consentito con attribuzione, che va mostrata accanto ai numeri.' });

  console.log(`scritto: ${esito.quanti} paesi, ${Math.round(esito.byte / 1024)} KB`);
  return { esito: 'fatto', quanti: esito.quanti, messaggio: `anno ${anno}`,
           durataSecondi: Math.round((Date.now() - avvio) / 1000) };
}

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
