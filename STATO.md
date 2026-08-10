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
sociale, messaggistica e profilo. I testi lunghi restano segnaposto: titoli,
autori e alcune fotografie sono veri, il corpo degli articoli no.

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
| `notizie.js` | legge i feed degli atenei → `dati/notizie.json`. **Un solo ateneo su nove pubblica un feed** (ERUA); gli altri conservano le notizie che hanno |
| `ascolta.js` | legge il feed pubblico del canale → `dati/ascolta.json`. Funziona **senza accesso al canale** |
| `didattica.js` | controlla che i 18 video dichiarati rispondano ancora. Non sceglie corsi: è selezione editoriale |
| `studenti.js` | tiene il posto e la forma. Produce un elenco vuoto, ed è corretto così |

Da fare su questo fronte, in ordine:

1. **Trovare i feed degli altri otto atenei.** È la cosa che cambia di più
   il risultato: oggi le notizie di otto atenei su nove sono ferme a quelle
   inserite a mano. Dove un feed non esiste, va deciso caso per caso se
   leggere la pagina o lasciar perdere — §6.2 tollera titolo, estratto e
   collegamento, non la copia delle immagini.
2. **Mettere `robot/giro.sh` nel cron del server**, insieme alla riga di
   sorveglianza che avvisa se un robot smette di dare segno di vita.
3. **Archivio completo delle puntate.** Il feed pubblico dà le ultime 15
   pubblicazioni; il canale ne ha più di 40. Per recuperare tutto in un
   colpo serve l'interfaccia ufficiale con una chiave — che è anche l'unico
   momento in cui servirà l'accesso al canale.

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

Ultimo salvataggio: **10/08/2026 alle 21:26** — file toccato: `robot/didattica.js`

| File | Righe | Peso |
|:--|--:|--:|
| `avvio.js` | 38 | 4.0K |
| `configurazione.js` | 219 | 12K |
| `index.html` | 356 | 28K |
| `moduli/articolo.js` | 569 | 24K |
| `moduli/ascolta.js` | 170 | 8.0K |
| `moduli/aula.js` | 834 | 44K |
| `moduli/didattica.js` | 429 | 20K |
| `moduli/lingua.js` | 164 | 8.0K |
| `moduli/navigazione.js` | 97 | 4.0K |
| `moduli/notizie.js` | 101 | 8.0K |
| `moduli/nucleo.js` | 266 | 16K |
| `moduli/rivista.js` | 294 | 16K |
| `moduli/sociale.js` | 237 | 12K |
| `moduli/storie.js` | 100 | 8.0K |
| `robot/ascolta.js` | 129 | 8.0K |
| `robot/comune/feed.js` | 100 | 4.0K |
| `robot/comune/registro.js` | 77 | 4.0K |
| `robot/comune/rete.js` | 65 | 4.0K |
| `robot/comune/scrivi.js` | 95 | 4.0K |
| `robot/notizie.js` | 126 | 8.0K |
| `robot/studenti.js` | 87 | 4.0K |
| `stile/articolo.css` | 132 | 12K |
| `stile/ascolta.css` | 129 | 12K |
| `stile/aula.css` | 457 | 32K |
| `stile/base.css` | 209 | 12K |
| `stile/didattica.css` | 163 | 12K |
| `stile/notizie.css` | 125 | 12K |
| `stile/rivista.css` | 100 | 8.0K |
| `stile/sociale.css` | 549 | 40K |
| `stile/storie.css` | 48 | 4.0K |

<!-- fine timbro automatico -->
