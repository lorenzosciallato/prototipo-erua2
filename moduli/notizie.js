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

import { CITTA, LINGUA_FONTE } from '../configurazione.js';
import { T, esc, elenco, offre, dataBreve, stemma, filaAtenei } from './nucleo.js';

let NEWS = [];
let filtroNews = null, paginaNews = 1;
const PER_PAGINA = 20;

function renderChipsNews() {
  document.getElementById('news-atenei').innerHTML = filaAtenei('data-news', filtroNews);
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
  renderChipsNews();
  renderNews();
}

offre('notizie', { avvia, ridisegna: () => { if (avviata) { renderChipsNews(); renderNews(); } } });
