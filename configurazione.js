/* ERUA connect — configurazione unica
   ==================================================================
   Questo è il file che rende il progetto replicabile presso un'altra
   alleanza: cambiando quello che c'è qui dentro, e le fotografie in
   `immagini/`, l'applicazione parla di un'altra rete di atenei senza
   che si tocchi una riga dei moduli. Vedi riferimento.md §2.4 e §9.2.

   Cosa NON sta qui, e perché:

   - I colori generali (carta, inchiostro, ombre, caratteri) stanno in
     `stile/base.css`, dentro `:root`. Tenerli lì evita di averli in due
     posti e evita lo sfarfallio: il foglio di stile è già applicato
     quando la pagina compare, un file JavaScript no. Qui sotto restano
     invece i colori che sono identità dell'alleanza — la tinta di ogni
     ateneo — perché quelli servono anche al codice.
   - Le stringhe visibili stanno in `testi/<lingua>.json`, una per lingua.
   - I contenuti stanno in `dati/`, una per sezione.
*/

export const CONFIG = {

  /* ── chi siamo ──────────────────────────────────────────────────── */
  nome: 'ERUA connect',
  alleanza: {
    sigla: 'ERUA',
    nome: 'European Reform University Alliance',
    sito: 'https://erua-eui.eu/',
  },

  /* Il marchio in fondo alla pagina e sui documenti stampati. È lo
     stesso disegno usato nell'intestazione e nei PDF dell'aula. */
  marchio: {
    file: 'immagini/loghi/erua.jpg',
    simbolo: 'immagini/loghi/simbolo.jpg',
    verde: '#1E7A54',
    inchiostro: '#20201D',
  },

  /* ── gli atenei ─────────────────────────────────────────────────── */
  /* L'ordine conta: è quello dei cerchi in cima alla rivista, alle
     notizie e alla piazza. La tinta è l'identità visiva dell'ateneo e
     viene usata dal codice (bordo delle schede, lettore delle puntate).
     La lingua è quella in cui l'ateneo pubblica le proprie notizie: si
     mostra accanto al titolo perché il lettore sappia, prima di
     cliccare, che cosa troverà. */
  atenei: [
    { sigla: 'UNIMC',   citta: 'Macerata',          lingua: 'IT',    tinta: '#A8E6C9', logo: 'immagini/loghi/unimc.jpg' },
    { sigla: 'MRU',     citta: 'Vilnius',           lingua: 'EN/LT', tinta: '#FFC9A8', logo: 'immagini/loghi/mru.jpg' },
    { sigla: 'NBU',     citta: 'Sofia',             lingua: 'BG',    tinta: '#A9D3FF', logo: 'immagini/loghi/nbu.jpg' },
    { sigla: 'EUV',     citta: 'Frankfurt (Oder)',  lingua: 'DE',    tinta: '#FFE1A8', logo: 'immagini/loghi/euv.jpg' },
    { sigla: 'SWPS',    citta: 'Warsaw',            lingua: 'PL',    tinta: '#E4DED4', logo: 'immagini/loghi/swps.jpg' },
    { sigla: 'ULPGC',   citta: 'Las Palmas',        lingua: 'ES',    tinta: '#B6E5F0', logo: 'immagini/loghi/ulpgc.jpg' },
    { sigla: 'UAEGEAN', citta: 'Mytilene',          lingua: 'EL',    tinta: '#CFC4F7', logo: 'immagini/loghi/uaegean.jpg' },
    { sigla: 'UP8',     citta: 'Saint-Denis',       lingua: 'FR',    tinta: '#FFC0CE', logo: 'immagini/loghi/up8.jpg' },
  ],

  /* Atenei nominati nei contenuti ma non membri: compaiono come luogo,
     non come filtro. */
  altriLuoghi: {
    KONSTANZ: { citta: 'Konstanz', tinta: '#DDD8CF' },
  },

  /* La sigla usata per i contenuti dell'alleanza nel suo insieme. */
  siglaAlleanza: 'ERUA',

  /* ── lingue ─────────────────────────────────────────────────────── */
  /* `originale` è la lingua in cui i contenuti sono scritti: da questa
     Google Translate traduce verso le altre. Le prime otto della lista
     sono le lingue degli atenei; le altre sono aggiunte per chi arriva
     da fuori. Ogni codice qui deve avere il suo `testi/<codice>.json`. */
  lingue: {
    originale: 'en',
    attive: ['en', 'it', 'lt', 'bg', 'de', 'pl', 'es', 'el', 'fr',
             'da', 'pt', 'zh-CN', 'ar', 'hi', 'ru', 'ja'],
  },

  /* ── traduzione automatica ──────────────────────────────────────── */
  /* La pagina è tradotta da Google Translate. Sono tre cose distinte,
     tutte dovute:
     - `origini` va riportato nella CSP quando si pubblicherà con le
       intestazioni di sicurezza (riferimento.md §3.8);
     - il servizio scrive un cookie proprio (`googtrans`), quindi rientra
       fra i cookie di terzi da dichiarare (§7.4);
     - la traduzione è contenuto prodotto da una macchina e va marcata
       come tale (P7): l'avviso qui sotto compare in ogni sezione quando
       la lingua scelta non è quella originale. */
  traduzione: {
    servizio: 'Google Translate',
    origini: [
      'https://translate.google.com',
      'https://translate.googleapis.com',
      'https://translate-pa.googleapis.com',
      'https://www.gstatic.com',
    ],
    cookie: 'googtrans',
    avviso: {
      it: 'Tradotto automaticamente da {servizio}. Traduzione non verificata: il testo originale è in {originale}.',
      en: 'Machine-translated by {servizio}. Unverified translation: the original text is in {originale}.',
    },
  },

  /* ── servizi esterni ────────────────────────────────────────────── */
  /* Ogni voce è un'origine da cui la pagina carica qualcosa. Serve a
     tenere in un posto solo l'elenco di chi può eseguire codice o
     vedere gli indirizzi di chi naviga (§3.7, §3.10). */
  serviziEsterni: {
    video: {
      nome: 'YouTube',
      /* dominio senza cookie: il video parte senza tracciare finché non
         si preme play */
      incorpora: 'https://www.youtube-nocookie.com',
      api: 'https://www.youtube.com/iframe_api',
      anteprime: 'https://i.ytimg.com',
    },
    caratteri: {
      nome: 'Google Fonts',
      origini: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    },
  },

  /* ── fonti dei processi automatici ─────────────────────────────────
     Da dove i robot in `robot/` pescano quello che finisce in `dati/`.
     Sta qui, e non nei robot, perché è parte di "quale alleanza è
     questa": cambiarla è cambiare progetto, non cambiare programma.

     Sono tutti indirizzi pubblici, pubblicati dalle fonti stesse.
     Nessuna chiave, nessun accesso riservato: §6.3 esclude dall'esercizio
     l'automazione tramite interfacce non ufficiali, e un feed che la
     piattaforma pubblica da sé non lo è.

     `feed: null` vuol dire "non ne ho ancora trovato uno": quella fonte
     viene saltata e il robot lo dice, invece di inventarsi un modo per
     leggerla comunque. */
  fonti: {
    /* Il canale dell'alleanza. Il feed dà le ultime 15 pubblicazioni:
       basta a restare aggiornati, non a ricostruire l'archivio — per
       quello servirebbe l'interfaccia ufficiale con una chiave. */
    canaleVideo: {
      nome: 'ERUA su YouTube',
      canale: 'UCRKcrKcVzq1-qTId2I84dew',
      feed: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCRKcrKcVzq1-qTId2I84dew',
      /* Come si riconosce una puntata del podcast fra tutti i video del
         canale. Senza questo, in "Ascolta" finirebbero anche i
         livestream e i video promozionali. */
      riconosciPuntata: /erua\s*podcast/i,
    },

    /* I siti da cui arrivano le notizie.

       Sette atenei su nove pubblicano un feed: si usa quello, perché è
       un impegno della fonte a mantenere una forma.

       Due non lo pubblicano, e per loro si legge l'elenco dalla pagina.
       Le regole di lettura stanno qui, accanto alla fonte, e non dentro
       il programma: quando quel sito verrà rifatto — e verrà rifatto —
       si aggiusta una riga di configurazione. Sono espressioni scritte
       come stringhe perché è configurazione, non codice. */
    notizie: [
      { uni: 'ERUA', sito: 'https://erua-eui.eu/',
        feed: 'https://erua-eui.eu/feed/' },

      { uni: 'UNIMC', sito: 'https://www.unimc.it/it/unimc-comunica/news',
        feed: 'https://www.unimc.it/it/unimc-comunica/news/RSS' },

      { uni: 'MRU', sito: 'https://www.mruni.eu/en/',
        feed: 'https://www.mruni.eu/feed/' },

      /* NBU: il feed sta a `/rss/news`, non a `/rss` — quello risponde
         "no news found" e sembra rotto. La versione inglese esiste ma è
         ferma al 2016: si prende la bulgara, che è viva. Il lettore vede
         la sigla della lingua accanto al titolo, e la traduzione della
         pagina fa il resto. */
      { uni: 'NBU', sito: 'https://news.nbu.bg/bg/news',
        feed: 'https://news.nbu.bg/bg/rss/news' },

      { uni: 'SWPS', sito: 'https://english.swps.pl/we-the-university/our-news-and-events/news',
        feed: 'https://english.swps.pl/we-the-university/our-news-and-events/news?format=feed&type=rss' },

      { uni: 'UAEGEAN', sito: 'https://www.aegean.gr/',
        feed: 'https://www.aegean.gr/rss.xml' },

      { uni: 'UP8', sito: 'https://www.univ-paris8.fr/-Actualites-',
        feed: 'https://www.univ-paris8.fr/spip.php?page=backend' },

      /* Viadrina: il vecchio feed su euv-frankfurt-o.de è morto e il
         portale nuovo non ne dichiara. Si legge l'elenco. */
      { uni: 'EUV',
        sito: 'https://www.europa-uni.de/de/universitaet/kommunikation/newsportal/index.html',
        feed: null,
        pagina: {
          url: 'https://www.europa-uni.de/de/universitaet/kommunikation/newsportal/index.html',
          blocco: '<article class="teaser-item[\\s\\S]*?</article>',
          titolo: '<h3[^>]*>([\\s\\S]*?)</h3>',
          data: '<time[^>]*datetime="([^"]+)"',
          collegamento: '<a[^>]+href="([^"]+)"',
        } },

      /* ULPGC: nessun feed. Il loro robots.txt consente la lettura
         automatica con dieci secondi di pausa — e noi facciamo una
         richiesta sola per giro, quindi siamo ampiamente dentro. Il
         filtro che risponde 403 guarda solo come ci si presenta.
         La data sta nell'indirizzo della notizia: la si prende da lì,
         che è uguale in tutte le lingue. */
      { uni: 'ULPGC', sito: 'https://www.ulpgc.es/noticias', feed: null,
        pagina: {
          url: 'https://www10.ulpgc.es/noticias',
          hostPubblico: 'www.ulpgc.es',
          blocco: '<article class="ulpgcds-article[\\s\\S]*?</article>',
          titolo: '<h2[^>]*>([\\s\\S]*?)</h2>',
          collegamento: '<a[^>]+href="(/noticia/[^"]+)"',
          dataDalCollegamento: '/noticia/(\\d{4})/(\\d{2})/(\\d{2})/',
        } },
    ],
  },

  /* ── contatti e documenti ───────────────────────────────────────── */
  /* I documenti non esistono ancora: si pubblicano quando un ente
     assume per iscritto la titolarità del trattamento (§7.0, §7.3).
     Finché `pubblicati` è falso, il piè di pagina lo dice apertamente
     invece di mostrare collegamenti che non portano da nessuna parte. */
  documenti: {
    pubblicati: false,
    informativa: 'documenti/informativa.html',
    condizioni: 'documenti/condizioni.html',
    cookie: 'documenti/cookie.html',
    accessibilita: 'documenti/accessibilita.html',
  },
  contatti: {
    redazione: null,
    titolare: null,
    responsabileProtezioneDati: null,
  },

  /* ── stato del servizio ─────────────────────────────────────────── */
  /* Momento zero non superato: nessun utente reale, nessun dato
     personale, si collauda con account propri (§7.0). Il codice usa
     questo valore per mostrare l'avviso di prototipo e per rifiutarsi
     di raccogliere qualsiasi cosa. */
  momentoZero: {
    superato: false,
    avviso: {
      it: 'Prototipo di presentazione. Nessun dato viene raccolto o conservato.',
      en: 'Presentation prototype. No data is collected or stored.',
    },
  },
};

/* ── comodità ricavate dalla configurazione ───────────────────────── */
/* Le forme che il codice usa spesso, calcolate una volta sola qui
   invece che ricostruite in ogni modulo. */

export const ATENEI = CONFIG.atenei.map(a => a.sigla);

export const CITTA = Object.fromEntries([
  ...CONFIG.atenei.map(a => [a.sigla, a.citta]),
  ...Object.entries(CONFIG.altriLuoghi).map(([s, v]) => [s, v.citta]),
]);

export const TINTE = Object.fromEntries([
  ...CONFIG.atenei.map(a => [a.sigla, a.tinta]),
  ...Object.entries(CONFIG.altriLuoghi).map(([s, v]) => [s, v.tinta]),
]);

export const LINGUA_FONTE = Object.fromEntries([
  [CONFIG.siglaAlleanza, 'EN'],
  ...CONFIG.atenei.map(a => [a.sigla, a.lingua]),
]);

export const LOGHI = Object.fromEntries([
  [CONFIG.siglaAlleanza, CONFIG.marchio.file],
  ...CONFIG.atenei.map(a => [a.sigla, a.logo]),
]);
