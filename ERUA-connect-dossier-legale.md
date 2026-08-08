# ERUA connect
## Dossier legale
### Quadro giuridico, rischi e tutele per lo sviluppo e la gestione della piattaforma

**Documento interno di progetto — agosto 2026**

---

## AVVERTENZA

Il presente dossier esamina i profili giuridici rilevanti per lo sviluppo, la messa in esercizio e la gestione della piattaforma da parte di un singolo sviluppatore, persona fisica, studente presso uno degli atenei dell'alleanza di riferimento.

**Il dossier non costituisce parere legale.** Costituisce una ricognizione sistematica dei rischi, delle norme applicabili e delle tutele disponibili, redatta con due finalità: consentire un'interlocuzione informata e paritaria con gli uffici legali e amministrativi degli enti, e individuare con precisione i momenti — pochi e determinati — in cui l'assistenza di un professionista è effettivamente necessaria. Tali momenti sono contrassegnati con **[PROFESSIONISTA]**.

Il dossier è complementare al Documento tecnico di riferimento e vi rinvia per gli aspetti implementativi. Ove i due documenti trattino la medesima materia, il presente dossier ne sviluppa il fondamento giuridico; il documento tecnico ne disciplina l'attuazione.

**Struttura.** La Parte I definisce la posizione giuridica attuale e i tre eventi che la modificano. Le Parti II–V esaminano i quattro corpi normativi rilevanti: protezione dei dati, responsabilità sui contenuti, intelligenza artificiale, proprietà intellettuale e marchi. La Parte VI analizza il contratto, clausola per clausola. La Parte VII copre i profili fiscali, previdenziali e assicurativi. La Parte VIII ricostruisce gli scenari concreti di responsabilità. La Parte IX espone il quadro multigiurisdizionale. La Parte X contiene la sequenza operativa degli adempimenti.

---

# PARTE I — LA POSIZIONE GIURIDICA E I SUOI MUTAMENTI

## 1. Qualificazione attuale

Alla data del presente dossier, lo sviluppatore è una persona fisica che ha realizzato un software e lo ha reso raggiungibile in rete, senza registrazione di utenti, senza raccolta di dati personali di terzi, senza percezione di corrispettivi e senza vincoli contrattuali con alcun ente.

Da tale condizione discendono quattro esclusioni, ciascuna delle quali corrisponde a un intero corpo di obblighi che **non** trova applicazione:

1. **Non è titolare né responsabile del trattamento** ai sensi della disciplina sulla protezione dei dati, perché non tratta dati personali riferiti a terzi. La sperimentazione condotta con account propri, su indirizzi di posta propri, non costituisce trattamento rilevante: la disciplina protegge i dati delle persone diverse da chi li tratta.
2. **Non è prestatore di servizi di memorizzazione** ai sensi della disciplina sui servizi digitali, perché non ospita contenuti immessi da terzi.
3. **Non esercita attività economica**, perché non percepisce corrispettivi: nessun obbligo fiscale, previdenziale o di inquadramento.
4. **Non ha assunto obbligazioni contrattuali**: nessuna prestazione dovuta, nessun livello di servizio, nessuna responsabilità da inadempimento.

Questa configurazione è la più protetta che il progetto attraverserà. La strategia giuridicamente corretta consiste nel **conservarla per l'intera durata dello sviluppo**, portando il prodotto a completezza dentro di essa, e nell'uscirne in modo ordinato, con le tutele già predisposte, solo al ricorrere delle condizioni descritte nel seguito.

## 2. I tre eventi che mutano la posizione

Tre gesti, ciascuno autonomo, trasformano la qualificazione giuridica. Vanno riconosciuti come soglie e mai attraversati incidentalmente.

### 2.1 La registrazione del primo utente terzo

Dal momento in cui una persona diversa dallo sviluppatore si registra:

- I dati di tale persona (indirizzo, contenuti, messaggi, registri di accesso) sono **dati personali oggetto di trattamento**. Chi determina finalità e mezzi del trattamento ne è **titolare**, con l'intero corredo di obblighi: informativa, basi giuridiche, registro, sicurezza, riscontro ai diritti, notifica delle violazioni.
- I contenuti immessi da tale persona rendono il gestore **prestatore di servizi di memorizzazione**, con gli obblighi di segnalazione e rimozione descritti nella Parte III.
- Se l'utente è minorenne, si aggiungono le discipline speciali della sezione 8.

**Conseguenza operativa.** La registrazione del primo utente terzo non avviene finché un ente non abbia assunto per iscritto la titolarità del trattamento (sezione 5). Fino ad allora, il collaudo si esegue esclusivamente con identità dello sviluppatore.

### 2.2 La percezione del primo corrispettivo

Dal primo euro percepito in relazione al progetto:

- Sorge un'**attività economicamente rilevante**, con obblighi dichiarativi e, oltre determinate soglie o in presenza di continuità, di inquadramento (Parte VII).
- Se il corrispettivo proviene da fondi europei, si applicano le regole di **rendicontazione, conflitto di interessi e divieto di doppio finanziamento** (sezione 21).
- Il corrispettivo percepito diventa il parametro naturale del **massimale di responsabilità** contrattuale (sezione 24.5): la gratuità della fase di sviluppo è quindi anche una misura di contenimento del rischio, non soltanto una condizione di fatto.

### 2.3 La sottoscrizione del primo contratto

Dalla firma:

- Sorgono **obbligazioni giuridicamente esigibili**: prestazioni dovute, termini, eventuali penali.
- L'inadempimento espone il **patrimonio personale**: in assenza di una struttura societaria, la persona fisica risponde con tutti i propri beni presenti e futuri.
- Le clausole sottoscritte — comprese quelle non lette — vincolano. La Parte VI esiste per questo.

## 3. La sequenza corretta degli adempimenti

L'ordine con cui si attraversano le soglie determina l'esposizione. La sequenza corretta è:

1. **Prima** l'assetto istituzionale: un ente assume la titolarità del trattamento e l'intestazione dell'infrastruttura.
2. **Poi** la formalizzazione scritta del ruolo dello sviluppatore, con le tutele della Parte VI.
3. **Solo dopo**, e solo in presenza di corrispettivo, l'inquadramento fiscale e la copertura assicurativa.

La sequenza inversa — apertura della posizione fiscale, assunzione della qualità di responsabile del trattamento e stipula di coperture assicurative **prima** della definizione dell'assetto istituzionale — produce l'effetto di attrezzare la persona fisica a sopportare rischi che l'assetto corretto avrebbe allocato altrove. È l'errore strutturale da cui il presente dossier mette in guardia con maggiore insistenza.

**[PROFESSIONISTA]** — L'assistenza legale è necessaria in un momento solo: quando esiste una bozza contrattuale da sottoscrivere. Anteriormente è prematura; successivamente è tardiva. L'assistenza di un commercialista è necessaria quando esiste una cifra concreta da percepire.

---

# PARTE II — PROTEZIONE DEI DATI PERSONALI

## 4. Fonte e ambito di applicazione

La disciplina è contenuta nel Regolamento (UE) 2016/679 (GDPR), **direttamente applicabile in tutti gli Stati membri**. Il nucleo delle regole è pertanto identico negli otto Stati dell'alleanza. I margini rimessi ai legislatori nazionali sono circoscritti: l'età del consenso digitale dei minori (sezione 8), taluni trattamenti particolari, il regime sanzionatorio verso gli enti pubblici. Non esistono, in materia di protezione dei dati, otto ordinamenti da armonizzare: esiste un ordinamento con varianti puntuali.

Il regolamento si applica al trattamento di dati personali, definiti come qualunque informazione riferita a una persona fisica identificata o identificabile. Rientrano nella nozione, con rilevanza per il progetto: l'indirizzo di posta elettronica, lo pseudonimo associato a un'identità, l'indirizzo IP, i contenuti pubblicati riferibili a un autore, i messaggi privati, i registri di accesso, le fotografie di persone riconoscibili.

**Cosa non vi rientra:** i dati resi effettivamente anonimi, cioè non più riferibili a persona alcuna con mezzi ragionevoli. L'anonimizzazione è un'operazione impegnativa e facilmente sopravvalutata: la pseudonimizzazione — sostituzione dell'identità con un codice, conservando altrove la corrispondenza — **non** è anonimizzazione e resta integralmente soggetta al regolamento.

## 5. I ruoli: titolare, responsabile, contitolare

### 5.1 Definizioni

- **Titolare del trattamento**: il soggetto che determina finalità e mezzi del trattamento. Risponde davanti all'autorità di controllo e agli interessati. Nel progetto: l'alleanza o un ateneo capofila.
- **Responsabile del trattamento**: il soggetto che tratta dati per conto del titolare, sulla base di istruzioni documentate. Nel progetto: lo sviluppatore, dal momento dell'attivazione.
- **Sub-responsabili**: i fornitori di cui il responsabile si avvale (infrastruttura cloud, servizio di invio posta, strumento di rilevazione errori). Il ricorso a essi richiede autorizzazione del titolare, generale o specifica, e la trasmissione contrattuale dei medesimi obblighi.

### 5.2 Il criterio sostanziale

