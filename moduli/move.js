/* ERUA connect — MOVE: dove si può andare, e entro quando
   ==================================================================
   Due viste. **Bandi**: le occasioni aperte, con la scadenza, e in fondo
   quelle chiuse. **Destinazioni**: gli atenei con cui esiste un accordo,
   con quanto costa vivere lì rispetto a casa.

   Tre scelte che si vedono, e il perché:

   1. **Le destinazioni non portano il logo dell'ateneo ospitante.** Sono
      marchi altrui, con manuali d'identità vincolanti (riferimento.md
      §6.4), e i file hanno licenza loro (§6.2). Portano la bandiera del
      paese e il segno pastello che il sito genera da sé. I loghi qui
      dentro sono solo quelli degli otto atenei dell'alleanza, nel
      filtro — come in tutte le altre sezioni.

   2. **Il costo non è una cifra, è un confronto.** «A Vilnius l'alloggio
      costa il 36% meno che in Italia» è aritmetica su indici Eurostat,
      con la fonte scritta sotto. «A Vilnius servono 700 € al mese»
      sarebbe una stima, e su questo contenuto una stima sbagliata fa
      danno vero: qualcuno decide dove vivere un anno.

   3. **Quello che non sappiamo si dice.** Un bando senza scadenza scritta
      lo dichiara; una destinazione fuori Europa non ha il confronto dei
      costi e lo dichiara; gli atenei di cui non abbiamo ancora le
      destinazioni sono elencati per nome. Una lacuna dichiarata è
      informazione; una lacuna nascosta è un inganno.
*/

import { CITTA, ATENEI } from '../configurazione.js';
import { LANG, T, esc, elenco, offre, dataBreve, filaAtenei, marchio } from './nucleo.js';

let BANDI = [], DESTINAZIONI = [], COSTI = new Map();
let fonteBandi = null, fonteDest = null, fonteCosti = null;
let vista = 'bandi';
let filtroUni = null, filtroPaese = null, pagina = 1;
const PER_PAGINA = 24;

/* Gli atenei che hanno destinazioni: serve a dire, con onestà, di quali
   non le abbiamo ancora. */
const conDestinazioni = () => new Set(DESTINAZIONI.map(d => d.da));

/* ── bandiera del paese ────────────────────────────────────────────
   Dalle due lettere del codice ISO alle due lettere regionali che il
   sistema disegna come bandiera. Niente file da scaricare, niente
   licenze: è testo. Dove il sistema non sa disegnarla — o il paese non
   ha un codice a due lettere — resta il segno pastello. */
function bandiera(iso) {
  if (!iso || iso.length !== 2) return null;
  const base = 0x1F1E6 - 65;
  return String.fromCodePoint(base + iso.toUpperCase().charCodeAt(0),
                              base + iso.toUpperCase().charCodeAt(1));
}

/* ── il confronto dei costi ────────────────────────────────────────
   Fra il paese di chi parte e quello dove va. Se manca uno dei due, non
   si mostra niente: meglio il silenzio di un confronto a metà. */
const VOCI = [
  { id: 'alloggio',  it: 'alloggio',      en: 'housing' },
  { id: 'spesa',     it: 'spesa',         en: 'groceries' },
  { id: 'trasporti', it: 'trasporti',     en: 'transport' },
  { id: 'fuori',     it: 'mangiare fuori', en: 'eating out' },
];

function confronto(paesePartenza, paeseArrivo) {
  const da = COSTI.get(paesePartenza), a = COSTI.get(paeseArrivo);
  if (!da || !a) return null;
  const righe = [];
  for (const v of VOCI) {
    const x = da.voci[v.id], y = a.voci[v.id];
    if (x == null || y == null || !x) continue;
    righe.push({ voce: T(v.it, v.en), scarto: Math.round((y / x - 1) * 100) });
  }
  return righe.length ? righe : null;
}

/* ── i bandi ───────────────────────────────────────────────────────── */
function bandoHTML(b) {
  const etichetta = {
    aperto: T('aperto', 'open'),
    chiuso: T('chiuso', 'closed'),
    'senza-data': T('scadenza non indicata', 'no deadline given'),
  }[b.stato];

  /* quanti giorni restano: è la cosa che si guarda per prima */
  let resta = '';
  if (b.stato === 'aperto' && b.scadenza) {
    const giorni = Math.round((new Date(b.scadenza + 'T12:00:00Z') - Date.now()) / 86400000);
    resta = giorni <= 0 ? T('ultimo giorno', 'last day')
      : giorni === 1 ? T('resta 1 giorno', '1 day left')
      : T(`restano ${giorni} giorni`, `${giorni} days left`);
  }

  return `<article class="move-bando ${esc(b.stato)}">
    <div class="mb-testa">
      <span class="mb-uni">${esc(CITTA[b.u] || b.u)}</span>
      ${b.mobilita ? `<span class="mb-mob">${T('mobilità', 'mobility')}</span>` : ''}
      <span class="mb-stato">${esc(etichetta)}</span>
    </div>
    <b class="mb-tit">${esc(b.t)}</b>
    ${b.s ? `<p class="mb-som">${esc(b.s)}</p>` : ''}
    <div class="mb-piede">
      ${b.scadenza
        ? `<span class="mb-quando"><b>${dataBreve(b.scadenza)}</b>${resta ? ` · ${esc(resta)}` : ''}</span>`
        : `<span class="mb-quando vago">${T('guarda il bando', 'check the call')}</span>`}
      <a href="${esc(b.l)}" target="_blank" rel="noopener">${T('Vai al bando', 'Open the call')} →</a>
    </div>
  </article>`;
}

