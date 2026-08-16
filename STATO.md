# Stato del lavoro — ERUA connect

Questo file risponde a una domanda sola: **a che punto siamo e cosa manca.**
La parte descrittiva la aggiorno io a ogni intervento sul codice di presentazione;
il blocco finale è timbrato automaticamente e riporta solo dati misurati.

Regole permanenti e quadro completo: `riferimento.md`. Sintesi operativa: `CLAUDE.md`.

---

## Dove siamo

**Momento zero non superato.** Nessun ente ha ancora assunto per iscritto la
titolarità del trattamento, quindi niente utenti reali: si collauda solo con
account propri (`riferimento.md` §7.0).

Esiste un **prototipo di presentazione**, ora **scorporato** secondo
`riferimento.md` §2.4. Le sezioni sono rivista, didattica (vetrina), notizie,
sociale, ideathon, messaggistica e profilo. I testi lunghi restano segnaposto:
titoli, autori e alcune fotografie sono veri, il corpo degli articoli no.

**Ideathon: quattro bandi europei, uno per volta nel banner.** New European
Bauhaus Prizes (Strand B), European Solidarity Corps — Solidarity Projects,
European Charlemagne Youth Prize e CASSINI Hackathons. Sono bandi veri, esterni
all'alleanza. Gli altri tre stanno **dentro** al banner, in fondo, e si aprono
in un foglio da cui si può portarli in evidenza al posto di quello che c'è.

**I progetti premiati sono veri su tre bandi su quattro**, con l'annuncio
ufficiale linkato dentro ogni scheda: Bauhaus (edizione 2024-25, fotografie
della Commissione), Charlemagne 2025 (Forum Europaeum, Díky že můžem volit,
Feminist Law Clinic) e CASSINI decima edizione (Avalanche Detectors, TrailRadar,
GlideBuddy). Il quarto — il corpo europeo di solidarietà — **non ha vincitori
perché non è una gara**: è un contributo che si ottiene stando nei requisiti,
non battendo qualcun altro. Lì le tre schede spiegano come funziona e la sezione
dichiara che le abbiamo scritte noi.

Ogni progetto si preme e apre il racconto lungo in un foglio. Le date sono
dell'edizione precedente e la scheda lo dice, col collegamento al sito ufficiale
accanto.

Restano inventate **le squadre e gli studenti in cerca di gruppo**, e la sezione
lo dichiara in fondo.

La struttura dei dati è già quella che servirà a un robot: `dati/ideathon.json`
tiene una lista `bandi` e un campo `bandoInEvidenza`. Il robot che andrà a
prendere i bandi aperti dovrà scrivere in quella forma; il modulo legge in modo
tollerante e regge anche un file vecchio con un bando solo.

**I loghi degli atenei stanno dentro il codice.** Prima ogni cerchio era una
richiesta al server: le sezioni si ridisegnano a ogni clic su un filtro, e un
logo ancora in viaggio lasciava il cerchio vuoto — Sofia e Francoforte
sparivano e ricomparivano a intermittenza. Ora arrivano con la pagina
(`moduli/loghi-incorporati.js`, generato da `robot/incorpora-loghi.js`): 45 KB
in più all'avvio, dieci richieste in meno, e nessun istante in cui possono
mancare. Se cambia un logo va rilanciato lo script.

**Le fotografie sono in WebP.** Da 761 KB a 317 (58% in meno), con
`robot/converti-webp.js`. Il caso grosso era una fotografia salvata in PNG: da
sola pesava 414 KB, più di tutte le altre quindici insieme; ora 36. Una è
rimasta com'era perché il WebP usciva più pesante, e lo script se ne accorge da
solo invece di convertirla lo stesso. Serve `cwebp` installato sulla macchina
(`sudo apt install webp`): è un programma di sistema, non una dipendenza dentro
il codice pubblicato (§6.7).

Com'è fatto adesso:

| Cartella | Che cosa contiene |
|:--|:--|
| `index.html` | solo la struttura della pagina — 25 KB, era 813 |
| `configurazione.js` | nome, atenei, tinte, lingue, origini esterne, documenti |
| `testi/` | le stringhe visibili, un file per lingua (16) |
| `dati/` | i contenuti, un file per sezione, caricati su richiesta |
| `stile/` | nove fogli, uno per sezione |
| `moduli/` | il codice, un modulo per sezione, caricato su richiesta |
| `immagini/` | le 23 fotografie, prima incorporate in base64 |
| `robot/` | i processi automatici che riscrivono `dati/` |
| `collaudo/` | le prove automatiche |

Chi apre solo la rivista non scarica più la didattica né le trascrizioni delle
lezioni: prima arrivava tutto a ogni visita.

Non esiste ancora nessuna componente a database: niente PostgreSQL, niente
policy di riga (RLS), niente accesso via collegamento monouso. Tutto quello che
si vede gira nel browser.

## I processi automatici

Esistono e funzionano su dati veri. Dettagli in `robot/LEGGIMI.md`.

| Robot | Cosa fa oggi |
|:--|:--|
| `notizie.js` | **tutti e nove gli atenei**: sette da feed, EUV e ULPGC leggendo la pagina → `dati/notizie.json` |
| `ascolta.js` | legge il feed pubblico del canale → `dati/ascolta.json`. Funziona **senza accesso al canale** |
| `didattica.js` | controlla che i 18 video dichiarati rispondano ancora. Non sceglie corsi: è selezione editoriale |
| `bandi.js` | *fermo* — ricavava le scadenze dai bandi in nove lingue |
| `destinazioni.js` | *fermo* — 751 destinazioni da ULPGC (banca dati) e UniMC (allegato in PDF) |
| `loghi.js` | *fermo* — 211 loghi da Wikidata e Commons, solo con licenza libera |
| `costi.js` | *fermo* — livelli di prezzo Eurostat per 47 paesi |
| `studenti.js` | tiene il posto e la forma. Produce un elenco vuoto, ed è corretto così |

Da fare su questo fronte, in ordine:

1. **Riscrivere i robot per n8n.** L'orchestrazione (orari, credenziali
   OAuth, riprove) passa a n8n; restano codice i controlli che n8n non dà:
   rifiuto di pubblicare il vuoto, involucro, provenienza, commit.
2. **Le destinazioni degli altri sei atenei.** MRU, NBU, EUV, SWPS,
   UAEGEAN e UP8 non hanno ancora un lettore. La sezione lo dice per
   nome sopra l'elenco, invece di far credere che non esistano.
3. **Sorvegliare EUV e ULPGC.** Sono gli unici due letti dalla pagina
   invece che da un feed: un restauro del loro sito li spegne in silenzio.
   Il rifiuto di pubblicare il vuoto lo trasforma in un avviso, ma le
   regole di lettura vanno riscritte in `configurazione.js`.
4. **Mettere `robot/giro.sh` nel cron del server**, insieme alla riga di
   sorveglianza che avvisa se un robot smette di dare segno di vita.
5. **Archivio completo delle puntate.** Il feed pubblico dà le ultime 15
   pubblicazioni; il canale ne ha più di 40. Per recuperare tutto in un
   colpo serve l'interfaccia ufficiale con una chiave — che è anche l'unico
   momento in cui servirà l'accesso al canale.

## La sezione Move: tolta

Esisteva una settima sezione, **Move**, con bandi e destinazioni di
mobilità. È stata **rimossa dall'applicazione** perché l'impaginazione non
convinceva.

Che cosa resta e che cosa no:

- **Tolti**: la voce nella navigazione, il pannello, `moduli/move.js`,
  `stile/move.css`, le stringhe nei file dei testi, le prove nel collaudo.
  Nell'applicazione non c'è più alcun riferimento.
