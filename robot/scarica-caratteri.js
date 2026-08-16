#!/usr/bin/env node
/* ERUA connect — porta i caratteri dentro il progetto
   ==================================================================
   Scarica da Google Fonts i quattro caratteri che il sito usa, li
   scrive in `caratteri/`, e genera `stile/caratteri.css` che li
   dichiara come file nostri.

   **Perché.** `riferimento.md` §6.1 è PRIORITÀ ALTA e lo chiede:
   caricare un carattere da un server esterno trasmette a quel server
   l'IP di chi visita — dato personale, verso un operatore fuori
   dall'Unione, senza base né informativa. Nel 2022 un tribunale
   tedesco ha riconosciuto il risarcimento a un singolo visitatore per
   questo, e un ateneo dell'alleanza è in Germania.

   Ci guadagna anche l'attesa, ma non nel modo che verrebbe da pensare:
   i file dei caratteri pesano uguale ospitati qui. Quello che sparisce
   è il **giro di andata e ritorno verso un server esterno prima del
   primo disegno** — il foglio di stile di Google va chiesto, e finché
   non arriva la pagina non si disegna. Con i caratteri qui, quel foglio
   arriva insieme agli altri nostri.

   **Cosa non scarica, e perché.**
   - I sottoinsiemi diversi da `latin` e `latin-ext`. Cirillico, greco,
     vietnamita: il sito non ha testo in quegli alfabeti. `latin-ext`
     invece serve e va tenuto — i nomi dei progetti premiati sono in
     ceco e polacco («Díky že můžem volit»), e senza finiscono in un
     carattere di ripiego a metà parola.
   - Il corsivo di Fraunces. Non è usato da nessuna parte: ogni `<i>`
     del progetto è riportato a `font-style:normal`. Erano 148 KB
     dichiarati per niente. Se un giorno servirà, si toglie dalla lista
     qui sotto e si rilancia.

   **Licenze.** Tutti e quattro sono sotto SIL Open Font License, che
   consente di ospitarli. Il testo della licenza va conservato accanto
   ai file: lo scrive questo script in `caratteri/LICENZA.txt`.

   Si rilancia quando cambia un carattere:  node robot/scarica-caratteri.js
*/

const fs = require('fs');
const path = require('path');

const RADICE = path.join(__dirname, '..');
const CARTELLA = path.join(RADICE, 'caratteri');
const FOGLIO = path.join(RADICE, 'stile', 'caratteri.css');

/* Chi chiede, per Google, decide cosa riceve: con un programma
   qualsiasi risponde con caratteri in un formato vecchio e pesante.
   Serve dichiararsi un browser recente per ricevere woff2. */
const BROWSER = 'Mozilla/5.0 (X11; CrOS x86_64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const SOTTOINSIEMI = ['latin', 'latin-ext'];

/* Le famiglie, con il nome del file che ne uscirà e gli assi da
   chiedere. Sono gli stessi che chiedeva `index.html`, meno il corsivo
   di Fraunces. */
const FAMIGLIE = [
  { nome: 'Fraunces',       file: 'fraunces',       assi: 'opsz,wght@9..144,400..700' },
  { nome: 'Inter',          file: 'inter',          assi: 'wght@400;500;600;700;800' },
  { nome: 'JetBrains Mono', file: 'jetbrains-mono', assi: 'wght@400;500;700' },
  { nome: 'Source Serif 4', file: 'source-serif-4', assi: 'opsz,wght@8..60,400;8..60,600;8..60,700' },
];

const LICENZA = `I caratteri in questa cartella sono sotto SIL Open Font License 1.1.

  Fraunces        — Undercase Type / Phaedra Charles, Flavia Zimbardi
                    https://github.com/undercasetype/Fraunces
  Inter           — Rasmus Andersson
                    https://github.com/rsms/inter
  JetBrains Mono  — JetBrains
                    https://github.com/JetBrains/JetBrainsMono
  Source Serif 4  — Adobe / Frank Grießhammer
                    https://github.com/adobe-fonts/source-serif

La licenza consente di usarli, modificarli e ridistribuirli, anche
ospitandoli sul proprio server, a due condizioni: che i file mantengano
questa licenza, e che non vengano venduti da soli.

Il testo integrale della licenza:  https://openfontlicense.org

Sono qui e non su un server di terzi per la ragione scritta in
riferimento.md §6.1: caricarli da fuori trasmette l'IP di chi visita a
un operatore extraeuropeo.

Rigenerato da:  node robot/scarica-caratteri.js
`;

