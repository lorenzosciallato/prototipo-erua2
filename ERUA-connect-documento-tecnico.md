# ERUA connect
## Documento tecnico di riferimento
### Architettura, sicurezza, conformità normativa e assetto contrattuale

**Documento interno di progetto — agosto 2026**

---

## AVVERTENZA PRELIMINARE

Questo documento costituisce il riferimento operativo unico per lo sviluppo e la gestione della piattaforma ERUA connect. Va consultato all'inizio di ogni sessione di lavoro e prima di ogni modifica sostanziale all'architettura, alla struttura dei dati o alle modalità di pubblicazione.

Le sezioni 1–3 sono operative e vanno rilette con frequenza. Le sezioni 4–10 costituiscono il corpo tecnico e giuridico e si consultano al bisogno. L'Appendice A contiene la valutazione critica delle indicazioni tecniche raccolte in fase istruttoria preliminare. L'Appendice B raccoglie le criticità emerse dall'analisi complessiva.

Le parti relative agli aspetti legali non costituiscono parere legale. Costituiscono una mappa dei rischi e delle clausole rilevanti, redatta per consentire un'interlocuzione informata con gli uffici legali degli enti e per individuare i momenti in cui l'assistenza di un professionista è necessaria.

I riferimenti a prezzi, listini e denominazioni commerciali di prodotti sono segnalati con il simbolo 🕐 e devono essere verificati alla fonte prima di qualunque utilizzo in documentazione destinata a terzi.

Il nome commerciale del motore software è indicato in questo documento con il segnaposto **`[MOTORE]`**, da sostituire quando la denominazione sarà definita.

---

## LEGENDA DELLE VALUTAZIONI

| Simbolo | Significato |
|---|---|
| ✅ | Indicazione confermata, da applicare |
| ⚠️ | Indicazione parzialmente valida: il nucleo è corretto ma contiene elementi errati, imprecisi o fuori contesto |
| ❌ | Indicazione errata o fuorviante: da non applicare |
| 🕐 | Dato soggetto a variazione: da verificare alla fonte prima dell'uso |

---

## 1. PRINCIPIO ORGANIZZATIVO

Il progetto si governa distinguendo due dimensioni indipendenti, che vanno tenute separate in ogni decisione.

**Dimensione A — completezza del prodotto.**
La piattaforma si sviluppa sempre completa. Accesso, chat, notifiche, moderazione, segnalazioni, cancellazione dell'account, esportazione dei dati e pannello di amministrazione vengono costruiti e collaudati integralmente, nelle condizioni operative in cui funzionerebbero con migliaia di utenti. Non esistono versioni ridotte da completare in un secondo momento.

**Dimensione B — accesso e titolarità dei dati.**
Esiste un unico passaggio di stato rilevante: il momento in cui viene registrato il primo utente diverso dallo sviluppatore.

Prima di tale momento, il collaudo si esegue con account creati dallo sviluppatore stesso, utilizzando indirizzi di posta propri. Non sussiste alcun profilo di rischio giuridico: la normativa sulla protezione dei dati personali disciplina il trattamento di dati riferiti a terzi.

A partire da tale momento si attiva la procedura descritta alla sezione 9. Poiché il software è già completo, tale procedura si esaurisce in una sequenza di verifiche e pubblicazioni, non in una fase di sviluppo.

**Criterio derivato.** Le regole contenute in questo documento disciplinano **chi accede**, **cosa viene diffuso all'esterno** e **quali costi si generano**. Nessuna regola limita ciò che può essere sviluppato. Una prescrizione che avesse l'effetto di impedire lo sviluppo di una funzione sarebbe, per ciò stesso, formulata in modo errato.

---

## 2. REGOLE PERMANENTI

Nove prescrizioni vincolanti, applicabili dall'avvio del progetto. Il criterio che le accomuna è il rapporto fra costo di adozione immediato e costo di adozione differito: ciascuna comporta oggi un onere trascurabile e comporterebbe in seguito una riscrittura sostanziale.

**P1 — Assenza di credenziali conservate.**
Nessuna password viene conservata, in alcuna forma, in alcuna fase. L'autenticazione avviene tramite collegamento monouso inviato per posta elettronica.
*Motivazione.* Elimina integralmente la categoria di incidente più frequente e più onerosa, ossia la compromissione di credenziali. Elimina inoltre le funzioni accessorie di recupero, i criteri di complessità e l'onere di custodia di credenziali che gli utenti riutilizzano su altri servizi.

**P2 — Verifica di autorizzazione su ogni richiesta.**
Non è sufficiente verificare che l'utente sia autenticato: occorre verificare che la risorsa richiesta gli appartenga.
*Motivazione.* È la vulnerabilità più diffusa nelle applicazioni web. La sua introduzione successiva comporta la revisione di ogni interrogazione al database. Trattazione estesa alla sezione 5.2.

**P3 — Il contenuto immesso dagli utenti è trattato come testo, mai come codice.**
Ogni contenuto proveniente da un utente viene inserito nella pagina esclusivamente attraverso i costrutti che ne impediscono l'interpretazione.
*Motivazione.* In assenza di questa precauzione, un contenuto può includere istruzioni eseguibili nel browser di chi lo visualizza, con conseguente possibilità di sottrazione della sessione altrui.

**P4 — Nessun elemento segreto nel codice pubblicato.**
Chiavi, token, credenziali di servizio e stringhe di connessione non compaiono nei file versionati. Un controllo automatico ne verifica l'assenza prima di ogni pubblicazione.
*Motivazione.* Esistono sistemi automatici che analizzano continuamente i repository pubblici alla ricerca di credenziali. L'intervallo fra pubblicazione accidentale e primo utilizzo da parte di terzi si misura in minuti. Si veda la sezione 4.6 per la distinzione, essenziale, fra chiave pubblica di servizio e chiave riservata.

**P5 — Nessuna risorsa caricata da server di terzi nel browser dell'utente.**
Caratteri tipografici, librerie, icone e fogli di stile sono ospitati sull'infrastruttura del progetto.
*Motivazione.* Ogni risorsa richiesta a un server esterno comporta la trasmissione a tale server dell'indirizzo IP dell'utente. Costituisce trattamento e, se il server è extraeuropeo, trasferimento di dati personali. Trattazione estesa alla sezione 8.1.

**P6 — Ogni servizio a consumo dispone di un limite di spesa configurato prima dell'attivazione.**
Si applica ai servizi di intelligenza artificiale, all'infrastruttura cloud e all'invio di posta elettronica.
*Motivazione.* I servizi a scalabilità automatica fatturano ogni singola richiesta e non impongono limiti propri. Un errore di programmazione o un utilizzo malevolo possono generare importi rilevanti in poche ore.

**P7 — Ogni contenuto generato automaticamente è identificato come tale.**
Ciascun materiale prodotto da sistemi di intelligenza artificiale riporta in modo visibile la fonte, la data, il sistema utilizzato, l'indicazione che si tratta di contenuto generato e non verificato, e un canale per la segnalazione di errori.
*Motivazione.* Obbligo normativo dal 2 agosto 2026 (sezione 8.5). Costituisce inoltre il presidio di attendibilità scientifica dei materiali didattici.

**P8 — Ogni dichiarazione contenuta nell'informativa è vincolante.**
Non vengono dichiarate garanzie che il sistema non è in grado di mantenere.
*Motivazione.* Le tre dichiarazioni non veritiere più ricorrenti sono la cifratura punto a punto, la non uscita dei dati dal territorio europeo e la cancellazione immediata. Ciascuna, se dichiarata in assenza dei presupposti, trasforma una criticità tecnica in una dichiarazione non veritiera verso utenti e autorità di controllo.

**P9 — Ogni dato deve poter essere estratto.**
Esportazione in formati standard; nessuna logica applicativa collocata in contesti da cui non sia recuperabile.
*Motivazione.* Necessario per l'esercizio dei diritti degli interessati, per l'eventuale trasferimento della gestione a una struttura informatica di ateneo, per la chiusura ordinata del progetto e per la replicabilità del modello presso altre alleanze.

**Prescrizione ulteriore.** Il prototipo non viene indicizzato dai motori di ricerca fino all'eventuale ufficializzazione. La comparsa del prototipo nei risultati di ricerca associati alla denominazione dell'alleanza costituirebbe un problema di identità e di confondibilità evitabile con una riga di configurazione.

---

## 3. CRITERIO DI VALUTAZIONE PREVENTIVA

Ogni nuova funzione va valutata secondo la sequenza seguente.

1. **Comporta diffusione verso l'esterno?** Invio di posta, pubblicazione di file, chiamata a servizi di terzi, contenuto accessibile senza autenticazione. In caso affermativo si applicano le sezioni 8 e 5.
2. **Può generare consumo non presidiato?** In caso affermativo occorrono un limite di frequenza e un tetto di spesa (sezione 6.7).
3. **Continua a funzionare in assenza di presidio?** In caso negativo deve almeno segnalare il proprio malfunzionamento (sezione 4.8).
4. **Tratterà dati personali di terzi dopo l'attivazione?** In caso affermativo va sviluppata integralmente adesso e va aggiunta una voce alla procedura della sezione 9.

---
## 4. ARCHITETTURA

### 4.1 Schema generale

```
   PROCESSI AUTOMATICI (server dedicato)      APPLICAZIONE (file statici)
   ─────────────────────────────────────      ──────────────────────────────
   notizie dei nove siti istituzionali        HTML, CSS, JavaScript
   bandi e scadenze              ─────────►   senza framework
   articoli e podcast            producono    suddivisa in moduli
   trascrizioni e materiali      file JSON        │
   didattici                                      │
                                                  ▼
                                    SERVIZIO GESTITO (regione europea)
                                    ─────────────────────────────────
                                    account, contenuti degli utenti
                                    messaggistica, segnalazioni
                                    notifiche, archiviazione file
```

### 4.2 Criterio di ripartizione

Il criterio non è tecnologico ma attiene alla natura del dato. Un dato identico per tutti gli utenti, aggiornato con cadenza giornaliera e non modificabile dall'applicazione, non richiede un database. Un dato differenziato per utente, soggetto a modifica continua e da proteggere individualmente, lo richiede.

| | Contenuti dei processi automatici | Attività degli utenti |
|---|---|---|
| Origine | script sul server | utenti |
| Frequenza di variazione | giornaliera | continua |
| Differenziato per utente | no | sì |
| Richiede protezione individuale | no, è pubblico | sì |
| Collocazione | file JSON serviti staticamente | database |
| Costo | nullo | nullo fino a qualche centinaio di utenti |

Il vantaggio ulteriore della componente a file consiste nella resilienza: l'interruzione di un processo automatico non compromette il funzionamento dell'applicazione, che continua a esporre i dati dell'aggiornamento precedente. Un guasto sulla componente a database, al contrario, interrompe il servizio. Per questa ragione i contenuti redazionali non vanno collocati nel database anche quando questo sia disponibile.

### 4.3 Componente di presentazione

La componente di presentazione resta costituita da HTML, CSS e JavaScript, suddivisa in moduli.

**Esclusione dei framework applicativi.** L'adozione di un framework moderno comporta un sistema di compilazione, un gestore di pacchetti e un numero di dipendenze di terze parti compreso fra alcune centinaia e alcune migliaia. Ciascuna dipendenza costituisce una superficie di attacco, una licenza da verificare e un elemento soggetto a rottura in caso di aggiornamento. Il beneficio offerto riguarda la gestione di interfacce complesse, ambito nel quale il progetto non presenta criticità.

**Vincolo funzionale da mantenere.** La navigazione fra sezioni non comporta il caricamento di pagine distinte. L'intera applicazione resta su una schermata unica. Il requisito è pienamente compatibile con la suddivisione in moduli.

### 4.4 Suddivisione del codice

Quattro categorie di file con funzioni distinte.

**File di configurazione.** Denominazione, marchio, palette cromatica, elenco degli atenei, lingue attive, indirizzi di contatto, riferimenti ai testi legali. File unico.
Costituisce l'elemento che rende il progetto replicabile presso un'altra alleanza mediante la modifica di poche righe, anziché mediante un intervento diffuso sul codice. Traduce sul piano tecnico l'assetto proprietario descritto alla sezione 10.2. L'adozione differita comporta una riscrittura.

**File dei testi dell'interfaccia.** Tutte le stringhe visibili all'utente, mai collocate nel codice. Un file per lingua.
L'inserimento successivo di una lingua, in assenza di questa separazione, comporta la revisione integrale del progetto.

**File di dati**, uno per sezione, prodotti dai processi automatici e caricati su richiesta.
La sezione sociale non deve comportare il caricamento dei dati della sezione didattica. La differenza è determinante sui dispositivi di fascia bassa.

**Moduli di codice**, uno per sezione, caricati su richiesta.

### 4.5 Scelta della componente a database

La componente a database si realizza su un servizio gestito basato su PostgreSQL, in regione europea. Le motivazioni, in ordine di rilevanza:

**Natura relazionale del dominio.** Uno studente appartiene a un ateneo, pubblica contenuti, riceve risposte da altri studenti, partecipa a progetti collegati a bandi. Un database relazionale gestisce nativamente queste relazioni: si dichiarano una volta e il sistema ne garantisce la coerenza.
Un database documentale non dispone del concetto di relazione. La medesima struttura richiede la **duplicazione dei dati**: nome e immagine dell'autore replicati all'interno di ciascun contenuto pubblicato. La tecnica è nota come denormalizzazione ed è, su quella tipologia di sistema, obbligata. Ogni duplicazione costituisce però un punto di possibile divergenza: la modifica dell'immagine di profilo di un utente comporta la riscrittura di tale immagine all'interno di tutti i contenuti da lui pubblicati, con stato incoerente in caso di interruzione del processo.

**Verificabilità delle regole di sicurezza.** Su PostgreSQL la regola che limita la visibilità delle conversazioni ai soli partecipanti si esprime in poche righe di sintassi dichiarativa, verificabili da un tecnico terzo in tempi brevi. Sui sistemi documentali proprietari la medesima regola si esprime in un linguaggio specifico del fornitore, non verificabile da soggetti esterni al progetto.
Per un progetto che presenta come criticità strutturale la dipendenza da un unico sviluppatore (sezione 13.3), la verificabilità da parte di terzi costituisce un requisito, non un elemento accessorio.

**Prevedibilità della spesa.** I sistemi documentali a consumo fatturano ogni singola lettura di documento e non prevedono un limite massimo di spesa. Un errore di programmazione o un utilizzo malevolo producono un importo rilevabile solo a posteriori. Un servizio gestito a canone fisso, in caso di superamento delle risorse, degrada le prestazioni anziché incrementare la fatturazione.

**Ricerca testuale.** Requisito già previsto per il progetto. PostgreSQL la fornisce nativamente. I sistemi documentali non la forniscono e richiedono l'integrazione di un servizio esterno specializzato, a pagamento e da mantenere sincronizzato. Trattazione alla voce B.2 dell'Appendice B.

