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

/* Le cartelle, e per ognuna la larghezza massima oltre la quale ridurre.
   `null` vuol dire lasciare la misura originale.

   **Le fotografie non si riducono.** Si aprono a tutta larghezza dentro
   un articolo, e non sappiamo su che schermo: ritagliarle qui vorrebbe
   dire deciderlo per sempre e senza poter tornare indietro.

   **I loghi sì.** Non compaiono mai sopra i 74px — l'anello degli atenei
   in `notizie.css` e `sociale.css`, e dentro l'anello il logo sta a una
   sessantina di pixel. Erano larghi 230. A 168 restano al doppio abbondante
   di quanto servirebbe anche su uno schermo fitto, e pesano il 39% in meno.

   E per i loghi il peso conta il doppio: non sono file che il browser
   chiede quando servono, sono scritti dentro `moduli/loghi-incorporati.js`
   e arrivano con la pagina, ogni volta, prima di tutto il resto. Erano
   stati messi lì apposta — vedi STATO.md — perché a ogni ridisegno il
   cerchio restava vuoto per un istante. La scelta resta giusta: qui non
   si toglie, si alleggerisce. */
const CARTELLE = [
  { dove: 'immagini/ideathon', larghezzaMax: null },
  { dove: 'immagini/rivista',  larghezzaMax: null },
  { dove: 'immagini/loghi',    larghezzaMax: 168 },
];

/* 82 su 100: sotto si comincia a vedere sulle superfici piatte, sopra
   il file cresce senza che si veda la differenza. */
const QUALITA = 82;

try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('Manca `cwebp`. Installalo una volta sola:\n\n    sudo apt install webp\n');
  process.exit(1);
}

/* La larghezza in pixel, letta dall'intestazione del file. `cwebp -resize`
   ingrandirebbe volentieri un'immagine più piccola del limite: qui si
   guarda prima, per ridurre soltanto. Se non si riesce a leggerla si
   torna zero, cioè "non ridurre": nel dubbio si lascia com'è. */
function larghezzaDi(file) {
  try {
    const d = fs.readFileSync(file);
    if (d[0] === 0x89 && d[1] === 0x50) return d.readUInt32BE(16);       // PNG
    if (d[0] === 0xFF && d[1] === 0xD8) {                                 // JPEG
      let i = 2;
      while (i < d.length - 9) {
        if (d[i] !== 0xFF) { i++; continue; }
        const m = d[i + 1];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC)
          return d.readUInt16BE(i + 7);
        i += 2 + d.readUInt16BE(i + 2);
      }
    }
  } catch { /* illeggibile: si lascia la misura originale */ }
  return 0;
}

const convertiti = [];   // [vecchio, nuovo]
const saltati = [];

for (const { dove: cartella, larghezzaMax } of CARTELLE) {
  const dir = path.join(RADICE, cartella);
  if (!fs.existsSync(dir)) continue;

  for (const nome of fs.readdirSync(dir).sort()) {
    if (!/\.(jpe?g|png)$/i.test(nome)) continue;

    const daFare = path.join(dir, nome);
    const fatto = daFare.replace(/\.(jpe?g|png)$/i, '.webp');
    const prima = fs.statSync(daFare).size;

    if (PROVA) { console.log(`  proverei  ${cartella}/${nome}  (${Math.round(prima / 1024)} KB)`); continue; }

    try {
      /* `-resize L 0`: la larghezza la decidiamo noi, l'altezza la
         ricava cwebp mantenendo la proporzione. Solo verso il basso —
         un'immagine già più stretta del limite si lascia com'è, invece
         di ingrandirla e farla sgranare. */
      const misura = (larghezzaMax && larghezzaDi(daFare) > larghezzaMax)
        ? ['-resize', String(larghezzaMax), '0'] : [];
      execFileSync('cwebp', ['-q', String(QUALITA), ...misura, '-quiet', daFare, '-o', fatto]);
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
