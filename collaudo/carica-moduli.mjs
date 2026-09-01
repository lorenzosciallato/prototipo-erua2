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
const perSelettore = new Map();
function elemento(nome) {
  const base = {
    __nome: nome,
    style: new Proxy({}, { get: () => '', set: () => true }),
    classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
    dataset: {},
    children: [], hidden: false, value: '', textContent: '', innerHTML: '',
    offsetTop: 0, offsetWidth: 100, offsetHeight: 100, scrollTop: 0, disabled: false,
    addEventListener(tipo, fn){ (this.__ascolti ||= {})[tipo] = [...(this.__ascolti?.[tipo]||[]), fn]; },
    removeEventListener(){}, appendChild(){}, removeChild(){},
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
  /* stabile: lo stesso selettore restituisce sempre lo stesso elemento,
     come farebbe il DOM. Senza questo, l'HTML scritto dentro un elemento
     trovato per selettore andrebbe perso. */
  querySelector: (s) => { if (!perSelettore.has(s)) perSelettore.set(s, elemento(s)); return perSelettore.get(s); },
  querySelectorAll: () => [],
  createElement: n => elemento(n),
  __ascolti: {},
  addEventListener(tipo, fn){ (this.__ascolti[tipo] ||= []).push(fn); },
  removeEventListener(){},
  body: elemento('body'),
  head: elemento('head'),
  documentElement: elemento('html'),
  cookie: '',
};
document_.body.classList = { add(){}, remove(){}, toggle(){}, contains: () => false };

globalThis.document = document_;
globalThis.window = globalThis;
/* si entra in Learn: la navigazione scrive l'indirizzo PRIMA di caricare
   il modulo, ed e' in questa condizione che la vetrina si rompeva */
globalThis.location = { hash: '#study', hostname: 'esempio.test', href: 'http://esempio.test/#study' };
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
                 'sociale', 'ideathon', 'articolo', 'storie', 'didattica', 'aula'];

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

/* nucleo.js si aggancia alla pagina appena viene importato, quindi lo si
   può prendere solo adesso: prima non esisterebbe niente a cui agganciarsi. */
const { prioritaFoto } = await import(path.join(REPO, 'moduli', 'nucleo.js'));

await new Promise(r => setTimeout(r, 1800));

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
  ['idea-bando',   'ideathon', ['New European Bauhaus', 'European Commission', 'ib-premio', 'ib-striscia']],
  ['idea-squadre', 'ideathon', ['idea-squadra', 'is-tit', 'is-liberi', 'is-cop', '<svg']],
  ['idea-soli',    'ideathon', ['idea-solo', 'isl-interessi']],
  ['idea-conta',   'ideathon', ['data-cat']],
];
console.log('\ncontenuto prodotto:');
for (const [id, sezione, frammenti] of attese) {
  const el = creati.get(id);
  const html = (el && (el.innerHTML || el.textContent)) || '';
  const mancano = frammenti.filter(f => !html.includes(f));
  if (!html) { console.log(`  ${id.padEnd(14)} VUOTO (${sezione})`); errori.push([id, new Error('niente disegnato')]); }
  else if (mancano.length) { console.log(`  ${id.padEnd(14)} manca: ${mancano.join(', ')}`); errori.push([id, new Error('manca ' + mancano.join(', '))]); }
  else console.log(`  ${id.padEnd(14)} ${String(html.length).padStart(6)} caratteri  ✓`);
}

/* Un clic finto. `closest` risponde al solo selettore che ci interessa:
   basta a far scattare il ramo giusto del gestore. */