**Portabilità.** Una copia di sicurezza di un database PostgreSQL è ripristinabile su qualunque infrastruttura. Requisito necessario per l'esportazione dei dati, per l'eventuale trasferimento della gestione e per la replicabilità del modello.

**Servizi inclusi.** Autenticazione tramite collegamento monouso, aggiornamento in tempo reale per la messaggistica, archiviazione dei file, regione europea, piano gratuito adeguato alla fase di sviluppo.

**Esclusione dell'installazione su server proprio.** L'installazione del database sul server già in uso per i processi automatici comporterebbe la gestione diretta di copie di sicurezza, aggiornamenti di sicurezza del sistema operativo e continuità del servizio. Il server dedicato mantiene la funzione per cui è idoneo: elaborazioni pesanti e programmate, la cui eventuale interruzione non produce indisponibilità del servizio.

### 4.6 Elementi caratteristici del servizio gestito

**Chiave pubblica nel codice dell'applicazione.** La chiave di identificazione dell'applicazione è contenuta nel codice pubblicato e ciò è conforme al modello di sicurezza previsto: tale chiave non conferisce di per sé alcun privilegio. **L'intero presidio di sicurezza è costituito dalle politiche di accesso definite sulle tabelle.**
*Conseguenza operativa vincolante:* ogni tabella dispone delle proprie politiche, definite prima dell'inserimento del primo record e collaudate mediante tentativo effettivo di accesso ai dati di un altro utente. **Una tabella priva di politiche espone i propri dati a chiunque.** La verifica va automatizzata e non affidata alla memoria.
La chiave di servizio, che scavalca le politiche, risiede esclusivamente sul server e non compare mai nel codice dell'applicazione (P4).

**Sospensione dei progetti inattivi.** Il piano gratuito sospende i progetti dopo un periodo di inattività. La circostanza è rilevante in occasione delle presentazioni: un progetto non utilizzato per alcune settimane risulterebbe sospeso al momento della dimostrazione. Contromisura: processo automatico che effettua una richiesta giornaliera, oppure attivazione del piano a pagamento nel periodo delle presentazioni.

**Regione non modificabile.** La regione si definisce alla creazione del progetto e non è successivamente modificabile. Va selezionata una regione dell'Unione europea.

### 4.7 Decisioni sul modello dei dati

Sei decisioni strutturali, onerose da modificare in seguito.

**a) Identificativi casuali.** Identificativi progressivi rendono desumibile il numero complessivo di record, ne consentono l'enumerazione e rivelano l'andamento della crescita. Si adottano identificativi casuali di lunghezza adeguata.

**b) Contatori gestiti in modo atomico.** L'aggiornamento di un contatore mediante lettura, incremento e riscrittura produce perdita di aggiornamenti in caso di operazioni simultanee. Si utilizza l'operazione atomica di incremento fornita dal database oppure, finché i volumi lo consentono, si calcola il valore al momento della lettura senza mantenere un contatore.

**c) Cancellazione dell'account con anonimizzazione dei contenuti.** La cancellazione effettiva dei contenuti pubblicati rende incomprensibili le conversazioni cui hanno partecipato altri utenti. Si sostituisce il riferimento all'autore con un segnaposto, scollegando il contenuto dall'identità. **La modalità va indicata nei termini d'uso** (P8).

**d) Marcatura dei dati di collaudo.** Ogni tabella dispone di un campo che identifica i record di collaudo, valorizzato dal primo inserimento. Consente la rimozione selettiva all'attivazione del servizio e la permanenza dei dati necessari alla modalità dimostrativa (sezione 9.6).

**e) Data di creazione e di ultima modifica su ogni record.** Necessarie per l'applicazione dei termini di conservazione, per l'ordinamento e per la ricostruzione degli eventi in caso di incidente.

**f) Date e orari in formato universale.** La conversione nel fuso orario dell'utente avviene esclusivamente in fase di visualizzazione. Il requisito è particolarmente rilevante per le scadenze dei bandi.

### 4.8 Processi automatici

**Idempotenza.** Ogni fase salva il proprio risultato e può essere rieseguita senza effetti collaterali. L'esecuzione ripetuta della medesima fase produce il medesimo risultato dell'esecuzione singola. Il requisito consente il riavvio dopo un'interruzione senza produrre stati incoerenti.

**Segnalazione di completamento.** Ogni processo segnala il proprio completamento corretto. Il malfunzionamento si rileva dall'assenza della segnalazione, non dalle segnalazioni degli utenti.

**Rimozione dei file temporanei.** La rimozione avviene in ogni caso, anche in presenza di errore, mediante i costrutti che ne garantiscono l'esecuzione. In assenza, lo spazio di lavoro si satura compromettendo le esecuzioni successive.

**Suddivisione delle elaborazioni.** Le elaborazioni che possono eccedere i limiti di durata si suddividono in fasi distinte e persistenti: acquisizione, trascrizione, sintesi, generazione dei materiali.

**Versioni bloccate.** Le librerie e le interfacce esterne si vincolano a versioni specifiche. Il riferimento generico alla versione più recente espone a interruzioni determinate da aggiornamenti di terzi.

**Conservazione dei dati precedenti.** I file di dati prodotti nelle esecuzioni precedenti si conservano per un numero adeguato di cicli, a tutela dei casi di modifica strutturale delle fonti.

### 4.9 Compatibilità fra versioni

Al rilascio di una nuova versione, una parte degli utenti dispone ancora della versione precedente nella memoria del browser.

- Ai file di dati si aggiungono campi; non se ne rinominano né rimuovono fino alla certezza dell'aggiornamento generalizzato.
- Ogni file di dati riporta un numero di versione e il codice mantiene la capacità di interpretare la versione precedente.
- I dati conservati localmente si migrano, previa copia, e non si eliminano.
- Il ricaricamento forzato, ove necessario, avviene con preavviso all'utente e senza perdita dei contenuti in corso di redazione.

### 4.10 Dati conservati sul dispositivo

I materiali di studio personali — annotazioni, evidenziazioni, contenuti della bacheca — restano sul dispositivo dell'utente. La scelta comporta assenza di costi, assenza di esposizione in caso di incidente e assenza di obblighi di trattamento.

L'eventuale sincronizzazione fra dispositivi va mantenuta facoltativa, disattivata per impostazione predefinita, cifrata e accompagnata da avviso esplicito sulla trasmissione dei dati.

**Contropartita da gestire.** La cancellazione dei dati del browser comporta la perdita dei materiali. Sono necessari un avviso e una funzione di esportazione immediata.

**Gestione dei conflitti.** Il funzionamento in assenza di connessione può determinare modifiche divergenti fra dispositivo e server. La soluzione più robusta consiste nell'evitare il conflitto: i materiali personali non si sincronizzano affatto, mentre le operazioni dirette al server si accodano e vengono trasmesse al ripristino della connessione, con visibilità della coda per l'utente.

### 4.11 Gestione del codice

- Ogni modifica transita dal sistema di controllo di versione. Non si interviene direttamente sull'ambiente pubblicato: in assenza di cronologia non è possibile il ripristino della versione precedente.
- Ramo di sviluppo distinto dal ramo pubblicato.
- Ambiente di collaudo separato, da predisporre appena esistono dati non riproducibili.
- Registro delle versioni rilasciate, con indicazione delle modifiche. Costituisce inoltre elemento di prova della data di realizzazione ai fini della sezione 10.3.

### 4.12 Rilevazione dei malfunzionamenti

Tre strumenti, tutti disponibili a costo nullo alla scala del progetto, da predisporre preventivamente.

**Raccolta degli errori applicativi.** In assenza di un sistema di raccolta, gli errori che si manifestano sui dispositivi degli utenti non sono conoscibili e determinano abbandono silenzioso del servizio. Il sistema va configurato in modo da non trasmettere il contenuto delle pagine né dati riferibili agli utenti, e va indicato nell'informativa.

**Canale di segnalazione interno all'applicazione.** Modulo che acquisisce automaticamente dispositivo, browser e sezione, con smistamento in coda ordinata. In assenza, le richieste di assistenza si indirizzano ai recapiti personali dei referenti accademici e dello sviluppatore.

**Controllo di disponibilità del servizio**, con notifica in caso di indisponibilità.

---
## 5. SICUREZZA

### 5.1 Modello delle minacce

Le contromisure vanno dimensionate sugli scenari effettivamente probabili.

| Soggetto | Probabilità | Obiettivo | Contromisura principale |
|---|---|---|---|
| **Errore dello sviluppatore** | **Molto alta** | — | controlli automatici, copie di sicurezza, ambiente di collaudo |
| Utente che sperimenta con gli strumenti del browser | Alta | accesso a dati di altri utenti | verifica di autorizzazione (5.2) |
| Utente che molesta un altro utente | Alta | contatto reiterato, elusione del blocco | blocco efficace, limiti, moderazione |
| Sistemi automatici di scansione | Alta | credenziali esposte, moduli da saturare | assenza di segreti pubblicati, limiti di frequenza |
| Raccolta automatizzata di dati | Media | acquisizione dell'elenco degli utenti | limiti di frequenza, assenza di elenchi completi |
| Attacco a fini di consumo economico | Media | generazione di costi | tetti di spesa, allarmi, funzioni onerose non esposte |
| Attaccante specializzato | Bassa | dati riservati | le contromisure precedenti elevano significativamente la soglia |

La prima riga della tabella individua lo scenario prevalente. Le contromisure contro l'errore proprio hanno priorità su tutte le altre.

### 5.2 Verifica di autorizzazione

Alla richiesta di una risorsa identificata da un riferimento, il sistema deve eseguire due verifiche distinte:

1. **Autenticazione** — l'utente è riconosciuto.
2. **Autorizzazione** — la risorsa richiesta è riferibile a quell'utente.

L'omissione della seconda consente a qualunque utente autenticato di accedere alle risorse altrui mediante semplice modifica del riferimento nella richiesta. La vulnerabilità è nota come riferimento diretto a oggetti non sicuro ed è rilevabile in tempi brevissimi da un utente non specializzato. Il suo verificarsi su dati personali configura una violazione soggetta a notifica.

**Criterio di progettazione.** L'identità del richiedente si ricava esclusivamente dal token di sessione, mai da parametri trasmessi dall'applicazione. Si verifica quindi l'esistenza della relazione fra tale identità e la risorsa.

**Presidio a livello di database.** Su PostgreSQL la verifica si esprime come politica sulla tabella: è il database stesso a rifiutare le righe non riferibili al richiedente. Il presidio opera anche in presenza di difetti nel codice applicativo. Costituisce la ragione per cui, alla sezione 4.6, le politiche vengono qualificate come unico presidio effettivo.

**Modalità di collaudo.** La verifica non si effettua mediante lettura del codice ma mediante prova diretta: si predispongono due account, si genera un contenuto con il primo e si tenta l'accesso con il secondo invocando direttamente il servizio, senza mediazione dell'interfaccia. La prova va ripetuta per ogni tabella contenente dati personali e a ogni introduzione di nuove tabelle.

### 5.3 Accesso e sessioni

- Collegamento monouso, con validità di pochi minuti, utilizzabile una sola volta, non prevedibile.
- Elenco chiuso dei domini di posta ammessi, corrispondenti agli atenei dell'alleanza. Si veda la sezione 9.6 per la necessità di una modalità di accesso dimostrativa.
- **I messaggi di errore non rivelano l'esistenza di un indirizzo registrato.** Un messaggio differenziato consente la ricostruzione dell'elenco degli utenti mediante tentativi successivi. Il messaggio è invariante: viene indicato che, se l'indirizzo è valido, il collegamento sarà recapitato.
- Sessione di durata contenuta con rinnovo in presenza di attività. Sessioni di durata prolungata comportano il permanere dell'accesso in caso di sottrazione del dispositivo.
- Funzione di revoca di tutte le sessioni attive di un account.
- Verifica periodica del permanere del rapporto con l'ateneo. Le caselle di posta degli ex studenti restano attive per periodi lunghi; il permanere dell'accesso a spazi riservati da parte di soggetti non più affiliati costituisce violazione delle politiche interne degli atenei. Contromisura: scadenza dell'account con riconferma periodica.

### 5.4 Contenuti pubblici

- Trattamento del contenuto come testo (P3).
- Limiti di frequenza su pubblicazioni, risposte e segnalazioni.
- Modifica e cancellazione riservate all'autore; cancellazione dell'account con anonimizzazione (4.7c).
- Funzione di segnalazione su ogni elemento, costantemente visibile.
- **Insieme dei caratteri ammessi negli pseudonimi limitato in fase di generazione.** Uno pseudonimo compare in numerosi contesti dell'interfaccia; se può contenere caratteri di controllo costituisce un vettore di iniezione in ciascuno di essi.

### 5.5 Messaggistica e contatti

La materia attiene anche alla sicurezza personale degli utenti e va progettata di conseguenza.

- Politica sul database che nega la lettura ai non partecipanti (5.2). Costituisce il presidio effettivo; i controlli applicativi hanno funzione di sola usabilità.
- Apertura della conversazione subordinata all'accettazione reciproca. La misura elimina il messaggio non sollecitato, che costituisce il vettore principale delle condotte moleste.
- Blocco esteso alle nuove richieste di contatto, non percepibile dal soggetto bloccato.
- Limite alle richieste reiterate verso il medesimo destinatario.
- Avviso in occasione dello scambio di recapiti, con indicazione dell'uscita dall'ambito della piattaforma.
- Esclusione del numero di telefono dalla prima versione.
- Cancellazione automatica al termine del periodo di conservazione, con l'eccezione di cui alla voce B.9 dell'Appendice B.
- Assenza di dichiarazioni relative alla cifratura punto a punto (P8). Formulazione corretta alla sezione 8.6.
- Percorso di trattazione prioritaria per le segnalazioni relative a molestie, minacce o rischio per l'incolumità (sezione 9.5).

### 5.6 File caricati

- **Compressione e ridimensionamento nel browser prima della trasmissione.** Trattazione estesa alla sezione 6.2.
- **Limiti di dimensione e tipo applicati anche lato server.** I controlli eseguiti nel browser sono eludibili. Il principio è generale: ogni controllo eseguito nel browser va replicato sul server.
- Verifica del tipo effettuata sul contenuto del file, non sull'estensione.
- I file caricati non vengono serviti dal dominio dell'applicazione, per evitare che un file interpretabile acquisisca i privilegi dell'applicazione stessa.
- **Rimozione dei metadati dalle immagini.** Le immagini prodotte da dispositivi mobili contengono frequentemente le coordinate geografiche di acquisizione. La rimozione è automatica e non facoltativa.

### 5.7 Collegamenti esterni