La qualificazione discende dalla **sostanza dei rapporti, non dalle etichette contrattuali**. Un contratto che designi lo sviluppatore quale responsabile non impedisce la riqualificazione come **contitolare** se questi assume in autonomia decisioni sulle finalità: quali dati raccogliere, per quali usi, per quanto tempo. La contitolarità comporta responsabilità solidale verso gli interessati ed è la posizione più esposta fra quelle possibili.

**Regola di condotta derivata.** Dopo l'attivazione, ogni funzione che comporti la raccolta di nuove categorie di dati o nuovi utilizzi va **proposta al titolare e documentata come sua istruzione**, mai introdotta autonomamente. La disciplina che appare un vincolo è in realtà una protezione: ciò che è eseguito su istruzione documentata ricade nella sfera di responsabilità del titolare.

### 5.3 Perché la titolarità non può essere assunta dallo sviluppatore

Tre ragioni convergenti:

1. **Esposizione personale.** Il titolare è il destinatario delle sanzioni amministrative, dei reclami e delle azioni degli interessati. Una persona fisica che assuma la titolarità del trattamento dei dati di studenti di otto Stati si espone in proprio a tale intero fronte.
2. **Impraticabilità istituzionale.** Nessun ateneo può consentire che i dati dei propri studenti risiedano su infrastrutture intestate a un privato e siano trattati sotto la responsabilità di un privato. La proposta contraria riceverebbe un diniego e comprometterebbe l'interlocuzione.
3. **Impraticabilità tecnica.** L'accesso federato alle identità di ateneo — la soluzione a regime per l'autenticazione — è riservato dalle federazioni nazionali alle organizzazioni, non alle persone fisiche. La struttura istituzionale è dunque condizione anche dell'architettura di autenticazione definitiva.

## 6. Le basi giuridiche

Ogni trattamento richiede una base fra quelle tassativamente previste. L'errore ricorrente consiste nel ritenere il consenso la base universale: è invece la base **meno idonea** per i trattamenti necessari al servizio, in quanto revocabile in ogni momento, soggetta a onere probatorio, e tale da rendere instabile ciò che dovrebbe essere strutturale.

| Trattamento | Base giuridica | Fondamento |
|---|---|---|
| Indirizzo istituzionale per l'accesso | esecuzione del contratto | l'utente richiede il servizio; il trattamento è necessario a erogarlo |
| Contenuti pubblici | esecuzione del contratto | la pubblicazione è il servizio |
| Messaggistica privata | esecuzione del contratto | idem |
| Notifiche transazionali | esecuzione del contratto | necessarie al funzionamento del servizio richiesto |
| Registro delle segnalazioni e delle decisioni | obbligo legale e legittimo interesse | la conservazione prescinde dal consenso del segnalato |
| Registri tecnici di sicurezza | legittimo interesse | prevenzione degli abusi; conservazione limitata |
| Comunicazioni promozionali | **consenso** | facoltative per definizione; revocabili; disiscrizione immediata |
| Statistiche | legittimo interesse se aggregate; fuori ambito se anonime | i dati non riferibili non sono dati personali |
| Immagini di persone riconoscibili | consenso | cui si aggiunge la disciplina del diritto all'immagine (sezione 15.5) |

Il legittimo interesse richiede un bilanciamento documentato fra l'interesse perseguito e i diritti degli interessati. Per i registri di sicurezza a conservazione breve il bilanciamento è pacifico; per ogni uso ulteriore va compiuto e conservato per iscritto.

## 7. I principi, con le loro conseguenze progettuali

I principi del regolamento non sono enunciazioni: ciascuno vincola una scelta di progettazione.

- **Minimizzazione.** Si raccoglie il minimo necessario. Ogni campo richiesto all'utente deve superare la domanda: quale funzione risulta impossibile in sua assenza? Applicazioni già assunte: sola dichiarazione di maggiore età anziché data di nascita; esclusione del numero di telefono; pseudonimo in luogo del nome nell'interfaccia pubblica.
- **Limitazione della finalità.** I dati raccolti per una finalità non si riutilizzano per finalità incompatibili. I dati di autenticazione non alimentano statistiche di profilo; i contenuti didattici non alimentano valutazioni sugli studenti.
- **Limitazione della conservazione.** Ogni categoria ha un termine, definito prima della progettazione della base dati (sezione 12).
- **Esattezza.** L'utente dispone della modifica dei propri dati.
- **Integrità e riservatezza.** Le misure della sezione 11.
- **Responsabilizzazione.** Il titolare — e il responsabile per quanto di competenza — deve poter **dimostrare** la conformità: registro, documentazione, misure descritte per iscritto. La conformità non documentata è, agli occhi dell'autorità, inesistente.
- **Protezione dei dati fin dalla progettazione e per impostazione predefinita.** Le impostazioni più protettive sono quelle attive in assenza di scelta dell'utente. Applicazione già assunta: la sincronizzazione dei materiali personali, ove introdotta, è disattivata per impostazione predefinita.

## 8. Utenti minori di età

L'età al di sotto della quale il consenso ai servizi della società dell'informazione richiede l'autorizzazione dei genitori è fissata dal regolamento a sedici anni, con facoltà per gli Stati di ridurla fino a tredici. Gli Stati dell'alleanza hanno esercitato la facoltà in modo difforme: il quadro effettivo si colloca fra i tredici e i sedici anni e va verificato Stato per Stato al momento dell'attivazione.

La rilevanza non è teorica: in più ordinamenti europei l'immatricolazione universitaria avviene anche a diciassette anni, e le iniziative di orientamento coinvolgono studenti delle scuole superiori.

**Impostazione adottata e sua giustificazione.** Acquisizione della sola dichiarazione di maggiore età; conservazione del solo esito; per i minori, esclusione della messaggistica privata e dello scambio di recapiti, con facoltà di sola interazione pubblica. L'impostazione è **più restrittiva del massimo richiesto in ciascuno degli otto Stati** e consente pertanto un'unica implementazione, in luogo di otto regimi differenziati.

**Completamenti necessari.**
- La dichiarazione non costituisce verifica. I termini d'uso lo dichiarano espressamente e disciplinano l'ipotesi di dichiarazione non veritiera: sospensione dell'account, non cancellazione immediata, poiché i dati sono necessari alla gestione di eventuali segnalazioni connesse.
- Le comunicazioni promozionali verso utenti dichiaratisi minorenni sono escluse.
- Il regolamento impone che le informative destinate ai minori siano formulate con linguaggio a essi comprensibile: il regolamento della comunità in linguaggio piano (sezione 10) assolve la funzione.

## 9. I diritti degli interessati

Ciascun diritto corrisponde a una funzione che il sistema deve saper eseguire entro **un mese** dalla richiesta, prorogabile di due in casi complessi. La progettazione delle funzioni contestualmente alla base dati è l'unico modo di rendere il termine irrilevante.

| Diritto | Contenuto | Funzione corrispondente |
|---|---|---|
| Accesso | conoscere se e quali dati sono trattati, con copia | esportazione integrale in formato leggibile |
| Rettifica | correzione dei dati inesatti | modifica del profilo |
| Cancellazione | rimozione, nei limiti di legge | cancellazione dell'account con anonimizzazione dei contenuti |
| Limitazione | congelamento del trattamento in pendenza di contestazioni | stato sospeso dell'account |
| Portabilità | ricezione dei dati in formato strutturato e leggibile da dispositivo automatico | esportazione in formato strutturato |
| Opposizione | ai trattamenti fondati sul legittimo interesse | disattivazione selettiva |

**Limiti che è legittimo — e doveroso — opporre:**
- La cancellazione non travolge i dati necessari all'adempimento di obblighi legali o alla difesa in giudizio: il registro delle segnalazioni relative all'interessato si conserva per il termine proprio.
- La cancellazione non impone la distruzione immediata delle copie di sicurezza: la rimozione avviene alla rotazione, entro il termine dichiarato nell'informativa.
- L'anonimizzazione dei contenuti pubblici in luogo della loro rimozione, a tutela dell'integrità delle conversazioni altrui, è legittima **se dichiarata nei termini d'uso**.

Le richieste pervengono al titolare o al responsabile indifferentemente; il responsabile che le riceva le trasmette al titolare e presta assistenza. Il riscontro non richiede forme: richiede completezza e rispetto del termine.

## 10. Trasparenza: informativa e documenti collegati

L'informativa è l'atto con cui il titolare comunica agli interessati, prima della raccolta, gli elementi prescritti: identità e recapiti del titolare, recapiti del responsabile della protezione dei dati, finalità e basi giuridiche di ciascun trattamento, categorie di destinatari, eventuali trasferimenti verso paesi terzi con relative garanzie, periodi di conservazione, elencazione dei diritti e modalità di esercizio, facoltà di reclamo all'autorità.

Requisiti di forma sostanziale:
- **Veridicità.** Ogni enunciato è una dichiarazione vincolante. Le tre dichiarazioni non veritiere ricorrenti — cifratura punto a punto, permanenza assoluta dei dati nell'Unione, cancellazione istantanea — vanno sostituite dalle formulazioni esatte (Documento tecnico, sezione 8.6).
- **Comprensibilità.** Linguaggio piano; ove il servizio sia accessibile ai minori, comprensibile anche a essi.
- **Lingue.** Nelle lingue di erogazione del servizio, o quantomeno in inglese, con individuazione espressa della versione facente fede.
- **Versionamento.** Registro delle versioni e comunicazione preventiva delle modifiche sostanziali. La modifica silenziosa dei documenti è fra le condotte più frequentemente sanzionate.

