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

Ultimo salvataggio: **14/08/2026 alle 23:34** — file toccato: `moduli/articolo.js`

| File | Righe | Peso |
|:--|--:|--:|
| `avvio.js` | 38 | 4.0K |
| `configurazione.js` | 300 | 16K |
| `index.html` | 408 | 28K |
| `moduli/articolo.js` | 574 | 28K |
| `moduli/ascolta.js` | 173 | 8.0K |
| `moduli/aula.js` | 834 | 44K |
| `moduli/didattica.js` | 463 | 24K |
| `moduli/geometrie.js` | 155 | 8.0K |
| `moduli/ideathon.js` | 514 | 24K |
| `moduli/lingua.js` | 164 | 8.0K |
| `moduli/loghi-incorporati.js` | 35 | 64K |
| `moduli/navigazione.js` | 124 | 8.0K |
| `moduli/notizie.js` | 105 | 8.0K |
| `moduli/nucleo.js` | 456 | 24K |
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
| `robot/converti-webp.js` | 130 | 8.0K |
| `robot/costi.js` | 136 | 8.0K |
| `robot/destinazioni.js` | 297 | 16K |
| `robot/didattica.js` | 101 | 8.0K |
| `robot/incorpora-loghi.js` | 80 | 4.0K |
| `robot/loghi.js` | 341 | 16K |
| `robot/notizie.js` | 150 | 8.0K |
| `robot/ricevi.js` | 167 | 8.0K |
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
