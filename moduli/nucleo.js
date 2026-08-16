/* ERUA connect — nucleo
   ==================================================================
   Quello che serve a più di una sezione: la lingua dei contenuti, la
   messa in sicurezza del testo, il caricamento dei file di dati, i
   segni grafici (stemmi, identicone, icone), la lente sulle fotografie
   e il messaggio temporaneo in fondo allo schermo.

   Regola di questo file: qui non entra niente che riguardi una sola
   sezione. Se una funzione serve solo alla rivista, sta in
   `rivista.js`, anche se è comoda. Il nucleo cresce male.

   I moduli delle sezioni non si chiamano fra loro: quando la rivista
   deve aprire un articolo passa dal registro qui sotto. Così non
   esistono dipendenze circolari e ogni sezione si può caricare da sola,
   nell'ordine in cui l'utente la apre (riferimento.md §2.4).
*/

import { CONFIG, ATENEI, CITTA, LOGHI } from '../configurazione.js';
import { logoIncorporato } from './loghi-incorporati.js';

/* ── lingua dei contenuti ──────────────────────────────────────────
   Distinta dalla lingua dell'interfaccia. I contenuti della rivista e
   della piazza hanno un italiano e un inglese scritti a mano; tutto il
   resto lo traduce la macchina (vedi `lingua.js`). */
export let LANG = CONFIG.lingue.originale === 'it' ? 'it' : 'en';
export const T = (it, en) => (LANG === 'it' ? it : en);

/* ── P3: il contenuto degli utenti è testo, mai codice ─────────────
   Da usare su ogni valore che finisce dentro una stringa di HTML.
   Chi scrive `${...}` senza passare di qui apre un buco. */
