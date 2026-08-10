/* ERUA connect — robot delle destinazioni di mobilità
   ==================================================================
       node robot/destinazioni.js            aggiorna
       node robot/destinazioni.js --prova    non scrive
       node robot/destinazioni.js --solo ULPGC

   Dove si può andare in mobilità partendo da ciascuno degli otto atenei.

   **Ogni ateneo pubblica queste informazioni a modo suo**, e non c'è
   niente da fare: nessun formato comune, nessun feed, nessuna
   interfaccia condivisa. Quindi qui non c'è un lettore solo ma una
   strategia per ateneo, dichiarata nella tabella `STRATEGIE`. Chi ne
   aggiunge una nuova non tocca il resto.

   **La regola che tiene in piedi tutto: nel dubbio, non si pubblica.**
   Una destinazione sbagliata o di un bando scaduto manda una persona a
   vivere un anno nel posto sbagliato, o le fa perdere l'occasione. Vale
   più un elenco parziale e vero che uno completo e incerto. Quindi:

   - ogni destinazione porta **da dove viene** e **di che anno è**;
   - se il paese ricavato dai due modi possibili non coincide, la
     destinazione si scarta e lo si dice;
   - quello che non si riesce a leggere con sicurezza non compare, e il
     conto di quanto si è scartato finisce nel registro.

   Nessun modello linguistico normalizza niente. Se un giorno servisse,
   quelle righe andrebbero marcate come generate e non verificate
   (§6.5) — e su questo contenuto «non verificato» non è una formula:
   sarebbe un avvertimento vero.
*/

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scarica } from './comune/rete.js';
import { DA_ULPGC, PAESI_CON_PREFISSO, leggiCodiceErasmus } from './comune/paesi.js';
import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'destinazioni';

/* ── ULPGC ─────────────────────────────────────────────────────────
   L'unico degli otto che pubblica una banca dati interrogabile. Il
   modulo di ricerca sul loro sito parla con questi indirizzi, che
   rispondono in JSON: si chiede l'elenco dei paesi, poi per ogni paese
   l'elenco degli atenei partner. I nomi arrivano già col codice Erasmus
   ufficiale davanti — `D  AACHEN01 - RWTH AACHEN` — che è la cosa
   migliore che potesse capitarci: identifica l'ateneo senza ambiguità. */
const ULPGC = {
  paesi: 'https://apps.ulpgc.es/pi/obtenerPaisConvenio',
  atenei: 'https://apps.ulpgc.es/pi/obtenerUniversidadConvenio',
  consultazione: 'https://apps.ulpgc.es/pi/consultaConvenios',
  /* I programmi che interessano uno studente in partenza. Ce ne sono
     altri (tirocinio, dottorato) da aggiungere quando servirà. */
  programmi: [
    { codice: 'ERA', it: 'Erasmus+ studio', en: 'Erasmus+ studies' },
    { codice: 'MUN', it: 'Mundus', en: 'Mundus' },
  ],
  anno: '202627',
  annoLeggibile: '2026-27',
};

async function daUlpgc() {
  const destinazioni = [];
  const scartate = [];

  for (const programma of ULPGC.programmi) {
    const corpo = `programa=${programma.codice}&anioAcademico=${ULPGC.anno}`;
    const paesi = JSON.parse(await scarica(`${ULPGC.paesi}?${corpo}`));
    const conAccordi = paesi.filter(p => Number(p.total) > 0);
    console.log(`  ${programma.it}: ${conAccordi.length} paesi con accordi`);

    for (const paese of conAccordi) {
      const mappa = DA_ULPGC[paese.codigo];
      if (!mappa) {
        scartate.push(`paese sconosciuto: ${paese.codigo} (${paese.nombre})`);
        continue;
      }

      const grezzo = JSON.parse(await scarica(`${ULPGC.atenei}?${corpo}&pais=${encodeURIComponent(paese.codigo)}`));
      for (const voce of Object.values(grezzo)) {
        const letto = leggiCodiceErasmus(voce.nombre);

        /* Controprova: il paese dichiarato nell'elenco e quello scritto
           dentro il codice Erasmus devono dire la stessa cosa. Si fa solo
           dove la convenzione del prefisso vale — fuori dai paesi del
           programma un codice che comincia per "A" non vuol dire Austria,
           e la controprova scarterebbe destinazioni buone. */
        if (letto.paeseIso && PAESI_CON_PREFISSO.has(mappa.iso) && letto.paeseIso !== mappa.iso) {
          scartate.push(`${letto.ateneo}: l'elenco dice ${mappa.iso}, il codice dice ${letto.paeseIso}`);
          continue;
        }

        destinazioni.push({
          da: 'ULPGC',
          ateneo: letto.ateneo,
          codice: letto.codice,
          paese: mappa.iso,
          paeseEurostat: mappa.eurostat,
          paeseNome: { it: mappa.it, en: mappa.en },
          posti: Number(voce.total) || 0,
          programma: { it: programma.it, en: programma.en },
          anno: ULPGC.annoLeggibile,
          origine: {
            fonte: 'Banca dati degli accordi ULPGC',
            url: ULPGC.consultazione,
            letto: new Date().toISOString().slice(0, 10),
            generato: null,
          },
        });
      }
    }
  }

  return { destinazioni, scartate };
}