I termini d'uso e il regolamento della comunità completano il quadro; il loro contenuto è disciplinato nel Documento tecnico, sezione 9.3.

## 11. Le misure di sicurezza e la loro funzione giuridica

Il regolamento impone misure tecniche e organizzative **adeguate al rischio**, con elencazione esemplificativa: pseudonimizzazione e cifratura; capacità di assicurare riservatezza, integrità, disponibilità e resilienza; capacità di ripristino tempestivo; procedura di verifica periodica dell'efficacia.

L'adeguatezza si valuta in concreto. Per il progetto, il perimetro delle misure coincide con la sezione 5 del Documento tecnico: assenza di credenziali conservate, verifica di autorizzazione a livello di base dati, cifratura in transito e a riposo, registri non modificabili, copie di sicurezza con ripristino verificato, limitazioni di frequenza, ambiente di collaudo separato.

**Funzione giuridica della documentazione.** Le misure adottate vanno descritte per iscritto in un allegato tecnico. La descrizione assolve tre funzioni: costituisce l'adempimento dell'obbligo di responsabilizzazione; delimita il perimetro delle obbligazioni contrattuali del responsabile, che risponde delle misure dichiarate e non di uno standard indeterminato; costituisce, in caso di violazione, la prova della diligenza. **Un incidente subìto nonostante misure adeguate e documentate non è, di per sé, un inadempimento**: il regolamento impone l'adeguatezza, non l'invulnerabilità.

## 12. Conservazione

I termini vanno definiti prima della progettazione della base dati e dichiarati nell'informativa. La tabella di riferimento è nel Documento tecnico, sezione 9.9. Rilevano qui i fondamenti:

- La conservazione illimitata è di per sé una violazione, indipendentemente dalla sicurezza.
- I termini asimmetrici sono legittimi se giustificati: la messaggistica a sei mesi e il registro delle segnalazioni a ventiquattro convivono, perché rispondono a esigenze diverse (riservatezza degli utenti; difesa del gestore).
- **La sospensione del termine in pendenza di segnalazione** (Documento tecnico, voce B.9) non è un'eccezione al regolamento: è l'applicazione della base giuridica dell'obbligo legale e del legittimo interesse difensivo, e va prevista espressamente.

## 13. La violazione dei dati personali

### 13.1 Nozione

Costituisce violazione ogni compromissione di riservatezza (accesso o comunicazione non autorizzati), integrità (alterazione) o disponibilità (perdita, distruzione) dei dati personali. Vi rientrano, oltre alle intrusioni: l'errore di configurazione che esponga una tabella, l'invio di una comunicazione ai destinatari sbagliati, la perdita non recuperabile di dati per un difetto di procedura.

### 13.2 Obblighi e termini

- **Il titolare** notifica all'autorità di controllo entro **72 ore** dal momento in cui ne ha avuto conoscenza, salvo che la violazione sia improbabilmente rischiosa per gli interessati. Il superamento del termine va motivato.
- **Il responsabile** informa il titolare **senza ingiustificato ritardo** dopo esserne venuto a conoscenza. Il termine del responsabile non è di 72 ore: è immediato. Il ritardo del responsabile è un suo autonomo inadempimento.
- Se la violazione comporta un **rischio elevato** per gli interessati, il titolare la comunica anche a questi, salvo che le misure adottate (per esempio la cifratura dei dati compromessi) rendano il rischio non più probabile.

### 13.3 Predisposizione

La gestione di una violazione si decide prima che accada. Elementi da predisporre, su supporto esterno al sistema:

1. Recapito unico del titolare (nominativo, indirizzo, telefono), fissato contrattualmente.
2. Modello di comunicazione: natura della violazione, categorie e numero approssimativo di interessati e di registrazioni, conseguenze probabili, misure adottate e proposte, recapito per informazioni.
3. Capacità di ricostruzione: la risposta alla domanda "chi ha avuto accesso, a cosa, quando" presuppone i registri di cui alla sezione 5.11 del Documento tecnico. L'impossibilità di rispondere è essa stessa un elemento a carico.
4. Registro interno delle violazioni, anche di quelle non soggette a notifica: l'obbligo di documentazione prescinde dall'obbligo di notifica.
5. Funzione di commutazione del servizio in sola lettura.

### 13.4 Il giorno dell'evento — sequenza

1. Contenere: interrompere il canale della compromissione (commutazione in sola lettura, revoca delle sessioni, rotazione delle chiavi).
2. Informare immediatamente il titolare con gli elementi disponibili, integrandoli progressivamente: la conoscenza parziale non giustifica il silenzio.
3. Documentare ogni azione con orario.
4. Non cancellare nulla: gli elementi della violazione sono anche gli elementi della difesa.
5. Le comunicazioni pubbliche competono al titolare.

## 14. Trasferimenti verso paesi terzi e risorse esterne

### 14.1 Il principio

Il trasferimento di dati personali fuori dallo Spazio economico europeo è ammesso solo in presenza di una decisione di adeguatezza, di garanzie adeguate (clausole contrattuali tipo) o di deroghe puntuali. La nozione di trasferimento è ampia: comprende **l'accesso** ai dati da un paese terzo, anche a fini di sola assistenza tecnica.

### 14.2 L'infrastruttura

La collocazione delle risorse in una regione europea del fornitore risolve la **conservazione**, non l'eventuale accesso della casa madre extraeuropea per finalità di assistenza. Tale accesso si fonda sulle clausole contrattuali tipo incorporate nelle condizioni del fornitore e **va dichiarato nell'informativa** nella formulazione esatta: i dati sono conservati nell'Unione; il fornitore può accedervi per finalità di assistenza sulla base delle garanzie contrattuali applicabili.

### 14.3 Le risorse caricate dal browser

Ogni risorsa che la pagina richieda a un server esterno — carattere tipografico, libreria, componente di riproduzione — determina la trasmissione a tale server dell'indirizzo IP dell'utente e del riferimento di provenienza. Trattandosi di dato personale, la trasmissione a un server extraeuropeo configura un trasferimento privo di base e di informativa.

La giurisprudenza tedesca del 2022 ha riconosciuto il diritto al risarcimento del singolo visitatore per l'incorporazione dinamica di caratteri tipografici da fornitore extraeuropeo, originando una prassi di diffide seriali. La presenza nell'alleanza di un ateneo tedesco rende il profilo concretamente rilevante.

**Adempimento**: ospitalità locale di tutte le risorse (Documento tecnico, sezione 8.1) e caricamento dei componenti di riproduzione video solo su azione dell'utente. Le due misure, congiunte all'assenza di strumenti di profilazione, producono l'effetto ulteriore descritto alla sezione successiva.

## 15. Disciplina dei cookie e figure affini

### 15.1 La regola

L'installazione sul dispositivo dell'utente di strumenti non strettamente necessari all'erogazione del servizio richiede un consenso preventivo, espresso, granulare e documentato. Gli strumenti tecnici necessari (il cookie di sessione) ne sono esclusi.

### 15.2 L'applicazione al progetto

In presenza delle misure già assunte — assenza di strumenti di analisi con profilazione, ospitalità locale delle risorse, caricamento differito dei componenti di terzi — **il servizio non installa alcuno strumento soggetto a consenso**. Ne discende l'esenzione dal modulo di raccolta del consenso, sostituito da una sezione informativa. La semplificazione è al contempo un vantaggio di conformità, di esperienza d'uso e di peso della pagina.

L'eventuale esigenza statistica futura si soddisfa con strumenti privi di cookie e di profilazione, che non riattivano l'obbligo.

### 15.3 Il divieto da mantenere

L'introduzione successiva di un qualunque strumento di terzi che installi identificativi — un componente di condivisione sociale, un sistema di commenti esterno, un contatore — riattiva l'intera disciplina. Ogni introduzione va pertanto vagliata contro questa sezione prima dell'adozione.

## 16. Fotografie e diritto all'immagine

Le immagini di persone riconoscibili cumulano due tutele: quella dei dati personali e quella civilistica del diritto all'immagine, che nell'ordinamento italiano richiede il consenso della persona ritratta per l'esposizione e la pubblicazione, salvo eccezioni (notorietà, eventi pubblici, finalità di giustizia e polizia, scopi scientifici o didattici nei limiti del decoro).

Applicazioni:
- Le fotografie pubblicate dalla redazione della rivista studentesca sono state raccolte con liberatorie di cui è titolare la redazione: la ripubblicazione presuppone che tali liberatorie coprano anche l'utilizzo sulla piattaforma, circostanza da verificare in sede di accordo con la redazione.
- Le immagini caricate dagli utenti che ritraggano terzi sono responsabilità dell'utente caricante, in forza della garanzia prevista nei termini d'uso; la piattaforma predispone la segnalazione e la rimozione.
- La rimozione automatica dei metadati di geolocalizzazione dalle immagini caricate (Documento tecnico, sezione 5.6) è una misura di protezione dei dati a beneficio dello stesso caricante.