export function esc(t) {
  return String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

/* ── file di dati, caricati una volta sola e su richiesta ──────────
   `dati('notizie')` legge `dati/notizie.json`. La promessa viene messa
   in cache subito, non il risultato: due sezioni che chiedono lo stesso
   file nello stesso istante fanno una sola richiesta. */
const inCorso = new Map();
export function dati(nome) {
  if (!inCorso.has(nome)) {
    inCorso.set(nome, fetch(`dati/${nome}.json`).then(r => {
      if (!r.ok) throw new Error(`dati/${nome}.json: ${r.status}`);
      return r.json();
    }));
  }
  return inCorso.get(nome);
}

/* ── fogli di stile chiesti quando servono ─────────────────────────
   Un `<link rel="stylesheet">` nella pagina blocca il primo disegno:
   il browser non mostra niente finché non ha letto tutti i fogli, per
   non far comparire il testo nudo e poi vestito. Giusto — ma solo per i
   fogli che servono a quello che si vede subito.

   `ideathon.css` e `aula.css` sono 31 KB l'uno e non servono alla prima
   schermata: l'aula si apre da dentro un corso, l'ideathon è una sezione
   in cui bisogna entrare. Chiederli qui li toglie dalla fila davanti al
   primo disegno.

   **Sull'ordine.** In `index.html` l'ordine dei fogli non va cambiato,
   perché alcune regole si sovrascrivono a vicenda. Un foglio chiesto
   così finisce in fondo alla cascata, quindi si può fare solo dove
   quella posizione non cambia niente: `aula.css` era già l'ultimo, e
   `ideathon.css` non condivide nemmeno un selettore con i due che
   verrebbe a seguire (`didattica.css` e `aula.css`). Verificato, non
   supposto — e c'è una prova nel collaudo che lo ricontrolla.

   Chi chiama **aspetta** che il foglio sia applicato prima di disegnare:
   il contrario si vedrebbe, ed è esattamente il difetto che i fogli
   bloccanti esistono per evitare. */
const fogliChiesti = new Map();

export function foglio(nome) {
  if (!fogliChiesti.has(nome)) {
    fogliChiesti.set(nome, new Promise(fatto => {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = `stile/${nome}.css`;
      /* Anche se non arriva si va avanti: una sezione senza il suo
         foglio si legge male, ma si legge. Fermarsi qui vorrebbe dire
         non mostrarla affatto (§2.2). */
      l.addEventListener('load', () => fatto(true), { once: true });
      l.addEventListener('error', () => {
        console.error(`stile/${nome}.css non caricato`);
        fatto(false);
      }, { once: true });
      document.head.appendChild(l);
    }));
  }
  return fogliChiesti.get(nome);
}

/* I file che i robot riscrivono hanno un involucro: numero di versione,
   quando sono stati aggiornati, da quale fonte, e poi gli elementi. Ma
   un file appena scritto e uno mai passato dai robot convivono, e al
   rilascio parte degli utenti ha ancora in cache la forma di prima
   (§2.9). Quindi si accettano entrambe: un elenco nudo vale come un
   involucro senza data. Il giorno in cui si aggiungerà un campo, si
   aggiunge — non si rinomina e non si toglie. */
export async function elenco(nome) {
  const j = await dati(nome);
  if (Array.isArray(j)) return { elementi: j, aggiornato: null, fonte: null, versione: 0 };
  return { versione: 0, aggiornato: null, fonte: null, ...j, elementi: j.elementi || [] };
}

/* ── registro delle sezioni ────────────────────────────────────────
   Una sezione dichiara qui che cosa sa fare per le altre; le altre lo
   chiedono senza importarla. `chiedi` aspetta che la sezione sia
   caricata, così l'ordine di caricamento non conta. */
const offerte = new Map();
const attese = new Map();

/* Dove sta ogni sezione. Serve a `chiedi`: se qualcuno chiede una
   sezione che non è ancora stata caricata, la si carica adesso invece di
   restare ad aspettare per sempre una risposta che non arriverà. */
const PERCORSI = {
  rivista:   './rivista.js',
  ascolta:   './ascolta.js',
  notizie:   './notizie.js',
  sociale:   './sociale.js',
  ideathon:  './ideathon.js',
  articolo:  './articolo.js',
  storie:    './storie.js',
  didattica: './didattica.js',
  aula:      './aula.js',
};
const inArrivo = new Set();

export function offre(sezione, funzioni) {
  offerte.set(sezione, funzioni);
  const a = attese.get(sezione);
  if (a) { a.forEach(risolvi => risolvi(funzioni)); attese.delete(sezione); }
}

export function chiedi(sezione) {
  if (offerte.has(sezione)) return Promise.resolve(offerte.get(sezione));
  if (PERCORSI[sezione] && !inArrivo.has(sezione)) {
    inArrivo.add(sezione);
    import(PERCORSI[sezione]).catch(err => {
      inArrivo.delete(sezione);
      console.error(`sezione "${sezione}" non caricata:`, err);
    });
  }
  return new Promise(risolvi => {
    if (!attese.has(sezione)) attese.set(sezione, []);
    attese.get(sezione).push(risolvi);
  });
}

/* ── scheletri che luccicano ───────────────────────────────────────
   Da mettere in un contenitore *prima* di aspettare i dati. Il vuoto,
   per chi guarda, è indistinguibile da un guasto: uno pensa che il sito
   sia rotto e se ne va prima che i dati arrivino.

   `scheletro('feed-griglia', 'scheda', 6)` riempie il contenitore di sei
   schede finte. Quando i dati arrivano, il vero disegno le sostituisce
   scrivendo sopra: non serve toglierle. */
const FORME = {
  scheda: `<div class="scheletro sk-scheda">
      <span class="sk foto"></span>
      <div class="corpo">
        <span class="sk tit"></span><span class="sk riga"></span><span class="sk corta"></span>
      </div>
    </div>`,
  riga: `<div class="scheletro sk-riga">
      <span class="sk quad"></span>
      <div class="corpo">
        <span class="sk tit" style="height:1.05rem;width:70%"></span>
        <span class="sk riga" style="height:.75rem"></span>
        <span class="sk corta" style="height:.75rem;width:38%"></span>
      </div>
    </div>`,
  cerchi: `<div class="scheletro sk-cerchi">${'<span class="sk"></span>'.repeat(9)}</div>`,
};

export function scheletro(idContenitore, forma = 'scheda', quanti = 6) {
  const box = document.getElementById(idContenitore);
  if (!box) return;
  /* se c'è già qualcosa di vero, non lo si copre: succede tornando in
     una sezione già vista */
  if (box.children.length && !box.querySelector('.scheletro')) return;
  box.innerHTML = forma === 'cerchi' ? FORME.cerchi : FORME[forma].repeat(quanti);
}

/* ── messaggio temporaneo ──────────────────────────────────────────── */
let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1800);
}

