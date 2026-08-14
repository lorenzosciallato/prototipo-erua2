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
import { T, esc, dati, offre, dataBreve, faccia, stemma, apriFoglio, chiudiFoglio } from './nucleo.js';
import { copertina } from './geometrie.js';

let BANDI = [], BANDO = null, CONTA = null, SQUADRE = [], SOLI = [], NOTA = null;
let filtroCategoria = null;

/* Le categorie di tutti i bandi messe insieme.

   Le squadre non cambiano quando cambi il bando in evidenza: sono
   persone dell'alleanza che si stanno organizzando, non la graduatoria
   di un bando. Se cercassimo la loro categoria solo dentro il bando
   scelto, cambiando bando perderebbero tutte il colore e il filtro non
   troverebbe più niente. Si cerca quindi nell'insieme. */
const tutteCategorie = () => BANDI.flatMap(b => b.categorie || []);
const categoriaDi = id => tutteCategorie().find(c => c.id === id) || tutteCategorie()[0];

/* Le categorie che i filtri mostrano: solo quelle che almeno una
   squadra usa davvero. Un filtro che non ha niente da filtrare è un
   pulsante che porta a una pagina vuota. */
const categorieUsate = () => {
  const usate = new Set(SQUADRE.map(s => s.categoria));
  return tutteCategorie().filter(c => usate.has(c.id));
};

/* ── quanti giorni mancano ──────────────────────────────────────────
   Un numero solo, calcolato in un posto solo: la striscia dei bandi e
   il banner devono dire la stessa cosa, e due conti separati che
   sembrano uguali sono due conti che un giorno divergono. */
function giorniA(scadenza) {
  return Math.round((new Date(scadenza + 'T12:00:00Z') - Date.now()) / 86400000);
}

/* ── il bando ──────────────────────────────────────────────────────
   Un blocco solo, che in due secondi deve dire: **quanto si vince**, che
   è aperto, e che riguarda te. Tre informazioni, tre dimensioni di
   carattere molto diverse — se sono tutte della stessa taglia, l'occhio
   non sa dove posarsi e non si posa da nessuna parte.

   La spiegazione lunga sta fuori di qui, sotto: dentro un banner
   nessuno legge cinque paragrafi, e metterceli li rende invisibili
   tutti e cinque. */
function bandoHTML() {
  const b = BANDO;
  const giorni = giorniA(b.scadenza);

  return `<article class="idea-bando">
    <div class="ib-alto">
      <span class="ib-ente">${esc(b.ente)}</span>
      <span class="ib-nome">${esc(b.titolo)}</span>
      <span class="ib-vivo"><i></i>${T('Bando aperto', 'Call open')}</span>
    </div>

    <h2 class="ib-tit">${esc(b.occhiello)}</h2>

    <div class="ib-corpo">
      <div class="ib-premio">
        <b>${esc(b.premio)}</b>
        <span>${esc(b.premioNota)}</span>
      </div>
      <div class="ib-lato">
        <p class="ib-cosa">${esc(b.descrizione)}</p>
        <div class="ib-due">
          <div><b>${dataBreve(b.scadenza)}</b><span>${giorni > 0
            ? T(`fra ${giorni} giorni`, `${giorni} days left`)
            : T('edizione chiusa', 'edition closed')}</span></div>
          <div><b>${esc(b.eta)}</b><span>${esc(b.etaNota)}</span></div>
        </div>
      </div>
    </div>

    <div class="ib-piede">
      <a class="ib-vai" href="${esc(b.sito)}" target="_blank" rel="noopener">
        ${T('Vai al bando', 'Open the call')} →</a>
      <button class="ib-guida" data-spiega="${esc(b.id)}">
        ${T('Come funziona', 'How it works')}</button>
      <span class="ib-avviso">${esc(b.scadenzaNota)}</span>
    </div>

    <div class="ib-vinti">
      <span class="ib-vinti-eti">${etichettaVincitori(b)}</span>
      <div class="ib-striscia">
        ${(b.vincitori || []).map((v, i) => `
          <button class="ibv" data-vinto="${i}" ${v.foto ? '' : 'data-disegno="1"'}
            aria-label="${esc(v.titolo)}">
            <span class="ibv-img">${v.foto
              ? `<img src="${esc(v.foto)}" alt="" loading="lazy" decoding="async">`
              : copertina(v.titolo, { larghezza: 480, altezza: 320, tavolozza: i })}
              <span class="ibv-piu">${T('Leggi', 'Read')} →</span>
            </span>
            <span class="ibv-testi">
              <b>${esc(v.titolo)}</b>
              <i>${esc(v.paese)} · ${esc(v.anno)}</i>
            </span>
          </button>`).join('')}
      </div>
    </div>

    ${altriBandiHTML()}
  </article>`;
}

