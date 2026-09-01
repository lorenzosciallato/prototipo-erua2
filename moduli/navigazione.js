/* ERUA connect — navigazione fra le sezioni
   ==================================================================
   Schermata unica: cambiare sezione non ricarica la pagina, nasconde un
   pannello e ne mostra un altro (riferimento.md §2.3).

   È anche il punto in cui i moduli si caricano su richiesta. Al primo
   ingresso in una sezione si scarica il suo modulo e il suo file di
   dati; chi apre solo la rivista non scarica mai la didattica, che è la
   sezione più pesante. Su un telefono di fascia bassa la differenza si
   vede (§2.4).
*/

import { scheletro, foglio } from './nucleo.js';

export const TABS = ['social', 'news', 'ideathon', 'study', 'magazine', 'chat', 'profilo'];

/* Che cosa mostrare mentre la sezione si carica. Sta qui e non nei
   moduli perché deve comparire **prima** che il modulo sia scaricato:
   se aspettasse il modulo, il vuoto si vedrebbe lo stesso — ed è
   proprio quello il momento in cui si vede.

   Le forme somigliano a quello che comparirà davvero: schede nella
   rivista, righe negli elenchi. Serve a non far saltare la pagina
   quando i dati arrivano. */
const ATTESA = {
  magazine: [['storie', 'cerchi'], ['feed-griglia', 'scheda', 6]],
  news:     [['news-atenei', 'cerchi'], ['news-lista', 'riga', 7]],
  social:   [['sc-atenei', 'cerchi'], ['thread-lista', 'riga', 5]],
  /* La vetrina dei corsi ha scheletri suoi, ma li disegna solo dopo aver
     scaricato i dati: nel frattempo si vedeva la pagina vuota e, sotto,
     la dicitura in fondo al sito. Questi arrivano prima. */
  study:    [['st-atenei', 'cerchi'], ['st-gruppi', 'scheda', 6]],
  ideathon: [['idea-squadre', 'scheda', 4], ['idea-soli', 'riga', 6]],
};

/* Quale modulo serve a quale sezione. `chat` e `profilo` non hanno
   codice proprio: sono pannelli fermi. */
const MODULI = {
  magazine: () => import('./rivista.js'),
  news:     () => import('./notizie.js'),
  social:   () => import('./sociale.js'),
  ideathon: () => import('./ideathon.js'),
  study:    () => import('./didattica.js'),
};

/* Le sezioni il cui foglio di stile non sta in `index.html`, perché non
   serve alla prima schermata. Vedi `foglio()` in `nucleo.js`: là c'è
   scritto perché si può fare solo per queste. */
const FOGLI = { ideathon: 'ideathon' };

const caricati = new Map();

/* Carica il modulo di una sezione, una volta sola, e lo avvia.
   Modulo e foglio partono insieme e si aspettano entrambi: disegnare
   prima che lo stile sia applicato vorrebbe dire far vedere la sezione
   nuda per un istante. */
export function caricaSezione(nome) {
  if (!MODULI[nome]) return Promise.resolve(null);
  if (!caricati.has(nome)) {
    caricati.set(nome, Promise.all([
      MODULI[nome](),
      FOGLI[nome] ? foglio(FOGLI[nome]) : null,
    ])
      .then(([m]) => (m.avvia ? m.avvia().then(() => m) : m))
      .catch(err => {
        /* Se una sezione non si carica, le altre devono continuare a
           funzionare: è lo stesso principio per cui l'interruzione di un
           processo automatico non ferma l'app (§2.2). */
        console.error(`sezione "${nome}" non caricata:`, err);
        caricati.delete(nome);
        return null;
      }));
  }
  return caricati.get(nome);
}

/* ── il cambio di sezione ──────────────────────────────────────────── */
const scrollMem = {};
let tabAttiva = 'magazine';

/* Vero mentre siamo noi a riscrivere l'indirizzo: serve a non
   rispondere al nostro stesso cambiamento. */
let cambioInterno = false;

export function scriviHash(valore) {
  cambioInterno = true;
  try { location.hash = valore; } catch (err) { /* indirizzo non scrivibile */ }
  setTimeout(() => { cambioInterno = false; }, 0);
}