/* ── ordine casuale (per l'impaginazione asimmetrica del feed) ─────── */
export function mescola(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── quando chiedere una fotografia ────────────────────────────────
   `loading="lazy"` serve a non scaricare quello che sta sotto la piega.
   Sulle immagini che si vedono **subito** fa il danno opposto: il
   browser le tratta come rimandabili e le mette in fondo alla coda.

   E ne fa uno peggiore dentro una sezione nascosta. I pannelli non
   attivi stanno a `display:none` (`stile/base.css`): un'immagine lazy
   là dentro non ha riquadro, quindi non incrocia mai lo schermo, quindi
   **non viene chiesta affatto**. La richiesta parte solo quando il
   pannello si mostra — e se il ridisegno la ricrea mentre è ancora
   nascosta, resta lo spazio bianco finché qualcosa non fa scorrere la
   pagina.

   Per questo il differimento ora si chiede, non si subisce. Le
   fotografie nostre pesano 228 KB **in tutto**: rimandarle non fa
   guadagnare niente e costa quel bianco. Le miniature di YouTube sono
   un altro discorso — stanno su un altro server, sono decine, e lì il
   differimento serve davvero: quelle passano `differibile`.

   @param {number} i           posizione nell'elenco, da zero
   @param {number} inVista     quante ne sta in schermo senza scorrere
   @param {boolean} differibile se quelle sotto la piega vanno rimandate */
export function prioritaFoto(i, inVista = 3, differibile = false) {
  if (i === 0) return 'fetchpriority="high" decoding="sync"';
  if (i < inVista) return 'decoding="async"';
  return differibile ? 'loading="lazy" decoding="async"' : 'decoding="async"';
}

/* ── fotografie che sopravvivono al ridisegno ──────────────────────
   Riscrivere `innerHTML` di un contenitore distrugge ogni `<img>` che
   c'era dentro e ne crea di nuove: elementi diversi, che ripartono da
   zero anche quando il file è già in memoria. Un clic su un cuore
   faceva sparire e ricomparire tutte le fotografie del feed.

   Qui le si tiene da parte per indirizzo. Quando un ridisegno rimette
   in pagina lo stesso indirizzo, si reinserisce **l'elemento di
   prima** — già scaricato e già decodificato — invece del segnaposto
   appena creato. Gli attributi nuovi (proporzioni, priorità) si
   copiano sopra, così l'impaginazione resta quella che il modulo ha
   chiesto.

   Non tocca le immagini incorporate nel codice (`data:`): quelle non
   hanno niente da riscaricare, e come chiavi peserebbero decine di KB. */
const fotoTenute = new Map();

export function riusaFoto(contenitore) {
  const box = typeof contenitore === 'string'
    ? document.getElementById(contenitore) : contenitore;
  if (!box || typeof box.querySelectorAll !== 'function') return;

  for (const nuova of box.querySelectorAll('img[src]')) {
    const src = nuova.getAttribute('src');
    if (!src || src.startsWith('data:')) continue;

    /* `isConnected` non è pignoleria: lo stesso indirizzo può comparire
       due volte nella stessa pagina. Senza il controllo, la seconda
       comparsa **sposterebbe** l'elemento già rimesso al posto della
       prima, lasciando un buco dove prima c'era la fotografia. */
    const tenuta = fotoTenute.get(src);
    if (tenuta && tenuta.complete && tenuta.naturalWidth
        && !tenuta.isConnected && nuova.replaceWith) {
      for (const att of Array.from(nuova.attributes)) {
        tenuta.setAttribute(att.name, att.value);
      }
      nuova.replaceWith(tenuta);
    } else {
      fotoTenute.set(src, nuova);
    }
  }
}

/* ── stemma di un ateneo ───────────────────────────────────────────
   Il logo vero se c'è, la sigla scritta se manca il file.

   Il logo arriva incorporato nel codice, non da una richiesta al
   server: le sezioni si ridisegnano a ogni clic su un filtro, e
   un'immagine da riscaricare a ogni ridisegno lasciava il cerchio
   vuoto per un istante. Vedi `loghi-incorporati.js`. */
export function stemma(u, cls) {
  const l = logoIncorporato(LOGHI[u]);
  return l
    ? `<span class="${cls}"><img src="${l}" alt="${esc(u)}" decoding="sync"></span>`
    : `<span class="${cls} testo">${esc(u.slice(0, 5))}</span>`;
}

/* ── marchio dell'ateneo: forme piene in pastello, morbide ─────────── */
export function marchio(sigla, dim) {
  const i = Math.max(0, ATENEI.indexOf(sigla));
  const tinte = ['#A8E6C9', '#FFC9A8', '#A9D3FF', '#FFE1A8', '#E4DED4', '#B6E5F0', '#CFC4F7', '#FFC0CE'];
  const c = tinte[i % 8];
  const forme = [
    `<circle cx="24" cy="24" r="12" fill="${c}"/>`,
    `<rect x="12" y="12" width="24" height="24" rx="9" fill="${c}"/>`,
    `<path d="M24 10 38 34H10Z" fill="${c}"/>`,
    `<path d="M12 32a12 12 0 0 1 24 0Z" fill="${c}"/>`,
    `<path d="M24 10c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14Z" fill="${c}"/>`,
    `<circle cx="18" cy="24" r="9" fill="${c}"/><circle cx="30" cy="24" r="9" fill="${c}" opacity=".6"/>`,
    `<path d="M10 28q7-12 14 0t14 0v8H10Z" fill="${c}"/>`,
    `<rect x="11" y="11" width="12" height="12" rx="4" fill="${c}"/><rect x="25" y="25" width="12" height="12" rx="4" fill="${c}"/><rect x="25" y="11" width="12" height="12" rx="4" fill="${c}" opacity=".55"/>`,
  ];
  return `<svg viewBox="0 0 48 48" width="${dim}" height="${dim}" aria-hidden="true"
    style="flex:0 0 auto;background:var(--sup2);border-radius:50%">${forme[i % 8]}</svg>`;
}

/* ── identicona ────────────────────────────────────────────────────
   Un cerchio pastello con dentro un segno geometrico bianco, ricavato
   dalle lettere del nome. Sempre uguale per lo stesso nome, sempre
   diverso dal vicino: dodici segni per otto colori. Serve a dare un
   volto a chi scrive senza chiedergli una fotografia — che sarebbe un
   dato personale in più da custodire (riferimento.md §3.5). */
export function faccia(nome, dim) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
  const tinte = ['#8FDCB6', '#B8A9F0', '#F5B98C', '#8FC4F0', '#F0A9BC',
                 '#7FCBC4', '#E9C36B', '#C9A7E8'];
  const c = tinte[h % 8];
  const b = 'rgba(255,255,255,.92)';
  const segni = [
    `<circle cx="24" cy="24" r="8" fill="${b}"/>`,
    `<path d="M24 12v24" stroke="${b}" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="24" r="4.5" fill="${c}"/>`,
    `<path d="M14 30a10 10 0 0 1 20 0" fill="none" stroke="${b}" stroke-width="6" stroke-linecap="round"/>`,
    `<rect x="15" y="15" width="18" height="18" rx="6" fill="${b}"/>`,
    `<path d="M24 14 34 32H14Z" fill="${b}"/>`,
    `<circle cx="19" cy="24" r="6.5" fill="${b}"/><circle cx="31" cy="24" r="6.5" fill="${b}" opacity=".6"/>`,
    `<path d="M13 24h22M24 13v22" stroke="${b}" stroke-width="6" stroke-linecap="round"/>`,
    `<path d="M14 24a10 10 0 0 1 20 0a10 10 0 0 1-20 0" fill="none" stroke="${b}" stroke-width="6"/>`,
    `<path d="M14 32 24 14l10 18Z" fill="none" stroke="${b}" stroke-width="5.5" stroke-linejoin="round"/>`,
    `<path d="M13 28q5.5-12 11 0t11 0" fill="none" stroke="${b}" stroke-width="5.5" stroke-linecap="round"/>`,
    `<rect x="14" y="21" width="20" height="6" rx="3" fill="${b}"/><circle cx="24" cy="14" r="4" fill="${b}"/>`,
    `<circle cx="24" cy="24" r="10" fill="none" stroke="${b}" stroke-width="5.5" stroke-dasharray="30 12"/>`,
  ];
  return `<svg viewBox="0 0 48 48" width="${dim}" height="${dim}" aria-hidden="true" style="flex:0 0 auto">
    <circle cx="24" cy="24" r="24" fill="${c}"/>${segni[(h >> 3) % 12]}</svg>`;
}