/* L'etichetta sopra i progetti dice quello che sono davvero. Dove c'è
   una classifica sono vincitori; dove non c'è — il contributo del corpo
   di solidarietà si ottiene, non si vince — chiamarli vincitori sarebbe
   falso, e la parola sbagliata qui costa a chi ci crede. */
function etichettaVincitori(b) {
  if (b.senzaClassifica) return T('Come funziona, in tre punti', 'How it works, in three points');
  return b.vincitoriReali
    ? T('Hanno vinto con questo bando', 'These won this call')
    : T('Il genere di progetto che vince', 'The kind of project that wins');
}

/* ── gli altri bandi, dentro al banner ─────────────────────────────
   Stanno in fondo al blocco e non sopra: prima si guarda il bando che
   c'è, poi si scopre che non è l'unico. Invertendoli, si comincerebbe
   da una scelta fra quattro cose di cui non si sa ancora niente.

   Si aprono in un foglio invece di cambiare la pagina sotto: da lì si
   legge il bando per intero, e solo se convince lo si porta nel banner.
   Cambiare tutto al primo clic punisce la curiosità. */
function altriBandiHTML() {
  const altri = BANDI.filter(b => b.id !== BANDO.id);
  if (!altri.length) return '';

  return `<div class="ib-altri">
    <span class="ib-altri-eti">${T(
      `Non è l'unico: altri ${altri.length} bandi europei aperti`,
      `Not the only one: ${altri.length} more open European calls`)}</span>
    <div class="ib-altri-fila">
      ${altri.map(a => {
        const g = giorniA(a.scadenza);
        return `<button class="iba" data-apri="${esc(a.id)}">
          <span class="iba-ente">${esc(a.ente)}</span>
          <b class="iba-tit">${esc(a.titolo)}</b>
          <span class="iba-piede">
            <i class="iba-premio">${esc(a.premio)}</i>
            <i class="iba-quando">${g > 0
              ? T(`fra ${g} g`, `${g} d left`)
              : T('da riaprire', 'reopening')}</i>
          </span>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

/* ── il foglio di un bando ─────────────────────────────────────────
   Il testo lungo per intero, coi grassetti e le sottolineature segnati
   a mano nei dati. In fondo due strade: il sito ufficiale, oppure
   portare questo bando nel banner al posto di quello che c'è — perché
   chi ha letto tutto è esattamente chi potrebbe volerselo davanti
   mentre guarda le squadre. */
function foglioBandoHTML(b) {
  const g = giorniA(b.scadenza);
  return `<div class="fgb">
    <span class="fgb-ente">${esc(b.ente)}</span>
    <h2 class="fgb-tit">${esc(b.titolo)}</h2>
    <p class="fgb-occhiello">${esc(b.occhiello)}</p>

    <div class="fgb-dati">
      <div><b>${esc(b.premio)}</b><span>${esc(b.premioNota)}</span></div>
      <div><b>${dataBreve(b.scadenza)}</b><span>${g > 0
        ? T(`fra ${g} giorni`, `${g} days left`)
        : T('edizione chiusa', 'edition closed')}</span></div>
      <div><b>${esc(b.eta)}</b><span>${esc(b.etaNota)}</span></div>
    </div>

    <div class="fgb-testo">
      ${(b.descrizioneLunga || []).map(p => `<p>${conEnfasi(p)}</p>`).join('')}
    </div>

    ${(b.vantaggi || []).length ? `<ul class="fgb-vantaggi">
      ${b.vantaggi.map(v => `<li>${esc(v)}</li>`).join('')}
    </ul>` : ''}

    <p class="fgb-avviso">${esc(b.scadenzaNota)}</p>

    <div class="fgb-piede">
      <a class="fgb-vai" href="${esc(b.sito)}" target="_blank" rel="noopener">
        ${T('Vai al bando', 'Open the call')} →</a>
      <a class="fgb-guida" href="${esc(b.sitoStrand)}" target="_blank" rel="noopener">
        ${esc(b.guidaEtichetta)}</a>
      ${b.id === BANDO.id ? '' : `<button class="fgb-evidenza" data-evidenzia="${esc(b.id)}">
        ${T('Mettilo in evidenza', 'Show it in the banner')}</button>`}
    </div>
  </div>`;
}

/* ── il foglio di un progetto ──────────────────────────────────────
   La copertina grande e poi il racconto lungo. Risponde alla domanda
   che viene guardando la striscia — «sì, ma cosa hanno fatto di
   preciso?» — a cui una didascalia di sei parole non risponde.

   In fondo, sempre, da dove viene: il collegamento all'annuncio
   ufficiale se il progetto è premiato davvero, e la dichiarazione per
   esteso se invece l'abbiamo scritto noi. */
function foglioProgettoHTML(v, i, b) {
  return `<div class="fgp">
    <div class="fgp-img"${v.foto ? '' : ' data-disegno="1"'}>${v.foto
      ? `<img src="${esc(v.foto)}" alt="">`
      : copertina(v.titolo, { larghezza: 600, altezza: 340, tavolozza: i })}</div>

    <span class="fgp-cat">${esc(v.categoria)}</span>
    <h2 class="fgp-tit">${esc(v.titolo)}</h2>
    <span class="fgp-paese">${esc(v.paese)} · ${esc(v.anno)}</span>

    <p class="fgp-testo">${esc(v.esteso || v.sintesi)}</p>

    <div class="fgp-piede">
      <span class="fgp-bando">${b.senzaClassifica
        ? T('Da', 'From')
        : T('Premiato da', 'Awarded by')} <b>${esc(b.titolo)}</b></span>
      ${b.vincitoriReali && b.vincitoriFonte
        ? `<a class="fgp-fonte" href="${esc(b.vincitoriFonte)}" target="_blank" rel="noopener">
            ${T('Annuncio ufficiale', 'Official announcement')} →</a>`
        : `<span class="fgp-nonvero">${esc(b.vincitoriNota || '')}</span>`}
    </div>
  </div>`;
}

/* ── il conteggio: quante persone si sono già mosse ────────────────
   Serve a togliere la paura di essere il primo. Sono i tre numeri che
   una persona guarda prima di decidere se vale la pena. */
function contaHTML() {
  const c = CONTA;

  /* Ogni numero sta dentro una figura, e la figura è **solo contorno**.
     Riempirle di colore avrebbe messo il colore davanti al numero:
     un contorno spesso circoscrive senza competere, e il numero resta
     la cosa più scura e più grande dentro il riquadro.

     Tre figure diverse e non tre cerchi: alla seconda ripetizione
     l'occhio smette di distinguere e legge «tre pallini». Cerchio,
     rombo e triangolo si riconoscono di scorcio, ognuno col suo colore.

     I contorni sono disegnati, non bordi CSS: un bordo sa fare solo
     rettangoli e cerchi, e il triangolo verrebbe con i vertici tagliati. */
  const figure = [
    { d: '<circle cx="60" cy="60" r="52"/>', tinta: '#F5C518', v: c.rispostoAllaCall,
      eti: T('hanno risposto', 'answered the call') },
    { d: '<rect x="20" y="20" width="80" height="80" rx="8" transform="rotate(45 60 60)"/>', tinta: '#48F89B', v: c.squadreFormate,
      eti: T('squadre formate', 'teams formed') },
    { d: '<path d="M60 10 112 104H8z" stroke-linejoin="round"/>', tinta: '#8B6BFF', v: c.ancoraSoli,
      eti: T('cercano un gruppo', 'looking for a team') },
  ];

  return `<div class="idea-conta">
    ${figure.map(f => `
      <div class="ic-voce" style="--seg:${f.tinta}">
        <span class="ic-figura">
          <svg viewBox="0 0 120 120" aria-hidden="true" fill="none"
            stroke="${f.tinta}" stroke-width="4">${f.d}</svg>
          <b>${f.v}</b>
        </span>
        <span class="ic-eti">${f.eti}</span>
      </div>`).join('')}
  </div>

  <nav class="idea-filtri" aria-label="${T('Categorie', 'Categories')}">
    <button class="chip" data-cat="" aria-pressed="${!filtroCategoria}">${T('Tutte', 'All')}</button>
    ${categorieUsate().map(c => `
      <button class="chip" data-cat="${esc(c.id)}" aria-pressed="${filtroCategoria === c.id}"
        style="--sf:var(${c.tinta});--sc:var(${c.tinta}-s)">${esc(c.nome)}</button>`).join('')}
  </nav>`;
}

/* ── le squadre già formate ────────────────────────────────────────── */
function squadraHTML(s, indice) {
  const cat = categoriaDi(s.categoria);
  const atenei = [...new Set(s.membri.map(m => m.uni))];

  /* Ogni squadra ha una copertina geometrica sua, nata dal titolo del
     progetto: sempre uguale per lo stesso progetto, diversa da tutte le
     altre. Serve a distinguerle a colpo d'occhio quando saranno venti e
     non quattro — un elenco di riquadri bianchi non si scorre. */
  return `<article class="idea-squadra" style="--tinta:var(${cat.tinta});--tinta-s:var(${cat.tinta}-s)">
    <span class="is-cop">${copertina(s.progetto, { larghezza: 600, altezza: 300, tavolozza: indice })}
      <span class="is-cat">${esc(cat.nome)}</span>
      <span class="is-atenei">${atenei.map(u => stemma(u, 'is-logo')).join('')}</span>
    </span>

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
      lista.map((s, i) => squadraHTML(s, i)).join('') ||
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
  document.getElementById('idea-conta').innerHTML = contaHTML();
  document.getElementById('idea-squadre').innerHTML = squadreHTML();
  document.getElementById('idea-soli').innerHTML = soliHTML();
  document.getElementById('idea-nota').textContent = NOTA || '';
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  /* Cambio del bando in evidenza. Si ridisegna solo quello che
     dipende dal bando — banner, spiegazione, vincitori — e non le
     squadre: quelle sono le stesse, e rifarle farebbe saltare la
     pagina sotto le mani di chi sta leggendo. */
  /* Un altro bando, o la spiegazione di quello in evidenza: stessa
     finestra, stesso contenuto. «Come funziona» non è che il foglio del
     bando che stai già guardando. */
  const apri = e.target.closest('#p-ideathon [data-apri], #p-ideathon [data-spiega]');
  if (apri) {
    const id = apri.dataset.apri || apri.dataset.spiega;
    const b = BANDI.find(x => x.id === id);
    if (b) apriFoglio(foglioBandoHTML(b), b.titolo);
    return;
  }

  /* Un progetto premiato. L'indice basta a ritrovarlo: la striscia è
     disegnata dal bando in evidenza, quindi è lì che si cerca. */
  const vinto = e.target.closest('#p-ideathon [data-vinto]');
  if (vinto) {
    const i = Number(vinto.dataset.vinto);
    const v = (BANDO.vincitori || [])[i];
    if (v) apriFoglio(foglioProgettoHTML(v, i, BANDO), v.titolo);
    return;
  }

  /* Dal foglio di un bando: portalo nel banner. Si chiude la finestra e
     si risale al banner — senza lo scorrimento, chi aveva letto in
     fondo si ritroverebbe davanti le squadre e non capirebbe che il
     bando sopra è cambiato. */
  const evid = e.target.closest('[data-evidenzia]');
  if (evid) {
    const scelto = BANDI.find(b => b.id === evid.dataset.evidenzia);
    if (!scelto || scelto === BANDO) return;
    BANDO = scelto;
    chiudiFoglio();
    document.getElementById('idea-bando').innerHTML = bandoHTML();
    const su = document.getElementById('idea-bando');
    if (su && su.scrollIntoView) su.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

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

  /* Lettura tollerante (§2.9): oggi i bandi sono una lista, ma un file
     vecchio con un bando solo continua a funzionare. Il giorno in cui un
     robot scriverà qui dentro, sarà lui a dover rispettare questa forma
     — non questa funzione a doversi adattare a lui. */
  BANDI = Array.isArray(d.bandi) ? d.bandi : (d.bando ? [d.bando] : []);
  BANDO = BANDI.find(b => b.id === d.bandoInEvidenza) || BANDI[0];
  if (!BANDO) return;

  CONTA = d.conta;
  SQUADRE = d.squadre || [];
  SOLI = d.soli || [];
  NOTA = d.note || null;

  ridisegna();
}

offre('ideathon', { avvia, ridisegna: () => { if (avviata) ridisegna(); } });