- Ammessi esclusivamente i protocolli sicuri.
- Apertura con gli attributi che impediscono alla pagina di destinazione di operare sulla pagina di origine.
- Pagina intermedia con indicazione del dominio effettivo di destinazione, a tutela dai collegamenti mascherati.
- **Assenza di meccanismi di reindirizzamento che accettino la destinazione come parametro.** Costituiscono il metodo consueto per la costruzione di collegamenti fraudolenti che presentano il dominio legittimo come origine.

### 5.8 Intestazioni di sicurezza

Configurazioni trasmesse dal server unitamente alla pagina, di onere trascurabile e di efficacia elevata.

- **Divieto di incorporamento in pagine di terzi.** In assenza, l'applicazione può essere caricata all'interno di una pagina controllata da terzi, con sovrapposizione di elementi non visibili e induzione dell'utente a compiere azioni non volute.
- **Politica sui contenuti**, che definisce quali codici il browser può eseguire e da quali origini. Configurata correttamente, neutralizza gli effetti di un'eventuale iniezione.
- **Trasporto sicuro obbligatorio.**

*Presupposto tecnico.* L'efficacia della politica sui contenuti richiede l'assenza di codice collocato all'interno del markup, sia come attributi di gestione degli eventi sia come blocchi in linea. L'adeguamento va eseguito contestualmente alla suddivisione del codice (4.4).

### 5.9 Abuso della logica applicativa

- Limiti per utente e per unità di tempo su pubblicazione, invio di messaggi, richieste di contatto, segnalazioni, ricerche e generazione di materiali.
- Limite complessivo, ulteriore rispetto a quelli individuali, sulle operazioni onerose.
- Nessuna funzione onerosa accessibile in assenza di autenticazione.
- Contro i sistemi automatici di registrazione: campi non visibili all'utente ma compilati dai sistemi automatici, e verifica comportamentale. Il rischio è contenuto in presenza di accesso vincolato ai domini istituzionali, ma i moduli pubblici di contatto restano esposti.
- Contro la raccolta automatizzata: assenza di elenchi completi ottenibili con una singola richiesta, limiti sulle interrogazioni reiterate e, se necessario, protezioni fornite dal livello di distribuzione.

### 5.10 Catena di fornitura del software

- Numero di dipendenze mantenuto al minimo. La condizione attuale, prossima all'assenza di dipendenze, costituisce un vantaggio sotto il profilo della sicurezza, del costo e delle licenze.
- Le librerie esterne indispensabili vengono ospitate localmente, con versione vincolata e verifica di integrità del file.
- Verifica automatica delle vulnerabilità note nelle dipendenze.
- **Rischio dei pacchetti inesistenti.** I sistemi di generazione automatica del codice possono indicare l'installazione di librerie non esistenti. Esistono soggetti che pubblicano pacchetti con tali denominazioni in attesa di installazioni automatiche. Contromisura alla sezione 7.3.

### 5.11 Registrazione degli eventi

- Si registrano: accessi, azioni amministrative, decisioni di moderazione, esportazioni di dati, modifiche dei permessi.
- Non si registrano: contenuto dei messaggi, token in forma integrale.
- Gli indirizzi IP presenti nei registri costituiscono dati personali e sono soggetti a conservazione limitata (9.9).
- **Il registro delle azioni amministrative non è modificabile da chi dispone di privilegi amministrativi.** In assenza di tale requisito il registro non ha valore probatorio.

### 5.12 Contromisure contro l'errore proprio

- **Verifica automatica dell'assenza di segreti prima di ogni pubblicazione**, con interruzione del processo in caso di rilevamento. Costituisce la contromisura con il rapporto più favorevole fra danno evitato e onere di adozione, e va implementata prioritariamente.
- **Copie di sicurezza automatiche, con procedura di ripristino verificata almeno una volta.** Una copia di sicurezza mai ripristinata non costituisce una garanzia. La verifica si esegue su un ambiente distinto.
- **Ambiente di collaudo separato.**
- **Funzione di commutazione in sola lettura** eseguibile in tempi brevi.
- **Verifiche automatiche sui tre flussi critici** prima dell'attivazione del servizio: accesso, pubblicazione di un contenuto, invio di un messaggio.

---

## 6. PRESTAZIONI, TRAFFICO E COSTI

### 6.1 Modello di costo

Nei servizi a consumo l'elemento tariffato non è la giacenza dei dati ma il loro movimento: ogni trasferimento, ogni lettura dal database, ogni esecuzione di funzione. Il costo non è quindi proporzionale alla dimensione della piattaforma ma alla quantità di operazioni non necessarie che essa esegue.

Seguono le quattro leve di contenimento, in ordine di efficacia. Le prime due determinano congiuntamente oltre il novanta per cento del risultato.

### 6.2 Compressione delle immagini in fase di caricamento

**Problema.** Un'immagine acquisita da un dispositivo mobile recente ha dimensione compresa fra otto e quindici megabyte. In assenza di trattamento, il volume in ingresso e i successivi trasferimenti in uscita risultano sproporzionati rispetto al valore informativo.

**Soluzione.** La trasformazione avviene sul dispositivo dell'utente, prima della trasmissione. Alla selezione del file, il codice dell'applicazione lo ridisegna in memoria alla dimensione massima prevista — **1200 pixel sul lato maggiore** costituisce il valore adeguato per una visualizzazione a scorrimento — e lo converte in **formato WebP con qualità all'80%**, che a parità di resa percepita comporta una riduzione compresa fra il 25 e il 35 per cento rispetto ai formati precedenti.

**Risultato.** Un'immagine di dodici megabyte si riduce a 200-300 kilobyte, con **riduzione del traffico all'origine compresa fra il 95 e il 98 per cento** e senza degrado percepibile sui dispositivi mobili.

**Priorità di adozione.** L'intervento riguarda il codice dell'applicazione e non la configurazione dei servizi. L'adozione differita comporta l'accumulo di materiale da riconvertire.

**Presidio lato server.** La compressione eseguita nel browser è eludibile. Il server rifiuta comunque i file eccedenti la dimensione massima — tre megabyte costituisce un limite adeguato — e di tipo non previsto.

**Versioni ridotte.** Sono necessarie due versioni derivate: una di circa 150 pixel per le immagini di profilo e le anteprime, una di circa 800 pixel per la visualizzazione a scorrimento. La versione integrale si carica esclusivamente su richiesta esplicita di ingrandimento. L'adozione riduce ulteriormente il traffico di un fattore compreso fra tre e quattro.

### 6.3 Livello di distribuzione

**Problema.** Ogni visualizzazione comporta un trasferimento in uscita dal servizio di archiviazione, tariffato. La visualizzazione del medesimo contenuto da parte di più utenti comporta trasferimenti ripetuti del medesimo file.

**Soluzione.** Si interpone un livello di distribuzione fra gli utenti e l'archiviazione. Tale livello conserva copia del file nei propri nodi distribuiti. Il primo accesso determina un trasferimento dall'archiviazione; gli accessi successivi vengono soddisfatti dal livello di distribuzione, senza costo.

**Risultato.** Riduzione del costo di trasferimento a valori prossimi allo zero e miglioramento dei tempi di risposta per gli utenti geograficamente distanti.

**Condizione tecnica.** L'efficacia richiede che i file abbiano riferimenti stabili e istruzioni di conservazione prolungate. Si ottiene includendo nel nome del file un elemento derivato dal contenuto, che varia al variare del medesimo: consente istruzioni di conservazione di lunga durata senza rischio di erogazione di versioni superate.

**Costo.** I piani gratuiti dei principali fornitori coprono integralmente questo caso d'uso e includono protezioni contro i sistemi automatici e contro gli attacchi di saturazione.

### 6.4 Caricamento differito

**Immagini.** Attributo che subordina il trasferimento all'ingresso dell'elemento nell'area visibile. La visualizzazione dei primi contenuti non comporta il trasferimento di quelli successivi.

**Dati.** Il caricamento avviene per blocchi, con richiesta dei blocchi successivi in funzione dello scorrimento.

**Sezioni.** Il caricamento dei moduli avviene su richiesta (4.4).

**Contenuti video.** Il componente di riproduzione non viene caricato fino all'azione dell'utente: si presenta un'immagine di anteprima con comando di avvio. L'accorgimento produce un duplice effetto, di contenimento del traffico e di conformità in materia di cookie di terze parti (sezione 8.1).

### 6.5 Contenimento delle interrogazioni al database

Criterio: ogni schermata deve comportare un numero di interrogazioni fisso e ridotto, indipendente dal numero di elementi visualizzati.

L'errore ricorrente consiste nell'eseguire un'interrogazione per l'elenco e un'interrogazione aggiuntiva per ciascun elemento, al fine di recuperare i dati correlati. La visualizzazione di venti elementi comporta in tal modo alcune decine di interrogazioni. Su un database relazionale la medesima visualizzazione si ottiene con un'unica interrogazione che unisce le entità correlate: costituisce una delle motivazioni tecniche della scelta di cui alla sezione 4.5.

Ulteriori misure: definizione di indici sulle colonne utilizzate per la selezione e l'ordinamento; conservazione temporanea nel browser dei dati già acquisiti; adozione di contatori solo in presenza di volumi elevati, con aggiornamento atomico (4.7b).

### 6.6 Notifiche

- Invio scaglionato, mai simultaneo alla totalità dei destinatari.
- Raggruppamento: la pluralità di eventi relativi al medesimo contenuto in un intervallo ravvicinato genera una notifica unica.
- Esclusione dei destinatari che non accedono al servizio da periodi prolungati.
- Rispetto delle preferenze, con disiscrizione mediante singola azione.
- Configurazione dei tre meccanismi di autenticazione del dominio di posta, in assenza dei quali i messaggi vengono classificati come indesiderati e la funzione risulta inefficace.

### 6.7 Limiti di spesa

- Limite configurato su ogni servizio a consumo, precedentemente all'attivazione (P6).
- Allarmi di budget su soglie progressive.
- Limite massimo di esecuzioni concorrenti sulle funzioni server.
- Nessuna funzione onerosa accessibile in assenza di autenticazione.
- Verifica di provenienza delle richieste dall'applicazione legittima.

### 6.8 Ordini di grandezza

**Fase di sviluppo.** Costo nullo: erogazione statica gratuita, server già in esercizio, piano gratuito del servizio gestito. Unica eccezione, l'eventuale attivazione del piano a pagamento nel periodo delle presentazioni per evitare la sospensione per inattività (4.6).

**Alcune centinaia di utenti attivi.** Piani gratuiti o poche decine di euro mensili.

**Cinquemila utenti attivi mensili**, con l'architettura descritta: ordine di grandezza compreso **fra cento e trecento euro mensili**, determinato prevalentemente da database, invio di posta ed eventuale autenticazione federata, tariffata per utente attivo.

Le stime superiori reperibili in fase istruttoria si riferivano a ventimila utenti e a un'architettura priva delle misure descritte alle sezioni 6.2-6.5, che riducono il traffico di un fattore compreso fra venti e trenta.

### 6.9 Rappresentazione del costo in sede istituzionale

Il costo va presentato in termini comparativi rispetto all'alternativa effettiva, ossia l'affidamento a una società di sviluppo esterna. Va accompagnato dalla previsione espressa che **i costi dell'infrastruttura sono a carico dell'ente committente e non del fornitore**. L'anticipazione dei costi infrastrutturali da parte del fornitore configura un finanziamento del committente e determina una posizione dalla quale non è agevole recedere.

---
## 7. CONTROLLO AUTOMATICO DELLA SICUREZZA DEL CODICE

### 7.1 Impostazione

La ricerca di vulnerabilità mediante sottoposizione periodica dell'intera base di codice a un sistema di intelligenza artificiale è inefficace: produce segnalazioni non pertinenti, disperde il contesto e comporta consumo non giustificato.

Gli strumenti di analisi statica operano invece su regole sintattiche deterministiche: individuano le occorrenze corrispondenti alle regole, senza produrre risultati inventati.

La ripartizione corretta prevede che gli strumenti deterministici individuino, il sistema di intelligenza artificiale proponga la correzione, i controlli automatici verifichino e l'approvazione resti umana.

### 7.2 Sequenza

```
   modifica al codice
          │
          ▼
   1. RICERCA DI SEGRETI ──── rilevamento? ──► interruzione
          │ (esito negativo)
          ▼
   2. ANALISI STATICA ─────── nessun rilievo? ──► pubblicazione
          │ (vulnerabilità rilevata)
          ▼
   3. GENERAZIONE DELLA CORREZIONE
      (il sistema riceve esclusivamente il frammento interessato e il rapporto dello strumento)
          │
          ▼
   4. PROPOSTA DI MODIFICA + esecuzione dei controlli automatici
          │
          ▼
   5. APPROVAZIONE
```

### 7.3 Vincoli

**La correzione non viene applicata automaticamente all'ambiente pubblicato.** Viene generata come proposta soggetta a revisione. Una correzione di sicurezza errata applicata automaticamente produce effetti più gravi della vulnerabilità che intende rimuovere.

**La ricerca dei segreti precede l'invio al sistema esterno.** L'inversione dell'ordine comporterebbe la trasmissione a terzi di eventuali credenziali presenti nel codice.

**Il sistema può utilizzare esclusivamente le librerie già presenti nel progetto.** Il vincolo va esplicitato nell'istruzione e costituisce la contromisura al rischio dei pacchetti inesistenti (5.10).

### 7.4 Formulazione dell'istruzione

L'istruzione impone che il sistema restituisca esclusivamente il frammento corretto, in formato elaborabile automaticamente; mantenga invariata la logica applicativa; limiti l'intervento al frammento fornito; dichiari l'eventuale incertezza anziché produrre una soluzione non verificata.

### 7.5 Costo

L'approccio mirato — invocazione del sistema esclusivamente in presenza di un rilievo, limitatamente al frammento interessato — comporta un costo di ordine di grandezza pari a pochi euro mensili, contro alcune decine dell'approccio non selettivo.
🕐 Le denominazioni dei modelli e le tariffe rilevate in fase istruttoria si riferiscono a generazioni precedenti e vanno riverificate.

### 7.6 Priorità

In caso di adozione parziale, la componente da implementare per prima è la **verifica automatica dell'assenza di segreti**, indipendentemente dalle altre.

### 7.7 Limite degli strumenti automatici

Gli strumenti di analisi statica **non individuano la totalità delle vulnerabilità**: individuano esclusivamente le occorrenze corrispondenti alle proprie regole. Non rilevano i difetti di logica applicativa, gli errori di configurazione né le politiche di accesso formulate in modo inadeguato.

La vulnerabilità descritta alla sezione 5.2 — omessa verifica di autorizzazione — appartiene esattamente alla categoria non rilevabile automaticamente. L'esito favorevole dell'analisi automatica non costituisce quindi garanzia, e il collaudo manuale descritto alla medesima sezione resta necessario.

---

## 8. CONTENUTI: DIRITTI DI TERZI E OBBLIGHI NORMATIVI

Le voci sono ordinate secondo il rischio effettivo, valutato in base alla probabilità che il titolare del diritto attivi una tutela.