/* ── il cerchio dell'alleanza, in testa a ogni fila di atenei ──────────
   Fa due mestieri diversi a seconda della sezione, e la differenza
   conta:

   - Nella rivista e nella piazza significa **tutti**: gli articoli sono
     scritti da studenti dei vari atenei, e "ERUA" vuol dire "senza
     filtro".
   - Nelle notizie significa **ERUA come fonte**: il sito dell'alleanza
     pubblica notizie sue, distinte da quelle degli atenei. Lì il
     cerchio col logo ERUA che mostrava tutto era proprio fuorviante —
     uno lo preme aspettandosi le notizie dell'alleanza e ottiene le
     stesse di prima.

   Da qui `comeFiltro`: quando è acceso, il cerchio porta la sigla
   dell'alleanza come valore invece che il vuoto. Premendolo di nuovo si
   torna a vedere tutto, come per gli altri cerchi. */
export function bottoneTutti(attr, attivo, comeFiltro = false) {
  const l = logoIncorporato(LOGHI[CONFIG.siglaAlleanza]);
  const sigla = esc(CONFIG.siglaAlleanza);
  const dentro = l
    ? `<span class="avatar"><img src="${l}" alt="${sigla}" decoding="sync"></span>`
    : `<span class="avatar testo">${sigla}</span>`;
  return `<button class="storia tutti" ${attr}="${comeFiltro ? sigla : ''}"
    aria-pressed="${attivo}" title="${sigla}">
    <span class="anello">${dentro}</span><span class="citta">${sigla}</span></button>`;
}