---
# PARTE III — CONTENUTI DI TERZI E RESPONSABILITÀ DEL GESTORE

## 17. La disciplina dei servizi digitali

### 17.1 Qualificazione

Chi ospita informazioni fornite dagli utenti è prestatore di servizi di memorizzazione ai sensi del regolamento europeo sui servizi digitali. La qualificazione scatta con la registrazione del primo utente terzo e prescinde dalle dimensioni.

### 17.2 Il regime di responsabilità

Il prestatore **non è responsabile** delle informazioni memorizzate a condizione che: non ne abbia conoscenza effettiva; ovvero, acquisita la conoscenza, agisca immediatamente per la rimozione o la disabilitazione dell'accesso.

Il regime va compreso nella sua struttura: non è un'immunità, è un'esenzione **condizionata alla reattività**. La segnalazione circostanziata fa acquisire la conoscenza; l'inerzia successiva fa venir meno l'esenzione e radica la responsabilità. Ne discende che il sistema di segnalazione, il registro e i termini di riscontro non sono adempimenti accessori: sono la condizione stessa dell'esenzione.

Il prestatore non ha, per converso, un obbligo generale di sorveglianza sui contenuti: non è tenuto al vaglio preventivo di ciò che gli utenti pubblicano. L'equilibrio è: nessun controllo preventivo dovuto, reazione tempestiva dovuta.

### 17.3 Obblighi applicabili e obblighi esclusi

Gli obblighi rafforzati del regolamento — relazioni periodiche di trasparenza, sistemi interni di gestione dei reclami, organismi di risoluzione extragiudiziale, segnalatori attendibili, valutazioni di rischio sistemico — gravano sulle piattaforme di dimensioni rilevanti, con **esclusioni espresse per le micro e piccole imprese**. Una piattaforma universitaria dell'ordine di grandezza previsto ne resta fuori.

Gli obblighi effettivamente applicabili sono: meccanismo di segnalazione accessibile ed elettronico; trattazione tempestiva, diligente e non arbitraria delle segnalazioni; motivazione dei provvedimenti a chi li subisce; punto di contatto pubblico. La loro attuazione è disciplinata nel Documento tecnico, sezione 9.5.

### 17.4 Contenuti illeciti: la nozione varia per Stato

Il regolamento rinvia, per la definizione di illiceità, agli ordinamenti nazionali e al diritto dell'Unione. Ciò che costituisce diffamazione, vilipendio, incitamento all'odio o violazione della riservatezza differisce fra gli otto Stati. La conseguenza organizzativa è la distribuzione della moderazione per ateneo, con referenti che conoscono l'ordinamento locale: non è una preferenza gestionale, è l'unico assetto che consente valutazioni giuridicamente fondate.

### 17.5 Fattispecie penalmente rilevanti

Tre categorie richiedono procedure predefinite, sottratte alla coda ordinaria:

1. **Contenuti che rivelino un rischio per l'incolumità** (propositi autolesivi, minacce): trattazione immediata, riscontro predisposto con i riferimenti dei servizi di sostegno dello Stato dell'utente, coinvolgimento del referente istituzionale.
2. **Materiale la cui detenzione o diffusione costituisce reato**: conservazione a fini di prova, astensione da qualunque cancellazione, trasmissione immediata al referente istituzionale che attiva l'autorità competente. La cancellazione autonoma, per quanto istintiva, distrugge la prova e può integrare autonoma responsabilità.
3. **Provvedimenti dell'autorità giudiziaria o amministrativa**: il destinatario naturale è il titolare del trattamento; il responsabile che li riceva li trasmette senza dare autonoma esecuzione, salvo che il provvedimento lo imponga direttamente e nei limiti in cui lo imponga.

## 18. La messaggistica privata

### 18.1 Il regime

Le comunicazioni interpersonali godono di tutela rafforzata: la riservatezza della corrispondenza è principio di rango costituzionale negli ordinamenti dell'alleanza e la disciplina europea ne vieta l'intercettazione e la sorveglianza, salvo consenso o legge.

L'assetto adottato — nessuna lettura né analisi da parte del gestore; accesso al contenuto solo su allegazione dell'utente segnalante o su provvedimento dell'autorità — è conforme e prudente. Ne discendono tre regole:

1. **Nessuna funzione di lettura amministrativa dei messaggi.** Nemmeno a fini di moderazione preventiva: la moderazione della messaggistica opera solo su segnalazione, sugli elementi allegati dal segnalante.
2. **Nessuna dichiarazione di cifratura punto a punto**, che non sussiste e la cui affermazione sarebbe non veritiera. La formulazione corretta è nel Documento tecnico, sezione 8.6.
3. **Conservazione limitata con sospensione in pendenza di segnalazione** (sezione 12): la scadenza automatica non può travolgere gli elementi di un procedimento in corso né quelli richiesti dall'autorità.

### 18.2 L'ostensione all'autorità

La richiesta dell'autorità giudiziaria di consegna di comunicazioni va soddisfatta nei limiti del provvedimento, per il tramite del titolare, con documentazione di quanto consegnato. La capacità tecnica di estrarre le comunicazioni di una specifica conversazione, con integrità verificabile, va prevista in progettazione: l'impossibilità di adempiere a un ordine legittimo è essa stessa fonte di responsabilità.

## 19. I contenuti immessi dagli utenti

### 19.1 Titolarità e licenza

L'utente che redige un contenuto ne è autore e titolare. La piattaforma necessita di una licenza per le operazioni tecniche del servizio: memorizzazione, riproduzione, comunicazione al pubblico nell'ambito della piattaforma, traduzione, adattamenti tecnici, conservazione a fini di moderazione.

La clausola dei termini d'uso prevede pertanto: titolarità che permane in capo all'utente; licenza non esclusiva, gratuita, territorialmente e funzionalmente limitata alle finalità del servizio; persistenza della licenza sui contenuti anonimizzati a seguito di cancellazione dell'account, nei limiti della funzione di integrità delle conversazioni.

Da escludere le formulazioni espansive ricorrenti nei modelli statunitensi (licenza perpetua, irrevocabile, sublicenziabile, per ogni finalità): oltre a essere sproporzionate, deprimono la fiducia degli utenti e sono censurabili come clausole abusive in più ordinamenti dell'alleanza.

### 19.2 La garanzia dell'utente

L'utente garantisce di disporre dei diritti sui contenuti immessi e tiene indenne il gestore dalle pretese di terzi conseguenti alla violazione della garanzia. La clausola è il presidio civilistico contro l'immissione di materiale altrui — dispense riprodotte, testi protetti, immagini di terzi — e opera congiuntamente al meccanismo di segnalazione e rimozione, che è il presidio pubblicistico.

### 19.3 Contenuti generati con sistemi automatici dagli utenti

Gli utenti immetteranno anche contenuti da essi prodotti con strumenti di intelligenza artificiale. Il regolamento della comunità disciplina l'ipotesi in coerenza con la posizione sull'integrità accademica (Documento tecnico, voce B.5): l'immissione è ammessa, la responsabilità del contenuto resta dell'utente, la finalità di supporto allo studio è distinta dalla produzione di elaborati destinati alla valutazione.

## 20. I contenuti di terzi utilizzati dalla piattaforma

### 20.1 Quadro delle fonti e dei regimi

| Fonte | Regime | Condizioni di utilizzo |
|---|---|---|
| Rivista studentesca dell'alleanza | diritto d'autore degli autori; raccolta della redazione | attribuzione completa; recapito per la rimozione; accordo con la redazione opportuno, comprensivo delle liberatorie fotografiche |
| Comunicazioni istituzionali degli atenei (bandi, call, iniziative) | titolarità degli enti; interesse degli enti alla diffusione | titolo, estratto, collegamento alla fonte; immagini non copiate (sezione 20.2) |
| Contenuti audio e video dei canali ufficiali | condizioni della piattaforma di pubblicazione | incorporazione mediante componente ufficiale; caricamento su azione dell'utente |
| Corsi universitari ad accesso aperto | licenze aperte con clausole di attribuzione, non commercialità, condivisione conforme | attribuzione visibile nell'interfaccia; vigilanza sulla clausola di non commercialità in caso di evoluzione onerosa |
| Materiali dei docenti | diritto d'autore del docente | consenso preventivo, revocabile, con effetti estesi ai derivati (sezione 22.3) |

### 20.2 Le immagini delle fonti istituzionali

I siti istituzionali impiegano di frequente immagini di repertorio con licenza intestata all'ente, non estensibile a chi ripubblica. I fornitori di tali immagini operano sistemi automatizzati di rilevamento e prassi di richiesta di pagamento. L'aggregazione non copia pertanto le immagini delle fonti: l'elemento visivo è generato dall'applicazione o espressamente autorizzato.

### 20.3 Il diritto sulle banche dati

L'ordinamento europeo attribuisce al costitutore di una banca dati un diritto sull'investimento nella raccolta e nell'organizzazione, indipendente dalla proteggibilità dei singoli contenuti. L'estrazione o il reimpiego di parti sostanziali sono riservati. L'aggregazione conforme — titolo, estratto contenuto, collegamento, frequenza giornaliera, rispetto delle esclusioni per i sistemi automatici, identificazione del processo — resta al di fuori della fattispecie e coincide con la corretta impostazione del servizio, il cui valore è il reindirizzamento alla fonte e non la sua sostituzione.

