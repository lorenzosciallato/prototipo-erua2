/* ERUA connect — Ideathon
   ==================================================================
   Un bando europeo aperto, e chi si sta organizzando per vincerlo.

   **Perché questa sezione esiste separata dalle altre.** La rivista, le
   notizie e la piazza raccontano quello che l'alleanza fa. Questa fa una
   cosa diversa: mette gli studenti in condizione di **prendere soldi da
   fuori**, competendo con tutta Europa. È il solo posto del sito dove
   c'è in gioco un premio vero, e per questo la voce nella navigazione è
   marcata: chi guarda il sito per la prima volta deve trovarla subito.

   **Il bando è reale.** New European Bauhaus Prizes, Strand B «Rising
   Stars», Commissione europea, riservato a chi ha trent'anni o meno.
   Categorie, premi e sito ufficiale sono quelli veri. Le date sono
   quelle dell'edizione precedente e la scheda lo dice apertamente, con
   il collegamento al sito ufficiale accanto: nessuno deve poter perdere
   una scadenza per colpa di una nostra pagina.

   **Le squadre e gli studenti sono inventati**, e la sezione lo dichiara
   in fondo. Servono a mostrare come funzionerebbe: senza qualcuno già
   dentro, una pagina che dice «forma una squadra» resta vuota per
   sempre — nessuno è il primo a scrivere in una stanza vuota.

   Quando ci saranno persone vere, qui ci sarà un problema di dati
   personali da affrontare prima, non dopo: età e genere sono dati
   personali, e mostrarli a tutti è una scelta che va giustificata (§3.5,
   §7.0). Oggi sono finti e non c'è nulla da proteggere.
*/

import { CITTA } from '../configurazione.js';
import { T, esc, dati, offre, dataBreve, faccia, stemma } from './nucleo.js';

let BANDO = null, CONTA = null, SQUADRE = [], SOLI = [], NOTA = null;
let filtroCategoria = null;

const categoriaDi = id => (BANDO.categorie || []).find(c => c.id === id) || BANDO.categorie[0];

/* ── enfasi nel testo del bando ────────────────────────────────────
   Il testo lo scriviamo noi, ma passa comunque da `esc()` per primo:
   la regola P3 non ha eccezioni per i contenuti «di casa», perché è
   proprio l'eccezione che un giorno lascia passare qualcos'altro.
   Solo dopo, su testo già innocuo, si riconoscono due segni:

       **grassetto**      le parole che portano il senso
       __sottolineato__   le condizioni da non sbagliare

   Due e non di più: un linguaggio di marcatura completo dentro un file
   di dati diventa un buco per cui nessuno si sente responsabile. */
function conEnfasi(testo) {
  return esc(testo)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/__(.+?)__/g, '<u>$1</u>');
}

/* ── il bando, in cima ─────────────────────────────────────────────
   Deve rispondere in tre secondi a: quanto si vince, entro quando, e
   posso partecipare io. Tutto il resto viene dopo. */
function bandoHTML() {
  const b = BANDO;
  const giorni = Math.round((new Date(b.scadenza + 'T12:00:00Z') - Date.now()) / 86400000);

  return `<article class="idea-bando">
    <div class="ib-testa">
      <span class="ib-ente">${esc(b.ente)}</span>
      <span class="ib-strand">${esc(b.sottotitolo)}</span>
    </div>

    <h2 class="ib-tit">${esc(b.titolo)}</h2>
    <p class="ib-occhiello">${esc(b.descrizione)}</p>

    <div class="ib-lungo">
      ${(b.descrizioneLunga || []).map(p => `<p>${conEnfasi(p)}</p>`).join('')}
    </div>

    <div class="ib-numeri">
      <div class="ib-num grande">
        <b>${esc(b.premio)}</b>
        <span>${esc(b.premioNota)}</span>
      </div>
      <div class="ib-num">
        <b>${dataBreve(b.scadenza)}</b>
        <span>${giorni > 0
          ? T(`fra ${giorni} giorni`, `in ${giorni} days`)
          : T('edizione chiusa', 'edition closed')}</span>
      </div>
      <div class="ib-num">
        <b>≤ 30</b>
        <span>${T('anni, tutti gli autori', 'years old, every author')}</span>
      </div>
    </div>

    <ul class="ib-vantaggi">
      ${(b.vantaggi || []).map(v => `<li>${esc(v)}</li>`).join('')}
    </ul>

    <div class="ib-piede">
      <a class="ib-vai" href="${esc(b.sito)}" target="_blank" rel="noopener">
        ${T('Bando ufficiale', 'Official call')} →</a>
      <a class="ib-guida" href="${esc(b.sitoStrand)}" target="_blank" rel="noopener">
        ${T('Regole dello Strand B', 'Strand B rules')}</a>
      <span class="ib-avviso">${esc(b.scadenzaNota)}</span>
    </div>
  </article>`;
}