/* ── la fila dei cerchi degli atenei ───────────────────────────────
   La usano rivista, notizie e piazza: cambia solo il nome
   dell'attributo con cui ciascuna riconosce il proprio clic. */
export function filaAtenei(attr, scelto, comeFiltro = false) {
  const sigla = CONFIG.siglaAlleanza;
  const acceso = comeFiltro ? scelto === sigla : !scelto;
  return bottoneTutti(attr, acceso, comeFiltro) + ATENEI.map(u => `
    <button class="storia" ${attr}="${esc(u)}" aria-pressed="${scelto === u}" title="${esc(u)}">
      <span class="anello">${stemma(u, 'avatar')}</span>
      <span class="citta">${esc(CITTA[u] || u)}</span>
    </button>`).join('');
}

/* ── data in forma breve, nella lingua dei contenuti ───────────────── */
export function dataBreve(iso) {
  if (!iso) return '';
  const mesi = {
    it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  const p = String(iso).split('-');
  if (p.length === 1) return p[0];
  if (p.length === 2) return mesi[LANG][+p[1] - 1] + ' ' + p[0];
  const d = new Date(iso + 'T12:00:00');
  return d.getDate() + ' ' + mesi[LANG][d.getMonth()] + ' ' + d.getFullYear();
}

/* ── icone ─────────────────────────────────────────────────────────── */
export const ICONE = {
  cuore:     '<svg viewBox="0 0 24 24"><path d="M12 20.5C7 16.6 3.5 13.4 3.5 9.7 3.5 7 5.6 5 8.1 5c1.6 0 3 .8 3.9 2.1C12.9 5.8 14.3 5 15.9 5c2.5 0 4.6 2 4.6 4.7 0 3.7-3.5 6.9-8.5 10.8z"/></svg>',
  commento:  '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/></svg>',
  condividi: '<svg viewBox="0 0 24 24"><path d="M21 3 10 14M21 3l-7 18-3.5-7.5L3 10z"/></svg>',
  salva:     '<svg viewBox="0 0 24 24"><path d="M6 3.5h12V21l-6-4-6 4z"/></svg>',
  play:      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>',
  playPieno: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pausa:     '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5.5" width="3.4" height="13" rx="1"/><rect x="13.6" y="5.5" width="3.4" height="13" rx="1"/></svg>',
  su:        '<svg viewBox="0 0 24 24"><path d="M12 5 5 13h4v6h6v-6h4z"/></svg>',
  giu:       '<svg viewBox="0 0 24 24"><path d="M12 19 5 11h4V5h6v6h4z"/></svg>',
  chat:      '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/></svg>',
};

/* ── il foglio: una finestra per un contenuto lungo ────────────────
   La lente qui sotto ingrandisce una fotografia e non fa altro. Questo
   serve a un testo: la scheda di un bando, la storia di un progetto
   premiato. Una scatola sola per entrambe le cose avrebbe significato
   un componente che fa due mestieri e nessuno dei due bene.

   Perché una finestra e non una pagina: quello che c'è dentro è un
   approfondimento di ciò che stavi guardando. Cambiare pagina ti fa
   perdere il posto e ti obbliga a tornare indietro per riprenderlo;
   una finestra si chiude e sei di nuovo dove eri, allo stesso punto di
   scorrimento.

   Chi apre passa l'HTML già pronto: il testo che ci finisce dentro
   dev'essere già passato da `esc()` a monte (P3). */
export function apriFoglio(html, etichetta = '') {
  const f = document.getElementById('foglio');
  if (!f) return;
  document.getElementById('foglio-dentro').innerHTML = html;
  f.setAttribute('aria-label', etichetta);
  f.setAttribute('aria-hidden', 'false');
  f.classList.add('aperto');
  document.body.style.overflow = 'hidden';
  /* Il foglio riparte dall'alto: riaprendolo, restava allo scorrimento
     di quello aperto prima e sembrava un testo che comincia a metà. */
  const scatola = f.querySelector('.fg-scatola');
  if (scatola) scatola.scrollTop = 0;
  const via = document.getElementById('foglio-via');
  if (via && via.focus) via.focus();
}

export function chiudiFoglio() {
  const f = document.getElementById('foglio');
  if (!f) return;
  f.classList.remove('aperto');
  f.setAttribute('aria-hidden', 'true');
  document.getElementById('foglio-dentro').innerHTML = '';
  document.body.style.overflow = inLettura() ? 'hidden' : '';
}

export const foglioAperto = () => {
  const f = document.getElementById('foglio');
  return !!f && f.classList.contains('aperto');
};

/* Si chiude dal fondo, dal pulsante, e con Esc. Tre modi perché è la
   cosa che si cerca per prima quando si vuole uscire, e chi la cerca è
   già leggermente infastidito. */
{
  const f = document.getElementById('foglio');
  if (f) {
    f.addEventListener('click', e => {
      if (e.target === f || e.target.closest('#foglio-via')) chiudiFoglio();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && foglioAperto()) chiudiFoglio();
    });
  }
}

/* ── lente sulle fotografie ────────────────────────────────────────── */
export function apriLente(src) {
  const lente = document.getElementById('lente');
  document.getElementById('lente-img').src = src;
  lente.classList.add('aperta');
  document.body.style.overflow = 'hidden';
  document.getElementById('lente-via').focus();
}

export function chiudiLente() {
  const lente = document.getElementById('lente');
  lente.classList.remove('aperta');
  document.getElementById('lente-img').src = '';
  document.body.style.overflow = inLettura() ? 'hidden' : '';
}

export const lenteAperta = () => {
  const l = document.getElementById('lente');
  return !!l && l.classList.contains('aperta');
};

/* Vero mentre la pagina articolo occupa lo schermo: serve a chi deve
   decidere se restituire lo scorrimento al corpo della pagina. */
export const inLettura = () => document.body.classList.contains('in-lettura');

document.getElementById('lente').addEventListener('click', e => {
  if (e.target.id !== 'lente-img') chiudiLente();
});

document.addEventListener('click', e => {
  const zoom = e.target.closest('.scatto,.scatto-art');
  if (zoom) { e.stopPropagation(); apriLente(zoom.src); }
});