/* ── il foglio di stile di Google, che dice dove stanno i file ─────── */
async function chiediFoglio(fam) {
  const url = 'https://fonts.googleapis.com/css2?family='
    + encodeURIComponent(fam.nome).replace(/%20/g, '+') + ':' + fam.assi + '&display=swap';
  const r = await fetch(url, { headers: { 'User-Agent': BROWSER } });
  if (!r.ok) throw new Error(`${fam.nome}: il foglio non arriva (${r.status})`);
  return r.text();
}

/* Ogni `@font-face` è preceduto da un commento che dice a quale
   sottoinsieme appartiene. È l'unico modo per distinguerli: nel blocco
   c'è solo `unicode-range`, che sarebbe da interpretare. */
function leggiBlocchi(css) {
  const fuori = [];
  let sottoinsieme = null;
  for (const riga of css.split('\n')) {
    const c = riga.match(/^\s*\/\* ([a-z0-9-]+) \*\/\s*$/);
    if (c) { sottoinsieme = c[1]; continue; }
    if (riga.includes('@font-face')) fuori.push({ sottoinsieme, righe: [] });
    if (fuori.length) fuori[fuori.length - 1].righe.push(riga);
  }
  return fuori.map(b => {
    const t = b.righe.join('\n');
    const url = t.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
    return {
      sottoinsieme: b.sottoinsieme,
      stile: (t.match(/font-style:\s*([^;]+);/) || [, 'normal'])[1].trim(),
      peso: (t.match(/font-weight:\s*([^;]+);/) || [, '400'])[1].trim(),
      intervallo: (t.match(/unicode-range:\s*([^;]+);/) || [, ''])[1].trim(),
      url: url && url[1],
    };
  }).filter(b => b.url && SOTTOINSIEMI.includes(b.sottoinsieme));
}

async function scarica(url) {
  const r = await fetch(url, { headers: { 'User-Agent': BROWSER } });
  if (!r.ok) throw new Error(`file non scaricato (${r.status}): ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

function umano(n) {
  return n >= 1024 ? (n / 1024).toFixed(0) + ' KB' : n + ' B';
}

(async () => {
  fs.mkdirSync(CARTELLA, { recursive: true });

  const dichiarazioni = [];
  let peso = 0, quanti = 0;

  for (const fam of FAMIGLIE) {
    const blocchi = raggruppa(leggiBlocchi(await chiediFoglio(fam)));
    if (!blocchi.length) throw new Error(`${fam.nome}: nessun sottoinsieme utile trovato`);

    for (const b of blocchi) {
      const nomeFile = `${fam.file}-${b.sottoinsieme}${b.stile === 'italic' ? '-corsivo' : ''}.woff2`;
      const dati = await scarica(b.url);
      fs.writeFileSync(path.join(CARTELLA, nomeFile), dati);
      peso += dati.length; quanti++;
      console.log(`  ${nomeFile.padEnd(34)} ${umano(dati.length).padStart(7)}`);

      dichiarazioni.push(
`@font-face{
  font-family:'${fam.nome}';
  font-style:${b.stile};
  font-weight:${b.peso};
  font-display:swap;
  src:url('../caratteri/${nomeFile}') format('woff2');
  unicode-range:${b.intervallo};
}`);
    }
  }

  fs.writeFileSync(FOGLIO,
`/* ERUA connect — i caratteri, ospitati qui
   ==================================================================
   GENERATO DA  node robot/scarica-caratteri.js  — non si modifica a
   mano: al primo rilancio le modifiche sparirebbero.

   Stanno nel progetto e non su un server di terzi perché caricarli da
   fuori trasmette l'IP di chi visita a un operatore extraeuropeo:
   riferimento.md §6.1, PRIORITÀ ALTA. Licenze in caratteri/LICENZA.txt.

   \`font-display:swap\` vuol dire che il testo si vede subito con il
   carattere di ripiego e cambia quando il nostro è pronto: si legge
   dal primo istante, invece di restare bianco ad aspettare.

   \`unicode-range\` divide ogni carattere per alfabeto: il browser
   scarica \`latin-ext\` solo se in pagina c'è davvero una parola che
   lo richiede — i nomi dei progetti premiati in ceco e polacco.

   ${quanti} file, ${umano(peso)} in tutto. Nessuno di questi viene
   scaricato finché non serve a disegnare del testo davvero presente.
*/

${dichiarazioni.join('\n\n')}
`);

  fs.writeFileSync(path.join(CARTELLA, 'LICENZA.txt'), LICENZA);

  console.log(`\n  ${quanti} file, ${umano(peso)} in tutto.`);
  console.log(`  scritti in    caratteri/`);
  console.log(`  dichiarati in stile/caratteri.css`);
  console.log(`  licenza in    caratteri/LICENZA.txt`);
})().catch(e => { console.error('\n  guasto:', e.message); process.exit(1); });