- **Restano, ma fermi**: i quattro robot che la alimentavano
  (`bandi`, `destinazioni`, `loghi`, `costi`) e i dati che avevano già
  prodotto — fra cui 751 destinazioni con i loro atenei e 211 loghi con
  licenza libera. Sono fuori dal giro automatico: continuare ad
  aggiornare dati che nessuno legge sarebbe lavoro sprecato.
- **Perché non sono stati cancellati**: quel materiale è costoso da
  rifare. Il lettore di tabelle in PDF (`robot/comune/pdf.js`) e il
  riconoscimento delle date in nove lingue (`robot/comune/date.js`)
  servono anche altrove.
- **Cancellati**: `immagini/atenei/`, i 211 loghi che pesavano 3,8 MB.
  Nessun modulo li caricava, quindi il sito non ne risente; se la
  sezione tornerà, `robot/loghi.js` li riscarica. Restano comunque
  recuperabili dai commit precedenti.

La dicitura sui marchi in fondo alla pagina **resta**: era dovuta comunque
(§6.4) e prima mancava.

## Cosa manca, in ordine

0. **Trasparenza sui contenuti generati: termine già scaduto.** §6.5
   riporta il 2 agosto 2026, non differito. Oggi siamo in regola perché
   l'unico contenuto automatico è la traduzione, ed è marcata. Ma la
   casella `origine.generato` va valorizzata **prima** che un robot scriva
   un riassunto o un occhiello, non dopo.
1. **Base di dati e autorizzazione.** Prima le policy di riga con il collaudo che
   deve fallire (`riferimento.md` §3.2), poi le funzioni che le usano.
2. **Intestazioni di sicurezza e CSP** (§3.8). Le origini da consentire sono già
   raccolte in `configurazione.js` sotto `traduzione.origini` e
   `serviziEsterni`: manca scrivere le intestazioni sul servizio che pubblica.
3. **Documenti per l'attivazione** (§7.3), predisposti prima, pubblicati quando
   l'ente assume la titolarità. Fra questi l'informativa sui cookie, che deve
   nominare `googtrans` di Google Translate (§7.4).
4. **Licenze dei corsi accanto ai corsi** (§6). I contenuti della didattica sono
   Open Yale Courses e MIT OpenCourseWare: la licenza va scritta nella scheda,
   non solo nella trascrizione.

## Da collaudare

Esiste la prima prova automatica: `node collaudo/carica-moduli.mjs` carica tutti
i moduli con una pagina finta, avvia ogni sezione e controlla che abbiano
davvero disegnato qualcosa. Non prova l'aspetto — quello va guardato — ma prende
i guasti da scorporo. Oggi passa.

Resta da scrivere il collaudo di autorizzazione descritto in §3.2 — il tentativo,
da parte di un utente, di leggere i dati di un altro, che deve fallire. Non è
scrivibile finché non c'è la base di dati.

**Da guardare a occhio**, perché nessuna prova automatica lo copre: che le sei
sezioni si vedano come prima, il cambio di lingua, il lettore delle puntate che
si espande, e l'aula con video e trascrizione.

## Guasti trovati dopo lo scorporo e corretti

Quattro, tutti della stessa famiglia: codice che nel file unico girava
quando tutto era già in memoria, e che diviso in moduli gira troppo presto o
in un file che non è ancora stato scaricato.

1. **«Read» e «Story» non rispondevano.** La rivista chiedeva la pagina di
   lettura al registro, ma nessuno caricava quel modulo: l'attesa non finiva
   mai. Ora `chiedi()` carica da sé la sezione che non c'è ancora.
2. **«Listen» non rispondeva.** Il comando delle due voci in cima alla rivista
   stava in `ascolta.js` — cioè nel file che quel clic doveva far scaricare.
   Spostato in `rivista.js`.
3. **La traduzione diceva «needs the page to be online» stando online.** Il
   traduttore veniva caricato con un tag `<script>` normale, che parte prima
   dei moduli: chiamava una funzione che `lingua.js` non aveva ancora
   definito. Ora è `lingua.js` a caricarlo, dopo averla definita.
