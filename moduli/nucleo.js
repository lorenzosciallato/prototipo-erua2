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

/* ── registro delle sezioni ────────────────────────────────────────
   Una sezione dichiara qui che cosa sa fare per le altre; le altre lo
   chiedono senza importarla. `chiedi` aspetta che la sezione sia
   caricata, così l'ordine di caricamento non conta. */
const offerte = new Map();
const attese = new Map();

export function offre(sezione, funzioni) {
  offerte.set(sezione, funzioni);
  const a = attese.get(sezione);
  if (a) { a.forEach(risolvi => risolvi(funzioni)); attese.delete(sezione); }
}

export function chiedi(sezione) {
  if (offerte.has(sezione)) return Promise.resolve(offerte.get(sezione));
  return new Promise(risolvi => {
    if (!attese.has(sezione)) attese.set(sezione, []);
    attese.get(sezione).push(risolvi);
  });
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

/* ── stemma di un ateneo ───────────────────────────────────────────
   Il logo vero se c'è, la sigla scritta se manca il file. */
export function stemma(u, cls) {
  const l = LOGHI[u];
  return l
    ? `<span class="${cls}"><img src="${l}" alt="${esc(u)}"></span>`
    : `<span class="${cls} testo">${esc(u.slice(0, 5))}</span>`;
}

/* ── marchio dell'ateneo: forme piene in pastello, morbide ─────────── */
export function marchio(sigla, dim) {
  const sigle = Object.keys(LOGHI);
  const i = Math.max(0, sigle.indexOf(sigla));
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

/* ── il cerchio dell'alleanza, in testa a ogni fila di atenei ──────── */
export function bottoneTutti(attr, attivo) {
  const l = LOGHI[CONFIG.siglaAlleanza];
  const sigla = esc(CONFIG.siglaAlleanza);
  const dentro = l
    ? `<span class="avatar"><img src="${l}" alt="${sigla}"></span>`
    : `<span class="avatar testo">${sigla}</span>`;
  return `<button class="storia tutti" ${attr}="" aria-pressed="${attivo}" title="${sigla}">
    <span class="anello">${dentro}</span><span class="citta">${sigla}</span></button>`;
}

/* ── la fila dei cerchi degli atenei ───────────────────────────────
   La usano rivista, notizie e piazza: cambia solo il nome
   dell'attributo con cui ciascuna riconosce il proprio clic. */
export function filaAtenei(attr, scelto) {
  return bottoneTutti(attr, !scelto) + ATENEI.map(u => `
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