function renderBandi() {
  const lista = filtroUni ? BANDI.filter(b => b.u === filtroUni) : BANDI;
  const aperti = lista.filter(b => b.stato === 'aperto').length;

  document.getElementById('move-bandi-conta').textContent =
    `${lista.length} ${T('bandi', 'calls')} · ${aperti} ${T('aperti', 'open')}` +
    (filtroUni ? ` · ${CITTA[filtroUni] || filtroUni}` : '');

  document.getElementById('move-bandi-lista').innerHTML =
    lista.map(bandoHTML).join('') ||
    `<p class="move-vuoto">${T('Nessun bando per questo ateneo, in questo momento.',
                              'No calls from this university right now.')}</p>`;
}

/* ── le destinazioni ─────────────────────────────────────────────────
   Il paese di ciascun ateneo di partenza, nei codici che usa Eurostat —
   dove la Grecia è EL, non GR. Serve al confronto dei costi: senza
   sapere da dove si parte, non c'è niente da confrontare. */
const PAESE_DI = { UNIMC: 'IT', MRU: 'LT', NBU: 'BG', EUV: 'DE', SWPS: 'PL', ULPGC: 'ES', UAEGEAN: 'EL', UP8: 'FR' };
const paeseDiPartenza = sigla => PAESE_DI[sigla] || null;

function destinazioneHTML(d) {
  const flag = bandiera(d.paese);
  const scarti = confronto(paeseDiPartenza(d.da), d.paeseEurostat);

  return `<article class="move-dest">
    <div class="md-testa">
      ${flag ? `<span class="md-bandiera" aria-hidden="true">${flag}</span>`
             : marchio(d.da, 26)}
      <span class="md-paese">${esc(d.paeseNome[LANG] || d.paeseNome.en)}</span>
      ${d.posti > 0 ? `<span class="md-posti">${d.posti} ${T('posti', 'places')}</span>` : ''}
    </div>
    <b class="md-ateneo">${esc(d.ateneo)}</b>
    ${d.codice ? `<span class="md-codice">${esc(d.codice)}</span>` : ''}
    ${scarti
      ? `<ul class="md-costi">${scarti.map(r => `
          <li><span>${esc(r.voce)}</span><b class="${r.scarto < 0 ? 'meno' : r.scarto > 0 ? 'piu' : ''}">${r.scarto > 0 ? '+' : ''}${r.scarto}%</b></li>`).join('')}</ul>`
      : `<p class="md-nocosti">${T('Confronto dei costi non disponibile per questo paese.',
                                   'Cost comparison not available for this country.')}</p>`}
    <div class="md-piede">
      <span>${T('partendo da', 'leaving from')} ${esc(CITTA[d.da] || d.da)}</span>
      <span class="md-anno">${esc(d.anno)}</span>
    </div>
  </article>`;
}