export function mostraTab(nome, aggiornaHash = true) {
  if (!TABS.includes(nome)) nome = 'social';
  scrollMem[tabAttiva] = window.scrollY;
  tabAttiva = nome;

  document.querySelectorAll('.pannello').forEach(p => p.classList.remove('attivo'));
  document.getElementById('p-' + nome).classList.add('attivo');
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.setAttribute('aria-selected', b.dataset.tab === nome));

  const piu = document.getElementById('btn-apri-scrivi');
  if (piu) piu.classList.toggle('mostra', nome === 'social');

  if (aggiornaHash) scriviHash(nome);

  /* Il salto in cima va fatto **di colpo**, non accompagnato.
     `stile/base.css` mette `scroll-behavior:smooth` su tutta la pagina,
     e quello vale anche per gli spostamenti chiesti dal codice: uno
     `scrollTo` normale, qui, animava la risalita. Chi era in fondo alla
     piazza e premeva «News» si vedeva scorrere all'indietro tutta la
     piazza prima di arrivare — mezzo secondo in cui la sezione nuova
     c'e' gia' ma non si vede, e sembra che il sito ci stia pensando.
     Cambiare sezione non e' un movimento dentro la pagina: e' un
     altrove, e l'occhio non ha niente da seguire.

     Lo scorrimento accompagnato resta dov'e' utile — i collegamenti
     interni e il ritorno in cima all'elenco delle notizie. */
  setTimeout(() => {
    const dove = scrollMem[nome] || 0;
    try { window.scrollTo({ top: dove, left: 0, behavior: 'instant' }); }
    catch (err) { window.scrollTo(0, dove); }
  }, 0);

  /* prima gli scheletri, poi il caricamento: in quest'ordine, e senza
     aspettare niente in mezzo */
  for (const [contenitore, forma, quanti] of (ATTESA[nome] || [])) {
    scheletro(contenitore, forma, quanti);
  }
  caricaSezione(nome);
}

export const sezioneAttiva = () => tabAttiva;

/* ── scaldare la sezione dopo ──────────────────────────────────────
   Sulla sezione d'atterraggio il preavviso sta in `index.html`: parte
   col primo byte della pagina. Ma un preavviso scritto lì può nominare
   una sezione sola, e sarebbe sbagliato nominarne di più — chiedere
   subito anche le notizie vorrebbe dire mettere 104 KB in gara con
   quello che serve *adesso*, sulla connessione di chi sta aprendo il
   sito. Si guadagnerebbe sulla seconda schermata rovinando la prima.

   Quindi le altre si scaldano **dopo**, quando la prima ha finito e il
   browser non ha più niente da fare. Chi tocca «News» due secondi dopo
   l'ha già in mano; chi non ci va mai ha pagato la fetta di rete che
   avanzava, non quella che serviva.

   Due limiti, e sono i limiti a rendere onesta l'idea:

   - **`saveData`** — chi ha detto al telefono «risparmia dati» l'ha
     detto sul serio. Scaricare in anticipo roba che forse non guarderà
     è esattamente ciò che ha chiesto di non fare.
   - **connessione lenta** — su 2G o 3G la rete è già il collo di
     bottiglia: scaldare vorrebbe dire rubare banda alla sezione che si
     sta guardando. Meglio far aspettare due secondi chi cambia sezione
     che rallentare tutti.

   `chat` e `profilo` non compaiono qui e non è una dimenticanza: non
   hanno né modulo né dati. Sono scritte dentro `index.html` e ci sono
   già — sono il caso migliore, non uno da sistemare. */
const DA_SCALDARE = ['news', 'magazine'];

export function scaldaLeAltre() {
  const rete = navigator.connection;
  if (rete) {
    if (rete.saveData) return;
    if (/(^|-)2g$/.test(rete.effectiveType || '')) return;
  }

  const quandoCalmo = window.requestIdleCallback
    || (f => setTimeout(() => f({ timeRemaining: () => 50 }), 1200));

  /* Una per volta, non tutte insieme: due sezioni che si scaricano in
     parallelo si rubano la banda a vicenda, e nessuna delle due arriva
     prima di quando sarebbe arrivata da sola. */
  const coda = DA_SCALDARE.filter(n => n !== tabAttiva && !caricati.has(n));
  const prossima = () => {
    const n = coda.shift();
    if (!n) return;
    caricaSezione(n).then(() => quandoCalmo(prossima));
  };
  quandoCalmo(prossima);
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(b =>
  b.addEventListener('click', () => mostraTab(b.dataset.tab)));

addEventListener('hashchange', async () => {
  if (cambioInterno) return;
  const h = location.hash.slice(1);
  if (h.startsWith('leggi/')) {
    const modulo = await import('./articolo.js');
    modulo.apri(h.slice(6));
    return;
  }
  const overlay = document.getElementById('p-articolo');
  if (overlay.classList.contains('aperto')) {
    overlay.classList.remove('aperto', 'attivo');
    document.body.classList.remove('in-lettura');
  }
  mostraTab(h, false);
});