### PRIORITÀ ALTA

#### 8.1 Risorse caricate da server di terzi

**Meccanismo.** Il caricamento di un carattere tipografico, di una libreria o di un'icona da un server esterno comporta la trasmissione a tale server dell'indirizzo IP dell'utente e della pagina di provenienza. L'indirizzo IP costituisce dato personale; se il server è collocato fuori dall'Unione europea si configura un trasferimento privo di base giuridica e di informativa.

**Rilevanza.** Nel 2022 un tribunale tedesco ha riconosciuto a un singolo visitatore il diritto al risarcimento per l'incorporazione dinamica di caratteri tipografici forniti da un operatore extraeuropeo. La pronuncia ha originato in Germania una prassi di richieste risarcitorie seriali. Uno degli atenei dell'alleanza ha sede in Germania.

**Adempimento.** I file dei caratteri tipografici vengono scaricati, collocati nella struttura del progetto e dichiarati nel foglio di stile. La medesima misura si applica a ogni libreria esterna.

**Licenze dei caratteri tipografici.** I caratteri attualmente impiegati sono rilasciati con licenze che ne consentono l'utilizzo web e l'inclusione nel progetto; il file di licenza va conservato nella struttura del progetto. Come criterio generale, alcuni caratteri sono gratuiti per l'utilizzo web ma non per l'inclusione in applicazioni o in marchi: la licenza va verificata prima dell'adozione di ogni nuovo carattere.

#### 8.2 Immagini a corredo delle notizie aggregate

Le fonti dell'aggregazione sono i siti istituzionali dell'alleanza e degli atenei: comunicazioni su bandi, call e iniziative, di titolarità delle università stesse. Il profilo di rischio dei **testi** è pertanto contenuto: si tratta di comunicazioni che gli enti hanno interesse a veder diffuse, e l'aggregazione con collegamento alla fonte ne asseconda la funzione.

Il profilo residuo riguarda le **immagini**. I siti istituzionali impiegano di frequente fotografie di repertorio acquisite da banche immagini con licenza intestata all'ateneo: tale licenza copre l'utilizzo da parte dell'ateneo sul proprio sito e **non si estende a chi ripubblica altrove**. Le banche immagini dispongono di sistemi automatizzati di individuazione degli utilizzi non licenziati e di prassi consolidate di richiesta di pagamento. Il rischio, pur ridotto rispetto all'aggregazione di testate giornalistiche, non è azzerato e ha la caratteristica di attivarsi senza che alcuno debba accorgersi del servizio.