async function clicca(selettore, dataset = {}) {
  const bersaglio = elemento('bersaglio');
  bersaglio.dataset = dataset;
  bersaglio.closest = (s) => (s === selettore ? bersaglio : null);
  for (const fn of (document_.__ascolti.click || [])) await fn({ target: bersaglio, preventDefault(){}, stopPropagation(){} });
  await new Promise(r => setTimeout(r, 60));
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

/* ── i comandi che devono far caricare un modulo non ancora scaricato ── */
console.log('\ncomandi che caricano un modulo:');
const prove = [
  ['Listen (puntate)', '#modi-mag .modo-mag', { mag: 'ascolta' }, 'mag-ascolta', 'pod-hero'],
  ['Read (articolo)',  '.leggi-art',          { id: 'editoriale' }, 'art',        'art-testa'],
  ['Story (storia)',   '[data-storia]',       { storia: 'editoriale' }, 'storie-viewer', 'sv-testo'],
];
for (const [nome, sel, ds, id, atteso] of prove) {
  try {
    if (creati.has(id)) creati.get(id).innerHTML = '';
    await clicca(sel, ds);
    await new Promise(r => setTimeout(r, 250));
    const h = String((creati.get(id) || {}).innerHTML || '');
    if (!h.includes(atteso)) throw new Error(`nessuna risposta al clic (manca ${atteso})`);
    console.log(`  ${nome.padEnd(18)} ${String(h.length).padStart(6)} caratteri  ✓`);
  } catch (e) { console.log(`  ${nome.padEnd(18)} ERRORE`); errori.push([nome, e]); }
}

/* ── cuore e segnalibro non devono ridisegnare il feed ──────────────
   La prova guarda il feed prima e dopo il clic. Se il gestore torna a
   chiamare `renderFeed()`, il contenuto viene riscritto da capo — e nel
   browser vero e' li' che le fotografie sparivano. Serve anche a
   prendere un'eccezione dentro l'aggiornamento mirato: se
   `aggiornaCuore` solleva, il clic non fa piu' niente e da fuori si
   vede un cuore che non si accende. */
console.log('\ncuore e segnalibro, senza ridisegno:');
for (const [nome, sel, ds] of [
  ['cuore',      '.cuore', { id: 'editoriale' }],
  ['segnalibro', '.salva', { id: 'editoriale' }],
]) {
  try {
    /* Una sentinella al posto del feed: se il gestore chiama
       `renderFeed()` la sovrascrive, e si vede. Confrontare l'HTML vero
       prima e dopo non basterebbe — un cuore che cambia un contatore
       lascia il resto identico, e la prova passerebbe lo stesso. */
    const feed = creati.get('feed-griglia');
    if (!feed || !String(feed.innerHTML || '')) throw new Error('il feed era gia\' vuoto prima del clic');
    feed.innerHTML = '<!--sentinella-->';
    await clicca(sel, ds);
    const dopo = String((creati.get('feed-griglia') || {}).innerHTML || '');
    if (dopo !== '<!--sentinella-->') throw new Error('il feed e\' stato riscritto: le foto ripartono da zero');
    console.log(`  ${nome.padEnd(18)} feed intatto  ✓`);
  } catch (e) { console.log(`  ${nome.padEnd(18)} ERRORE`); errori.push([nome, e]); }
}

/* ── la vetrina della didattica, a disegno finito ───────────────────── */
{
  const h = [...perSelettore.entries()].filter(([s]) => s.includes('data-slot'))
    .map(([, el]) => String(el.innerHTML || '')).join('');
  const attesi = ['st-card', 'data-corso', 'i.ytimg.com', 'st-dive'];
  const mancano = attesi.filter(x => !h.includes(x));
  if (mancano.length) { console.log(`\n  vetrina corsi      manca: ${mancano.join(', ')}`); errori.push(['vetrina corsi', new Error('manca ' + mancano.join(', '))]); }
  else console.log(`\n  vetrina corsi      ${String(h.length).padStart(6)} caratteri  ✓`);
}

/* ── i fogli dell'ideathon, premendo davvero ───────────────────────
   Questo blocco esiste per un errore preciso: avevo cancellato una
   funzione (`conEnfasi`) insieme a un blocco che stavo togliendo, e
   nessuna prova se n'era accorta — perché controllavano il **testo**
   del codice invece di **eseguirlo**. Il foglio di un bando si compone
   solo quando qualcuno preme, e quel percorso non lo premeva nessuno.

   Da qui in poi si preme: se una funzione manca o solleva un'eccezione,
   il foglio resta vuoto e la prova fallisce. */
console.log('\nfogli che si aprono premendo:');
{
  const dentro = () => String((creati.get('foglio-dentro') || {}).innerHTML || '');
  const banner = () => String((creati.get('idea-bando') || {}).innerHTML || '');
  const quale = h => (/New European Bauhaus|Solidarity Projects|Charlemagne|CASSINI/.exec(h) || [])[0];

  const provaFoglio = async (nome, sel, ds, atteso) => {
    try {
      if (creati.has('foglio-dentro')) creati.get('foglio-dentro').innerHTML = '';
      await clicca(sel, ds);
      const h = dentro();
      if (!h) throw new Error('il foglio è rimasto vuoto');
      const mancano = atteso.filter(x => !h.includes(x));
      if (mancano.length) throw new Error('manca ' + mancano.join(', '));
      console.log(`  ${nome.padEnd(26)} ${String(h.length).padStart(6)} caratteri  ✓`);
    } catch (e) { console.log(`  ${nome.padEnd(26)} ERRORE: ${e.message}`); errori.push([nome, e]); }
  };

  await provaFoglio('un altro bando', '#p-ideathon [data-apri], #p-ideathon [data-spiega]',
    { apri: 'cassini-hackathons' }, ['CASSINI', 'data-evidenzia', 'fgb-testo', '<b>']);
  await provaFoglio('come funziona questo bando', '#p-ideathon [data-apri], #p-ideathon [data-spiega]',
    { spiega: 'neb-rising-stars' }, ['fgb-testo', '<u>']);
  await provaFoglio('un progetto premiato', '#p-ideathon [data-vinto]',
    { vinto: '0' }, ['fgp-testo', 'fgp-tit']);

  /* E il bando in evidenza deve cambiare davvero: è la cosa che
     l'utente ha visto non funzionare. */
  try {
    const prima = quale(banner());
    await clicca('[data-evidenzia]', { evidenzia: 'charlemagne-youth-prize' });
    await new Promise(r => setTimeout(r, 120));
    const dopo = quale(banner());
    if (dopo === prima || !/Charlemagne/.test(dopo || '')) throw new Error(`il banner e rimasto su ${prima}`);
    console.log(`  ${'cambio del bando'.padEnd(26)} ${prima} → ${dopo}  ✓`);
  } catch (e) { console.log(`  ${'cambio del bando'.padEnd(26)} ERRORE: ${e.message}`); errori.push(['cambio del bando', e]); }
}

/* ── controlli su comportamenti che si rompono in silenzio ─────────── */
console.log('\ncomportamenti:');
const prove2 = [
  ['ERUA filtra nelle notizie',
   () => /data-news="ERUA"/.test(String((creati.get('news-atenei')||{}).innerHTML||'')),
   'il cerchio ERUA deve portare data-news="ERUA", non il vuoto'],
  ['ERUA resta "tutti" nella rivista',
   () => /data-uni=""/.test(String((creati.get('storie')||{}).innerHTML||'')),
   'nella rivista il cerchio ERUA deve restare senza valore'],
  ['il marchio non si traduce',
   () => {
     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     const i = html.indexOf('class="logo');
     return i > 0 && /translate="no"/.test(html.slice(i - 90, i + 90));
   },
   'il logo deve portare translate="no"'],
  ['spazio sotto il piè di pagina',
   () => fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8').includes('footer{padding-bottom'),
   'senza spazio in fondo, la dicitura finisce sotto al pulsante New post'],
  ['niente trucchi sul pulsante',
   () => {
     const css = fs.readFileSync(path.join(REPO, 'stile/sociale.css'), 'utf8');
     return !css.includes('.sc-piu::before') && !css.includes('.sc-piu.in-fondo');
   },
   'il pulsante non deve avere veli dietro né sparire scorrendo'],
  ['Learn ha gli scheletri',
   () => fs.readFileSync(path.join(REPO, 'moduli/navigazione.js'), 'utf8').includes("study:    [['st-atenei'"),
   'entrando in Learn si vedeva la pagina vuota e la dicitura in fondo'],
  ['la vetrina non fa aspettare',
   () => {
     const js = fs.readFileSync(path.join(REPO, 'moduli/didattica.js'), 'utf8');
     return !/640\s*\+\s*i\s*\*/.test(js) && !/640\s*\+\s*ST_GRUPPI/.test(js);
   },
   'i ritardi voluti dopo l\'arrivo dei dati vanno tolti'],
  ['i bandi sono europei, non interni a ERUA',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     /* Ogni bando deve venire da fuori l'alleanza: il senso della
        sezione è mostrare che si prendono soldi europei, non che si
        redistribuiscono quelli di casa. */
     return d.bandi.length >= 2 &&
            d.bandi.every(b => /europa\.eu|charlemagneyouthprize\.eu|cassini\.eu/.test(b.sito)) &&
            !d.bandi.some(b => /^ERUA/i.test(b.ente));
   },
   'devono essere bandi europei veri, non interni all alleanza'],
  ['il bando in evidenza esiste davvero',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     return d.bandi.some(b => b.id === d.bandoInEvidenza);
   },
   'bandoInEvidenza deve puntare a un bando della lista, o la sezione si apre vuota'],
  ['ogni bando ha la sua sezione vincitori',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     return d.bandi.every(b => Array.isArray(b.vincitori) && b.vincitori.length >= 3);
   },
   'un bando senza vincitori lascia un buco quando lo si mette in evidenza'],
  ['i vincitori inventati sono dichiarati',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     const js = fs.readFileSync(path.join(REPO, 'moduli/ideathon.js'), 'utf8');
     /* Dove i vincitori non sono premiati veri, la pagina deve dirlo:
        un esempio scambiato per un vincitore lo si scopre davanti a chi
        non doveva scoprirlo. */
     return d.bandi.every(b => typeof b.vincitoriReali === 'boolean' &&
              (b.vincitoriReali || (b.vincitoriNota || '').length > 20)) &&
            js.includes('vincitoriNota');
   },
   'i vincitori non veri vanno marcati nei dati e mostrati come tali nella pagina'],
  ['la sezione dichiara cosa e inventato',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     const js = fs.readFileSync(path.join(REPO, 'moduli/ideathon.js'), 'utf8');
     return /INVENTAT/i.test(d.note) && js.includes("idea-nota");
   },
   'squadre e studenti sono finti: va scritto nella pagina, non solo nei dati'],
  ['la voce Ideathon pulsa, ma con garbo',
   () => {
     const css = fs.readFileSync(path.join(REPO, 'stile/ideathon.css'), 'utf8');
     /* l'alone deve pulsare dietro, non l'oggetto: se si muovesse il
        pulsante, l'occhio lo inseguirebbe e non leggerebbe la pagina.
        E deve fermarsi per chi ha chiesto meno animazioni. */
     return css.includes('.tab-btn.acceso::after') &&
            css.includes('@keyframes idea-battito') &&
            /prefers-reduced-motion[\s\S]{0,200}tab-btn\.acceso::after\{animation:none/.test(css);
   },
   'deve pulsare un alone dietro, non il pulsante, e fermarsi su richiesta'],
  ['le copertine si generano dal titolo',
   () => {
     const js = fs.readFileSync(path.join(REPO, 'moduli/ideathon.js'), 'utf8');
     return js.includes("from './geometrie.js'") && js.includes('copertina(s.progetto');
   },
   'ogni squadra deve avere il suo disegno, sempre uguale per lo stesso progetto'],
  ['i vincitori hanno foto vere',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     const conFoto = d.bandi.flatMap(b => b.vincitori).filter(v => v.foto);
     return conFoto.length >= 4 && conFoto.every(v =>
       fs.existsSync(path.join(REPO, v.foto)));
   },
   'le fotografie dei vincitori devono esistere davvero sul disco'],
  ['i loghi degli atenei non si possono perdere',
   () => {
     const inc = fs.readFileSync(path.join(REPO, 'moduli/loghi-incorporati.js'), 'utf8');
     const nucleo = fs.readFileSync(path.join(REPO, 'moduli/nucleo.js'), 'utf8');
     const conf = fs.readFileSync(path.join(REPO, 'configurazione.js'), 'utf8');
     /* Ogni ateneo dichiarato in configurazione.js deve avere il suo
        logo dentro il codice. Finché ci arrivavano dalla rete, un
        ridisegno poteva coglierli a metà strada e lasciare il cerchio
        vuoto: è il guasto per cui Sofia e Francoforte sparivano. */
     const sigle = [...conf.matchAll(/logo:\s*'immagini\/loghi\/([a-z0-9]+)\./g)].map(m => m[1]);
     return sigle.length >= 8 &&
            sigle.every(s => inc.includes(`'${s}': 'data:image/`)) &&
            nucleo.includes('logoIncorporato(LOGHI[u])');
   },
   'i loghi vanno incorporati nel codice: dalla rete sparivano a ogni ridisegno'],
  ['i progetti premiati si aprono',
   () => {
     const js = fs.readFileSync(path.join(REPO, 'moduli/ideathon.js'), 'utf8');
     /* Devono essere pulsanti, non figure ferme: una copertina che non
        si preme è una promessa che la pagina non mantiene. E il foglio
        deve ricevere il testo lungo, non la stessa didascalia. */
     return js.includes('data-vinto') && js.includes('apriFoglio(foglioProgettoHTML') &&
            js.includes('v.esteso');
   },
   'ogni progetto deve aprire il suo racconto lungo in un foglio'],
  ['gli altri bandi stanno dentro al banner',
   () => {
     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     const js = fs.readFileSync(path.join(REPO, 'moduli/ideathon.js'), 'utf8');
     /* Spiegazione e vincitori sono stati assorbiti nel banner: se i
        contenitori separati tornassero, tornerebbero anche i tre blocchi
        in fila che nessuno leggeva come un discorso solo. */
     return !html.includes('idea-spiega') && !html.includes('idea-vincitori') &&
            js.includes('altriBandiHTML') && js.includes('data-apri') &&
            js.includes('data-evidenzia');
   },
   'i bandi vanno dentro al banner e si aprono in un foglio'],
  ['ogni progetto ha un racconto lungo',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     return d.bandi.every(b => b.vincitori.every(v => (v.esteso || '').length > 200));
   },
   'senza testo esteso il foglio ripete la didascalia e non serve a niente'],
  ['i vincitori veri portano la loro fonte',
   () => {
     const d = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/ideathon.json'), 'utf8'));
     /* Un progetto dichiarato premiato davvero deve avere accanto
        l'annuncio ufficiale: e' la differenza fra un'informazione e
        un'affermazione. */
     return d.bandi.filter(b => b.vincitoriReali)
       .every(b => /^https:\/\//.test(b.vincitoriFonte || ''));
   },
   'chi dichiara vincitori veri deve linkare l annuncio ufficiale'],
  ['i numeri stanno in figure di solo contorno',
   () => {
     const js = fs.readFileSync(path.join(REPO, 'moduli/ideathon.js'), 'utf8');
     const css = fs.readFileSync(path.join(REPO, 'stile/ideathon.css'), 'utf8');
     /* Contorno e non riempimento: riempite, il colore verrebbe prima
        del numero, che e' il contrario di quello che serve. E tre forme
        diverse, perche' tre cerchi uguali si leggono come tre pallini. */
     const figure = js.slice(js.indexOf('const figure = ['), js.indexOf('];', js.indexOf('const figure = [')));
     return js.includes('fill="none"') && js.includes('stroke="${f.tinta}"') &&
            /tinta: '#[0-9A-F]{6}'/i.test(figure) &&
            figure.includes('<circle') && figure.includes('<rect') && figure.includes('<path') &&
            css.includes('.ic-figura');
   },
   'i numeri vanno dentro figure colorate solo nel contorno, e diverse fra loro'],
  ['il foglio si chiude in tre modi',
   () => {
     const nucleo = fs.readFileSync(path.join(REPO, 'moduli/nucleo.js'), 'utf8');
     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     /* Dal fondo, dal pulsante e con Esc. E' la cosa che si cerca per
        prima quando si vuole uscire, e chi la cerca e' gia' infastidito. */
     return nucleo.includes("e.key === 'Escape'") && nucleo.includes('foglio-via') &&
            nucleo.includes('e.target === f') &&
            html.includes('id="foglio"') && html.includes('aria-modal="true"');
   },
   'il foglio deve chiudersi dal fondo, dal pulsante e con Esc'],
  ['ogni colore usato esiste davvero',
   () => {
     /* Un `var(--nome)` che non esiste non è un errore: il browser lo
        tratta come vuoto e tira dritto. Su un fondo diventa trasparente,
        e il risultato è testo illeggibile senza che niente si lamenti —
        è così che il foglio dei bandi è uscito senza fondo.

        Tre modi leciti di avere un valore, e vanno riconosciuti tutti e
        tre, altrimenti il controllo grida al lupo e si smette di
        ascoltarlo:

          1. definita in un foglio di stile;
          2. scritta da un modulo — nell'attributo `style` o con
             `setProperty`: le tinte delle squadre e delle materie
             nascono così;
          3. usata con un ripiego dichiarato, `var(--x, 1.1rem)`, che è
             una scelta esplicita e non una dimenticanza. */
     const fogli = fs.readdirSync(path.join(REPO, 'stile')).filter(f => f.endsWith('.css'));
     const definite = new Set();
     const usate = new Map();
     for (const f of fogli) {
       const s = fs.readFileSync(path.join(REPO, 'stile', f), 'utf8');
       for (const m of s.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) definite.add(m[1]);
       /* solo gli usi SENZA ripiego: `var(--x)` o `var(--x)` seguito da
          qualcosa che non sia una virgola */
       for (const m of s.matchAll(/var\((--[A-Za-z0-9_-]+)\s*([,)])/g))
         if (m[2] === ')' && !usate.has(m[1])) usate.set(m[1], f);
     }
     for (const f of fs.readdirSync(path.join(REPO, 'moduli'))) {
       if (!f.endsWith('.js')) continue;
       const s = fs.readFileSync(path.join(REPO, 'moduli', f), 'utf8');
       for (const m of s.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) definite.add(m[1]);
       for (const m of s.matchAll(/setProperty\(\s*['"](--[A-Za-z0-9_-]+)/g)) definite.add(m[1]);
     }
     const orfane = [...usate.keys()].filter(v => !definite.has(v));
     if (orfane.length) console.log('     colori inesistenti: ' +
       orfane.map(v => `${v} (${usate.get(v)})`).join(', '));
     return !orfane.length;
   },
   'un var(--nome) che non esiste diventa trasparente in silenzio'],
  ['il foglio ha un fondo opaco',
   () => {
     const css = fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8');
     const i = css.indexOf('.fg-scatola{');
     const regola = css.slice(i, css.indexOf('}', i));
     /* Fondo e colore del testo espliciti: il foglio sta sopra sezioni
        che vanno dal bianco al gradiente scuro, e senza dichiararli
        entrambi eredita quello sbagliato in metà dei casi. */
     return i > 0 && /background:var\(--(sup|sup2|bg)\)/.test(regola) && /color:var\(--testo\)/.test(regola);
   },
   'il foglio deve dichiarare fondo e colore del testo, non ereditarli'],
  ['i pulsanti partono nudi',
   () => {
     const css = fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8');
     const i = css.indexOf('button{');
     const regola = css.slice(i, css.indexOf('}', i));
     /* `color:inherit` senza `background` era la trappola: dentro il
        banner scuro il pulsante ereditava il testo bianco e teneva il
        grigio di serie del browser. Vanno azzerati insieme. */
     return i > 0 && regola.includes('color:inherit') &&
            regola.includes('background:none') && regola.includes('border:0');
   },
   'senza azzerare il fondo, un pulsante su fondo scuro esce bianco su grigio'],
  ['le foto in cima non si fanno aspettare',
   () => {
     /* La prima immagine di una sezione si vede appena la si apre:
        differirla la manda in fondo alla coda del browser, e resta
        grigia per secondi mentre il file era gia' pronto sul server.
        Si prova la funzione, non il disegno di un momento: quale bando
        sia in evidenza quando la prova gira non deve contare. */
     const p = prioritaFoto;
     const primaSubito = p(0).includes('fetchpriority="high"') && !p(0).includes('lazy');
     const vicineSubito = !p(1).includes('lazy') && !p(2).includes('lazy');
     /* Le fotografie nostre non si rimandano mai: pesano 228 KB in tutto,
        e rimandarle dentro un pannello nascosto vuol dire non chiederle
        affatto. Il differimento resta possibile, ma va chiesto — e lo
        chiedono solo le miniature che stanno su un altro server. */
     const nostreSubito = !p(3).includes('lazy') && !p(9).includes('lazy');
     const esterneDopo = p(3, 3, true).includes('loading="lazy"');
     /* e le sezioni devono usarla, invece di scrivere lazy a mano */
     const usata = ['ideathon', 'rivista'].every(s =>
       fs.readFileSync(path.join(REPO, 'moduli', s + '.js'), 'utf8').includes('prioritaFoto('));
     return primaSubito && vicineSubito && nostreSubito && esterneDopo && usata;
   },
   'la prima foto in schermo va chiesta subito, e le nostre non si rimandano mai'],

  ['nessuna foto nostra e differita',
   () => {
     /* Un pannello non attivo sta a display:none: un'immagine lazy la'
        dentro non ha riquadro, non incrocia mai lo schermo e non viene
        chiesta. Se il ridisegno la ricrea mentre e' nascosta, resta lo
        spazio bianco. Quindi: `loading="lazy"` scritto a mano e' ammesso
        solo sulle anteprime di YouTube, mai sulle nostre fotografie. */
     const sospetti = [];
     for (const f of ['articolo.js', 'rivista.js', 'ideathon.js', 'storie.js']) {
       const src = fs.readFileSync(path.join(REPO, 'moduli', f), 'utf8');
       src.split('\n').forEach((riga, n) => {
         if (riga.includes('loading="lazy"')) sospetti.push(`${f}:${n + 1}`);
       });
     }
     if (sospetti.length) console.log('    foto differite:', sospetti.join(', '));
     return sospetti.length === 0;
   },
   'una foto nostra differita dentro un pannello nascosto non viene chiesta affatto'],

  ['un cuore non rifa tutto il feed',
   () => {
     /* Riscrivere innerHTML del feed distrugge e ricrea ogni <img>: le
        fotografie sparivano e tornavano a ogni clic su un cuore o su un
        segnalibro. Quei due comandi devono toccare solo il pulsante. */
     const src = fs.readFileSync(path.join(REPO, 'moduli/rivista.js'), 'utf8');
     const rigaCuore = src.split('\n').find(r => r.includes('cuori[id] = !cuori[id]'));
     const rigaSalva = src.split('\n').find(r => r.includes('salvati[id] = !salvati[id]'));
     const cuoreMirato = !!rigaCuore && rigaCuore.includes('aggiornaCuore(')
       && !rigaCuore.includes('renderFeed()');
     const salvaMirato = !!rigaSalva && rigaSalva.includes('aggiornaSalvato(')
       && !rigaSalva.includes('renderFeed()');
     /* e lo stesso segnalibro premuto dalla pagina di lettura */
     const lettura = fs.readFileSync(path.join(REPO, 'moduli/articolo.js'), 'utf8');
     const letturaMirata = lettura.includes('offerta.aggiornaSalvato(');
     return cuoreMirato && salvaMirato && letturaMirata;
   },
   'cuore e segnalibro ricostruivano il feed intero, fotografie comprese'],

  ['le notizie si aprono su quelle dell\'alleanza',
   () => {
     /* Senza filtro l'elenco e' ordinato per data, e in cima finiva
        sempre Sofia: NBU pubblica anche gli eventi in programma, datati
        nei mesi a venire. Date giuste, ma il risultato era che aprendo
        la sezione si leggeva un ateneo solo, e per caso. */
     const src = fs.readFileSync(path.join(REPO, 'moduli/notizie.js'), 'utf8');
     const parteDaAlleanza = /let filtroNews = CONFIG\.siglaAlleanza/.test(src);
     /* e non deve poter atterrare su un elenco vuoto */
     const ripiego = /if \(!NEWS\.some\(n => n\.u === filtroNews\)\) filtroNews = null/.test(src);
     /* i dati devono davvero avere notizie dell'alleanza, altrimenti il
        ripiego scatterebbe sempre e questo non varrebbe niente */
     const dati = JSON.parse(fs.readFileSync(path.join(REPO, 'dati/notizie.json'), 'utf8'));
     const el = Array.isArray(dati) ? dati : dati.elementi;
     const quante = el.filter(n => n.u === 'ERUA').length;
     if (!quante) console.log('    nessuna notizia ERUA nei dati: si aprirebbe su tutte');
     return parteDaAlleanza && ripiego && quante > 0;
   },
   'senza filtro iniziale la sezione si apre su un ateneo solo, e per caso'],

  ['i fogli chiesti a richiesta non scavalcano nessuno',
   () => {
     /* `ideathon.css` e `aula.css` non stanno piu' in `index.html`: si
        chiedono quando servono, e un foglio chiesto cosi' finisce in
        fondo alla cascata. E' sicuro solo finche' quella posizione non
        cambia niente — cioe' finche' non condividono selettori con i
        fogli che verrebbero a seguire.

        Il giorno in cui qualcuno scrivesse `.st-card` dentro
        `ideathon.css`, o toccasse una regola di `didattica.css` da li',
        l'aspetto cambierebbe in un punto solo e a nessuno verrebbe in
        mente di collegarlo a questo. Meglio che fallisca qui. */
     const selettori = (f) => {
       const css = fs.readFileSync(path.join(REPO, 'stile', f), 'utf8')
         .replace(/\/\*[\s\S]*?\*\//g, ' ');
       const s = new Set();
       for (const m of css.matchAll(/([^{}]+)\{/g)) {
         for (const p of m[1].split(',')) {
           const t = p.trim();
           if (t && !t.startsWith('@') && t !== 'from' && t !== 'to' && !t.includes('%')) s.add(t);
         }
       }
       return s;
     };
     /* L'ordine originale dei dieci fogli, quando stavano tutti in
        `index.html`. Sta scritto qui perche' due di loro da li' sono
        usciti, e senza questo elenco non si saprebbe piu' quale
        posizione avevano. Conta solo chi un foglio **supera**: stare
        dopo qualcuno che gia' stava davanti non cambia niente. */
     const ORDINE = ['base.css', 'rivista.css', 'articolo.css', 'ascolta.css',
       'notizie.css', 'sociale.css', 'storie.css', 'ideathon.css',
       'didattica.css', 'aula.css'];
     const aRichiesta = ['ideathon.css', 'aula.css'];

     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     const inPagina = [...html.matchAll(/href="stile\/([a-z-]+)\.css"/g)].map(m => m[1] + '.css');

     const guai = [];
     for (const f of aRichiesta) {
       if (inPagina.includes(f)) { guai.push(`${f} e' tornato in index.html`); continue; }
       const mio = selettori(f);
       /* Chi supera: tutti quelli che nell'ordine originale gli stavano
          **dopo**. Fra i due chiesti a richiesta l'ordine dipende da chi
          si apre prima, quindi contano in entrambi i versi. */
       const superati = ORDINE.slice(ORDINE.indexOf(f) + 1)
         .concat(aRichiesta.filter(x => x !== f))
         .filter((x, i, a) => a.indexOf(x) === i);
       for (const altro of superati) {
         const comuni = [...selettori(altro)].filter(s => mio.has(s));
         if (comuni.length) guai.push(`${f} supererebbe ${altro} e condividono ${comuni.slice(0, 3).join(', ')}`);
       }
     }
     if (guai.length) console.log('    ' + guai.join('\n    '));
     return guai.length === 0;
   },
   'un foglio chiesto a richiesta finisce in fondo: se condivide selettori, l\'aspetto cambia'],

  ['nessun carattere chiesto a un server di terzi',
   () => {
     /* riferimento.md §6.1, PRIORITÀ ALTA. Caricare un carattere da
        fuori trasmette l'IP di chi visita a un operatore extraeuropeo:
        nel 2022 un tribunale tedesco ha riconosciuto per questo un
        risarcimento a un singolo visitatore, e un ateneo dell'alleanza
        e' in Germania.

        La prova guarda tutto il codice che finisce nel browser, non
        solo index.html: il foglio da stampare dell'aula se li chiedeva
        per conto suo, dentro una finestra che non si vede. */
     /* I commenti che spiegano perche' Google non c'e' piu' nominano
        Google, ed e' giusto cosi'. Vanno tolti prima di cercare, non
        riconosciuti a naso: un commento su piu' righe non si distingue
        guardando una riga per volta. */
     const senzaCommenti = (src, html) => src
       .replace(/\/\*[\s\S]*?\*\//g, ' ')
       .replace(html ? /<!--[\s\S]*?-->/g : /(?!)/g, ' ')
       .replace(/^\s*\/\/.*$/gm, ' ');

     const veri = [];
     const guarda = (cartella, filtro) => {
       for (const f of fs.readdirSync(path.join(REPO, cartella))) {
         if (!filtro.test(f)) continue;
         const p = path.join(cartella, f);
         const src = senzaCommenti(fs.readFileSync(path.join(REPO, p), 'utf8'), f.endsWith('.html'));
         if (/fonts\.(googleapis|gstatic)\.com/.test(src)) veri.push(p);
       }
     };
     guarda('.', /^(index\.html|configurazione\.js|avvio\.js)$/);
     guarda('moduli', /\.js$/);
     guarda('stile', /\.css$/);

     if (veri.length) console.log('    caratteri da fuori:', veri.join(', '));
     return veri.length === 0;
   },
   'i caratteri vanno ospitati nel progetto: node robot/scarica-caratteri.js'],

  ['i caratteri ospitati ci sono davvero',
   () => {
     /* Il foglio generato non deve dichiarare file che non esistono:
        un `@font-face` che punta nel vuoto non da' errore, fa solo
        comparire il testo in un carattere di ripiego — e non se ne
        accorge nessuno finche' qualcuno non guarda bene. */
     const foglio = path.join(REPO, 'stile/caratteri.css');
     if (!fs.existsSync(foglio)) return false;
     const css = fs.readFileSync(foglio, 'utf8');
     const chiesti = [...css.matchAll(/url\('\.\.\/([^']+)'\)/g)].map(m => m[1]);
     if (!chiesti.length) return false;
     const mancanti = chiesti.filter(f => !fs.existsSync(path.join(REPO, f)));
     if (mancanti.length) console.log('    file mancanti:', mancanti.join(', '));
     /* e la licenza va conservata accanto ai file (§6.1) */
     const licenza = fs.existsSync(path.join(REPO, 'caratteri/LICENZA.txt'));
     if (!licenza) console.log('    manca caratteri/LICENZA.txt');
     return mancanti.length === 0 && licenza;
   },
   'un @font-face che punta nel vuoto non da\' errore: cambia solo il carattere'],

  ['le foto sopravvivono al ridisegno',
   () => {
     /* Quando il ridisegno serve davvero (un filtro, un altro bando), le
        immagini gia' scaricate devono tornare in pagina come elementi,
        non come richieste nuove. */
     const nucleo = fs.readFileSync(path.join(REPO, 'moduli/nucleo.js'), 'utf8');
     const esiste = nucleo.includes('export function riusaFoto(');
     /* il caso dello stesso indirizzo due volte nella stessa pagina:
        senza questo controllo la seconda comparsa sposta la prima */
     const nonSposta = nucleo.includes('isConnected');
     const usata = ['rivista.js', 'ideathon.js'].every(f =>
       fs.readFileSync(path.join(REPO, 'moduli', f), 'utf8').includes('riusaFoto('));
     return esiste && nonSposta && usata;
   },
   'senza riuso, ogni ridisegno riparte da zero e lascia il bianco'],
  ['la voce Ideathon non sembra selezionata',
   () => {
     const css = fs.readFileSync(path.join(REPO, 'stile/ideathon.css'), 'utf8');
     const i = css.indexOf('.tab-btn.acceso{');
     const regola = css.slice(i, css.indexOf('}', i));
     /* deve avere il contorno colorato e il dentro della pagina, non un
        fondo pieno: pieno vuol dire "selezionata" in tutte le altre voci */
     return regola.includes('padding-box') && regola.includes('border-box');
   },
   'una voce piena in mezzo a voci vuote sembra gia selezionata'],
  ['il bando usa il gradiente del sito',
   () => {
     const css = fs.readFileSync(path.join(REPO, 'stile/ideathon.css'), 'utf8');
     const base = fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8');
     /* le stesse tre tinte di --anello, in versione profonda */
     return css.includes('--idea-grad:') && css.includes('#1E7A54') &&
            css.includes('#5B45B8') && css.includes('#A85A26') &&
            base.includes('--anello:linear-gradient(140deg');
   },
   'il gradiente deve nascere dalle tinte che il sito usa gia'],
  ['scheletri dichiarati per le sezioni',
   () => {
     const nav = fs.readFileSync(path.join(REPO, 'moduli/navigazione.js'), 'utf8');
     return ['magazine:', 'news:', 'social:'].every(k => nav.includes(k)) && nav.includes('scheletro');
   },
   'la navigazione deve dipingere gli scheletri prima di caricare'],

  ['il traduttore non si carica da solo',
   () => {
     /* Stesso principio di §6.1 sui caratteri: nessun contatto con un
        operatore extraeuropeo prima che qualcuno l'abbia chiesto.
        Prima `element.js` partiva all'import del modulo, cioe' a ogni
        visita, anche per chi legge in inglese e non tocca la tendina.

        La prova guarda la struttura, non l'aspetto. Un primo tentativo
        controllava che la riga fosse rientrata: non provava niente,
        perche' dentro un blocco `{ ... }` al primo livello — che si
        esegue all'import — le righe sono rientrate uguale. Qui invece
        si chiede che l'indirizzo stia **dentro il corpo di
        `caricaTraduttore`**: dopo la sua riga di apertura e prima della
        graffa che a colonna zero la chiude. */
     const src = fs.readFileSync(path.join(REPO, 'moduli/lingua.js'), 'utf8')
       .replace(/\/\*[\s\S]*?\*\//g, ' ');

     const quante = (src.match(/translate_a\/element\.js/g) || []).length;
     if (quante !== 1) {
       console.log(`    element.js compare ${quante} volte, ne serve una sola`);
       return false;
     }
     const apre = src.indexOf('export function caricaTraduttore');
     if (apre < 0) { console.log('    manca caricaTraduttore()'); return false; }
     const chiude = src.indexOf('\n}', apre);
     const dove = src.indexOf('translate_a/element.js');
     const dentroLaFunzione = dove > apre && dove < chiude;
     const chiamataEsplicita = /caricaTraduttore\(\)\s*;/.test(src.slice(chiude));

     if (!dentroLaFunzione) console.log('    element.js si carica fuori da caricaTraduttore(): parte all\'import');
     if (!chiamataEsplicita) console.log('    nessuno chiama caricaTraduttore()');
     return dentroLaFunzione && chiamataEsplicita;
   },
   'element.js va chiesto solo quando qualcuno sceglie una lingua (§6.1, §7.4)'],

  ['chi torna tradotto vede ancora l\'avviso P7',
   () => {
     /* Il cookie `googtrans` sopravvive al ricaricamento e il traduttore
        riscrive la pagina da se'. Se l'avvio non lo legge, la pagina e'
        in tedesco ma il pulsante dice EN e l'avviso di traduzione
        automatica resta nascosto: contenuto prodotto da una macchina,
        non marcato come tale. P7 chiede che sia dichiarato sempre. */
     const src = fs.readFileSync(path.join(REPO, 'moduli/lingua.js'), 'utf8');
     const avvia = src.slice(src.indexOf('export async function avvia'));
     return src.includes('function linguaDalCookie')
         && avvia.includes('linguaDalCookie()')
         && avvia.includes('segnalaLingua(');
   },
   'l\'avvio deve leggere googtrans e rimettere avviso ed etichetta (P7)'],

  ['cio\' che nasconde non sta in un foglio che arriva dopo',
   () => {
     /* IL GUASTO PIU' CARO DI QUESTO PROGETTO, e la prova che lo tiene
        chiuso.

        `#st-aula` e' scritta dentro `index.html`, e la nascondeva solo
        `stile/aula.css` — che dal 16/08 si carica su richiesta, per non
        far pesare 31 KB su chi in un'aula non entra mai. Le due
        decisioni erano giuste separatamente. Insieme facevano che, alla
        prima apertura del sito, l'aula restasse APERTA in mezzo alla
        pagina, alta 4828 pixel, spingendo tutte le sezioni cinquemila
        pixel piu' giu'. Sembrava «non carica», ed era «non ci arrivi».

        Era invisibile a ogni prova esistente e spariva da se': chi
        entrava una volta in un'aula si portava dietro il foglio per
        tutta la visita, e da quel momento il sito era a posto.

        La regola generale: `display:none` e' una condizione di
        partenza, non un effetto. Se un foglio a richiesta nasconde
        qualcosa che sta gia' nel markup, quel qualcosa deve essere
        nascosto anche da un foglio sempre presente. */
     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     const sempre = ['base', 'rivista', 'articolo', 'ascolta', 'notizie',
                     'sociale', 'storie', 'didattica']
       .map(n => fs.readFileSync(path.join(REPO, `stile/${n}.css`), 'utf8')).join('\n');

     /* i fogli che NON sono dichiarati in index.html: arrivano dopo */
     const aRichiesta = ['aula', 'ideathon']
       .filter(n => !html.includes(`stile/${n}.css`));

     const colpevoli = [];
     for (const n of aRichiesta) {
       const css = fs.readFileSync(path.join(REPO, `stile/${n}.css`), 'utf8');
       /* regole di primo livello che nascondono una classe intera */
       for (const m of css.matchAll(/(^|\n)(\.[a-z][\w-]*)\s*\{([^}]*)\}/g)) {
         const [, , sel, corpo] = m;
         if (!/display\s*:\s*none/.test(corpo)) continue;
         const classe = sel.slice(1);
         /* la usa il markup della pagina? */
         if (!new RegExp(`class="[^"]*\\b${classe}\\b`).test(html)) continue;
         /* un foglio sempre presente la nasconde anche lui? */
         const coperta = new RegExp(`\\.${classe}\\s*\\{[^}]*display\\s*:\\s*none`).test(sempre);
         if (!coperta) colpevoli.push(`${sel} (solo in stile/${n}.css)`);
       }
     }
     if (colpevoli.length) {
       console.log('    scoperti finche\' il loro foglio non arriva:');
       colpevoli.forEach(c => console.log('      ' + c));
     }
     return colpevoli.length === 0;
   },
   'display:none e\' una condizione di partenza, non un effetto'],

  ['nessun nome di classe senza virgolette',
   () => {
     /* `stSheet.classList.contains(on)` — `on` senza virgolette e' una
        variabile che non esiste, e la chiamata lancia un
        ReferenceError. Non un errore qualsiasi: spezzava l'uscita
        dall'aula a meta'. Il corpo della pagina prende `st-blocco`
        (`overflow:hidden`) entrando in una lezione, e la riga che lo
        toglie stava DOPO la chiamata che andava in errore. L'aula
        spariva e la pagina restava bloccata: sembrava tagliata male, e
        nessuno la collegava a Learn.

        La prova segnala ogni nome passato a `classList` che non sia fra
        virgolette e non risulti dichiarato nel file. Le variabili vere
        restano ammesse — ma devono esistere. */
     const sospetti = [];
     for (const f of fs.readdirSync(path.join(REPO, 'moduli'))) {
       if (!f.endsWith('.js')) continue;
       const src = fs.readFileSync(path.join(REPO, 'moduli', f), 'utf8')
         .replace(/\/\*[\s\S]*?\*\//g, ' ');
       for (const m of src.matchAll(/classList\.(?:add|remove|toggle|contains|replace)\(\s*([A-Za-z_$][\w$]*)\s*[,)]/g)) {
         const nome = m[1];
         const dichiarato = new RegExp(
           `(const|let|var|function)\\s+${nome}\\b|\\b${nome}\\s*=>|\\(\\s*[^)]*\\b${nome}\\b[^)]*\\)\\s*=>`
         ).test(src);
         if (!dichiarato) sospetti.push(`moduli/${f}: classList...(${nome})`);
       }
     }
     if (sospetti.length) {
       console.log('    nomi che non esistono — probabili virgolette dimenticate:');
       sospetti.forEach(s => console.log('      ' + s));
     }
     return sospetti.length === 0;
   },
   'un nome di classe senza virgolette lancia ReferenceError e spezza cio\' che segue'],

  ['la sezione d\'atterraggio non aspetta due viaggi in fila',
   () => {
     /* Nella piazza non si entra: ci si arriva aprendo il sito. Prima
        il browser scopriva i due pezzi che le mancano — il modulo e i
        dati — uno dopo l'altro e in fondo a tutto: l'intero gruppo dei
        moduli, poi `sociale.js`, e solo quando quello era arrivato ed
        eseguito partiva la richiesta di `dati/sociale.json`. Due viaggi
        in rete in fila indiana. Dichiarati nella pagina partono col
        resto, in parallelo.

        La prova controlla anche `credentials:'omit'`: senza, la
        richiesta del codice non combacia con il preavviso e il file si
        scarica DUE volte — il preavviso diventa un danno, e non se ne
        accorge nessuno perche' la pagina funziona lo stesso. */
     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     const nucleo = fs.readFileSync(path.join(REPO, 'moduli/nucleo.js'), 'utf8')
       .replace(/\/\*[\s\S]*?\*\//g, ' ');
     const modulo = /rel="modulepreload"\s+href="moduli\/sociale\.js"/.test(html);
     const preavviso = html.match(/<link rel="preload" href="dati\/sociale\.json"[^>]*>/);
     if (!modulo) console.log('    manca il modulepreload di moduli/sociale.js');
     if (!preavviso) { console.log('    manca il preload di dati/sociale.json'); return false; }

     /* Le due richieste devono essere della STESSA specie, non di una
        specie fissata. Oggi sono file pubblici e vanno senza identita';
        il giorno della base di dati (§3.2) dovranno portarla, e allora
        cambiano tutte e due — `credentials:'same-origin'` di qua,
        `crossorigin="use-credentials"` di la'. Se se ne cambia una sola
        il file si scarica DUE volte, e non se ne accorge nessuno perche'
        la pagina funziona lo stesso. La prova guarda l'accoppiata. */
     const conIdentita = /crossorigin="use-credentials"/.test(preavviso[0]);
     const chiede = nucleo.match(/fetch\(`dati\/\$\{nome\}\.json`,\s*\{\s*credentials:\s*'([a-z-]+)'/);
     if (!chiede) { console.log('    dati() non dichiara `credentials`: non puo\' combaciare'); return false; }

     const attesa = conIdentita ? 'same-origin' : 'omit';
     const combacia = chiede[1] === attesa
       && (conIdentita || /\scrossorigin(\s|>)/.test(preavviso[0]));
     if (!combacia) {
       console.log(`    preavviso e richiesta non combaciano: la pagina dice ${conIdentita ? 'use-credentials' : 'anonimo'}, dati() dice '${chiede[1]}'`);
       console.log('    il file si scarica due volte, e il preavviso diventa un danno');
     }
     return modulo && combacia;
   },
   'la sezione su cui si atterra non puo\' essere «su richiesta»'],

  ['le altre sezioni si scaldano dopo, non insieme',
   () => {
     /* Chi tocca «News» due secondi dopo l'atterraggio deve trovarla
        pronta. Ma chiederla SUBITO vorrebbe dire mettere 104 KB in gara
        con quello che serve adesso, sulla connessione di chi sta
        aprendo il sito: si guadagna sulla seconda schermata rovinando
        la prima. Quindi si scalda quando il browser non ha piu' niente
        da fare, e la chiamata sta in fondo ad avvio.js.

        E si rispetta chi ha chiesto di non farlo: `saveData` acceso
        vuol dire «non scaricare roba che forse non guardo», ed e'
        esattamente questo. */
     const nav = fs.readFileSync(path.join(REPO, 'moduli/navigazione.js'), 'utf8');
     const avv = fs.readFileSync(path.join(REPO, 'avvio.js'), 'utf8')
       .replace(/\/\*[\s\S]*?\*\//g, ' ');

     const esiste = /export function scaldaLeAltre/.test(nav);
     const rispettaDati = /saveData/.test(nav);
     const rispettaRete = /effectiveType/.test(nav);
     const conCalma = /requestIdleCallback/.test(nav);

     /* in fondo: dopo l'ultima cosa che serve alla prima schermata */
     const righe = avv.split('\n').map(r => r.trim()).filter(Boolean);
     const inFondo = righe[righe.length - 1].startsWith('scaldaLeAltre()');

     if (!esiste) console.log('    manca scaldaLeAltre()');
     if (!rispettaDati) console.log('    non guarda saveData: scarica a chi ha chiesto di non farlo');
     if (!rispettaRete) console.log('    non guarda la velocita\' della connessione');
     if (!conCalma) console.log('    non aspetta che il browser sia libero');
     if (!inFondo) console.log('    la chiamata non e\' l\'ultima cosa di avvio.js: gareggia con la prima schermata');
     return esiste && rispettaDati && rispettaRete && conCalma && inFondo;
   },
   'scaldare la sezione dopo non deve rallentare quella di adesso'],

  ['lo scheletro della piazza c\'e\' prima di JavaScript',
   () => {
     /* Il pannello della piazza e' vuoto nel markup: tutto lo disegna
        il codice. Finche' il codice non gira — dieci fogli di stile e
        il gruppo dei moduli — non c'era NIENTE. Schermo bianco, senza
        un segno che qualcosa stia arrivando.

        E le due forme devono restare uguali: quella scritta a mano in
        `index.html` e quella che `scheletro()` produce. Se divergono,
        al momento in cui il codice riscrive sopra la pagina fa un
        salto, ed e' proprio quello che gli scheletri servono a evitare. */
     const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
     const nucleo = fs.readFileSync(path.join(REPO, 'moduli/nucleo.js'), 'utf8');

     const piazza = html.slice(html.indexOf('id="p-social"'), html.indexOf('id="p-chat"'));
     const cerchi = /id="sc-atenei"[^>]*>\s*<div class="scheletro sk-cerchi"/.test(piazza);
     const righe = (piazza.match(/<div class="scheletro sk-riga"/g) || []).length;

     /* stesse classi da una parte e dall'altra, nessun `style=` a mano */
     const senzaStile = !/class="sk (tit|riga|corta)"[^>]*style=/.test(piazza)
                     && !/class="sk (tit|riga|corta)"[^>]*style=/.test(nucleo);
     const misureNelCss = fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8')
       .includes('.sk-riga .sk.tit{');

     if (!cerchi) console.log('    manca lo scheletro dei cerchi dentro #sc-atenei');
     if (righe !== 5) console.log(`    righe scheletro nel markup: ${righe}, ne servono 5 come in navigazione.js`);
     if (!senzaStile || !misureNelCss) console.log('    le misure dello scheletro non stanno in un posto solo');
     return cerchi && righe === 5 && senzaStile && misureNelCss;
   },
   'sulla sezione d\'atterraggio il vuoto si vede, e sembra un guasto'],

  ['niente sfocatura appiccicata su telefono',
   () => {
     /* Testata e barra delle sezioni sfocano quello che ci scorre
        sotto. Su telefono il browser rifa' due sfocature a tutta
        larghezza a ogni fotogramma dello scorrimento: e' la causa
        principale dello scorrimento a scatti.

        La prova cerca la regola che le spegne sotto gli 820px. Se un
        giorno qualcuno la togliesse, lo scorrimento tornerebbe a
        scatti e nessuno collegherebbe le due cose. */
     const css = fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8');
     const blocchi = css.match(/@media\s*\(\s*max-width:\s*819[^)]*\)\s*\{[\s\S]*?\n\}/g) || [];
     const spegne = blocchi.some(b =>
       /header\s*,\s*nav\.tabs/.test(b) && /backdrop-filter:\s*none/.test(b));
     if (!spegne) console.log('    manca la regola che spegne backdrop-filter sotto gli 820px');
     return spegne;
   },
   'due backdrop-filter appiccicati costano una sfocatura a fotogramma (telefono)'],

  ['le macchie non si muovono su telefono',
   () => {
     /* Tre forme sfocate di 40px che si muovono e si ingrandiscono:
        la sfocatura va rifatta a ogni fotogramma. Ferme si vedono
        uguali. */
     const css = fs.readFileSync(path.join(REPO, 'stile/base.css'), 'utf8');
     const blocchi = css.match(/@media\s*\(\s*max-width:\s*820px\s*\)\s*\{[\s\S]*?\n\}/g) || [];
     const ferme = blocchi.some(b => /\.m1\s*,\s*\.m2\s*,\s*\.m3/.test(b) && /animation:\s*none/.test(b));
     if (!ferme) console.log('    le macchie si animano anche su telefono');
     return ferme;
   },
   'animare una forma sfocata costa una sfocatura a fotogramma'],

  ['cambiare sezione non accompagna la risalita',
   () => {
     /* `scroll-behavior:smooth` vale anche per gli spostamenti chiesti
        dal codice. Senza `behavior:'instant'`, chi era in fondo a una
        sezione vedeva scorrere all'indietro tutta la pagina prima di
        arrivare in cima a quella nuova. */
     const nav = fs.readFileSync(path.join(REPO, 'moduli/navigazione.js'), 'utf8');
     const ha = /behavior:\s*'instant'/.test(nav);
     if (!ha) console.log('    mostraTab risale con lo scorrimento accompagnato');
     return ha;
   },
   'il cambio di sezione e\' un altrove, non un movimento da seguire'],

  ['ogni notizia dichiara la lingua in cui e\' scritta',
   () => {
     /* Le notizie arrivano in otto lingue dentro una pagina sola. Senza
        `lang`, un lettore di schermo legge il greco con la voce inglese.
        E' anche il presupposto di qualunque traduzione seria: senza,
        nessuno sa da che lingua partire. */
     const src = fs.readFileSync(path.join(REPO, 'moduli/notizie.js'), 'utf8');
     return src.includes('function codiceLingua')
         && /<b lang="\$\{esc\(codiceLingua/.test(src)
         && /<p lang="\$\{esc\(codiceLingua/.test(src);
   },
   'titolo e sommario delle notizie devono portare lang= (§7.12)'],
];
for (const [nome, prova, perche] of prove2) {
  let ok = false;
  try { ok = !!prova(); } catch (e) { ok = false; }
  console.log(`  ${nome.padEnd(34)} ${ok ? '✓' : 'NO — ' + perche}`);
  if (!ok) errori.push([nome, new Error(perche)]);
}

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