## 21. Il diritto d'autore sul software e sui materiali generati

### 21.1 Il codice

Il software è tutelato dal diritto d'autore come opera dell'ingegno. La titolarità sorge in capo all'autore per effetto della creazione, senza formalità. I diritti patrimoniali sono trasferibili; i diritti morali (paternità) non lo sono. La prova della data di creazione — cronologia del sistema di controllo di versione, rilasci numerati e datati — è l'elemento che consente di opporre la preesistenza (sezione 23).

Il codice prodotto con l'ausilio di sistemi di generazione automatica solleva questioni di titolarità non ancora consolidate negli ordinamenti; ai fini pratici del progetto rilevano due elementi: il contributo umano di selezione, direzione e revisione fonda la rivendicazione della titolarità; le condizioni d'uso dei fornitori dei sistemi impiegati attribuiscono all'utilizzatore i diritti sull'output nei limiti in cui possano disporne. La documentazione del processo di sviluppo — chi ha deciso cosa, con quali istruzioni — rafforza la posizione.

### 21.2 I materiali didattici generati

I materiali generati da fonti (sintesi, schede, quiz) sono opere derivate: presuppongono il diritto di elaborazione sulla fonte. Da ciò: per i contenuti dei docenti, il consenso preventivo (sezione 22.3); per i contenuti sotto licenza aperta, il rispetto delle condizioni della licenza, ivi compresa l'eventuale clausola di condivisione conforme, la cui portata va vagliata prima di qualunque evoluzione onerosa del servizio.

---

# PARTE IV — INTELLIGENZA ARTIFICIALE

## 22. Il regolamento europeo sull'intelligenza artificiale

### 22.1 Cronologia applicativa

Il regolamento è in vigore dall'agosto 2024, con applicazione scaglionata. Gli interventi normativi della primavera 2026 hanno differito taluni termini. Il quadro vigente:

| Termine | Contenuto |
|---|---|
| **2 agosto 2026** | Obblighi di trasparenza. **Termine non differito.** |
| 2 dicembre 2026 | Divieti ulteriori; estensione della trasparenza ai sistemi già immessi |
| 2 dicembre 2027 | Obblighi per i sistemi ad alto rischio autonomi, differiti dall'originario agosto 2026 |
| 2 agosto 2028 | Obblighi per i sistemi ad alto rischio integrati in prodotti regolamentati |

### 22.2 Qualificazione del progetto

L'allegato dei sistemi ad alto rischio comprende, per l'istruzione: la determinazione dell'accesso e dell'ammissione; la **valutazione dei risultati dell'apprendimento**, anche ai fini dell'orientamento; la determinazione del livello di istruzione; la sorveglianza durante le prove.

Le funzioni previste — generazione di materiali di studio e quiz di autovalutazione, i cui esiti restano sul dispositivo dell'utente e non alimentano alcuna decisione — non integrano alcuna delle fattispecie. Il progetto opera come **deployer di sistemi per finalità generali**, non come fornitore né come operatore di sistema ad alto rischio.

### 22.3 Le condizioni di permanenza fuori dall'alto rischio

Tre condizioni, la cui violazione anche singola muta la qualificazione:

1. Gli esiti delle autovalutazioni non lasciano il dispositivo e non sono accessibili a docenti o amministratori, nemmeno in forma individuale differita.
2. Nessuna graduatoria né comparazione fra utenti fondata su risultati di apprendimento. I meccanismi di ingaggio ammessi si fondano su partecipazione e contributi.
3. Nessuna funzione che orienti decisioni di valutazione, ammissione o indirizzamento degli studenti.

La richiesta, prevedibile, di un docente di accedere agli esiti dei propri studenti va soddisfatta esclusivamente con dati aggregati e non riferibili. L'accoglimento in forma individuale attirerebbe l'intero regime dell'alto rischio: sistema di gestione del rischio, documentazione tecnica, valutazione di conformità, sorveglianza umana, registrazione nella banca dati europea — un carico incompatibile con la struttura del progetto.

### 22.4 Gli obblighi di trasparenza applicabili

Dal 2 agosto 2026:

1. **Identificazione dei contenuti generati.** Ogni sintesi, scheda, quiz e traduzione automatica reca l'indicazione, apposta sull'elemento, della natura generata. La marcatura nei soli termini d'uso non assolve l'obbligo.
2. **Sistemi conversazionali.** Ove introdotti, l'utente è informato della natura automatica dell'interlocutore.
3. **Alfabetizzazione.** Chi mette a disposizione sistemi di intelligenza artificiale assicura un livello adeguato di comprensione negli utilizzatori: assolto mediante la pagina informativa sulle modalità di generazione, i limiti e la necessità di verifica.

L'attuazione coincide con il presidio di attendibilità scientifica: fonte, data, sistema, indicazione di contenuto non verificato, canale di segnalazione degli errori.

### 22.5 La posizione di deployer

L'impiego di modelli di terzi tramite interfacce ufficiali colloca gli obblighi sul modello in capo al fornitore. Restano in capo al deployer: la trasparenza verso gli utenti; l'uso conforme alle condizioni del fornitore; la responsabilità per i dati immessi nelle elaborazioni. Regola conseguente: **nessun dato personale degli utenti confluisce nelle istruzioni trasmesse ai modelli**, salvo necessità dichiarata nell'informativa; le elaborazioni riguardano i contenuti didattici.

---

# PARTE V — MARCHI, DENOMINAZIONI E ASSETTO PROPRIETARIO

## 23. I marchi dell'alleanza e degli atenei

### 23.1 Il quadro

La denominazione dell'alleanza, il relativo segno figurativo e gli stemmi degli atenei sono segni distintivi tutelati. I titolari istituzionali sono tenuti a difenderli — la tolleranza sistematica indebolisce il segno — e dispongono di manuali d'identità con prescrizioni d'uso vincolanti.

Il nucleo della tutela è il **rischio di confusione**: l'idoneità dell'uso altrui a far ritenere un collegamento con il titolare. Ne discende la gerarchia dei rischi: l'uso descrittivo e dichiaratamente non ufficiale, non commerciale e non indicizzato presenta rischio contenuto; l'uso che generi apparenza di ufficialità, l'uso commerciale e la promozione pubblica lo elevano sensibilmente.

### 23.2 Le misure

- Dicitura in ogni pagina, in lingua inglese: *"Independent prototype. Not an official service of ERUA or of its member universities. All trademarks belong to their respective owners."*
- Esclusione dall'indicizzazione fino all'ufficializzazione.
- In sede di primo confronto, quesito sulle modalità di presentazione del progetto in fase preliminare — formulazione che sollecita indicazioni operative anziché un diniego difensivo.
- Utilizzo degli stemmi dei singoli atenei conforme ai rispettivi manuali, e loro rimozione a semplice richiesta.

### 23.3 La separazione fra motore e installazione

L'assetto che risolve strutturalmente la questione: il software (motore) reca una denominazione autonoma, di titolarità dello sviluppatore; la denominazione riferita all'alleanza designa **una installazione** del motore, concessa in uso. La cessione all'alleanza della denominazione dell'installazione — priva di valore autonomo per lo sviluppatore — è concedibile senza sacrificio; la titolarità del motore, che incorpora il valore, permane.

L'assetto produce tre effetti: elimina il conflitto sui segni; consente la replicabilità presso altre alleanze, ciascuna con denominazione propria; e trasferisce sul piano tecnico un requisito preciso — la configurazione (denominazione, segni, palette, atenei, lingue) risiede in un file autonomo, sostituibile senza interventi diffusi.

### 23.4 Tutela della denominazione del motore

Alla definizione della denominazione: verifica di anteriorità sui registri marchi europei e sui domini; registrazione del dominio; l'eventuale deposito del marchio è rinviabile alla fase di effettiva replicabilità, quando il segno avrà un valore da proteggere. **[PROFESSIONISTA]** per il deposito, ove e quando deciso.

---
# PARTE VI — FINANZIAMENTI EUROPEI E RAPPORTI CON GLI ENTI

## 24. Proprietà intellettuale nei progetti finanziati

### 24.1 Il meccanismo delle clausole sui risultati

Gli atti di concessione dei finanziamenti europei disciplinano la titolarità dei **risultati** del progetto. Nelle formulazioni ricorrenti: i risultati appartengono al beneficiario che li genera; l'ente finanziatore si riserva diritti di accesso e utilizzo; il beneficiario è tenuto alla disseminazione, in taluni schemi con obblighi di apertura.

La nozione di risultato comprende il software sviluppato nell'ambito del progetto. **Il beneficiario è l'ente che amministra il finanziamento — l'ateneo o l'alleanza — non il singolo che materialmente sviluppa.** Il software realizzato dentro il progetto diviene pertanto, in tutto o in parte, risultato dell'ente, con eventuali obblighi di pubblicazione incompatibili con la replicabilità onerosa presso altri soggetti.

### 24.2 Il materiale preesistente

