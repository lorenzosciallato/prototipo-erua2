/* ERUA connect — robot della vetrina dei corsi
   ==================================================================
       node robot/didattica.js            controlla e aggiorna
       node robot/didattica.js --prova    controlla e basta

   **Questo robot non pesca corsi: controlla che quelli dichiarati siano
   ancora lì.** È una differenza di natura, non di ambizione.

   La vetrina non è un aggregatore: sono undici corsi scelti a mano fra
   quelli aperti di Yale, MIT, Harvard e Stanford, con le loro licenze.
   Sceglierli è un lavoro editoriale — quale corso serve a uno studente
   dell'alleanza — e non lo fa un programma. Quello che invece marcisce
   da solo, e in silenzio, è il collegamento: un video ritirato, una
   playlist resa privata, un corso spostato. Chi apre la lezione trova
   un riquadro nero e nessuno se ne accorge finché non lo dice.

   Quindi: il robot verifica che ogni video dichiarato risponda ancora, e
   segna quelli che non rispondono. Non cancella niente da solo — la
   decisione se togliere un corso o cercarne un altro è editoriale.

   **Licenze.** I corsi sono Open Yale Courses e MIT OpenCourseWare, con
   licenza di attribuzione, non commerciale, condivisione allo stesso
   modo — estendibile alle opere che li incorporano (§6.8). La licenza va
   scritta accanto al corso: oggi compare solo nella trascrizione, ed è
   una lacuna registrata in STATO.md.
*/

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { scarica } from './comune/rete.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'didattica';
const FILE = path.join(RADICE, 'dati', 'didattica.json');

const { CONFIG } = await import(path.join(RADICE, 'configurazione.js'));
const ANTEPRIME = CONFIG.serviziEsterni.video.anteprime;

/* Un video ritirato non ha più l'anteprima: è il modo più leggero per
   accorgersene, senza chiave e senza scaricare il video. */
async function rispondeAncora(idVideo) {
  try {
    await scarica(`${ANTEPRIME}/vi/${idVideo}/hqdefault.jpg`);
    return true;
  } catch (err) {
    return false;
  }
}

async function gira({ prova = false } = {}) {
  const avvio = Date.now();
  const dati = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const corsi = dati.corsi || [];
  const approfondimenti = dati.approfondimenti || [];

  /* raccolgo tutti gli identificativi dichiarati, senza ripetizioni */
  const daControllare = new Map();
  for (const c of corsi) {
    if (c.cover) daControllare.set(c.cover, `${c.id} (copertina)`);
    for (const [i, l] of (c.lez || []).entries())
      if (l.yt) daControllare.set(l.yt, `${c.id} lezione ${i + 1}`);
  }
  for (const v of approfondimenti) if (v.yt) daControllare.set(v.yt, `approfondimento ${v.id}`);

  console.log(`video dichiarati da controllare: ${daControllare.size}`);

  const spenti = [];
  for (const [id, dove] of daControllare) {
    if (!(await rispondeAncora(id))) { spenti.push({ id, dove }); console.log(`  SPENTO  ${dove} → ${id}`); }
  }

  if (!spenti.length) {
    console.log('tutti i video dichiarati rispondono ancora.');
    if (!prova) segnala(NOME, { esito: 'fatto', quanti: daControllare.size, durataSecondi: Math.round((Date.now() - avvio) / 1000) });
    return { esito: 'fatto', quanti: daControllare.size };
  }

  console.log(`\n${spenti.length} video non rispondono più.`);
  console.log('Non tolgo niente da solo: scegliere se sostituire il corso o');
  console.log('rimuoverlo è una decisione editoriale, non automatica.');
  return {
    esito: 'errore',
    quanti: daControllare.size,
    messaggio: `${spenti.length} video spenti: ` + spenti.map(s => s.dove).join('; '),
    durataSecondi: Math.round((Date.now() - avvio) / 1000),
  };
}

const prova = process.argv.includes('--prova');
try {
  const r = await gira({ prova });
  if (!prova) segnala(NOME, r);
  if (r.esito === 'errore') process.exit(1);
} catch (err) {
  console.error(`${NOME}: ${err.message}`);
  if (!prova) segnala(NOME, { esito: 'errore', messaggio: err.message });
  process.exit(1);
}