/* ── le strategie, una per ateneo ─────────────────────────────────
   Gli altri sette non hanno ancora un lettore. Non sono dimenticati:
   sono dichiarati qui con quello che si sa, così chi ci mette mano dopo
   sa da dove ripartire invece di rifare la ricerca. */
const STRATEGIE = {
  ULPGC: { pronta: true, leggi: daUlpgc,
    nota: 'banca dati interrogabile in JSON' },

  UNIMC: { pronta: false,
    nota: 'destinazioni negli allegati del bando annuale in PDF; le pagine "Accordo Erasmus – <dipartimento>" sono i moduli da compilare, non gli elenchi' },
  MRU:     { pronta: false, nota: 'da censire' },
  NBU:     { pronta: false, nota: 'da censire' },
  EUV:     { pronta: false, nota: 'da censire' },
  SWPS:    { pronta: false, nota: 'da censire' },
  UAEGEAN: { pronta: false, nota: 'da censire' },
  UP8:     { pronta: false, nota: 'da censire' },
};

async function gira({ prova = false, solo = null } = {}) {
  const avvio = Date.now();
  const tutte = [];
  const scartateTutte = [];
  const nonPronti = [];

  for (const [ateneo, s] of Object.entries(STRATEGIE)) {
    if (solo && ateneo !== solo) continue;
    if (!s.pronta) { nonPronti.push(`${ateneo} (${s.nota})`); continue; }
    console.log(`${ateneo}:`);
    const { destinazioni, scartate } = await s.leggi();
    console.log(`  ${destinazioni.length} destinazioni, ${scartate.length} scartate`);
    tutte.push(...destinazioni);
    scartateTutte.push(...scartate.map(x => `${ateneo}: ${x}`));
  }

  if (nonPronti.length) {
    console.log(`\nsenza lettore, per ora:`);
    for (const n of nonPronti) console.log(`  ${n}`);
  }
  if (scartateTutte.length) {
    console.log(`\nscartate perché incerte (${scartateTutte.length}):`);
    for (const s of scartateTutte.slice(0, 10)) console.log(`  ${s}`);
    if (scartateTutte.length > 10) console.log(`  … e altre ${scartateTutte.length - 10}`);
  }

  /* ordinate per paese e poi per ateneo: è l'ordine in cui si guardano */
  tutte.sort((a, b) =>
    (a.paeseNome.it || '').localeCompare(b.paeseNome.it || '') ||
    (a.ateneo || '').localeCompare(b.ateneo || ''));

  const paesi = new Set(tutte.map(d => d.paese));
  console.log(`\ntotale: ${tutte.length} destinazioni in ${paesi.size} paesi`);

  if (prova) {
    console.log('\n--prova: non scrivo niente. Prime cinque:');
    for (const d of tutte.slice(0, 5))
      console.log(`  ${d.paeseNome.it.padEnd(16)} ${String(d.codice).padEnd(14)} ${d.ateneo.slice(0, 46).padEnd(48)} ${d.posti} posti`);
    return { esito: 'saltato', quanti: tutte.length, messaggio: 'prova' };
  }

  const esito = scriviDati(
    path.join(RADICE, 'dati', 'destinazioni.json'),
    tutte,
    { fonte: 'sistemi di mobilità degli atenei dell\'alleanza',
      note: `Solo gli atenei con una fonte leggibile con sicurezza. Senza lettore: ${nonPronti.map(x => x.split(' ')[0]).join(', ')}. ` +
            `Scartate perché incerte in questo giro: ${scartateTutte.length}.` });

  console.log(`scritto: ${esito.quanti} destinazioni, ${Math.round(esito.byte / 1024)} KB`);
  return {
    esito: 'fatto',
    quanti: esito.quanti,
    messaggio: `${paesi.size} paesi; senza lettore: ${nonPronti.length}; scartate: ${scartateTutte.length}`,
    durataSecondi: Math.round((Date.now() - avvio) / 1000),
  };
}

const prova = process.argv.includes('--prova');
const i = process.argv.indexOf('--solo');
const solo = i > -1 ? process.argv[i + 1] : null;
try {
  const r = await gira({ prova, solo });
  if (!prova) segnala(NOME, r);
} catch (err) {
  const grave = !(err instanceof RifiutoDiScrivere);
  console.error(`${NOME}: ${err.message}`);
  if (!prova) segnala(NOME, { esito: grave ? 'errore' : 'saltato', messaggio: err.message });
  process.exit(grave ? 1 : 0);
}