Gli stessi schemi contrattuali riconoscono la categoria del materiale preesistente (*background*): beni, conoscenze e opere che un soggetto apporta al progetto avendoli realizzati **prima e al di fuori** di esso. Sul materiale preesistente il progetto acquisisce un diritto d'uso limitato alle proprie finalità; la titolarità permane in capo all'apportante.

La linea di confine è temporale e documentale. Ne discendono le misure:

1. **Sviluppo del software anteriore e autonomo rispetto a qualunque candidatura.** Ogni componente realizzata prima è materiale preesistente; ogni componente realizzata durante è suscettibile di qualificazione come risultato.
2. **Prova della data**: cronologia del controllo di versione; rilasci numerati e datati; eventuale marcatura temporale dei riepiloghi di versione.
3. **Dichiarazione espressa nella candidatura**: la piattaforma costituisce asset preesistente del proponente; il progetto ne prevede l'utilizzo a titolo gratuito per le attività proposte; il finanziamento non è destinato allo sviluppo software.
4. **Coerenza del bilancio**: nessuna voce di spesa per sviluppo software. Le voci ammissibili e opportune sono le attività — eventi, mobilità, produzione di materiali di comunicazione, coinvolgimento dei partecipanti.
5. **Esame preventivo** delle clausole su risultati e materiale preesistente da parte dell'ufficio progetti dell'ateneo, che le tratta correntemente, prima della sottoscrizione. **[PROFESSIONISTA]** ove l'ufficio non sia disponibile.

**La formulazione corretta della candidatura non è "il progetto svilupperà una piattaforma" ma "il progetto realizzerà [attività] utilizzando una piattaforma preesistente messa a disposizione dal proponente a titolo gratuito".** La differenza fra le due frasi è la titolarità del software.

### 24.3 Conflitto di interessi

La contemporanea qualità di studente dell'ateneo e di proponente, fornitore o percettore in un progetto amministrato dal medesimo ateneo integra una situazione da **dichiarare**, non una preclusione. Gli schemi dei finanziamenti europei e la disciplina nazionale sull'imparzialità amministrativa impongono l'emersione delle situazioni di potenziale conflitto e la loro gestione (astensione dei soggetti in conflitto dalle decisioni che li riguardano). La dichiarazione spontanea e preventiva è la condotta che protegge; l'emersione successiva a opera di terzi è la condotta che espone.

### 24.4 Divieto di doppio finanziamento

I medesimi costi non possono essere finanziati da più fonti; i risultati già finanziati non possono essere presentati come nuovi. Le componenti riutilizzate da progetti personali preesistenti si dichiarano come tali. La contestazione di doppio finanziamento è la più ricorrente in sede di rendicontazione e comporta la revoca con recupero delle somme.

### 24.5 Rapporti onerosi con l'ateneo

L'eventuale futuro rapporto oneroso con un ente pubblico soggiace alla disciplina degli affidamenti: sotto le soglie di rilevanza operano procedure semplificate (affidamento diretto con i limiti di rotazione e motivazione), gestite dall'ufficio competente dell'ente secondo tempi propri. Conseguenze pratiche: i tempi di formalizzazione non dipendono dal fornitore e non vanno promessi a terzi; la congruità del corrispettivo va documentabile (comparazione con i valori di mercato); la qualità di studente non preclude l'affidamento ma rientra nella dichiarazione di cui alla sezione 24.3.

---

# PARTE VII — IL CONTRATTO

Sezione di consultazione, da riprendere integralmente in presenza di una bozza. **[PROFESSIONISTA]** sulla bozza definitiva: è il momento, unico, in cui l'assistenza legale è necessaria e produttiva.

## 25. Premessa di metodo

Il contratto con un ente pubblico è predisposto dall'ente su schemi propri. Il margine del fornitore non consiste nella redazione ma nella **richiesta di modifiche puntuali su un numero ristretto di clausole**. La preparazione consiste nel sapere quali.

Le clausole decisive sono cinque: oggetto, proprietà intellettuale, livelli di servizio, limitazione di responsabilità, manleve. Le restanti — durata, recesso, uscita, legge applicabile — ammettono formulazioni standard riportate oltre.

## 26. Le clausole

### 26.1 Oggetto: la delimitazione in negativo

La clausola definisce le prestazioni dovute; la sua funzione protettiva sta nell'elencazione espressa delle prestazioni **escluse**: formazione degli utenti finali, assistenza di primo livello agli studenti, produzione di contenuti, migrazione da sistemi preesistenti, integrazioni non elencate, sviluppo di funzionalità ulteriori.

> *"Sono esclusi dall'oggetto, e potranno formare oggetto di separato accordo, tutti i servizi non espressamente elencati al presente articolo, e in particolare: [elenco]."*

In assenza, la locuzione "manutenzione della piattaforma" è riempita in via interpretativa, e l'interprete di fatto è la parte che corrisponde il compenso.

### 26.2 Proprietà intellettuale

Da escludere: le previsioni che qualifichino il software come realizzato su commissione o attribuiscano al committente i risultati dello sviluppo.

Da proporre:

> *"Il Fornitore è e resta titolare esclusivo di tutti i diritti di proprietà intellettuale sul Software, ivi compresi il codice sorgente, l'architettura, la documentazione e gli sviluppi successivi. Il Fornitore concede al Committente una licenza d'uso non esclusiva e non trasferibile, limitata alle finalità di cui all'art. [oggetto] e alla durata del presente contratto. I dati inseriti dagli utenti e i contenuti prodotti dal Committente restano nella titolarità del Committente."*

L'argomento risolutivo in trattativa è la distinzione fra software e dati: l'interesse effettivo dell'ente è la disponibilità perpetua **dei dati**, non del codice. Riconosciuta espressamente la titolarità dei dati al committente, con obbligo di consegna alla cessazione, la resistenza sulla titolarità del software di norma si scioglie.

Sul regime successivo alla cessazione, la soluzione intermedia praticabile: licenza perpetua sulla versione in essere alla cessazione, senza aggiornamenti, con contestuale consegna dei dati. Tutela l'ente dall'interruzione e il fornitore dalla espropriazione.

**Deposito del codice presso terzi.** La consegna del codice a un depositario neutrale, con rilascio al committente condizionato all'indisponibilità sopravvenuta del fornitore, è una richiesta legittima dell'ente e una proposta vantaggiosa se avanzata dal fornitore: risolve l'obiezione della dipendenza dal singolo senza trasferire la titolarità.

### 26.3 Livelli di servizio

Ogni valore promesso è un parametro di inadempimento. Le promesse insostenibili per un fornitore individuale:

- disponibilità pari o superiore al 99,9% mensile (indisponibilità massima inferiore a 45 minuti, a fronte di dipendenza da fornitori terzi non controllabili);
- termini garantiti di **risoluzione** (la risoluzione dipende anche da terzi);
- reperibilità continuativa.

Le formulazioni sostenibili:

- disponibilità obiettivo del 99% su base mensile, **al netto** delle indisponibilità imputabili a fornitori terzi e delle manutenzioni programmate comunicate con 48 ore di preavviso;
- termini di **presa in carico** in giorni lavorativi, graduati per severità (critico: 1; alto: 3; ordinario: 10);
- penali configurate come riduzione percentuale del canone, con tetto, ed escluso ogni effetto risarcitorio ulteriore;
- finestra di manutenzione programmata; periodi dell'anno a termini estesi, individuati preventivamente;
- fascia oraria di presidio espressa, comprensiva dell'eventuale operatività da fuso orario diverso, con recapito per le emergenze.

### 26.4 Limitazione di responsabilità

La clausola senza la quale l'esposizione è illimitata:

> *"La responsabilità complessiva del Fornitore, per qualsiasi titolo derivante dal presente contratto, è limitata all'importo dei corrispettivi effettivamente percepiti nei dodici mesi precedenti l'evento dannoso. È in ogni caso esclusa la responsabilità per danni indiretti, perdita di profitto, danno reputazionale e interruzione dell'attività, nonché per le pretese di rivalsa relative a sanzioni amministrative irrogate al Committente, salvo che derivino da inadempimento doloso o gravemente colposo del Fornitore."*

Limiti inderogabili: la responsabilità per dolo e colpa grave non è escludibile pattiziamente; la clausola che vi provvedesse sarebbe nulla in parte qua. La protezione copre quindi l'inadempimento ordinario e l'errore, non la negligenza grave.

La previsione sulle rivalse è quella più frequentemente omessa e più necessaria: le sanzioni dell'autorità di controllo colpiscono il titolare, che può rivalersi sul responsabile inadempiente; il massimale deve estendersi espressamente a tale ipotesi.

Correlazione strutturale: **massimale commisurato ai corrispettivi percepiti significa che la gratuità della fase iniziale è una protezione.** A corrispettivo nullo, massimale nullo.

### 26.5 Manleve

Bidirezionali e asimmetriche:

- **A favore del committente**, circoscritta: pretese di terzi fondate sulla violazione di diritti di proprietà intellettuale **da parte del software** (garanzia di paternità e originalità del codice).
- **A favore del fornitore**, da richiedere espressamente perché mai offerta:

