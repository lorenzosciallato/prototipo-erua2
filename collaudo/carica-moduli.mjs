/* ERUA connect — collaudo dei moduli
   ==================================================================
   Si lancia così, dalla radice del progetto:

       node collaudo/carica-moduli.mjs

   Carica davvero i moduli, con una pagina finta al posto del browser, e
   avvia ogni sezione. Non prova l'aspetto — quello
   si guarda — ma prova che i moduli si importino, che i riferimenti
   esistano, che i dati si leggano e che il disegno delle sezioni non
   sollevi eccezioni. È il grosso di quello che uno scorporo può rompere. */
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ── una pagina finta ──────────────────────────────────────────────
   Ogni elemento accetta qualunque cosa gli si chieda. Serve a far
   girare il codice, non a riprodurre il browser. */
const idsPagina = new Set(
  [...fs.readFileSync(path.join(REPO, 'index.html'), 'utf8').matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));

const creati = new Map();
function elemento(nome) {
  const base = {
    __nome: nome,
    style: new Proxy({}, { get: () => '', set: () => true }),
    classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
    dataset: {},
    children: [], hidden: false, value: '', textContent: '', innerHTML: '',
    offsetTop: 0, offsetWidth: 100, offsetHeight: 100, scrollTop: 0, disabled: false,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){},
    setAttribute(){}, getAttribute: () => null, removeAttribute(){}, focus(){},
    scrollIntoView(){}, closest: () => null, remove(){}, click(){},
    querySelector: () => elemento('generico'), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ top:0, left:0, width:100, height:100, bottom:100, right:100 }),
    insertAdjacentHTML(){}, contains: () => false,
  };
  return new Proxy(base, {
    get(t, k) { return k in t ? t[k] : undefined; },
    set(t, k, v) {
      t[k] = v;
      /* come nel browser: gli elementi appena scritti diventano
         trovabili per id */
      if (k === 'innerHTML' && typeof v === 'string')
        for (const m of v.matchAll(/\bid="([^"]+)"/g)) idsPagina.add(m[1]);
      return true;
    },
  });
}
const dammi = id => { if (!creati.has(id)) creati.set(id, elemento(id)); return creati.get(id); };

const document_ = {
  getElementById: id => (idsPagina.has(id) ? dammi(id) : null),
  querySelector: () => elemento('generico'),
  querySelectorAll: () => [],
  createElement: n => elemento(n),
  addEventListener(){}, removeEventListener(){},
  body: elemento('body'),
  head: elemento('head'),
  documentElement: elemento('html'),
  cookie: '',
};
document_.body.classList = { add(){}, remove(){}, toggle(){}, contains: () => false };

globalThis.document = document_;
globalThis.window = globalThis;
globalThis.location = { hash: '', hostname: 'esempio.test', href: 'http://esempio.test/' };
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.scrollTo = () => {};
globalThis.scrollY = 0;
globalThis.innerHeight = 900;
globalThis.matchMedia = () => ({ matches: false, addEventListener(){}, addListener(){} });
globalThis.localStorage = { getItem: () => null, setItem(){}, removeItem(){} };
globalThis.requestAnimationFrame = f => setTimeout(f, 0);
globalThis.ResizeObserver = class { observe(){} disconnect(){} };
globalThis.CSS = { escape: s => String(s) };
try { Object.defineProperty(globalThis, 'navigator', { value: { share: null }, configurable: true }); }
catch (e) { /* in Node navigator esiste già: va bene lo stesso */ }
globalThis.getSelection = () => null;

/* fetch legge dal disco, come farebbe il server */
globalThis.fetch = async (url) => {
  const f = path.join(REPO, String(url));
  if (!fs.existsSync(f)) return { ok: false, status: 404, json: async () => { throw new Error('404'); } };
  const testo = fs.readFileSync(f, 'utf8');
  return { ok: true, status: 200, json: async () => JSON.parse(testo), text: async () => testo };
};

/* ── prova ─────────────────────────────────────────────────────────── */
const errori = [];
process.on('unhandledRejection', e => errori.push(['promessa non gestita', e]));

const sezioni = ['lingua', 'navigazione', 'nucleo', 'rivista', 'ascolta', 'notizie',
                 'sociale', 'articolo', 'storie', 'didattica', 'aula'];

