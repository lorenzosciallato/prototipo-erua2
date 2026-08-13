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

import { scheletro } from './nucleo.js';

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

const caricati = new Map();

/* Carica il modulo di una sezione, una volta sola, e lo avvia. */
export function caricaSezione(nome) {
  if (!MODULI[nome]) return Promise.resolve(null);
  if (!caricati.has(nome)) {
    caricati.set(nome, MODULI[nome]()
      .then(m => (m.avvia ? m.avvia().then(() => m) : m))
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
  setTimeout(() => window.scrollTo(0, scrollMem[nome] || 0), 0);

  /* prima gli scheletri, poi il caricamento: in quest'ordine, e senza
     aspettare niente in mezzo */
  for (const [contenitore, forma, quanti] of (ATTESA[nome] || [])) {
    scheletro(contenitore, forma, quanti);
  }
  caricaSezione(nome);
}

export const sezioneAttiva = () => tabAttiva;

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