> *"Il Committente tiene indenne il Fornitore da ogni pretesa di terzi relativa ai contenuti pubblicati dagli utenti, alle decisioni di moderazione assunte dai referenti del Committente e all'esecuzione di istruzioni documentate impartite dal Committente."*

Il fondamento è l'allocazione del rischio secondo il controllo: i contenuti sono degli utenti, la moderazione è dell'ente, le istruzioni sono dell'ente. L'argomento che la ottiene: la denominazione sulla piattaforma è dell'alleanza, e con essa il rischio reputazionale; il controllo delle decisioni editoriali ne è il corollario, e con il controllo la responsabilità.

### 26.6 Accordo sul trattamento dei dati

Atto obbligatorio, distinto dal contratto di fornitura o suo allegato, con contenuto minimo prescritto: oggetto, durata, natura e finalità del trattamento; tipologie di dati e categorie di interessati; trattamento su sola istruzione documentata; obbligo di riservatezza dei soggetti autorizzati; misure di sicurezza; condizioni del ricorso a sub-responsabili; assistenza al titolare per i diritti degli interessati, le violazioni, la valutazione d'impatto; cancellazione o restituzione alla cessazione; elementi dimostrativi della conformità e facoltà di verifica.

Punti negoziali interni allo schema obbligatorio:

- **Sub-responsabili in regime di autorizzazione generale**, con comunicazione delle variazioni a 30 giorni e facoltà di opposizione motivata: l'autorizzazione specifica per singolo fornitore paralizza l'operatività.
- **Verifiche contenute**: una annuale, preavviso di 30 giorni, orario lavorativo, spese a carico del titolare salvo accertamento di violazioni gravi.
- **Allegato tecnico redatto dal fornitore**: la descrizione analitica e veritiera delle misure adottate delimita l'obbligazione alle misure dichiarate.

### 26.7 Durata, recesso, cessazione, sopravvivenza

- Durata determinata; rinnovo espresso, mai tacito.
- Recesso con preavviso non inferiore a 90 giorni, bilaterale.
- In caso di recesso anticipato del committente: corrispettivi maturati e costi già impegnati (impegni annuali verso fornitori terzi inclusi).
- Clausola di uscita: oggetto, formato e termine della consegna dei dati; imputazione degli oneri della consegna, che costituisce attività e non atto dovuto gratuito.
- Cessazione: cancellazione dei dati dai sistemi del fornitore entro termine determinato, con attestazione scritta — a tutela del fornitore stesso, che non deve permanere detentore di dati altrui.
- Sopravvivenza espressa di: riservatezza, proprietà intellettuale, limitazione di responsabilità, obblighi in materia di dati personali.

### 26.8 Legge applicabile e foro

> *"Il presente contratto è regolato dalla legge italiana. Per ogni controversia è competente in via esclusiva il Foro di [sede]."*

In difetto di clausola, l'individuazione avviene secondo le norme di conflitto, con possibile radicamento presso giudice straniero: per una persona fisica, il contenzioso all'estero è economicamente insostenibile anche in caso di fondatezza delle proprie ragioni. Ove la controparte estera non accetti la legge italiana, l'alternativa praticabile è la clausola di **mediazione preventiva obbligatoria** in sede europea, di norma accettata senza resistenza. Criterio di chiusura: foro straniero più corrispettivo contenuto è una combinazione da non sottoscrivere.

### 26.9 Clausole da non sottoscrivere in alcuna versione

1. Partenariati o consorzi con **responsabilità solidale**: la posizione corretta è quella di fornitore con contratto bilaterale.
2. **Cessione della titolarità** del motore, in qualunque formulazione (inclusa la qualificazione come opera su commissione).
3. Disponibilità superiore al 99% o reperibilità continuativa.
4. Responsabilità **priva di massimale**.
5. Foro straniero senza contropartita adeguata.
6. **Esclusiva o non concorrenza** che precluda installazioni presso altri soggetti: è la clausola più insidiosa dell'elenco, perché formulata in termini apparentemente innocui e distruttiva del valore prospettico del motore.
7. Assunzione della qualità di **titolare del trattamento**.

---

# PARTE VIII — PROFILI FISCALI, PREVIDENZIALI E ASSICURATIVI

## 27. Regime dei compensi

In assenza di corrispettivi, nessun adempimento. Alla maturazione di un corrispettivo, le opzioni in funzione della struttura del rapporto:

**Prestazione occasionale.** Idonea per compensi una tantum privi di continuità e organizzazione. Ritenuta d'acconto operata dal committente; soglia annua oltre la quale sorgono obblighi contributivi presso la gestione separata; nessuna posizione fiscale da aprire. 🕐 Le soglie vigenti vanno verificate al momento.

**Attività abituale.** Il canone periodico integra abitualità e impone l'apertura della posizione fiscale, con eventuale regime agevolato ove ne ricorrano i requisiti. Il canone mensile non è gestibile come prestazione occasionale.

**Committente estero intra-UE.** L'erogazione da parte di un ente di altro Stato membro comporta, per il prestatore stabilito in Italia, adempimenti specifici per le operazioni transfrontaliere fra soggetti economici: iscrizione all'archivio dei soggetti abilitati alle operazioni intracomunitarie e fatturazione con inversione contabile. L'omissione blocca i pagamenti presso gli uffici amministrativi dell'ente erogante. **[PROFESSIONISTA]** — commercialista, un incontro, alla prima cifra concreta.

**Compensi da progetti finanziati.** Il compenso del referente di progetto previsto dai bandi segue le regole di ammissibilità e rendicontazione del bando; la sua percezione integra comunque reddito e rientra nelle regole che precedono; si cumula con la dichiarazione di conflitto di interessi (24.3).

## 28. Compatibilità con altri rapporti in corso

Gli impegni assunti in programmi pubblici che prevedano un assegno o rimborso (servizio civile e figure affini) sono soggetti a discipline proprie di compatibilità con le attività lavorative, variabili per programma e per intensità dell'attività. **La verifica di compatibilità precede l'accettazione di qualunque compenso**, non la segue: la violazione comporta di norma la decadenza dal programma.

## 29. Copertura assicurativa

Necessaria dalla sottoscrizione del primo contratto, non prima. Requisiti della polizza di responsabilità civile professionale al momento dell'attivazione:

- estensione espressa ai danni da **violazione di dati personali** e da **interruzione del servizio** (esclusi in numerosi contratti standard);
- operatività per l'attività prestata **dall'estero**;
- massimale coerente con il massimale contrattuale di responsabilità;
- retroattività per fatti anteriori alla stipula ma denunciati in vigenza, ove ottenibile.

---
# PARTE IX — SCENARI DI RESPONSABILITÀ

Analisi delle fattispecie concrete, con individuazione delle fonti di responsabilità e delle tutele che operano in ciascuna. Gli scenari presuppongono l'assetto raccomandato (ente titolare, sviluppatore responsabile, contratto conforme alla Parte VII); per ciascuno è indicato l'aggravamento in caso di assetto difforme.

## 30. Violazione dei dati per vulnerabilità del codice

*Un difetto di autorizzazione consente a un utente di accedere a conversazioni altrui; l'accesso viene scoperto e segnalato.*

**Catena degli obblighi.** Comunicazione immediata al titolare; il titolare valuta e notifica all'autorità entro 72 ore; eventuale comunicazione agli interessati.

**Responsabilità del responsabile.** Sussiste se la vulnerabilità integra violazione delle misure di sicurezza **dichiarate** nell'allegato tecnico o della diligenza professionale. Le misure operanti: l'allegato tecnico redatto in modo veritiero delimita l'obbligazione; il massimale contrattuale contiene l'esposizione; la copertura assicurativa interviene sui danni; la documentazione dei collaudi eseguiti (verifiche di autorizzazione per tabella) prova la diligenza.

**Aggravamento in assetto difforme.** In assenza di ente titolare, la persona fisica è il destinatario diretto della notifica, dei reclami, delle sanzioni e delle azioni risarcitorie degli interessati.

## 31. Contenuto illecito pubblicato da un utente

*Un utente pubblica un contenuto diffamatorio verso un terzo; il terzo diffida il gestore.*

**Regime.** L'esenzione del prestatore di memorizzazione opera fino alla conoscenza effettiva. La diffida circostanziata la determina: dalla ricezione decorre il dovere di trattazione tempestiva. La valutazione dell'illiceità — che varia per ordinamento — compete al referente di moderazione dell'ateneo interessato; la rimozione o il mantenimento seguono la decisione, documentata nel registro.

**Tutele operanti.** Il registro delle segnalazioni prova la tempestività; la manleva del committente copre le decisioni dei suoi referenti; la garanzia dell'utente nei termini d'uso fonda la rivalsa verso l'autore.

**Errore da evitare.** La rimozione automatica e indiscriminata a ogni diffida espone al reclamo simmetrico dell'utente rimosso e presta il sistema all'uso censorio; la trattazione documentata secondo procedura è la condotta protetta.

## 32. Errore in un materiale didattico generato

*Una sintesi generata contiene un'affermazione errata; uno studente la studia e la contesta pubblicamente.*

**Profilo giuridico.** Contenuto identificato come generato e non verificato, con fonte accessibile: nessuna dichiarazione ingannevole, nessun affidamento qualificato tradito. Il profilo residuo non è risarcitorio ma reputazionale e istituzionale.

