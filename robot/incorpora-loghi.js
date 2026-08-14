#!/usr/bin/env node
/* ERUA connect — incorpora i loghi nel codice
   ==================================================================
   Trasforma i file in `immagini/loghi/` in un modulo JavaScript che
   contiene le immagini stesse, scritte come testo (data URI).

   **Perché.** Ogni cerchio con un logo era una richiesta separata al
   server. Le sezioni si ridisegnano a ogni clic su un filtro, e a ogni
   ridisegno il browser rimetteva in pagina immagini che doveva ancora
   ricevere o riconvalidare: per una frazione di secondo il cerchio
   restava vuoto. Da fuori si vede un logo che sparisce e ricompare.

   Incorporati nel codice, i loghi ci sono già quando la pagina parte:
   non c'è nessun momento in cui possono mancare, e il sito fa dieci
   richieste in meno all'apertura.

   Si rilancia quando un logo cambia:  node robot/incorpora-loghi.js
*/

const fs = require('fs');
const path = require('path');

const CARTELLA = path.join(__dirname, '..', 'immagini', 'loghi');
const USCITA = path.join(__dirname, '..', 'moduli', 'loghi-incorporati.js');

const TIPI = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

/* Un tetto di sicurezza: un file grosso incorporato peserebbe sulla
   partenza della pagina invece di alleggerirla. Sopra questa soglia
   conviene lasciarlo come file, e il modulo lo dice invece di tacere. */
const TETTO = 24 * 1024;

const file = fs.readdirSync(CARTELLA).filter(f => TIPI[path.extname(f).toLowerCase()]).sort();
if (!file.length) { console.error('Nessun logo trovato in', CARTELLA); process.exit(1); }

const voci = [];
const troppoGrandi = [];
let peso = 0;

for (const f of file) {
  const dati = fs.readFileSync(path.join(CARTELLA, f));
  if (dati.length > TETTO) { troppoGrandi.push(`${f} (${Math.round(dati.length / 1024)} KB)`); continue; }
  const chiave = path.basename(f, path.extname(f));
  const tipo = TIPI[path.extname(f).toLowerCase()];
  peso += dati.length;
  voci.push(`  '${chiave}': 'data:${tipo};base64,${dati.toString('base64')}',`);
}

if (troppoGrandi.length) console.warn('Lasciati come file perché oltre i 24 KB:', troppoGrandi.join(', '));

const testo = `/* ERUA connect — loghi incorporati
   ==================================================================
   GENERATO DA \`robot/incorpora-loghi.js\`. Non modificare a mano:
   rilancia \`node robot/incorpora-loghi.js\` dopo aver cambiato un file
   in \`immagini/loghi/\`.

   Le immagini sono scritte qui dentro come testo. Costano ${Math.round(peso / 1024)} KB in
   più al primo caricamento e tolgono ${voci.length} richieste al server: da quel
   momento un logo non può più mancare, nemmeno per un istante, perché
   non c'è niente da andare a prendere.
*/

const INCORPORATI = {
${voci.join('\n')}
};

/** L'immagine di un logo, pronta da mettere in un \`src\`.
 *  @param {string} percorso  il percorso del file, come sta in configurazione.js
 *  @returns il logo incorporato, o il percorso originale se non c'è */
export function logoIncorporato(percorso) {
  if (!percorso) return percorso;
  const nome = String(percorso).split('/').pop().replace(/\\.[^.]+$/, '');
  return INCORPORATI[nome] || percorso;
}

export const QUANTI_INCORPORATI = ${voci.length};
`;

fs.writeFileSync(USCITA, testo);
console.log(`Incorporati ${voci.length} loghi (${Math.round(peso / 1024)} KB) in moduli/loghi-incorporati.js`);