/* ── chi ha vinto negli anni scorsi ────────────────────────────────
   Sono progetti veri, premiati davvero. Stanno qui perché la domanda
   che si fa chiunque legga un bando è «ma che cosa vince, di preciso?»,
   e cinque esempi rispondono meglio di qualunque descrizione. Servono
   anche a togliere soggezione: nessuno di questi era un'opera d'ingegno
   irraggiungibile, erano idee chiare. */
function vincitoriHTML() {
  const v = BANDO.vincitori || [];
  if (!v.length) return '';
  return `<div class="idea-sezione">
      <h2 class="idea-titolo">${T('Idee che hanno vinto', 'Ideas that won')}</h2>
      <p class="idea-sotto">${T('Progetti veri, premiati nelle edizioni precedenti dello stesso bando.',
                                'Real projects, awarded in previous editions of this same prize.')}</p>
    </div>
    <div class="idea-vincitori">
      ${v.map(x => `
        <article class="iv-scheda">
          <header>
            <span class="iv-anno">${esc(x.anno)}</span>
            <span class="iv-paese">${esc(x.paese)}</span>
          </header>
          <b class="iv-tit">${esc(x.titolo)}</b>
          <span class="iv-cat">${esc(x.categoria)}</span>
          <p class="iv-sintesi">${esc(x.sintesi)}</p>
        </article>`).join('')}
    </div>`;
}

/* ── il conteggio: quante persone si sono già mosse ────────────────
   Serve a togliere la paura di essere il primo. Sono i tre numeri che
   una persona guarda prima di decidere se vale la pena. */
function contaHTML() {
  const c = CONTA;
  return `<div class="idea-conta">
    <div class="ic-voce"><b>${c.rispostoAllaCall}</b><span>${T('hanno risposto alla call', 'answered the call')}</span></div>
    <div class="ic-voce"><b>${c.squadreFormate}</b><span>${T('squadre già formate', 'teams already formed')}</span></div>
    <div class="ic-voce"><b>${c.ancoraSoli}</b><span>${T('cercano ancora un gruppo', 'still looking for a team')}</span></div>
  </div>

  <nav class="idea-filtri" aria-label="${T('Categorie', 'Categories')}">
    <button class="chip" data-cat="" aria-pressed="${!filtroCategoria}">${T('Tutte', 'All')}</button>
    ${BANDO.categorie.map(c => `
      <button class="chip" data-cat="${esc(c.id)}" aria-pressed="${filtroCategoria === c.id}"
        style="--sf:var(${c.tinta});--sc:var(${c.tinta}-s)">${esc(c.nome)}</button>`).join('')}
  </nav>`;
}

/* ── le squadre già formate ────────────────────────────────────────── */
function squadraHTML(s) {
  const cat = categoriaDi(s.categoria);
  const atenei = [...new Set(s.membri.map(m => m.uni))];

  return `<article class="idea-squadra" style="--tinta:var(${cat.tinta});--tinta-s:var(${cat.tinta}-s)">
    <header class="is-capo">
      <span class="is-cat">${esc(cat.nome)}</span>
      <span class="is-atenei">${atenei.map(u => stemma(u, 'is-logo')).join('')}</span>
    </header>

    <h3 class="is-tit">${esc(s.progetto)}</h3>
    <p class="is-sintesi">${esc(s.sintesi)}</p>

    <div class="is-membri">
      ${s.membri.map(m => `
        <span class="is-membro" title="${esc(m.nome)} · ${esc(CITTA[m.uni] || m.uni)}">
          ${faccia(m.nome, 30)}
          <span class="is-chi"><b>${esc(m.nome)}</b><i>${esc(m.ruolo)}</i></span>
        </span>`).join('')}
      ${s.postiLiberi > 0
        ? `<span class="is-liberi">+${s.postiLiberi}<i>${T('posti', 'open')}</i></span>`
        : ''}
    </div>

    <div class="is-cerca">
      <span class="is-cerca-eti">${T('Cercano', 'Looking for')}</span>
      <p>${esc(s.cerca)}</p>
    </div>

    <button class="is-unisci" data-unisci="${esc(s.id)}">
      ${T('Chiedi di entrare', 'Ask to join')} →</button>
  </article>`;
}