4. **La vetrina dei corsi restava vuota.** Un timer ereditato disegnava a
   150 ms dall'ingresso in Learn, prima che i dati arrivassero: andava in
   errore e lasciava alzata la bandierina «già disegnato», così il disegno
   vero non avveniva più. Timer tolto, e `studyReveal` ora non alza la
   bandierina se i dati non ci sono.

Il collaudo automatico ora copre tutti e quattro: simula i clic e l'ingresso
in Learn con l'indirizzo già su `#study`.

## L'avvio: cosa deve arrivare prima che si veda qualcosa

Tre interventi, in ordine di resa. Il metro è sempre lo stesso: **quanto deve
arrivare prima che il browser possa disegnare la prima schermata.**

| | prima | adesso |
|:--|:--|:--|
| fogli di stile bloccanti | 10 file, 161 KB | 9 file, 104 KB |
| foglio dei caratteri | 29 KB, da un server esterno | nessuno: sono nostri |
| loghi incorporati | 61 KB | 33 KB |
| attesa di `testi/en.json` | sì, prima della prima sezione | no |

**L'attesa del file dei testi era inutile.** `avvio.js` aveva `await
lingua.avvia()`, e la prima sezione non compariva finché `testi/en.json` non era
arrivato. Ma la lingua originale *è* `en`, e in quel file ogni chiave vale sé
stessa: esattamente il testo già scritto nel markup. Un giro in rete davanti a
tutto il resto, per non cambiare niente di visibile. Ora si chiede e non si
aspetta. Vale finché `CONFIG.lingue.originale` resta la lingua del markup — se
cambiasse, si vedrebbe un istante di inglese e l'attesa andrebbe rimessa; sta
scritto nel commento, accanto al codice.

**`ideathon.css` e `aula.css` non stanno più in `index.html`.** Sono 31 KB
l'uno e non servono a quello che si vede aprendo la pagina: nell'aula si entra
da dentro un corso, nell'ideathon bisogna andarci. Ogni foglio dichiarato in
pagina blocca il primo disegno finché non è arrivato, **anche per chi in
un'aula non entra mai.** Adesso li chiede chi ne ha bisogno, e li aspetta prima
di disegnare — il contrario si vedrebbe.

Si può fare solo con questi due, e la ragione va tenuta a mente: un foglio
chiesto a richiesta finisce **in fondo** alla cascata. `aula.css` era già
l'ultimo, quindi non scavalca nessuno; `ideathon.css` scavalcherebbe
`didattica.css` e `aula.css`, e con quei due non condivide nemmeno un selettore.
Verificato, non supposto — e una prova nel collaudo lo ricontrolla a ogni giro:
il giorno in cui qualcuno scrivesse una regola condivisa, l'aspetto cambierebbe
in un punto solo e nessuno lo collegherebbe a questo. Meglio che fallisca prima.

**I loghi pesavano il doppio del necessario.** Erano dieci JPEG larghi 230
pixel, incorporati nel codice — e nel codice il peso conta il doppio, perché non
sono file che il browser chiede quando servono: arrivano con la pagina, sempre,
prima di tutto il resto. Ma un logo non compare mai sopra i 74 pixel, e dentro
l'anello sta a una sessantina. Ridotti a 168 di larghezza e convertiti in WebP:
45 KB → 24, e il modulo da 61 KB a 33. Restano al doppio abbondante di quanto
servirebbe anche su uno schermo fitto.

La scelta di incorporarli **resta giusta** e non è stata toccata: erano stati
messi lì perché a ogni ridisegno il cerchio restava vuoto per un istante. Qui
non si è tolto niente, si è alleggerito. `robot/converti-webp.js` adesso sa
ridurre, ma solo dove glielo si dice: le fotografie no, perché si aprono a tutta
larghezza dentro un articolo e ritagliarle vorrebbe dire deciderlo per sempre.

Lo stesso script ora riscrive i riferimenti anche in `configurazione.js`, non
solo in `dati/`: i loghi sono nominati lì, uno per ateneo, e lasciarli a puntare
a file cancellati non avrebbe dato errore subito — `logoIncorporato()` cerca per
nome senza estensione e li avrebbe trovati lo stesso. Si sarebbe visto molto
dopo, il giorno in cui un logo non fosse più incorporato.

## I caratteri sono nel progetto

**§6.1 è chiusa.** Era PRIORITÀ ALTA e restava aperta: la pagina chiedeva i
caratteri a `fonts.googleapis.com`, e ogni visita trasmetteva l'IP di chi
guardava a un operatore extraeuropeo. Nel 2022 un tribunale tedesco ha
riconosciuto per questo un risarcimento a un singolo visitatore, e un ateneo
dell'alleanza è a Francoforte sull'Oder.

Ora stanno in `caratteri/`: otto file, 528 KB, generati da
`node robot/scarica-caratteri.js`, con la licenza SIL Open Font accanto in
`caratteri/LICENZA.txt` come §6.1 richiede. Le origini di Google sono sparite
anche da `configurazione.js`: da quell'elenco nasceranno le intestazioni di
sicurezza (§3.8), e lasciarcele avrebbe voluto dire aprire un permesso verso un
server che non usiamo — una regola più larga della realtà.

**Cosa non si scarica più.** Il corsivo di Fraunces non era usato da nessuna
parte: ogni `<i>` del progetto è riportato a `font-style:normal`. Erano 148 KB
dichiarati per niente. Restano fuori anche cirillico, greco e vietnamita, che
non servono; `latin-ext` invece resta, perché i nomi dei progetti premiati sono
in ceco e in polacco («Díky že můžem volit») e senza finirebbero in un carattere
di ripiego a metà parola.

**Sull'attesa, il guadagno è un altro da quello che sembra.** I file pesano
uguale ospitati qui. Quello che sparisce è il **giro verso un server esterno
prima del primo disegno**: il foglio di Google andava chiesto, e finché non
rispondeva la pagina non si disegnava. Adesso quel foglio — 4 KB — arriva
insieme agli altri dieci, dalla stessa origine. E i due caratteri che servono
subito (Inter per il testo, Fraunces per i titoli) si chiedono in anticipo con
`rel="preload"`, invece di aspettare che il foglio sia stato letto.

Nessun carattere si scarica finché non serve a disegnare del testo davvero
presente: Source Serif 4 — il più pesante, 218 KB — arriva solo aprendo un
articolo, l'aula o un foglio, e non all'avvio.

**Anche il foglio da stampare dell'aula** se li chiedeva per conto suo, dentro
una finestra che non si vede. Adesso prende gli stessi caratteri del sito. Lì il
piè di pagina è in corsivo su Fraunces: non avendo più il file del corsivo, il
browser lo inclina da sé. Su una riga stampata non si nota, ma è bene saperlo.

Due prove nuove lo tengono chiuso, verificate anche al contrario: nessun
riferimento a `fonts.googleapis.com` o `fonts.gstatic.com` nel codice che
finisce nel browser (i commenti che spiegano perché non ci sono più vengono
tolti prima di cercare, non riconosciuti a naso), e nessun `@font-face` che
punti a un file mancante — perché quello non dà errore: cambia solo il
carattere, in silenzio.

## Le fotografie: perché tardavano e perché sparivano

Due sintomi diversi, tre cause, tutte nate dallo scorporo del 10 agosto —
non dall'ideathon, che è solo la sezione dove si vedevano meglio.

**Prima le fotografie erano dentro la pagina.** Fino al 10 agosto `index.html`
pesava 813 KB perché conteneva le 23 fotografie in base64. Non c'era niente da
aspettare: arrivavano con l'HTML, già decodificate. Dallo scorporo sono file a
parte, e la loro richiesta è l'ultimo anello di una catena: la pagina carica
`avvio.js`, che è un modulo e quindi parte differito; `avvio.js` importa
configurazione, lingua, nucleo e navigazione; aspetta il file dei testi; entra
nella sezione; importa il modulo della sezione; ne chiede il file di dati; e
soltanto allora esistono gli `<img>` da chiedere. Sei passi in fila prima del
primo byte di fotografia. **Non si può togliere la catena senza tornare al file
unico**, ma i moduli della prima schermata ora si chiedono in anticipo con
`rel="modulepreload"` invece di scoprirsi uno dopo l'altro.

**`loading="lazy"` dentro una sezione nascosta non rimanda: annulla.** I pannelli
non attivi stanno a `display:none`. Un'immagine differita là dentro non ha
riquadro, quindi non incrocia mai lo schermo, quindi non viene chiesta affatto:
la richiesta parte solo quando il pannello si mostra. Le nostre fotografie
pesano 228 KB **in tutto** — rimandarle non faceva guadagnare niente e costava
quell'attesa. Ora `prioritaFoto()` non differisce più di sua iniziativa: il
differimento va chiesto, e lo chiedono solo le miniature di YouTube, che stanno
su un altro server e sono decine.

**Un cuore ricostruiva tutto il feed.** `renderFeed()` riscrive l'`innerHTML`
del feed: ogni `<img>` viene distrutta e ricreata, cioè riparte da zero anche
quando il file è già in memoria. Lo chiamavano il cuore, il segnalibro, i
filtri, e il segnalibro premuto dalla pagina di lettura — quest'ultimo mentre il
magazine è nascosto sotto l'articolo, che è il caso peggiore: si tornava indietro
e le fotografie non c'erano più. Cuore e segnalibro ora toccano solo il proprio
pulsante e il proprio contatore. Dove il ridisegno serve davvero (un filtro, un
altro bando in evidenza) `riusaFoto()` rimette in pagina **l'elemento di prima**,
già scaricato, invece del segnaposto appena creato.

Quattro prove nuove nel collaudo, verificate anche al contrario — rimettendo la
regressione, falliscono: nessuna fotografia nostra differita, cuore e segnalibro
che non riscrivono il feed (con una sentinella al posto del contenuto, perché
confrontare l'HTML non basta: un contatore che cambia lascia il resto identico),
e il riuso degli elementi immagine.

**Resta da guardare a occhio**, perché il collaudo gira su una pagina finta e non
ha un vero motore di rendering: che le fotografie compaiano subito entrando in
ciascuna sezione, e che restino al loro posto uscendo da un articolo e
rientrando nel magazine.

**Resta anche una cosa non fatta:** `avvio.js` aspetta il file dei testi
(`await lingua.avvia()`) *prima* di mostrare la prima sezione. È un anello della
catena che si potrebbe togliere — le stringhe del markup hanno già `data-it` e
`data-en` — ma cambia cosa si vede nel primo istante, e va deciso guardandolo.

## Deciso durante lo scorporo

- La **palette generale** è rimasta in `stile/base.css`, non nel file di
  configurazione come suggerirebbe §2.4 alla lettera: metterla lì voleva dire o
  duplicarla, o far comparire la pagina senza colori a ogni caricamento. Nella
  configurazione ci sono le tinte dei singoli atenei, che servono anche al codice.
- I moduli delle sezioni **non si importano fra loro**: passano da un registro
  nel nucleo. Senza, `rivista` importerebbe `articolo` che importa `rivista`.
- L'**ordine dei fogli di stile** in `index.html` è quello del file originale e
  non va cambiato: alcune regole si sovrascrivono a vicenda.
- Il lettore delle puntate ora incorpora i video dal dominio **senza cookie**;
  prima usava `youtube.com`, che li deposita subito.
- I loghi degli atenei di destinazione vengono da **Wikidata e Wikimedia
  Commons**, non dai siti degli atenei: là licenza e autore sono
  dichiarati, quindi si tiene solo ciò che è libero e si attribuisce
  sempre. Il marchio resta comunque loro, e il piè di pagina lo dichiara
  come chiede §6.4 — dicitura che prima mancava del tutto.
- Corretta una violazione di **P3**: i post e le risposte scritti nella piazza
  finivano dentro l'HTML senza essere messi in sicurezza. Ora passano tutti da
  `esc()`.

## Automatismi attivi

- **Salvataggio automatico:** ogni modifica a un file `.html`, `.css` o `.js`
  viene registrata in un commit e mandata su GitHub.
- **Controllo dei segreti (P4):** gira prima di ogni salvataggio; se trova una
  credenziale nel codice, blocca commit e pubblicazione.
  Si lancia anche a mano: `.claude/hooks/cerca-segreti.sh`

<!-- TIMBRO AUTOMATICO — aggiornato dal salvataggio automatico, non modificare a mano -->

## Registro automatico

Ultimo salvataggio: **16/08/2026 alle 19:34** — file toccato: `robot/scrivi-csp.js`

| File | Righe | Peso |
|:--|--:|--:|
| `avvio.js` | 58 | 4.0K |
| `collaudo/sonda.html` | 280 | 12K |
| `configurazione.js` | 313 | 16K |
| `index.html` | 457 | 32K |
| `moduli/articolo.js` | 574 | 28K |
| `moduli/ascolta.js` | 173 | 8.0K |
| `moduli/aula.js` | 851 | 44K |
| `moduli/didattica.js` | 472 | 24K |
| `moduli/geometrie.js` | 155 | 8.0K |
| `moduli/ideathon.js` | 514 | 24K |
| `moduli/lingua.js` | 164 | 8.0K |
| `moduli/loghi-incorporati.js` | 35 | 36K |
| `moduli/navigazione.js` | 135 | 8.0K |
| `moduli/notizie.js` | 119 | 8.0K |
| `moduli/nucleo.js` | 500 | 24K |
| `moduli/rivista.js` | 332 | 16K |
| `moduli/sociale.js` | 237 | 12K |
| `moduli/storie.js` | 100 | 8.0K |
| `robot/ascolta.js` | 129 | 8.0K |
| `robot/bandi.js` | 172 | 8.0K |
| `robot/comune/date.js` | 171 | 8.0K |
| `robot/comune/feed.js` | 100 | 4.0K |
| `robot/comune/paesi.js` | 158 | 12K |
| `robot/comune/pagina.js` | 87 | 4.0K |
| `robot/comune/pdf.js` | 162 | 8.0K |
| `robot/comune/registro.js` | 77 | 4.0K |
| `robot/comune/rete.js` | 102 | 8.0K |
| `robot/comune/scrivi.js` | 95 | 4.0K |
| `robot/converti-webp.js` | 190 | 8.0K |
| `robot/costi.js` | 136 | 8.0K |
| `robot/destinazioni.js` | 297 | 16K |
| `robot/didattica.js` | 101 | 8.0K |
| `robot/incorpora-loghi.js` | 80 | 4.0K |
| `robot/loghi.js` | 341 | 16K |
| `robot/notizie.js` | 150 | 8.0K |
| `robot/ricevi.js` | 167 | 8.0K |
| `robot/scarica-caratteri.js` | 212 | 12K |
| `robot/scrivi-csp.js` | 198 | 12K |
| `robot/studenti.js` | 87 | 4.0K |
| `stile/articolo.css` | 132 | 12K |
| `stile/ascolta.css` | 129 | 12K |
| `stile/aula.css` | 457 | 32K |
| `stile/base.css` | 311 | 20K |
| `stile/didattica.css` | 163 | 12K |
| `stile/ideathon.css` | 522 | 32K |
| `stile/notizie.css` | 132 | 12K |
| `stile/rivista.css` | 100 | 8.0K |
| `stile/sociale.css` | 560 | 40K |
| `stile/storie.css` | 48 | 4.0K |

<!-- fine timbro automatico -->