**Adempimento.** L'aggregazione riporta titolo, ente di provenienza, estratto ridotto e collegamento alla fonte. Le immagini dei siti di origine non vengono copiate sull'infrastruttura del servizio: l'elemento visivo, ove necessario, è generato dall'applicazione (colore, simbolo, sigla dell'ateneo) oppure costituito da materiale grafico di cui l'alleanza autorizzi espressamente il riuso.

#### 8.3 Elaborazione di contenuti video tramite strumenti di terzi

Vanno distinti tre livelli, con profili di rischio diversi.

**Primo livello — incorporazione e fruizione.** L'incorporazione dei video mediante il componente di riproduzione ufficiale, con i sottotitoli che la piattaforma stessa espone, è conforme alle condizioni d'uso. Nessun profilo di rischio.

**Secondo livello — elaborazione tramite lo strumento di sintesi, in uso manuale.** Lo strumento di sintesi impiegato accetta ufficialmente i collegamenti video come fonte: l'inserimento di un collegamento e l'elaborazione dei relativi contenuti costituiscono funzioni previste dal prodotto. L'uso manuale è pertanto conforme. Nessun profilo di rischio.

**Terzo livello — automazione dello strumento tramite interfacce non ufficiali.** L'invocazione programmatica dello strumento attraverso interfacce non pubblicate — necessaria per l'alimentazione automatica da un pannello di controllo — non è prevista dalle condizioni d'uso del prodotto. I profili di rischio sono due, entrambi operativi e non giudiziali: la **fragilità** (una modifica interna al prodotto interrompe il processo senza preavviso) e la **limitazione dell'account** utilizzato per l'automazione, in caso di rilevamento di traffico anomalo. Vi si aggiunge il profilo reputazionale in sede di valutazione tecnica istituzionale, ove l'automazione non ufficiale risulti parte dell'infrastruttura presentata.

**Adempimento.** I livelli primo e secondo non richiedono misure. Il terzo resta circoscritto agli strumenti interni di sperimentazione, su contenuti liberamente accessibili, con esclusione di qualunque impiego nell'infrastruttura oggetto di presentazione istituzionale e di qualunque trattamento di dati personali. Per l'eventuale messa in esercizio, il passaggio a interfacce ufficiali — dello stesso prodotto o di un servizio di modello linguistico ordinario, sufficiente per la generazione di materiali a partire da trascrizioni — va previsto nella documentazione tecnica.

#### 8.4 Marchi e identità visiva

La denominazione dell'alleanza, il relativo segno grafico e gli stemmi degli otto atenei costituiscono marchi la cui tutela è esercitata dai rispettivi titolari, che sono tenuti a esercitarla per non comprometterne la validità. Ciascun ateneo dispone di un manuale di identità visiva con prescrizioni vincolanti.

Il profilo di rischio è attualmente contenuto in ragione dell'assenza di finalità commerciale, di indicizzazione e di rilevanza esterna. Aumenta significativamente in presenza di attività promozionale, di corrispettivi o di possibile confusione con canali ufficiali.

**Adempimenti immediati.**
- Dicitura in calce a ogni pagina, in lingua inglese: *"Independent prototype. Not an official service of ERUA or of its member universities. All trademarks belong to their respective owners."*
- Esclusione dall'indicizzazione.

**Adempimento strutturale.** Sezione 10.2.

**In sede di primo confronto istituzionale**, la richiesta va formulata come quesito sulle modalità di presentazione del progetto in fase preliminare, anziché come richiesta di autorizzazione all'uso del marchio.

#### 8.5 Identificazione dei contenuti generati automaticamente

**Quadro temporale.** Il regolamento europeo sull'intelligenza artificiale è in vigore dall'agosto 2024 con applicazione progressiva. Le modifiche approvate nella primavera 2026 hanno differito alcuni termini.

| Termine | Contenuto |
|---|---|
| **2 agosto 2026** | Obblighi di **trasparenza**. Termine non differito. |
| 2 dicembre 2026 | Ulteriori divieti; estensione degli obblighi di trasparenza ai sistemi preesistenti |
| **2 dicembre 2027** | Obblighi relativi ai sistemi **ad alto rischio**, differiti dall'originario agosto 2026 |

**Qualificazione del sistema.** L'allegato relativo ai sistemi ad alto rischio comprende il settore dell'istruzione limitatamente a specifici impieghi: determinazione dell'accesso o dell'ammissione, **valutazione dei risultati dell'apprendimento**, determinazione del livello di istruzione appropriato, sorveglianza durante le prove.

I quiz previsti hanno funzione di autovalutazione: l'esito non viene trasmesso né utilizzato per alcuna determinazione. Il sistema non ricade pertanto nella categoria ad alto rischio.

**Condizioni da mantenere per la permanenza fuori dalla categoria:**
1. L'esito dei quiz non lascia il dispositivo dell'utente e non è accessibile a docenti o amministratori.
2. Assenza di graduatorie e di comparazioni fra utenti fondate sui risultati di apprendimento. Eventuali meccanismi di ingaggio possono fondarsi su partecipazione, costanza e contributi, non su risultati di apprendimento comparati.
3. Assenza di funzioni che orientino decisioni di valutazione, ammissione o indirizzamento.

L'eventuale richiesta, da parte di un docente, di accesso ai risultati dei propri studenti va declinata o soddisfatta esclusivamente mediante dati aggregati e non riferibili. L'accoglimento in forma individuale determinerebbe l'applicazione integrale del regime dei sistemi ad alto rischio: documentazione tecnica, valutazione di conformità, sorveglianza umana documentata e registrazione in banca dati europea.

**Adempimenti entro il 2 agosto 2026.**
1. Identificazione visibile e non ambigua di ogni contenuto generato automaticamente, apposta sull'elemento e non nei soli termini d'uso.
2. In presenza di sistemi conversazionali, informazione all'utente sulla natura automatica dell'interlocutore.
3. Pagina informativa sulle modalità di generazione dei materiali, sui relativi limiti e sulla necessità di verifica.

Il terzo adempimento coincide con il requisito di attendibilità scientifica dei materiali: ciascun contenuto generato riporta fonte, data, sistema utilizzato e indicazione di contenuto non verificato, con canale di segnalazione degli errori.

#### 8.6 Dichiarazioni non sostenibili

Le dichiarazioni contenute nell'informativa hanno natura vincolante.

| Dichiarazione | Ragione dell'inesattezza | Formulazione corretta |
|---|---|---|
| Cifratura punto a punto | non implementata, e incompatibile con gli obblighi di ostensione all'autorità e con la gestione delle segnalazioni | vedi infra |
| Dati che non lasciano l'Unione europea | la conservazione è europea, ma il fornitore può accedervi da paesi terzi per attività di assistenza | "i dati sono conservati nell'Unione europea; il fornitore può accedervi per finalità di assistenza sulla base di [clausole contrattuali]" |
| Cancellazione immediata | le copie di sicurezza hanno rotazione periodica | "il dato è rimosso anche dalle copie di sicurezza entro [n] giorni" |

**Formulazione per la messaggistica:** *"I messaggi privati non sono oggetto di lettura né di analisi. Sono conservati in forma cifrata e accessibili esclusivamente su segnalazione dell'utente o su richiesta dell'autorità giudiziaria. Sono cancellati automaticamente decorsi sei mesi."*

#### 8.7 Licenze delle componenti software

Alcune licenze di software libero impongono a chi le incorpora il rilascio dell'intera opera derivata con la medesima licenza. L'utilizzo di componenti soggette a tali licenze all'interno del motore comporterebbe l'impossibilità di concederlo in licenza e di replicarlo presso altri soggetti.

**Adempimento.** Ammissione delle sole licenze permissive e verifica automatica delle licenze delle componenti introdotte.

### PRIORITÀ MEDIA

#### 8.8 Materiali didattici ad accesso aperto

Le trascrizioni dei corsi ad accesso aperto attualmente impiegate sono rilasciate con licenza che impone attribuzione, utilizzo non commerciale e condivisione con la medesima licenza. Quest'ultima clausola può estendersi alle opere che le incorporano.

**Adempimento.** Attribuzione visibile nell'interfaccia e non limitata al codice. La clausola di non commercialità va riconsiderata in caso di evoluzione verso un servizio a titolo oneroso.

#### 8.9 Aggregazione di notizie

L'ordinamento europeo tutela l'investimento nella costituzione di banche dati, indipendentemente dalla proteggibilità delle singole informazioni. L'estrazione sistematica di una parte sostanziale di una raccolta altrui può interferire con tale tutela anche in presenza di contenuti costituiti da notizie di cronaca.

**Adempimento.** Titolo, estratto di lunghezza contenuta, collegamento alla fonte, indicazione della testata. Rispetto delle indicazioni per i sistemi automatici presenti sui siti di origine. Frequenza di acquisizione giornaliera. Identificazione del processo automatico con denominazione e recapito.

Il valore aggiunto del servizio consiste nell'aggregazione multilingue di fonti distinte, non nella sostituzione della fonte: il rispetto della prescrizione coincide quindi con la corretta impostazione del prodotto.

#### 8.10 Immagini raffiguranti persone identificabili

Le immagini che ritraggono persone identificabili costituiscono dati personali e sono soggette alla tutela del diritto all'immagine.

**Adempimento.** In fase di sviluppo l'utilizzo è compatibile con la destinazione dimostrativa. All'attivazione del servizio è necessaria l'acquisizione delle liberatorie, di norma detenute dalla redazione che ha originariamente pubblicato le immagini, ovvero la sostituzione dei ritratti.

### PRIORITÀ CONTENUTA

#### 8.11 Materiali della rivista studentesca, contenuti audio istituzionali, corsi ad accesso aperto

Si tratta di contenuti pubblicati apertamente dagli enti di riferimento, in un'installazione non indicizzata e destinata alla dimostrazione funzionale. Il profilo di rischio è contenuto e il valore dimostrativo è elevato: la valutazione del prodotto da parte di terzi richiede contenuti reali.

**Adempimento.** Attribuzione completa — autore, numero della pubblicazione, collegamento all'originale — e indicazione di un recapito per le richieste di rimozione. L'acquisizione dell'autorizzazione formale della redazione è opportuna ma non costituisce condizione preliminare allo sviluppo.

#### 8.12 Strumenti interni di sperimentazione

Gli strumenti eseguiti su infrastruttura propria, su contenuti propri e senza diffusione esterna non rientrano nell'ambito di applicazione del presente documento.

#### 8.13 Materiali forniti dai docenti

L'inserimento di materiali didattici avviene su caricamento o autorizzazione espressa del titolare, con facoltà di revoca.

La revoca comporta la rimozione dei materiali derivati — sintesi, schede, quiz generati a partire dalla fonte — e non del solo originale. Il requisito va previsto nella struttura dei dati: ogni materiale generato mantiene il riferimento alla fonte di origine, in assenza del quale la revoca non è eseguibile.

I materiali già acquisiti sui dispositivi degli utenti non sono recuperabili. La circostanza va rappresentata al titolare in sede di acquisizione dell'autorizzazione.

---
## 9. ATTIVAZIONE DEL SERVIZIO

Procedura applicabile dal momento della registrazione del primo utente diverso dallo sviluppatore. Poiché il software è già completo, la procedura consiste in verifiche e pubblicazioni.

### 9.1 Presupposti istituzionali

**Designazione del titolare del trattamento.** Un ente — l'alleanza o un ateneo — assume per iscritto la qualità di titolare del trattamento dei dati personali. Il titolare determina finalità e modalità del trattamento e risponde nei confronti dell'autorità di controllo. Lo sviluppatore assume la qualità di responsabile del trattamento, operando su istruzione documentata.

L'assunzione della titolarità da parte dello sviluppatore non costituisce ipotesi praticabile: nessun ateneo può consentire che i dati dei propri studenti siano trattati su infrastrutture intestate a un privato. La proposta di un assetto conforme costituisce elemento di qualificazione professionale nell'interlocuzione.

*Elemento di attenzione.* L'assunzione di decisioni autonome sulle finalità del trattamento determina la qualifica di **contitolare**, indipendentemente dalla denominazione adottata nel contratto: la qualificazione discende dalla sostanza del rapporto. L'introduzione di funzioni che comportino il trattamento di nuove categorie di dati va pertanto comunicata al titolare.

**Designazione del referente per la moderazione.** Nominativo e casella funzionale, non recapito personale. La valutazione dell'illiceità di un contenuto presuppone la conoscenza dell'ordinamento applicabile, che varia fra gli Stati dell'alleanza: la funzione va pertanto distribuita per ateneo.

**Autorizzazione all'utilizzo della denominazione e dei marchi** (8.4).

### 9.2 Basi giuridiche del trattamento

| Trattamento | Base giuridica | Note |
|---|---|---|
| Indirizzo istituzionale per l'accesso | esecuzione del contratto | il consenso non è richiesto per l'erogazione del servizio richiesto |
| Contenuti pubblici | esecuzione del contratto | costituiscono il servizio |
| Messaggistica privata | esecuzione del contratto | |
| Segnalazioni e decisioni di moderazione | obbligo legale e legittimo interesse | la conservazione prescinde dalla volontà del segnalato |
| Notifiche relative al servizio | esecuzione del contratto | limitatamente a quelle transazionali |
| Comunicazioni promozionali | **consenso** | autonomo, revocabile, con disiscrizione immediata |
| Statistiche di utilizzo | legittimo interesse, se effettivamente anonime | i dati aggregati non riferibili esulano dall'ambito di applicazione |
| Immagini di persone identificabili | consenso | 8.10 |

*Criterio.* Il consenso costituisce la base giuridica meno idonea per i trattamenti necessari all'erogazione del servizio, in quanto revocabile in qualunque momento e soggetto a onere di documentazione. Va riservato ai trattamenti effettivamente facoltativi.

### 9.3 Documentazione da pubblicare

Predisposta preventivamente, pubblicata all'attivazione.

**Informativa sul trattamento dei dati.** Identità e recapiti del titolare, recapiti del responsabile della protezione dei dati, categorie di dati, finalità, basi giuridiche, periodi di conservazione, destinatari, eventuali trasferimenti extraeuropei, diritti degli interessati e modalità di esercizio, facoltà di reclamo all'autorità di controllo.

**Termini d'uso.** Requisiti di accesso, condotte vietate, conseguenze delle violazioni, assetto proprietario, limitazioni di responsabilità, legge applicabile.
La clausola relativa ai contenuti immessi dagli utenti prevede che l'utente **conservi la titolarità** dei contenuti; conceda una **licenza non esclusiva e gratuita, limitata alle finalità del servizio** (visualizzazione, conservazione, traduzione, moderazione); **garantisca la disponibilità dei diritti** sui contenuti immessi, tenendo indenne il gestore in caso contrario. Quest'ultima previsione costituisce il presidio nei confronti delle immissioni di materiale altrui.

**Regolamento della comunità.** Formulazione accessibile con esemplificazioni.

**Dichiarazione di accessibilità** con indicazione delle non conformità residue e recapito per le segnalazioni.

Tutta la documentazione va resa disponibile nelle lingue in cui il servizio è erogato, o quantomeno in lingua inglese con individuazione della versione facente fede.

**Modifiche.** È necessario un registro delle versioni e una comunicazione agli utenti in caso di modifiche sostanziali, con congruo preavviso.

### 9.4 Cookie e strumenti di tracciamento

La normativa europea subordina l'installazione di strumenti non necessari all'acquisizione di un consenso espresso e granulare. Gli strumenti tecnici necessari al funzionamento ne sono esclusi.

In presenza delle misure descritte alle sezioni 6.4 e 8.1 — assenza di strumenti di profilazione, caricamento differito dei componenti di riproduzione, ospitalità locale delle risorse — **il servizio non installa strumenti non necessari** e non richiede pertanto un modulo di raccolta del consenso, ma una sola informativa. La semplificazione costituisce un'ulteriore ragione a sostegno di tali misure.

L'eventuale necessità di rilevazioni statistiche va soddisfatta con strumenti che non impieghino cookie e non effettuino profilazione.

### 9.5 Moderazione e obblighi in materia di contenuti

La disciplina europea sui servizi digitali si applica ai prestatori che ospitano contenuti di terzi. Gli obblighi rafforzati — relazioni di trasparenza, sistemi interni di reclamo, risoluzione extragiudiziale — riguardano le piattaforme di dimensioni rilevanti, con esclusioni espresse per i soggetti di ridotte dimensioni. Gli obblighi di base si applicano a ogni prestatore.

**Adempimenti effettivamente richiesti:**
1. Funzione di segnalazione accessibile su ogni contenuto.
2. Registro delle segnalazioni con data, contenuto, motivazione, decisione, soggetto decidente e data della decisione, non modificabile.
3. Riscontro motivato sia al segnalante sia al soggetto destinatario del provvedimento.
4. Termine di riscontro dichiarato. Il termine di un giorno lavorativo costituisce un parametro adeguato.
5. Recapito pubblico per le questioni di sicurezza e di contenuto.

L'esenzione di responsabilità opera fino al momento dell'acquisizione della conoscenza effettiva: la ricezione di una segnalazione circostanziata non seguita da intervento la fa venire meno. Il registro e il rispetto dei termini assumono pertanto rilievo prevalente rispetto alla formulazione delle regole.

**Procedure di trattazione prioritaria**, da definire preventivamente:
- **Rischio per l'incolumità di una persona** (condotte autolesive, minacce): trattazione immediata al di fuori della coda ordinaria, con riscontro predisposto contenente i riferimenti dei servizi di sostegno del paese dell'utente.
- **Materiale soggetto a obbligo di segnalazione**: conservazione, astensione dalla cancellazione, trasmissione immediata al referente istituzionale.
- **Provvedimenti dell'autorità giudiziaria**: trasmissione al titolare del trattamento.

### 9.6 Modalità di accesso dimostrativa

Le presentazioni a organi accademici e a commissioni di valutazione non consentono l'espletamento della procedura di verifica tramite posta istituzionale. È pertanto necessaria una modalità di accesso dimostrativa: accesso immediato a un profilo precaricato, con contenuti già presenti, abilitato alla consultazione integrale e alla pubblicazione.

La funzione va sviluppata contestualmente al resto dell'applicazione.

La marcatura dei dati di collaudo (4.7d) consente la rimozione selettiva dei dati di sviluppo all'attivazione, con permanenza dei dati necessari alla modalità dimostrativa.

### 9.7 Funzioni corrispondenti ai diritti degli interessati

Sei funzioni, corrispondenti ad altrettanti diritti. Vanno progettate contestualmente alla struttura dei dati: una struttura che non consenta di individuare l'insieme dei dati riferiti a un soggetto richiede una riprogettazione.

| Funzione | Diritto corrispondente |
|---|---|
| Esportazione integrale dei dati in formato leggibile | accesso e portabilità |
| Modifica dei dati di profilo | rettifica |
| Cancellazione dell'account con anonimizzazione dei contenuti | cancellazione |
| Disattivazione delle notifiche | opposizione |
| Sospensione dell'account con mantenimento della visibilità | limitazione |
| Registro e riscontro delle segnalazioni | obblighi in materia di contenuti |

Il termine di riscontro è di un mese dalla richiesta.

### 9.8 Valutazione d'impatto

La valutazione d'impatto sulla protezione dei dati è richiesta in presenza di trattamenti che presentino un rischio elevato. Il trattamento in esame presenta almeno tre elementi rilevanti: dimensione significativa, interessati in posizione di soggezione rispetto all'istituzione con possibile presenza di minori, combinazione di insiemi di dati di origine diversa.

La valutazione compete al titolare, sulla base della documentazione tecnica fornita dal responsabile. La disponibilità preventiva di tale documentazione — categorie di dati, collocazione, periodi di conservazione, soggetti abilitati, rischi individuati, misure adottate — riduce sensibilmente i tempi.

**Documentazione da predisporre.** Registro dei trattamenti (una voce per tipologia: finalità, categorie di dati, destinatari, trasferimenti, termini, misure), schema dei flussi, elenco dei fornitori, termini di conservazione, misure di sicurezza. Il registro va istituito immediatamente, anche in forma essenziale.

### 9.9 Termini di conservazione

Da definire preventivamente alla progettazione della struttura dei dati.

| Categoria | Termine | Effetto |
|---|---|---|
| Account inattivo | 24 mesi dall'ultimo accesso | preavviso e successiva cancellazione o anonimizzazione |
| Contenuti pubblici | fino a cancellazione da parte dell'autore | anonimizzazione in caso di cancellazione dell'account |
| Messaggistica privata | 6 mesi | cancellazione, salvo quanto previsto alla voce B.9 |
| Registri tecnici contenenti indirizzi IP | 30 giorni | cancellazione automatica |
| Segnalazioni e decisioni di moderazione | 24 mesi | conservazione a fini difensivi |
| Copie di sicurezza | 35 giorni, con rotazione | **da indicare nell'informativa** |
| Materiali derivati da fonti dei docenti | fino a revoca | cancellazione dei derivati |

*Elemento di attenzione.* L'esercizio del diritto di cancellazione non comporta la rimozione immediata dalle copie di sicurezza, che avviene alla rotazione. La circostanza è ammessa ma va dichiarata (P8).

### 9.10 Procedura in caso di violazione dei dati

Da redigere su supporto autonomo rispetto al sistema, in quanto il sistema può essere l'oggetto della compromissione.

- Il titolare notifica all'autorità di controllo entro **72 ore** dalla conoscenza.
- Il responsabile informa il titolare **senza ingiustificato ritardo**: il termine non è di 72 ore.
- In presenza di rischio elevato per gli interessati, questi vanno informati.

**Elementi da predisporre preventivamente:**
1. Recapito unico presso l'ente, indicato nel contratto.
2. Modello di comunicazione predisposto: natura dell'evento, data, categorie di dati, numero di interessati, misure adottate.
3. Capacità di ricostruzione degli accessi. In assenza dei registri di cui alla sezione 5.11 la ricostruzione non è possibile.
4. Funzione di commutazione in sola lettura (5.12).

### 9.11 Utenti minori di età

Impostazione adottata: acquisizione della sola dichiarazione di maggiore età, conservazione del solo esito, esclusione della messaggistica privata e dello scambio di recapiti per i minori, con accesso limitato all'interazione pubblica.

L'impostazione è più restrittiva del minimo richiesto in ciascuno degli Stati dell'alleanza e consente pertanto un'unica implementazione. L'età per il consenso digitale varia infatti fra i tredici e i sedici anni fra gli Stati, e in diversi ordinamenti l'accesso all'istruzione universitaria avviene a diciassette anni.

La dichiarazione non costituisce verifica: la circostanza va indicata nei termini d'uso, unitamente alla disciplina applicabile in caso di dichiarazione non veritiera, che prevede la sospensione e non la cancellazione immediata, necessaria alla gestione di eventuali segnalazioni.

### 9.12 Accessibilità

**L'adozione formale di uno strumento digitale non accessibile non è consentita a un ente pubblico.** Il requisito non ha natura di raccomandazione ma di condizione.

La disciplina applicabile è quella relativa all'accessibilità dei siti web e delle applicazioni mobili degli enti pubblici, recepita in ciascuno Stato membro. Essa richiede:

1. Conformità allo standard europeo EN 301 549, che rinvia ai criteri WCAG di livello AA.
2. Pubblicazione di una **dichiarazione di accessibilità** con indicazione delle non conformità residue.
3. Predisposizione di un **meccanismo di segnalazione** delle barriere e di una procedura di riscontro.

**Interventi da eseguire in fase di sviluppo:**

- **Verifica del contrasto cromatico.** Le palette a bassa saturazione presentano frequentemente non conformità. La verifica va eseguita con strumenti di misura e preliminarmente al consolidamento della palette, in quanto la modifica successiva comporta la revisione dell'intera veste grafica.
- **Navigazione da tastiera** su tutti gli elementi interattivi, con indicatore di focus visibile. Ogni interazione basata su gesti richiede un'alternativa da tastiera.
- **Testi alternativi** per immagini, icone e marchi.
- **Struttura semantica** corretta: gerarchia delle intestazioni, elementi appropriati alla funzione.
- **Rispetto della preferenza di riduzione del movimento** espressa a livello di sistema operativo. Le animazioni non disattivabili costituiscono un impedimento effettivo per una parte degli utenti.
- **Sottotitoli** per i contenuti video e **trascrizione** per i contenuti audio. La trascrizione è producibile mediante i processi automatici già previsti, con duplice funzione di accessibilità e di arricchimento dei contenuti.

**Verifica con utenti reali.** La verifica dell'interfaccia mediante utilizzo di lettori di schermo da parte di utenti che ne fanno uso abituale ha valore superiore alle verifiche automatiche e costituisce elemento qualificante in sede di presentazione istituzionale.

---

## 10. ASSETTO CONTRATTUALE

Sezione di riferimento, da consultare in presenza di una proposta contrattuale.

Non costituisce parere legale. L'assistenza di un professionista è necessaria in un solo momento: la presenza di una bozza contrattuale da sottoscrivere.

### 10.1 Sequenza degli adempimenti

L'ordine corretto degli adempimenti è il seguente:

1. L'ente assume la titolarità del trattamento e l'intestazione dell'infrastruttura.
2. Si definisce per iscritto l'oggetto della prestazione.
3. Successivamente, e solo in presenza di corrispettivo, si affrontano gli aspetti fiscali e assicurativi.

L'inversione della sequenza — costituzione della posizione fiscale e assunzione della qualità di responsabile precedentemente alla definizione dell'assetto istituzionale — espone la persona fisica alla responsabilità per il trattamento di dati riferiti a un numero elevato di interessati in più Stati.

**Correlazione fra corrispettivo e limite di responsabilità.** Il massimale di responsabilità si commisura di norma ai corrispettivi percepiti (10.5). L'assenza di corrispettivo nella fase di sviluppo costituisce pertanto anche un elemento di contenimento del rischio.

**Soglie che determinano il mutamento della posizione giuridica:**

| Evento | Conseguenze |
|---|---|
| Registrazione di utenti terzi | qualità di responsabile o titolare del trattamento; qualità di prestatore di servizi di memorizzazione |
| Percezione di corrispettivo | attività economica: inquadramento fiscale, responsabilità contrattuale, disciplina di rendicontazione in presenza di fondi europei |
| Sottoscrizione di contratto | obbligazioni, penali, responsabilità patrimoniale |

### 10.2 Assetto proprietario

**Impostazione adottata:** la denominazione dell'installazione è cedibile all'alleanza; la titolarità del motore software resta in capo allo sviluppatore.

Il motore assume una denominazione autonoma, priva di riferimenti a specifiche alleanze. "ERUA connect" costituisce la denominazione di **una installazione** del motore, concessa in uso. Ulteriori installazioni presso altre alleanze assumeranno denominazioni proprie.

L'impostazione risolve congiuntamente la questione dei marchi (8.4), l'assetto proprietario e la replicabilità del modello.

**Conseguenza tecnica.** Denominazione, marchio, palette, elenco degli atenei, lingue e riferimenti ai testi legali risiedono in un file di configurazione autonomo (4.4).

**Formulazione contrattuale.**

Da escludere: ogni previsione che attribuisca al committente la titolarità dei risultati o che qualifichi l'opera come realizzata su commissione.

Da proporre:
> *"Il Fornitore è e resta titolare esclusivo di tutti i diritti di proprietà intellettuale sul Software, ivi compresi il codice sorgente, l'architettura e la documentazione. Il Fornitore concede al Committente una licenza d'uso non esclusiva e non trasferibile, limitata alle finalità di cui all'art. [oggetto] e per la durata del presente contratto. I dati inseriti dagli utenti e i contenuti prodotti dal Committente restano di titolarità del Committente."*

**Criterio da rappresentare in sede di trattativa:** la titolarità del software resta al fornitore, la titolarità dei dati resta al committente. La distinzione risolve la gran parte delle obiezioni, in quanto l'interesse dell'ente attiene alla disponibilità dei dati e non al codice.

**Effetti della cessazione.** La subordinazione della licenza al pagamento è più tutelante per il fornitore ma incontra resistenza presso gli enti pubblici, esposti al rischio di interruzione del servizio. Soluzione intermedia: licenza perpetua sulla versione in essere alla cessazione, priva di aggiornamenti, con contestuale consegna dei dati.

**Deposito del codice presso terzi.** L'ente può richiedere il deposito del codice sorgente presso un soggetto terzo, con consegna subordinata all'indisponibilità sopravvenuta del fornitore. La richiesta è fondata e la proposizione da parte del fornitore costituisce elemento favorevole nella trattativa, in quanto risolve la criticità di cui alla sezione 13.3 senza cessione della titolarità.

### 10.3 Proprietà intellettuale e finanziamenti europei

Gli atti di concessione dei finanziamenti europei contengono clausole relative alla titolarità dei **risultati** del progetto. Nelle formulazioni ricorrenti i risultati appartengono al beneficiario che li produce, con riserva di diritti di accesso in capo all'ente finanziatore e con obblighi di diffusione, in alcuni casi in regime di apertura.

**Rischio.** Lo sviluppo del software all'interno di un progetto finanziato può comportare l'attribuzione dei relativi diritti al beneficiario — l'ateneo che amministra il finanziamento — e l'assoggettamento a obblighi di pubblicazione incompatibili con la replicabilità presso altri soggetti.

**Misure.**

1. **Sviluppo antecedente e autonomo rispetto a qualunque candidatura.** Le componenti realizzate precedentemente costituiscono materiale preesistente, apportato al progetto con concessione di un diritto d'uso limitato. Le componenti realizzate nell'ambito del progetto sono suscettibili di contestazione.
2. **Documentazione della data di realizzazione.** La cronologia del sistema di controllo di versione costituisce elemento probatorio; il rilascio periodico di versioni numerate e datate lo rafforza.
3. **Dichiarazione espressa in sede di candidatura:** *"La piattaforma costituisce asset preesistente sviluppato dal proponente; il progetto ne prevede l'utilizzo a titolo gratuito per le attività proposte e non finanzia lo sviluppo software."*
4. **Esclusione dello sviluppo software dalle voci di spesa.** Le risorse vanno richieste per le attività: eventi, mobilità, produzione di materiali, coinvolgimento dei partecipanti. La formulazione è inoltre più coerente con le tipologie di spesa ammissibili nei bandi di riferimento.
5. **Esame preventivo delle clausole** relative alla titolarità dei risultati e al materiale preesistente da parte dell'ufficio competente dell'ateneo, prima della sottoscrizione della candidatura.

**Conflitto di interessi.** La contemporanea posizione di studente dell'ateneo e di fornitore o beneficiario di un progetto amministrato dal medesimo ateneo non è preclusa ma è soggetta a dichiarazione. La dichiarazione spontanea costituisce elemento di tutela.

**Divieto di doppio finanziamento.** Le componenti riutilizzate da progetti personali preesistenti vanno dichiarate come tali. La presentazione come nuovi di risultati già finanziati costituisce la contestazione più ricorrente in sede di rendicontazione.

### 10.4 Oggetto e livelli di servizio

**Oggetto.** La clausola deve indicare espressamente le prestazioni **escluse**: formazione degli utenti finali, assistenza di primo livello, produzione di contenuti, migrazione da sistemi preesistenti, integrazioni non elencate, sviluppo di nuove funzionalità.
> *"Sono esclusi dall'oggetto, e potranno formare oggetto di separato accordo, tutti i servizi non espressamente elencati al presente articolo, e in particolare: [elenco]."*

In assenza, l'ampiezza della prestazione è determinata in via interpretativa dal committente.

**Livelli di servizio.**

Da escludere: disponibilità pari o superiore al 99,9 per cento, corrispondente a un'indisponibilità massima inferiore ai quarantacinque minuti mensili, in presenza di dipendenza da fornitori terzi; termini di **risoluzione** garantiti; obblighi di reperibilità continuativa.

Da proporre: disponibilità del 99 per cento su base mensile, con esclusione delle indisponibilità imputabili a fornitori terzi e delle manutenzioni programmate comunicate con quarantotto ore di preavviso; termini di **presa in carico** espressi in giorni lavorativi e differenziati per gravità; penali configurate come riduzione del corrispettivo e non come risarcimento; finestra di manutenzione programmata e periodi con termini estesi, individuati preventivamente.

La fascia oraria di presidio va indicata contrattualmente, tenendo conto dell'eventuale operatività da fuso orario differente.

### 10.5 Limitazione della responsabilità

> *"La responsabilità complessiva del Fornitore per qualsiasi titolo derivante dal presente contratto è limitata all'importo dei corrispettivi effettivamente percepiti nei dodici mesi precedenti l'evento. È in ogni caso esclusa la responsabilità per danni indiretti, perdita di profitto, danni reputazionali e interruzione dell'attività, nonché per pretese di rivalsa relative a sanzioni amministrative."*

L'ordinamento non consente l'esclusione preventiva della responsabilità per dolo o colpa grave: la clausola opera pertanto rispetto agli inadempimenti ordinari.

L'ultima previsione riveste rilievo specifico: le sanzioni dell'autorità di controllo sono irrogate al titolare, che può esercitare rivalsa nei confronti del responsabile in caso di inadempimento di quest'ultimo. La limitazione deve estendersi espressamente a tale ipotesi.

### 10.6 Accordo sul trattamento dei dati

In presenza di trattamento per conto del titolare è obbligatorio un atto scritto con contenuto minimo determinato: oggetto, durata, natura e finalità del trattamento, tipologie di dati e categorie di interessati; obbligo di trattamento su sola istruzione documentata; obbligo di riservatezza; misure di sicurezza; condizioni per il ricorso a sub-responsabili; assistenza al titolare per le richieste degli interessati, per le violazioni e per la valutazione d'impatto; cancellazione o restituzione dei dati al termine del rapporto; messa a disposizione degli elementi necessari alla dimostrazione della conformità e facoltà di verifica.

**Clausole da negoziare:**

- **Autorizzazione generale ai sub-responsabili**, in luogo dell'autorizzazione specifica, con obbligo di comunicazione delle variazioni con trenta giorni di preavviso e facoltà di opposizione motivata del titolare.
- **Limitazione delle verifiche**: una verifica annuale, con trenta giorni di preavviso, in orario lavorativo, a spese del titolare salvo accertamento di violazioni gravi.

L'allegato tecnico relativo alle misure di sicurezza è predisposto dal fornitore. La redazione analitica e veritiera, sulla base della sezione 5, **circoscrive la responsabilità alle misure dichiarate**.

### 10.7 Manleve

**Manleva a favore del committente**, limitata alle pretese di terzi relative alla proprietà intellettuale del software.

**Manleva a favore del fornitore**, relativa ai contenuti immessi dagli utenti, alle decisioni di moderazione assunte dai referenti del committente e all'esecuzione di istruzioni documentate:
> *"Il Committente tiene indenne il Fornitore da ogni pretesa di terzi relativa ai contenuti pubblicati dagli utenti, alle decisioni di moderazione assunte dai referenti del Committente e all'esecuzione di istruzioni documentate impartite dal Committente."*

La seconda clausola non è di norma proposta spontaneamente dal committente e va richiesta.

### 10.8 Durata, recesso, cessazione

- Durata determinata con rinnovo espresso.
- Preavviso di recesso non inferiore a novanta giorni per entrambe le parti.
- Corresponsione dei corrispettivi maturati e dei costi già impegnati in caso di recesso anticipato.
- Clausola di uscita con indicazione di oggetto, formato e termine della consegna, e imputazione dei relativi oneri.
- Procedura di cessazione con cancellazione dei dati dai sistemi del fornitore entro termine determinato e attestazione scritta.
- Clausola di sopravvivenza per riservatezza, proprietà intellettuale, limitazione di responsabilità e obblighi in materia di dati personali.

### 10.9 Legge applicabile e foro competente

La disciplina sulla protezione dei dati personali è contenuta in un regolamento europeo direttamente applicabile: non sussistono discipline nazionali differenziate, salvo margini limitati.

Le differenze fra ordinamenti assumono rilievo in quattro ambiti:

1. **Contratto.** In assenza di clausola di legge applicabile e foro competente, l'individuazione avviene secondo le norme di conflitto, con possibile radicamento della controversia presso un'autorità giurisdizionale straniera. È il profilo di rischio economicamente più rilevante per una persona fisica.
2. **Autorità di controllo.** I reclami sono proposti all'autorità dello Stato dell'interessato, con successiva cooperazione. Ulteriore ragione della necessaria titolarità in capo all'ente.
3. **Qualificazione dell'illiceità dei contenuti**, che varia fra ordinamenti. Fondamento della distribuzione della moderazione per ateneo.
4. **Disciplina fiscale**, in caso di corrispettivo erogato da ente estero.

**Clausola da richiedere:**
> *"Il presente contratto è regolato dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di [sede]."*

In caso di indisponibilità della controparte, costituisce alternativa accettabile la clausola di mediazione preventiva in sede europea.

**Criterio.** In presenza di foro straniero e di corrispettivo contenuto, il rapporto non presenta un profilo di rischio proporzionato.

### 10.10 Clausole da non sottoscrivere

1. Accordi di partenariato con responsabilità solidale.
2. Cessione della proprietà intellettuale sul motore.
3. Livelli di disponibilità superiori al 99 per cento o obblighi di reperibilità continuativa.
4. Responsabilità priva di massimale.
5. Foro straniero in assenza di adeguata contropartita.
6. Clausole di esclusiva o di non concorrenza che precludano la replicabilità del modello presso altri soggetti.
7. Previsioni che attribuiscano al fornitore la titolarità del trattamento.

### 10.11 Corrispettivi

Ordini di grandezza di riferimento.

| Formula | Ordine di grandezza | Osservazioni |
|---|---|---|
| Inquadramento accademico (assegno o collaborazione) | 🕐 da verificare | La finalità di tali contratti è la ricerca, non la gestione sistemistica |
| Canone di sola manutenzione | 1.000–1.500 € mensili | fascia inferiore |
| Canone comprensivo di sviluppo evolutivo | 2.000–2.500 € mensili | corrispondente ai valori di mercato; non proponibile come richiesta iniziale |
| Affidamento a società esterna | 5.000–8.000 € mensili | utile come termine di comparazione |
| Attivazione una tantum | 4.000–6.000 € | struttura corretta: separazione fra attivazione e canone |

L'impostazione corretta prevede la separazione fra **attivazione** (corrispettivo una tantum) e **gestione** (canone), con imputazione dei costi infrastrutturali al committente.

La formulazione della richiesta economica presuppone l'avvenuta adozione della piattaforma e la disponibilità di dati di utilizzo.

🕐 I dati relativi ai bilanci delle alleanze universitarie vanno verificati sui documenti pubblici prima di qualunque utilizzo in sede di presentazione.

### 10.12 Aspetti fiscali e assicurativi

In assenza di corrispettivo non sussistono adempimenti.

Alla presenza di corrispettivo: la prestazione occasionale è soggetta a soglia annua oltre la quale sorgono obblighi contributivi; il rapporto continuativo richiede inquadramento autonomo; il corrispettivo erogato da ente di altro Stato membro comporta adempimenti specifici per le operazioni transfrontaliere fra soggetti economici.

Va inoltre verificata preventivamente la compatibilità con eventuali rapporti in corso soggetti a disciplina propria in materia di cumulo.

La copertura assicurativa per responsabilità civile professionale è necessaria dalla sottoscrizione del contratto. Deve comprendere espressamente i danni da violazione di dati personali e da interruzione del servizio, nonché l'attività svolta dall'estero.

---
## 11. RISCHI PREVALENTI

### 11.1 Errore dello sviluppatore
Trattato alle sezioni 5.1 e 5.12. Costituisce lo scenario a più elevata probabilità.

### 11.2 Mancata formazione di una massa critica di utenti
Costituisce il rischio più probabile in assoluto, superiore a qualunque rischio tecnico o giuridico: accesso iniziale determinato dalla curiosità, assenza di contenuti nuovi, abbandono.

Contromisure di prodotto:
- **Una parte dei contenuti non deve dipendere dall'attività degli utenti** — notizie, bandi, corsi, materiali audio. Tale componente mantiene valore anche in assenza di attività della comunità.
- **Notifiche per posta elettronica in caso di risposta.** Un contenuto la cui risposta non è notificata non produce interazione.
- **Cadenza di iniziative** che determini un motivo ricorrente di accesso.
- **L'indicatore di risultato non è il numero di iscritti** ma il numero di gruppi costituiti e di candidature presentate.

### 11.3 Dipendenza da un unico soggetto
Nessuna struttura informatica di ateneo adotta in via definitiva una piattaforma la cui continuità dipenda da una sola persona. L'obiezione è fondata e va anticipata.

1. **Documentazione tecnica** che consenta la prosecuzione da parte di terzi: architettura, collocazione delle componenti, procedura di pubblicazione, procedura di ripristino, servizi esterni e relativa intestazione, elenco degli account.
2. **Leggibilità del codice.** Il codice prodotto con l'ausilio di sistemi automatici tende alla correttezza formale e alla scarsa leggibilità: la tendenza va corretta, in quanto la leggibilità costituisce presupposto dell'adottabilità.
3. **Deposito del codice presso terzi** (10.2) o repository di ateneo in sola lettura.
4. **Procedura di continuità** documentata.

La documentazione costituisce l'elemento che qualifica la posizione professionale nel confronto istituzionale.

### 11.4 Debito tecnico
Lo sviluppo accelerato produce codice funzionante ma non ordinato, con conseguente aumento progressivo del costo di ogni modifica successiva.

Criterio operativo: al completamento di ciascuna sezione, intervento di riordino prima dell'avvio della successiva.

---

## 12. RIEPILOGO OPERATIVO

### 12.1 Decisioni assunte

| Data | Decisione |
|---|---|
| 6 ago 2026 | I progetti personali preesistenti restano esclusi dalle candidature e distinti dalla piattaforma |
| 6 ago 2026 | La titolarità del trattamento è attribuita all'alleanza o a un ateneo |
| 6 ago 2026 | La moderazione è distribuita per ateneo |
| 6 ago 2026 | Accesso mediante indirizzo istituzionale; consultazione libera senza registrazione |
| 6 ago 2026 | Messaggistica subordinata ad accettazione reciproca, con termine di conservazione |
| 6 ago 2026 | Acquisizione della sola dichiarazione di maggiore età; limitazioni per i minori |
| 8 ago 2026 | Quiz con funzione di sola autovalutazione; materiali didattici previo consenso del docente |
| 8 ago 2026 | Strumenti di sperimentazione confinati all'ambito interno |
| 8 ago 2026 | Sviluppo integrale del prodotto; unico passaggio di stato all'atto della prima registrazione di un utente terzo |
| 8 ago 2026 | Architettura: processi automatici su server dedicato, file di dati, applicazione statica, servizio gestito in regione europea |
| 8 ago 2026 | Esclusione dei sistemi documentali proprietari e dei framework applicativi |
| 8 ago 2026 | Utilizzo dei contenuti istituzionali pubblici in fase dimostrativa, con attribuzione |
| 8 ago 2026 | Assetto proprietario: cessione della denominazione dell'installazione, mantenimento della titolarità del motore |
| 8 ago 2026 | Interfaccia in lingua inglese con strumento di traduzione integrato |

### 12.2 Decisioni da assumere

| Oggetto | Elemento condizionato | Termine |
|---|---|---|
| Denominazione del motore | file di configurazione, dominio di posta | precedentemente alla suddivisione del codice |
| Dominio da registrare | reputazione del mittente di posta | precedentemente allo sviluppo delle notifiche |
| Eventuale candidatura a bandi | formulazione delle clausole di cui alla sezione 10.3 | secondo scadenze dei bandi |

### 12.3 Deroghe

Le deroghe consapevoli alle regole permanenti vanno annotate con data, motivazione e termine di rientro.

| Data | Regola | Motivazione | Rientro |
|---|---|---|---|
| | | | |

### 12.4 Interventi da eseguire sull'installazione corrente

Interventi a costo nullo, in ordine di priorità:

1. Verifica automatica dell'assenza di segreti precedentemente a ogni pubblicazione (7.6).
2. Ospitalità locale dei caratteri tipografici (8.1).
3. Sostituzione dei componenti di riproduzione incorporati con anteprime a caricamento differito (6.4).
4. Esclusione dall'indicizzazione (2).
5. Dicitura relativa alla natura non ufficiale del prototipo (8.4).
6. Configurazione delle intestazioni di sicurezza (5.8).
7. Verifica del contrasto cromatico precedentemente al consolidamento della palette (9.12).

### 12.5 Quesiti da porre in sede di primo confronto istituzionale

1. Individuazione del titolare del trattamento dei dati degli studenti.
2. Individuazione dei referenti per la moderazione, dei termini di riscontro e della responsabilità delle decisioni.
3. Modalità di formalizzazione dell'assetto proprietario del software e della licenza d'uso.
4. Modalità di presentazione del progetto in fase preliminare e condizioni di utilizzo della denominazione.
5. Intestazione e imputazione dei costi dell'infrastruttura, con indicazione della procedura interna.
6. Referenti delle strutture informatica e legale, ed elementi necessari alla formulazione dei rispettivi pareri.
7. Individuazione dell'ateneo capofila e del relativo responsabile della protezione dei dati.
8. Soggetto competente alla verifica di conformità in materia di accessibilità e obblighi applicabili.

I quesiti attengono alle condizioni ordinarie di adozione di uno strumento digitale da parte di un ente pubblico. La loro formulazione preventiva costituisce elemento di qualificazione dell'interlocuzione.

---

## APPENDICE A — VALUTAZIONE DELLE INDICAZIONI RACCOLTE IN FASE ISTRUTTORIA

La presente appendice riporta la valutazione analitica delle indicazioni tecniche e giuridiche acquisite nella fase istruttoria preliminare, con indicazione per ciascuna dell'esito della verifica e del rinvio alla sezione competente.

### A.1 Utilizzo di interfacce non ufficiali

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.1.1 | Le interfacce non ufficiali sono soggette a interruzione non preavvisata | ✅ | Riferito alla sola automazione (terzo livello di cui alla sezione 8.3): una modifica interna al servizio determina l'interruzione del processo senza preavviso |
| A.1.2 | Un consorzio universitario non può approvare software che violi le condizioni d'uso di terzi | ✅ | Costituisce la motivazione prevalente. Elemento ostativo in sede di valutazione tecnica |
| A.1.3 | Rischio di limitazione dell'accesso per superamento delle soglie | ✅ | Con la precisazione che la generazione avviene in modalità differita e non su richiesta dell'utente: il rischio riguarda l'utenza di sviluppo |
| A.1.4 | Utilizzo in fase dimostrativa con dichiarazione del passaggio a interfacce ufficiali in produzione | ⚠️ | L'impostazione è corretta, con la precisazione dei tre livelli di cui alla sezione 8.3: fruizione ed elaborazione manuale sono conformi; il profilo di rischio riguarda esclusivamente l'automazione tramite interfacce non ufficiali, da confinare agli strumenti interni |
| A.1.5 | Costi delle licenze del prodotto di riferimento | 🕐 | Da verificare. Si segnala inoltre che il prodotto citato è destinato a un utilizzo interattivo: per una generazione automatizzata di materiali a partire da trascrizioni è sufficiente un'interfaccia di modello linguistico ordinaria, di costo inferiore e priva di soglie minime di licenza |

### A.2 Controllo automatico della sicurezza del codice

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.2.1 | Articolazione in tre fasi: rilevazione deterministica, generazione della correzione, verifica e approvazione | ✅ | Recepita integralmente alla sezione 7 |
| A.2.2 | Inefficacia della sottoposizione periodica dell'intera base di codice | ✅ | |
| A.2.3 | Principio: proposta automatica, verifica automatica, approvazione umana | ✅ | Vincolante |
| A.2.4 | Gli strumenti di analisi statica individuano la totalità delle vulnerabilità | ❌ | **Errore rilevante.** Gli strumenti individuano esclusivamente le occorrenze corrispondenti alle proprie regole. Non rilevano difetti di logica applicativa, errori di configurazione né politiche di accesso inadeguate. La vulnerabilità di cui alla sezione 5.2 appartiene alla categoria non rilevabile. Conseguenza: necessità del collaudo manuale. Sezione 7.7 |
| A.2.5 | Percentuale di correttezza delle correzioni generate | ⚠️ | Dato privo di fonte. Il principio è fondato; il valore non è utilizzabile in documentazione |
| A.2.6 | Rischio di indicazione di componenti inesistenti | ✅ | Rischio effettivo. Contromisura alla sezione 7.3 |
| A.2.7 | Necessità di rilevare i segreti prima dell'invio a servizi esterni | ✅ | L'ordine delle fasi è vincolante |
| A.2.8 | Stima dei costi | 🕐 | Corretta nell'impostazione, da verificare nei valori |

### A.3 Protezione dei dati

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.3.1 | Non conservare credenziali | ✅ | Regola P1 |
| A.3.2 | Autenticazione federata di ateneo | ⚠️ | **Elemento omesso rilevante.** Le federazioni di identità accademiche ammettono quali fornitori di servizio le organizzazioni, non le persone fisiche. L'adesione presuppone un ente che risponda del servizio. La soluzione praticabile in fase iniziale è il collegamento monouso su indirizzo istituzionale con elenco chiuso dei domini, i cui limiti — mancata verifica del permanere dell'iscrizione e del ruolo — vanno dichiarati. Sezione 5.3 |
| A.3.3 | Algoritmi di derivazione delle credenziali | ✅ | Corretto sotto il profilo tecnico, non applicabile in assenza di credenziali conservate |
| A.3.4 | Cifratura punto a punto rispetto a cifratura lato server | ✅ | Analisi e conclusione corrette. Va aggiunta la conseguenza sul piano dichiarativo: sezione 8.6 |
| A.3.5 | Cifratura in transito e a riposo, gestione separata delle chiavi | ✅ | Fornite dal servizio gestito. Da riportare nell'allegato tecnico contrattuale |
| A.3.6 | Sicurezza a livello di riga sul database | ✅ | **Indicazione tecnicamente più rilevante fra quelle acquisite.** Costituisce il fondamento della sezione 5.2 |
| A.3.7 | Pseudonimizzazione e separazione delle tabelle di identità | ✅ | Recepita. Si veda la voce B.6 per i limiti |

### A.4 Piattaforma infrastrutturale

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.4.1 | Adozione di una piattaforma documentale proprietaria | ❌ | Non condivisa. Motivazioni alla sezione 4.5: natura relazionale del dominio, non verificabilità delle regole di sicurezza da parte di terzi, assenza di limite di spesa, assenza di ricerca testuale nativa, limitata portabilità. La valutazione non attiene alla qualità del prodotto ma alla sua idoneità al caso specifico |
| A.4.2 | Necessità di denormalizzazione e divieto di interrogazioni a cascata | ✅ | Corretto quale descrizione del sistema. ⚠️ La conclusione va invertita: la necessità di duplicare i dati costituisce argomento contrario all'adozione. La modifica di un dato di profilo comporta la riscrittura in tutti i contenuti correlati, con stato incoerente in caso di interruzione |
| A.4.3 | Struttura tariffaria | 🕐 | Corretta nell'impostazione, da verificare nei valori. Si segnala che l'autenticazione federata è tariffata per utente attivo presso qualunque fornitore |
| A.4.4 | Assenza di limite massimo di spesa | ✅ | Costituisce l'elemento più rilevante ai fini della valutazione. Fondamento della regola P6 |
| A.4.5 | Stima dei costi per ventimila utenti | ⚠️ | Ordine di grandezza plausibile per l'architettura e la dimensione ipotizzate. Per la dimensione effettivamente prevista e con le misure di cui alle sezioni 6.2-6.5 l'ordine di grandezza è di 100-300 € mensili. Resta valida l'impostazione della rappresentazione economica in sede istituzionale |

### A.5 Traffico e gestione dei contenuti multimediali

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.5.1 | Compressione nel browser, dimensione massima 1200 pixel, formato WebP a qualità 80% | ✅ | Confermata integralmente, valori inclusi. Sezione 6.2 |
| A.5.2 | Limiti di dimensione e tipo imposti dal server | ✅ | Principio generale: ogni controllo eseguito nel browser va replicato lato server |
| A.5.3 | Generazione di versioni ridotte | ✅ | Le denominazioni degli strumenti sono specifiche di una piattaforma; il criterio è invariante |
| A.5.4 | Livello di distribuzione con conservazione temporanea | ✅ | Seconda misura per efficacia. Sezione 6.3 |
| A.5.5 | Caricamento differito delle immagini | ✅ | |
| A.5.6 | Riduzione complessiva del traffico | ✅ | Ordine di grandezza confermato |
| A.5.7 | Conservazione temporanea sul dispositivo | ✅ | Sezione 4.10 |

### A.6 Impostazione strategica

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.6.1 | Distinzione visiva fra contenuti istituzionali e contenuti degli utenti | ✅ | Corretta. Si collega a P7: l'identificazione della fonte riguarda anche il livello di autorevolezza |
| A.6.2 | Generazione differita in modalità non interattiva | ✅ | Corretta sotto il profilo del costo e della prevedibilità |
| A.6.3 | Imputazione dei costi infrastrutturali all'ente | ✅ | Sezioni 6.9 e 10.4 |
| A.6.4 | Automazione quale presupposto della gestione da remoto | ✅ | Coincide con i requisiti di cui alla sezione 4.8 |

### A.7 Aspetti giuridici

| Rif. | Indicazione | Esito | Motivazione |
|---|---|---|---|
| A.7.1 | Pluralità di ordinamenti applicabili | ⚠️ | Sovradimensionata. La disciplina sulla protezione dei dati è contenuta in un regolamento direttamente applicabile. Le differenze rilevano nei quattro ambiti indicati alla sezione 10.9 |
| A.7.2 | Clausola di legge applicabile e foro competente | ✅ | Sezione 10.9 |
| A.7.3 | Distinzione fra titolare e responsabile; necessità di atto scritto | ✅ | Indicazione giuridicamente più rilevante fra quelle acquisite. Sezioni 9.1 e 10.6 |
| A.7.4 | Responsabilità diretta del responsabile per qualunque violazione | ⚠️ | Formulazione eccedente. Il responsabile risponde dei propri inadempimenti. Resta corretto il rilievo circa l'indeterminatezza della posizione in assenza di atto scritto |
| A.7.5 | Rischio di attribuzione della titolarità del software al committente | ✅ | Sezione 10.2 |
| A.7.6 | Esclusione degli accordi con responsabilità solidale | ✅ | Sezione 10.10 |
| A.7.7 | Obblighi di accessibilità | ⚠️ | Riferimento normativo non pertinente: la disciplina applicabile è quella relativa ai siti degli enti pubblici, non quella relativa ai servizi ai consumatori. Lo standard tecnico indicato è invece corretto. La conclusione operativa — impossibilità di adozione in assenza di conformità — è fondata. Sezione 9.12 |
| A.7.8 | Meccanismi di segnalazione e rimozione | ✅ nella sostanza, ⚠️ nell'estensione | Gli obblighi rafforzati riguardano le piattaforme di dimensioni rilevanti. Gli adempimenti effettivi sono elencati alla sezione 9.5 |
| A.7.9 | Dipendenza da un unico soggetto | ✅ | Osservazione fondata. Sezione 11.3 |
| A.7.10 | Titolarità dei materiali didattici e facoltà di esclusione dei docenti | ✅ | Da integrare: il consenso va acquisito preventivamente e la revoca deve estendersi ai materiali derivati. Sezione 8.13 |
| A.7.11 | Licenza sui contenuti degli utenti | ✅ | Sezione 9.3 |
| A.7.12 | Procedure per le fattispecie di rilievo penale | ✅ | Sezione 9.5 |
| A.7.13 | Clausole di recesso | ✅ | Sezione 10.8 |
| A.7.14 | Costituzione della posizione fiscale, contratto, copertura assicurativa | ⚠️ | Gli strumenti indicati sono corretti; la **sequenza** proposta è invertita. Costituisce il profilo di maggiore criticità dell'istruttoria preliminare: orienta verso l'assunzione della posizione di fornitore anteriormente alla definizione dell'assetto istituzionale. Sezione 10.1 |
| A.7.15 | Adempimenti per operazioni transfrontaliere | ✅ | Sezione 10.12 |
| A.7.16 | Dimensione dei bilanci delle alleanze | 🕐 | Da verificare sui documenti pubblici prima di qualunque utilizzo |

### A.8 Criticità operative elencate in fase istruttoria

| Rif. | Criticità | Esito | Sezione |
|---|---|---|---|
| A.8.1 | Disallineamento dei calendari accademici | ✅ | B.12 |
| A.8.2 | Variazione dei costi dei servizi di intelligenza artificiale; indipendenza dal fornitore | ✅ | B.11 |
| A.8.3 | Multilinguismo; traduzione su richiesta | ✅ | 4.4, B.12 |
| A.8.4 | Mancata formazione di una massa critica | ✅ rischio prevalente | 11.2 |
| A.8.5 | Contenuti incorporati e cookie di terze parti | ✅ | 6.4, 9.4 |
| A.8.6 | Dipendenza da fornitori terzi | ✅ | B.11 |
| A.8.7 | Revoca dell'affiliazione e sessioni persistenti | ✅ | 5.3 |
| A.8.8 | Diritti sui contenuti degli utenti | ✅ | 9.3 |
| A.8.9 | Procedure per fattispecie gravi; registro; recapito dedicato | ✅ | 9.5 |
| A.8.10 | Clausole di recesso e oneri di dismissione | ✅ | 10.8 |
| A.8.11 | Copie di sicurezza e ripristino | ✅ con verifica del ripristino | 5.12 |
| A.8.12 | Esposizione di credenziali nel codice dell'applicazione | ✅ con la precisazione di cui alla sezione 4.6 | P4 |
| A.8.13 | Modifiche non compatibili e conservazione locale | ✅ | 4.9 |
| A.8.14 | Consenso agli strumenti di tracciamento | ✅ semplificabile | 9.4 |
| A.8.15 | Gestione delle richieste di assistenza | ✅ | 4.12 |
| A.8.16 | Registri non modificabili | ✅ | 5.11 |
| A.8.17 | Operazioni concorrenti sui contatori | ✅ | 4.7b |
| A.8.18 | Raccolta automatizzata di dati | ✅ | 5.9 |
| A.8.19 | Procedura di dismissione | ✅ | 10.8 |
| A.8.20 | Funzionamento in assenza di connessione | ✅ con la semplificazione di cui alla sezione 4.10 | 4.10 |
| A.8.21 | Modifiche unilaterali delle interfacce di terzi | ✅ | 4.8 |
| A.8.22 | Debito tecnico | ✅ | 11.4 |
| A.8.23 | Scalabilità e costi delle notifiche | ✅ | 6.6 |
| A.8.24 | Utilizzo dei marchi degli atenei | ✅ | 8.4 |
| A.8.25 | Iniezione di codice nei contenuti degli utenti | ✅ | P3, 5.8 |
| A.8.26 | Adempimenti fiscali transfrontalieri | ✅ | 10.12 |
| A.8.27 | Rilevazione degli errori applicativi | ✅ | 4.12 |
| A.8.28 | Registrazioni automatizzate e contenuti indesiderati | ✅ | 5.9 |
| A.8.29 | Frammentazione dei dispositivi | ⚠️ | La criticità è fondata; la soluzione proposta introduce un sistema di compilazione non necessario. Il fattore determinante sui dispositivi di fascia bassa è il peso della pagina. B.13 |
| A.8.30 | Reindirizzamenti non controllati | ✅ | 5.7 |
| A.8.31 | Conflitti di sincronizzazione | ✅ evitabili per costruzione | 4.10 |
| A.8.32 | Limiti di durata delle esecuzioni | ✅ | 4.8 |
| A.8.33 | Licenze delle componenti software | ✅ | 8.7 |
| A.8.34 | Scadenza e revoca delle sessioni | ✅ | 5.3 |
| A.8.35 | Esposizione di dati mediante interrogazioni dirette | ✅ | 5.2 |
| A.8.36 | Credenziali nei repository | ✅ priorità massima | P4, 7.6 |
| A.8.37 | Abuso della logica applicativa | ✅ | 5.9 |
| A.8.38 | Normalizzazione di date e orari | ✅ | 4.7f |
| A.8.39 | Sessioni successive alla cessazione dell'affiliazione | ✅ | 5.3 |
| A.8.40 | Incorporamento in pagine di terzi | ✅ | 5.8 |
| A.8.41 | Localizzazione dei dati | ✅ con la precisazione che la scelta della regione attiene alla conservazione e non esclude l'accesso per attività di assistenza, da dichiarare | 4.6, 8.6 |
| A.8.42 | Saturazione economica delle risorse | ✅ | 6.7 |
| A.8.43 | Controllo di versione | ✅ | 4.11 |
| A.8.44 | Portabilità dei dati | ✅ | P9, 9.7 |
| A.8.45 | Rimozione dei file temporanei | ✅ | 4.8 |
| A.8.46 | Verifica di autorizzazione sulle risorse richieste | ✅ criticità tecnica prevalente | 5.2 |

---
## APPENDICE B — CRITICITÀ EMERSE DALL'ANALISI COMPLESSIVA

Criticità non individuate nella fase istruttoria preliminare.

### B.1 Risorse esterne nell'installazione corrente
Trattata alla sezione 8.1. Costituisce l'unica voce della presente appendice riferita all'installazione attuale e non a sviluppi successivi.

### B.2 Ricerca all'interno dei contenuti
Requisito già previsto per il progetto, non oggetto di valutazione in fase istruttoria, con effetti sulla scelta dell'infrastruttura.

PostgreSQL fornisce nativamente la ricerca testuale, comprensiva della gestione delle forme flesse, senza servizi aggiuntivi. I sistemi documentali non la forniscono e richiedono l'integrazione di un servizio esterno specializzato, a pagamento e da mantenere sincronizzato con la base dati.

Il requisito costituisce di per sé argomento sufficiente a sostegno della scelta di cui alla sezione 4.5.

**Requisito ulteriore.** La ricerca su contenuti in più lingue presuppone che la lingua di ciascun contenuto sia dichiarata. È pertanto necessario un campo dedicato su ogni contenuto **fin dalla prima immissione**: l'introduzione successiva non consente di attribuire la lingua ai contenuti già presenti.

### B.3 Dominio di provenienza delle comunicazioni
Le notifiche costituiscono la funzione determinante ai fini della continuità di utilizzo (11.2). Il loro recapito presuppone un dominio con configurazione di posta conforme.

L'invio da domini istituzionali di terzi presuppone autorizzazione e configurazione da parte delle relative strutture informatiche, con conseguente dipendenza operativa. L'invio non autorizzato comporta il rifiuto dei messaggi.

**Adempimento.** Registrazione di un dominio autonomo, corrispondente alla denominazione del motore e non dell'installazione (10.2). Le comunicazioni sono inviate da tale dominio con denominazione visibile riferita all'installazione.

**Termine.** L'adempimento precede lo sviluppo delle notifiche: la reputazione di un dominio in materia di posta elettronica si costituisce nel tempo, e un dominio di recente registrazione è soggetto a filtri più restrittivi nelle prime settimane di attività.

### B.4 Sostituzione di identità
Su una piattaforma che aggrega utenti di più istituzioni si verificano ipotesi di sostituzione di identità riferite a personale docente, a strutture dell'alleanza o a referenti studenteschi, con conseguenze che vanno dal disturbo alla condotta fraudolenta.

**Adempimento.** Contrassegno di verifica attribuito manualmente ai ruoli istituzionali, con la regola che **i ruoli non sono autodichiarati**: l'utente dichiara esclusivamente l'ateneo, verificato mediante il dominio di posta. L'attribuzione di qualifiche istituzionali richiede conferma da parte del referente dell'ateneo.

Il requisito comporta un campo nella struttura dei dati e una politica di accesso, e va previsto preventivamente.

### B.5 Utilizzo improprio a fini di scambio di materiali
Uno spazio dedicato alla condivisione di materiali didattici è suscettibile di utilizzo per la cessione di elaborati, la circolazione di prove d'esame o l'offerta di prestazioni sostitutive. Su una piattaforma associata alla denominazione di un'alleanza universitaria la fattispecie incide sull'integrità accademica, materia di particolare sensibilità per le istituzioni.

**Adempimento.** Previsione espressa nel regolamento della comunità, categoria dedicata nel sistema di segnalazione e **posizione dichiarata sull'utilizzo dei sistemi di intelligenza artificiale**: i materiali generati hanno funzione di supporto allo studio e non di produzione di elaborati destinati alla valutazione. La formulazione preventiva della posizione costituisce elemento favorevole nell'interlocuzione istituzionale.

### B.6 Limiti della pseudonimizzazione
Uno pseudonimo stabile non realizza l'anonimato. L'utente che interviene costantemente nella medesima lingua, in riferimento al medesimo ateneo e al medesimo corso, è identificabile in tempi brevi dagli altri utenti. Il gestore dispone inoltre della corrispondenza fra pseudonimo e indirizzo.

**Adempimento.** Il regolamento deve indicare espressamente che lo pseudonimo protegge dalla ricerca occasionale e non dall'identificazione. La previsione previene l'ipotesi di immissione di contenuti sensibili in presenza di un'aspettativa di anonimato non fondata.

### B.7 Processo di verifica dei materiali generati
L'identificazione dei contenuti generati (P7) costituisce l'adempimento formale. È necessario altresì un processo di correzione:

1. **Generazione** con tracciamento della fonte.
2. **Verifica automatica di coerenza**: raffronto fra il materiale generato e la fonte, al fine di rilevare affermazioni non riscontrabili. Un secondo passaggio di elaborazione intercetta la maggior parte delle difformità.
3. **Segnalazione da parte dell'utente**: funzione di segnalazione dell'errore su ogni singolo elemento, con trasmissione del contesto.
4. **Correzione in esercizio**: possibilità di correggere il singolo elemento senza rigenerazione integrale. Il requisito incide sulla struttura dei dati.
5. **Versionamento dei materiali**, ai fini della tracciabilità di quanto effettivamente consultato dagli utenti.

In assenza del punto 4, la segnalazione di un errore da parte di un docente non è gestibile in modo proporzionato.

### B.8 Errore contenuto in un materiale di studio
Ipotesi: un materiale generato contiene un errore che si riflette sulla preparazione di un utente. Il profilo rilevante non è risarcitorio, in presenza dell'avvertenza di cui a P7, ma attiene all'affidabilità percepita dello strumento in sede di valutazione istituzionale.

**Adempimenti di prodotto.** La fonte resta accessibile in prossimità del materiale generato; il materiale generato non sostituisce la fonte nell'interfaccia ma la affianca; per i contenuti forniti dai docenti è prevista una funzione di **approvazione da parte del docente**.

Quest'ultima funzione riveste rilievo nella presentazione istituzionale, in quanto configura l'utilizzo dei sistemi automatici come processo sottoposto a controllo del corpo docente.

### B.9 Conflitto fra termini di conservazione ed esigenze probatorie
Il termine di conservazione della messaggistica privata (9.9) può determinare la cancellazione degli elementi oggetto di una segnalazione ancora in corso di trattazione, ovvero di elementi richiesti dall'autorità in relazione a fatti anteriori.

**Adempimento.** La segnalazione determina la **sospensione del termine di conservazione** della conversazione interessata fino alla definizione del procedimento.

In assenza di tale previsione il sistema di moderazione risulta inoperante sotto il profilo probatorio.

### B.10 Profilo reputazionale in capo all'ente
Un evento negativo verificatosi su una piattaforma che reca la denominazione dell'alleanza produce un danno di immagine in capo all'alleanza.

La circostanza ha due implicazioni sulla trattativa. Costituisce la ragione dell'interesse dell'ente al controllo della moderazione: la richiesta di cui alla sezione 9.1 converge quindi con l'interesse della controparte. Costituisce inoltre il fondamento della manleva di cui alla sezione 10.7.

### B.11 Indipendenza dal fornitore di servizi di intelligenza artificiale
Tutte le invocazioni dei servizi di intelligenza artificiale transitano da un unico punto del codice, costituito da una funzione che riceve l'istruzione e restituisce il risultato. Le componenti chiamanti non hanno cognizione del fornitore sottostante.

La sostituzione del fornitore si risolve pertanto nella modifica di tale funzione.

L'adempimento è di onere trascurabile in fase di sviluppo e rileva in caso di variazione dei listini, di dismissione di un modello o di richiesta istituzionale di utilizzo di sistemi ospitati su infrastruttura europea.

### B.12 Calendari, fusi orari e lingue
- **Assenza di logiche fondate su un calendario accademico comune.** Le scadenze si esprimono come date assolute e non come periodi definiti in funzione dell'anno accademico.
- **Traduzione su richiesta esplicita**, mai automatica per impostazione predefinita, con identificazione della natura automatica (P7).
- **Campo lingua su ogni contenuto**, funzionale anche alla ricerca (B.2).

### B.13 Prestazioni sui dispositivi di fascia bassa
Il fattore determinante non è la compatibilità sintattica del codice ma il peso della pagina e il carico di elaborazione. Un'interfaccia con numerose immagini a piena risoluzione e animazioni estese risulta inutilizzabile su dispositivi di fascia economica, che costituiscono una quota significativa del parco dispositivi degli utenti.

Le contromisure sono quelle di cui alla sezione 6, integrate dalla **verifica diretta su un dispositivo di fascia economica**.

### B.14 Acquisizione dei primi utenti
Una piattaforma di aggregazione priva di contenuti non genera adesione spontanea. I primi utenti si acquisiscono individualmente.

Il caso d'uso già individuato — una richiesta di collaborazione pubblicata sui canali ufficiali dell'alleanza e priva di riscontro — costituisce l'elemento dimostrativo di maggior valore: la costituzione effettiva di un gruppo di lavoro attraverso la piattaforma ha efficacia superiore a qualunque presentazione.

**Conseguenza sulle priorità di sviluppo.** Le funzioni necessarie a tale caso d'uso — pubblicazione di una richiesta, ricezione di una risposta, notifica per posta elettronica, apertura di una conversazione — precedono ogni altra.

### B.15 Verifica in condizioni di utilizzo concorrente
Il funzionamento in presenza di più utenti simultanei non è stato verificato. Le presentazioni pubbliche comportano accessi concorrenti in numero significativo.

**Adempimento.** Verifica con utenze simulate in numero adeguato, eseguita preventivamente. Consente inoltre di individuare i limiti effettivi del piano di servizio in uso.

### B.16 Intestazione dei domini e degli account
L'intestazione di dominio, repository e servizi cloud a recapiti personali determina, in sede di formalizzazione del rapporto istituzionale, una trattativa sulla titolarità degli stessi.

**Adempimento.** Intestazione a un recapito dedicato al progetto, distinto dal recapito istituzionale, che cessa con la conclusione del percorso di studi. Mantenimento di un elenco degli account, della loro collocazione e della relativa intestazione, funzionale anche alla sezione 11.3.

---

*Documento tecnico di riferimento — revisione di agosto 2026. I riferimenti economici e le denominazioni commerciali contrassegnati con 🕐 vanno verificati alla fonte prima dell'utilizzo in documentazione destinata a terzi.*