**Tutele operanti.** L'identificazione prescritta (P7); la correzione puntuale in esercizio; la funzione di approvazione del docente sui materiali derivati dai propri contenuti, che sposta la validazione sul soggetto competente.

## 33. Indisponibilità prolungata del servizio

*Un guasto del fornitore cloud rende la piattaforma indisponibile per un giorno.*

**Regime contrattuale.** L'indisponibilità imputabile a fornitori terzi è esclusa dal computo della disponibilità (26.3); i termini contrattuali sono di presa in carico, non di risoluzione; l'eventuale penale opera come riduzione del canone con tetto.

**Condotta dovuta.** Comunicazione tempestiva al referente del committente; registrazione dell'evento; ripristino secondo la procedura documentata. La resilienza della componente a file (i contenuti redazionali restano fruibili anche con la componente dinamica indisponibile) riduce l'impatto percepito.

## 34. Richiesta dell'autorità su comunicazioni private

*L'autorità giudiziaria di uno Stato dell'alleanza richiede i messaggi di un utente.*

**Condotta.** Trasmissione della richiesta al titolare, che ne verifica legittimità e perimetro; estrazione limitata al perimetro del provvedimento, con documentazione di quanto consegnato; nessuna comunicazione all'interessato ove il provvedimento la vieti; sospensione dei termini di conservazione sui dati oggetto della richiesta.

**Predisposizione necessaria.** Capacità tecnica di estrazione selettiva e integra (18.2). L'impossibilità materiale di adempiere a un ordine legittimo è autonoma fonte di responsabilità.

## 35. Utente rivelatosi minorenne

*Emerge che un utente registratosi come maggiorenne è minorenne.*

**Condotta.** Sospensione dell'account secondo i termini d'uso; conservazione dei dati necessari alla gestione di eventuali segnalazioni connesse; nessuna cancellazione immediata; valutazione con il referente istituzionale delle eventuali comunicazioni dovute.

**Tutela operante.** L'impostazione restrittiva preesistente (esclusione di messaggistica e scambio recapiti per i minori dichiarati) e la dichiarazione espressa, nei termini, del carattere autodichiarato dell'età circoscrivono il rimprovero muovibile al gestore.

## 36. Rivendicazione sul software da parte dell'ente

*A progetto avviato, l'ente sostiene che il software sviluppato "per il progetto" gli appartenga.*

**Elementi decisivi.** La cronologia del controllo di versione e i rilasci datati provano l'anteriorità; la dichiarazione di asset preesistente nella candidatura e la clausola di proprietà intellettuale nel contratto escludono la qualificazione come risultato o come opera su commissione; l'assenza di voci di spesa per sviluppo software nel bilancio del progetto priva la pretesa del fondamento economico.

Lo scenario illustra la funzione congiunta delle misure della sezione 24: nessuna di esse è formale; ciascuna è un elemento di prova predisposto in anticipo.

## 37. Profili penali: perimetro

Le fattispecie penali astrattamente evocabili nell'esercizio della piattaforma — trattamento illecito di dati, accesso abusivo, omissioni in materia di comunicazioni — presuppongono condotte dolose o gravemente devianti dalle procedure descritte nel presente dossier. Il rispetto delle procedure — segnatamente: nessuna lettura delle comunicazioni private, trattazione documentata delle segnalazioni, trasmissione al titolare dei provvedimenti dell'autorità, conservazione delle prove nelle fattispecie di reato — colloca l'attività fuori dal perimetro delle condotte punibili. Il presidio non è l'assenza di rischio astratto ma l'aderenza documentata alle procedure.

---

# PARTE X — QUADRO MULTIGIURISDIZIONALE

## 38. Ciò che è uniforme e ciò che varia

| Materia | Regime | Rilevanza operativa |
|---|---|---|
| Protezione dei dati | Regolamento direttamente applicabile: uniforme | Un'unica implementazione; varianti puntuali (età dei minori) assorbite dall'impostazione restrittiva |
| Età del consenso digitale | Varia fra 13 e 16 anni per Stato | Assorbita dalla soglia unica dei 18 anni per le funzioni sensibili |
| Servizi digitali e responsabilità del prestatore | Regolamento direttamente applicabile: uniforme | Un'unica implementazione |
| Nozione di contenuto illecito (diffamazione, odio, vilipendio) | **Varia per Stato** | Moderazione distribuita per ateneo con referenti locali |
| Diritto d'autore | Direttive armonizzate con attuazioni nazionali | Le regole prudenziali adottate (estratti, collegamenti, attribuzione) sono conformi in tutti gli Stati |
| Diritto all'immagine | Discipline nazionali difformi | Liberatorie presso la fonte; garanzia dell'utente caricante |
| Contratti | **Determinato dalla clausola di scelta** | Legge italiana e foro italiano da pattuire; in difetto, norme di conflitto |
| Autorità di controllo competente | Stato dell'interessato, con cooperazione | Interlocuzione in capo al titolare |
| Fisco sui compensi | Stato di stabilimento del prestatore, con adempimenti transfrontalieri | Sezione 27 |
| Accessibilità degli strumenti pubblici | Direttiva con recepimenti nazionali su standard comune (EN 301 549) | Un'unica implementazione sullo standard |

La tabella fonda la conclusione di metodo: la pluralità di Stati non moltiplica gli ordinamenti da rispettare; concentra la variabilità in due punti — la clausola contrattuale di legge e foro, e la valutazione locale dei contenuti — entrambi presidiati dall'assetto raccomandato.

---

# PARTE XI — SEQUENZA OPERATIVA DEGLI ADEMPIMENTI

## 39. Adempimenti per stato del progetto

### 39.1 Immediati (fase di sviluppo, nessun utente terzo)

1. Ospitalità locale delle risorse esterne (14.3).
2. Esclusione dall'indicizzazione; dicitura in lingua inglese (23.2).
3. Istituzione del registro dei trattamenti, anche in forma essenziale (7).
4. Definizione dei termini di conservazione, contestuale alla progettazione della base dati (12).
5. Predisposizione — non pubblicazione — di informativa, termini d'uso, regolamento, dichiarazione di accessibilità.
6. Prova della data del software: rilasci numerati e datati (24.2).
7. Registrazione del dominio autonomo del motore, intestato a recapito dedicato.
8. Verifica di anteriorità sulla denominazione del motore, alla sua definizione (23.4).

### 39.2 Alla disponibilità di un interlocutore istituzionale

1. Quesiti della sezione 12.5 del Documento tecnico, nell'ordine ivi indicato.
2. Proposta dell'assetto: ente titolare, sviluppatore responsabile, infrastruttura intestata all'ente.
3. Consegna della documentazione tecnica preparatoria della valutazione d'impatto.
4. Definizione delle modalità di presentazione del progetto e d'uso dei segni distintivi.

### 39.3 Alla presenza di una bozza contrattuale

1. **[PROFESSIONISTA]** Revisione legale della bozza, con mandato circoscritto alle cinque clausole decisive (25) e all'accordo sul trattamento.
2. Verifica delle clausole della sezione 26.9 (da non sottoscrivere).
3. Redazione dell'allegato tecnico delle misure di sicurezza.

### 39.4 Alla maturazione di un corrispettivo

1. Verifica di compatibilità con i rapporti in corso (28).
2. **[PROFESSIONISTA]** Commercialista: inquadramento e adempimenti transfrontalieri (27).
3. Attivazione della copertura assicurativa con i requisiti della sezione 29.
4. Dichiarazione di conflitto di interessi ove il corrispettivo provenga dall'ateneo di appartenenza o da progetti da esso amministrati (24.3).

### 39.5 All'attivazione del servizio (primo utente terzo)

Rinvio integrale alla sezione 9 del Documento tecnico, che costituisce la lista di controllo dell'attivazione. Sotto il profilo giuridico, le condizioni non derogabili: titolarità del trattamento formalizzata; accordo sul trattamento sottoscritto; documentazione pubblicata; referente di moderazione operativo; procedura di violazione predisposta.

## 40. Quando è necessario il professionista: riepilogo

| Momento | Professionista | Perimetro |
|---|---|---|
| Bozza contrattuale da sottoscrivere | Legale | Cinque clausole decisive; accordo sul trattamento; clausole vietate |
| Candidatura a finanziamento con clausole sui risultati | Ufficio progetti dell'ateneo; in subordine, legale | Clausole su risultati e materiale preesistente |
| Prima cifra concreta da percepire | Commercialista | Inquadramento; adempimenti transfrontalieri; compatibilità |
| Deposito del marchio del motore | Consulente in proprietà industriale | Ove e quando la replicabilità sia concreta |

In ogni altro momento, l'assistenza professionale è prematura e il presente dossier, unitamente al Documento tecnico, costituisce la base operativa sufficiente.

---

*Dossier legale — revisione di agosto 2026. Il documento non costituisce parere legale. I dati contrassegnati con 🕐 vanno verificati alla fonte prima dell'utilizzo. Da rileggere integralmente al ricorrere di uno degli eventi della Parte I; le Parti VII e XI si consultano al ricorrere delle rispettive condizioni.*