function squadreHTML() {
  const lista = filtroCategoria ? SQUADRE.filter(s => s.categoria === filtroCategoria) : SQUADRE;
  return `<div class="idea-sezione">
      <h2 class="idea-titolo">${T('Squadre già formate', 'Teams already formed')}</h2>
      <p class="idea-sotto">${T('Ognuna ha ancora posto. Entrare in una che esiste è più facile che farne una da zero.',
                                'Each of them still has room. Joining one is easier than starting from nothing.')}</p>
    </div>
    <div class="idea-griglia">${
      lista.map(squadraHTML).join('') ||
      `<p class="idea-vuoto">${T('Nessuna squadra in questa categoria — sii il primo.',
                                 'No team in this category yet — be the first.')}</p>`}</div>`;
}

/* ── chi cerca ancora un gruppo ─────────────────────────────────────
   Sono schede di persone, non di progetti: qui non c'è un'idea da
   valutare, c'è qualcuno da cui partire. Per questo si legge prima cosa
   sa fare e poi da dove viene. */
function soloHTML(p) {
  return `<article class="idea-solo">
    <header class="isl-capo">
      ${faccia(p.nome, 42)}
      <div class="isl-chi">
        <b>${esc(p.nome)}</b>
        <span class="isl-dove">${stemma(p.uni, 'isl-logo')}${esc(CITTA[p.uni] || p.uni)}</span>
      </div>
      <span class="isl-dati">
        <i>${p.eta}</i>
        <span>${esc(p.genere)}</span>
      </span>
    </header>

    <p class="isl-testo">${esc(p.testo)}</p>

    <ul class="isl-interessi">
      ${(p.interessi || []).map(i => `<li>${esc(i)}</li>`).join('')}
    </ul>

    <button class="isl-scrivi" data-scrivi="${esc(p.id)}">
      ${T('Proponi una squadra', 'Team up')} →</button>
  </article>`;
}

function soliHTML() {
  return `<div class="idea-sezione">
      <h2 class="idea-titolo">${T('Cercano un gruppo', 'Looking for a team')}</h2>
      <p class="idea-sotto">${T('Hanno scritto cosa sanno fare. Il bando chiede almeno due atenei diversi: guarda chi non è del tuo.',
                                'They wrote what they can do. The call requires at least two different universities — look for someone not from yours.')}</p>
    </div>
    <div class="idea-griglia soli">${SOLI.map(soloHTML).join('')}</div>`;
}

function ridisegna() {
  document.getElementById('idea-bando').innerHTML = bandoHTML();
  document.getElementById('idea-vincitori').innerHTML = vincitoriHTML();
  document.getElementById('idea-conta').innerHTML = contaHTML();
  document.getElementById('idea-squadre').innerHTML = squadreHTML();
  document.getElementById('idea-soli').innerHTML = soliHTML();
  document.getElementById('idea-nota').textContent = NOTA || '';
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  const cat = e.target.closest('#p-ideathon [data-cat]');
  if (cat) {
    filtroCategoria = cat.dataset.cat || null;
    document.getElementById('idea-conta').innerHTML = contaHTML();
    document.getElementById('idea-squadre').innerHTML = squadreHTML();
    return;
  }

  /* Nel prototipo non si entra davvero in una squadra: non esiste
     ancora un profilo, e finché non c'è un titolare del trattamento non
     deve esistere (§7.0). Il pulsante lo dice invece di non fare niente:
     un pulsante che non risponde sembra rotto. */
  const u = e.target.closest('[data-unisci]');
  const s = e.target.closest('[data-scrivi]');
  if (u || s) {
    import('./nucleo.js').then(({ toast }) => toast(
      T('Nel prototipo non si può ancora scrivere a qualcuno: serve un profilo, e quello arriva col servizio vero.',
        'You cannot message anyone in the prototype yet: that needs a profile, and profiles come with the real service.')));
  }
});

/* ── avvio della sezione ───────────────────────────────────────────── */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;

  const d = await dati('ideathon');
  BANDO = d.bando;
  CONTA = d.conta;
  SQUADRE = d.squadre || [];
  SOLI = d.soli || [];
  NOTA = d.note || null;

  ridisegna();
}

offre('ideathon', { avvia, ridisegna: () => { if (avviata) ridisegna(); } });