for (const s of sezioni) {
  try {
    const m = await import(path.join(REPO, 'moduli', s + '.js'));
    process.stdout.write(`  ${s.padEnd(12)} importato`);
    if (typeof m.avvia === 'function') {
      await m.avvia();
      process.stdout.write(' · avviato');
    }
    process.stdout.write('\n');
  } catch (e) {
    console.log(`  ${s.padEnd(12)} ERRORE`);
    errori.push([s, e]);
  }
}

await new Promise(r => setTimeout(r, 300));

/* ── quello che le sezioni hanno davvero disegnato ─────────────────── */
const attese = [
  ['feed-griglia', 'rivista',   ['Editorial', 'leggi-art', 'f-tit']],
  ['storie',       'rivista',   ['Macerata', 'Vilnius', 'data-uni']],
  ['news-lista',   'notizie',   ['Queer Connect', 'rel="noopener"', 'lingua-fonte']],
  ['news-atenei',  'notizie',   ['data-news']],
  ['thread-lista', 'sociale',   ['cartographer_curious_4417', 'sc-post', 'data-voto']],
  ['toggle-lista', 'sociale',   ['data-toggle']],
  ['mag-ascolta',  'ascolta',   ['ERUA Podcast', 'pod-hero', 'i.ytimg.com']],
  ['st-gruppi',    'didattica', ['st-griglia', 'data-slot']],
  ['st-chips',     'didattica', ['data-f=']],
];
console.log('\ncontenuto prodotto:');
for (const [id, sezione, frammenti] of attese) {
  const el = creati.get(id);
  const html = (el && el.innerHTML) || '';
  const mancano = frammenti.filter(f => !html.includes(f));
  if (!html) { console.log(`  ${id.padEnd(14)} VUOTO (${sezione})`); errori.push([id, new Error('niente disegnato')]); }
  else if (mancano.length) { console.log(`  ${id.padEnd(14)} manca: ${mancano.join(', ')}`); errori.push([id, new Error('manca ' + mancano.join(', '))]); }
  else console.log(`  ${id.padEnd(14)} ${String(html.length).padStart(6)} caratteri  ✓`);
}

/* ── percorsi che attraversano piu' moduli ─────────────────────────── */
console.log('\npercorsi:');
try {
  const art = await import(path.join(REPO, 'moduli/articolo.js'));
  await art.apri('editoriale');
  const h = String((creati.get('art') || {}).innerHTML || '');
  const attesi = ['art-testa', 'data-modo="pieno"', 'vista-punti', 'Editorial'];
  const mancano = attesi.filter(x => !h.includes(x));
  if (!h) throw new Error('la pagina articolo e\' vuota');
  if (mancano.length) throw new Error('manca ' + mancano.join(', '));
  console.log(`  apertura articolo   ${String(h.length).padStart(6)} caratteri  ✓`);
} catch (e) { console.log('  apertura articolo   ERRORE'); errori.push(['apertura articolo', e]); }

try {
  const st = await import(path.join(REPO, 'moduli/storie.js'));
  await st.default?.apri?.('editoriale');
  const reg = await import(path.join(REPO, 'moduli/nucleo.js'));
  const storie = await reg.chiedi('storie');
  await storie.apri('editoriale');
  const h = String((creati.get('storie-viewer') || {}).innerHTML || '');
  if (!h.includes('sv-testo')) throw new Error('la storia non si e\' disegnata');
  console.log(`  apertura storia     ${String(h.length).padStart(6)} caratteri  ✓`);
} catch (e) { console.log('  apertura storia     ERRORE'); errori.push(['apertura storia', e]); }

console.log('');
if (errori.length) {
  for (const [dove, e] of errori) {
    console.log(`── ${dove}: ${e && e.message}`);
    const riga = String(e && e.stack || '').split('\n').find(l => l.includes('/moduli/') || l.includes('configurazione'));
    if (riga) console.log(`   ${riga.trim()}`);
  }
  console.log(`\n${errori.length} problemi`);
  process.exitCode = 1;
} else {
  console.log('nessun errore: tutti i moduli si caricano e le sezioni si avviano');
}
