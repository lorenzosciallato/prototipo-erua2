#!/usr/bin/env node
/* ERUA connect — le fotografie in WebP
   ==================================================================
   Converte le fotografie del sito in WebP e aggiorna da solo i
   riferimenti dentro `dati/`, così non resta un percorso che punta a un
   file che non c'è più.

   **Perché WebP.** Stesse fotografie, circa un terzo del peso, e lo
   capiscono tutti i browser in uso da anni. Il caso che pesa davvero è
   una fotografia salvata in PNG: il PNG non perde niente, ma per una
   fotografia quel «niente» costa dieci volte il file. Una sola immagine
   dell'ideathon pesava 414 KB su 588 di tutta la cartella.

   **Serve `cwebp`**, che non è una libreria del progetto ma un
   programma di sistema (§6.7: nessuna dipendenza dentro il codice
   pubblicato). Si installa una volta sola:

       sudo apt install webp

   **Cosa fa, e cosa non fa.** Converte, verifica che il risultato sia
   davvero più leggero, riscrive i percorsi nei dati, e solo allora
   toglie l'originale. Se una conversione non riesce o esce più pesante,
   quel file resta com'era e lo dice: meglio un'immagine pesante che una
   rotta. Gli originali restano comunque nella cronologia dei commit.

       node robot/converti-webp.js            converte
       node robot/converti-webp.js --prova    dice cosa farebbe, senza toccare niente
*/

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.join(__dirname, '..');
const PROVA = process.argv.includes('--prova');

/* Le cartelle con le fotografie. I loghi non stanno qui: quelli sono
   incorporati nel codice da `incorpora-loghi.js`, e convertirli
   cambierebbe solo il tipo scritto dentro il data URI. */
const CARTELLE = ['immagini/ideathon', 'immagini/rivista'];

/* 82 su 100: sotto si comincia a vedere sulle superfici piatte, sopra
   il file cresce senza che si veda la differenza. */
const QUALITA = 82;

try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('Manca `cwebp`. Installalo una volta sola:\n\n    sudo apt install webp\n');
  process.exit(1);
}

const convertiti = [];   // [vecchio, nuovo]
const saltati = [];

for (const cartella of CARTELLE) {
  const dir = path.join(RADICE, cartella);
  if (!fs.existsSync(dir)) continue;

  for (const nome of fs.readdirSync(dir).sort()) {
    if (!/\.(jpe?g|png)$/i.test(nome)) continue;

    const daFare = path.join(dir, nome);
    const fatto = daFare.replace(/\.(jpe?g|png)$/i, '.webp');
    const prima = fs.statSync(daFare).size;

    if (PROVA) { console.log(`  proverei  ${cartella}/${nome}  (${Math.round(prima / 1024)} KB)`); continue; }

    try {
      execFileSync('cwebp', ['-q', String(QUALITA), '-quiet', daFare, '-o', fatto]);
    } catch (e) {
      saltati.push(`${cartella}/${nome} — cwebp non è riuscito a convertirlo`);
      continue;
    }

    const dopo = fs.statSync(fatto).size;

    /* Se il WebP non è più leggero, la conversione non serve a niente e
       lascerebbe solo un formato in più da mantenere. */
    if (dopo >= prima) {
      fs.unlinkSync(fatto);
      saltati.push(`${cartella}/${nome} — il WebP usciva più pesante (${Math.round(dopo / 1024)} KB)`);
      continue;
    }

    convertiti.push([
      `${cartella}/${nome}`,
      `${cartella}/${path.basename(fatto)}`,
      prima, dopo,
    ]);
  }
}

if (PROVA) { console.log('\nProva: non ho toccato niente.'); process.exit(0); }

if (!convertiti.length) {
  console.log('Niente da convertire.');
  if (saltati.length) console.log('Saltati:\n  ' + saltati.join('\n  '));
  process.exit(0);
}

/* ── i riferimenti nei dati ────────────────────────────────────────
   Si riscrivono **prima** di togliere gli originali: se qualcosa va
   storto qui, il sito continua a funzionare sui file vecchi. */
const cambi = new Map(convertiti.map(([v, n]) => [v, n]));
const datiDir = path.join(RADICE, 'dati');
let toccati = 0;

for (const nome of fs.readdirSync(datiDir)) {
  if (!nome.endsWith('.json')) continue;
  const percorso = path.join(datiDir, nome);
  let testo = fs.readFileSync(percorso, 'utf8');
  const originale = testo;
  for (const [vecchio, nuovo] of cambi) testo = testo.split(vecchio).join(nuovo);
  if (testo !== originale) { fs.writeFileSync(percorso, testo); toccati++; }
}

/* Ora che nessuno li nomina più, gli originali possono andare. */
for (const [vecchio] of convertiti) fs.unlinkSync(path.join(RADICE, vecchio));

const primaTot = convertiti.reduce((s, c) => s + c[2], 0);
const dopoTot = convertiti.reduce((s, c) => s + c[3], 0);

for (const [v, , p, d] of convertiti) {
  console.log(`  ${path.basename(v).padEnd(26)} ${String(Math.round(p / 1024)).padStart(4)} KB → ${String(Math.round(d / 1024)).padStart(4)} KB`);
}
console.log(`\n${convertiti.length} fotografie convertite: ${Math.round(primaTot / 1024)} KB → ${Math.round(dopoTot / 1024)} KB`
  + ` (${Math.round((1 - dopoTot / primaTot) * 100)}% in meno)`);
console.log(`riferimenti aggiornati in ${toccati} file di dati`);
if (saltati.length) console.log('\nLasciati com\'erano:\n  ' + saltati.join('\n  '));
