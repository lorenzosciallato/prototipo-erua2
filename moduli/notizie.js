/* ERUA connect — le notizie degli atenei
   ==================================================================
   Un elenco solo, ordinato per data, con il filtro per ateneo in cima e
   la paginazione in fondo. Accanto a ogni titolo c'è la lingua in cui
   l'ateneo pubblica: serve a sapere, prima di cliccare, che cosa si
   troverà dall'altra parte.

   I collegamenti escono dal sito: portano `rel="noopener"` perché la
   pagina di destinazione non possa toccare quella di partenza
   (riferimento.md §3.7).

   Oggi le notizie sono un elenco fermo dentro `dati/notizie.json`.
   Quando il processo automatico leggerà i siti degli atenei (§2.8),
   riscriverà quel file e questa sezione non se ne accorgerà.
*/

import { CONFIG, CITTA, LINGUA_FONTE } from '../configurazione.js';
import { T, esc, elenco, offre, dataBreve, stemma, filaAtenei } from './nucleo.js';

let NEWS = [];

/* Si entra sulle notizie dell'alleanza, non su tutte.
   Senza filtro l'elenco è ordinato per data, e in cima finiva sempre
   Sofia: NBU pubblica anche gli eventi in programma, che sono datati nei
   mesi a venire e quindi stanno davanti a tutto. Sono date giuste — un
   evento di novembre è di novembre — ma il risultato era che aprendo la
   sezione si leggeva un ateneo solo, e per caso.

   Il cerchio ERUA resta un filtro come gli altri: premendolo si torna a
   vedere tutto, e siccome parte acceso si vede subito che un filtro c'è. */
let filtroNews = CONFIG.siglaAlleanza, paginaNews = 1;
const PER_PAGINA = 20;

function renderChipsNews() {
  /* qui il cerchio ERUA è un filtro come gli altri: mostra le notizie
     pubblicate dal sito dell'alleanza, non tutte quante */
  document.getElementById('news-atenei').innerHTML =
    filaAtenei('data-news', filtroNews, true);
}

/* In che lingua è scritta davvero questa notizia.
   `LINGUA_FONTE` porta l'etichetta da mostrare — `EL`, `EN/LT` — che
   serve all'occhio ma non al browser: lì dentro un codice come `EN/LT`
   non vuol dire niente. Qui se ne ricava la forma che `lang=` accetta,
   prendendo la prima delle due quando l'ateneo pubblica in due lingue.

   Non è pignoleria da specifica. Un titolo greco dentro una pagina
   dichiarata inglese viene letto da un lettore di schermo con la voce
   inglese, e non si capisce niente. Con `lang` giusto la voce cambia. */
function codiceLingua(u) {
  const eti = LINGUA_FONTE[u];
  if (!eti) return '';
  return String(eti).split('/')[0].trim().toLowerCase();
}

function renderNews() {
  const lista = (filtroNews ? NEWS.filter(n => n.u === filtroNews) : NEWS)
    .slice().sort((a, b) => b.d.localeCompare(a.d));
  const pagine = Math.max(1, Math.ceil(lista.length / PER_PAGINA));
  if (paginaNews > pagine) paginaNews = 1;
  const da = (paginaNews - 1) * PER_PAGINA;
  const pezzo = lista.slice(da, da + PER_PAGINA);

  document.getElementById('news-lista').innerHTML = pezzo.map(n => `
    <article class="news">
      <span class="news-logo">${stemma(n.u, 'avatar')}</span>
      <div class="txt">
        <div class="riga">
          <span class="uni">${esc(CITTA[n.u] || n.u)}</span>
          <span class="lingua-fonte">${esc(LINGUA_FONTE[n.u] || '')}</span>
          ${n.tipo === 'evento' ? `<span class="tipo-evento">${T('evento', 'event')}</span>` : ''}
          <span>${dataBreve(n.d)}</span>
        </div>
        <b>${esc(n.t)}</b>
        <p>${esc(n.s)}</p>
        <a href="${esc(n.l)}" target="_blank" rel="noopener">${T('Leggi la notizia', 'Read the story')} →</a>
      </div>
    </article>`).join('') ||
    `<p style="color:var(--testo2)">${T('Nessuna notizia per questo ateneo.', 'No news for this university.')}</p>`;

  const conta = document.getElementById('news-conta');
  if (conta) conta.textContent = lista.length + ' ' + T('notizie', 'stories') +
    (filtroNews ? (' · ' + (CITTA[filtroNews] || filtroNews)) : '');

  const nav = document.getElementById('news-pagine');
  if (nav) {
    nav.innerHTML = pagine < 2 ? '' :
      `<button class="pg" data-pg="${Math.max(1, paginaNews - 1)}" ${paginaNews === 1 ? 'disabled' : ''}>←</button>` +
      Array.from({ length: pagine }, (_, k) =>
        `<button class="pg ${k + 1 === paginaNews ? 'on' : ''}" data-pg="${k + 1}">${k + 1}</button>`).join('') +
      `<button class="pg" data-pg="${Math.min(pagine, paginaNews + 1)}" ${paginaNews === pagine ? 'disabled' : ''}>→</button>`;
  }
}

/* ── comandi ───────────────────────────────────────────────────────
   Un ascoltatore solo, sul documento, che riconosce i propri bersagli.
   Ogni sezione ha il suo e non conosce quelli delle altre: sono
   attributi distinti, quindi non si pestano i piedi. */
document.addEventListener('click', e => {
  const cn = e.target.closest('[data-news]');
  if (cn) {
    const u = cn.dataset.news || null;
    filtroNews = (filtroNews === u) ? null : u;
    paginaNews = 1;
    renderChipsNews();
    renderNews();
    return;
  }
  const pg = e.target.closest('#news-pagine .pg');
  if (pg && !pg.disabled) {
    paginaNews = parseInt(pg.dataset.pg, 10);
    renderNews();
    document.getElementById('news-atenei').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* ── avvio della sezione ───────────────────────────────────────────
   Chiamato dalla navigazione al primo ingresso. Il file di dati si
   scarica adesso, non al caricamento della pagina: chi non apre le
   notizie non se le porta dietro (riferimento.md §2.4). */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;
  NEWS = (await elenco('notizie')).elementi;
  /* Se l'alleanza non avesse pubblicato niente, entrare su un filtro
     vuoto direbbe «non ci sono notizie» a chi ne ha centoquaranta
     davanti. In quel caso si parte da tutte. */
  if (!NEWS.some(n => n.u === filtroNews)) filtroNews = null;
  renderChipsNews();
  renderNews();
}

offre('notizie', { avvia, ridisegna: () => { if (avviata) { renderChipsNews(); renderNews(); } } });