function renderDestinazioni() {
  let lista = DESTINAZIONI;
  if (filtroUni) lista = lista.filter(d => d.da === filtroUni);
  if (filtroPaese) lista = lista.filter(d => d.paese === filtroPaese);

  /* i paesi disponibili, col conto, per la fila dei filtri */
  const perPaese = new Map();
  const base = filtroUni ? DESTINAZIONI.filter(d => d.da === filtroUni) : DESTINAZIONI;
  for (const d of base) {
    const k = d.paese;
    if (!perPaese.has(k)) perPaese.set(k, { nome: d.paeseNome[LANG] || d.paeseNome.en, n: 0 });
    perPaese.get(k).n++;
  }
  const paesi = [...perPaese.entries()].sort((a, b) => b[1].n - a[1].n || a[1].nome.localeCompare(b[1].nome));

  document.getElementById('move-paesi').innerHTML =
    `<button class="chip" data-paese="" aria-pressed="${!filtroPaese}">${T('Tutti', 'All')}</button>` +
    paesi.map(([iso, v]) => {
      const f = bandiera(iso);
      return `<button class="chip" data-paese="${esc(iso)}" aria-pressed="${filtroPaese === iso}">${
        f ? `<span aria-hidden="true">${f}</span> ` : ''}${esc(v.nome)} <i>${v.n}</i></button>`;
    }).join('');

  const pagine = Math.max(1, Math.ceil(lista.length / PER_PAGINA));
  if (pagina > pagine) pagina = 1;
  const pezzo = lista.slice((pagina - 1) * PER_PAGINA, pagina * PER_PAGINA);

  const mancanti = ATENEI.filter(a => !conDestinazioni().has(a));
  document.getElementById('move-dest-conta').innerHTML =
    `${lista.length} ${T('destinazioni', 'destinations')}` +
    (filtroUni ? ` · ${esc(CITTA[filtroUni] || filtroUni)}` : '') +
    (mancanti.length
      ? `<span class="move-lacuna">${T('Non abbiamo ancora le destinazioni di', 'We do not yet have destinations for')}: ${
          esc(mancanti.map(a => CITTA[a] || a).join(', '))}</span>`
      : '');

  document.getElementById('move-dest-lista').innerHTML =
    pezzo.map(destinazioneHTML).join('') ||
    `<p class="move-vuoto">${T('Nessuna destinazione con questi filtri.', 'No destinations with these filters.')}</p>`;

  const nav = document.getElementById('move-pagine');
  nav.innerHTML = pagine < 2 ? '' :
    `<button class="pg" data-mpg="${Math.max(1, pagina - 1)}" ${pagina === 1 ? 'disabled' : ''}>←</button>` +
    Array.from({ length: pagine }, (_, k) =>
      `<button class="pg ${k + 1 === pagina ? 'on' : ''}" data-mpg="${k + 1}">${k + 1}</button>`).join('') +
    `<button class="pg" data-mpg="${Math.min(pagine, pagina + 1)}" ${pagina === pagine ? 'disabled' : ''}>→</button>`;
}

/* ── la riga delle fonti, sempre visibile ──────────────────────────
   Non è un dettaglio legale: è quello che permette a chi legge di
   controllarci. E per Eurostat l'attribuzione è anche una condizione
   della licenza. */
function renderFonte() {
  const parti = [];
  if (vista === 'bandi' && fonteBandi) parti.push(fonteBandi);
  if (vista === 'destinazioni') {
    if (fonteDest) parti.push(fonteDest);
    if (fonteCosti) parti.push(fonteCosti);
  }
  document.getElementById('move-fonte').textContent = parti.join(' · ');
}

function ridisegna() {
  document.getElementById('move-atenei').innerHTML = filaAtenei('data-move-uni', filtroUni);
  if (vista === 'bandi') renderBandi(); else renderDestinazioni();
  renderFonte();
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  const m = e.target.closest('#move-modi .modo-mag');
  if (m) {
    vista = m.dataset.move;
    document.querySelectorAll('#move-modi .modo-mag').forEach(b => {
      const on = b === m;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    document.getElementById('move-bandi').hidden = vista !== 'bandi';
    document.getElementById('move-destinazioni').hidden = vista !== 'destinazioni';
    ridisegna();
    return;
  }

  const u = e.target.closest('[data-move-uni]');
  if (u) {
    const s = u.dataset.moveUni || null;
    filtroUni = (filtroUni === s) ? null : s;
    filtroPaese = null; pagina = 1;
    ridisegna();
    return;
  }

  const p = e.target.closest('#move-paesi [data-paese]');
  if (p) {
    const iso = p.dataset.paese || null;
    filtroPaese = iso || null;
    pagina = 1;
    renderDestinazioni();
    return;
  }

  const pg = e.target.closest('#move-pagine .pg');
  if (pg && !pg.disabled) {
    pagina = parseInt(pg.dataset.mpg, 10);
    renderDestinazioni();
    document.getElementById('move-paesi').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* ── avvio della sezione ───────────────────────────────────────────
   Tre file, chiesti insieme e solo entrando qui. Se uno manca, la
   sezione mostra quello che ha invece di non aprirsi (§2.2). */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;

  const [bandi, dest, costi] = await Promise.all([
    elenco('bandi').catch(() => null),
    elenco('destinazioni').catch(() => null),
    elenco('costi').catch(() => null),
  ]);

  if (bandi) { BANDI = bandi.elementi; fonteBandi = bandi.fonte; }
  if (dest)  { DESTINAZIONI = dest.elementi; fonteDest = dest.fonte; }
  if (costi) {
    fonteCosti = costi.fonte;
    for (const p of costi.elementi) COSTI.set(p.paese, p);
  }

  ridisegna();
}

offre('move', { avvia, ridisegna: () => { if (avviata) ridisegna(); } });
