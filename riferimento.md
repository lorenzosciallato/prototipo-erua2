# ERUA connect — Foglietto di riferimento unico

Documento di contesto del progetto. Va letto all'inizio di ogni sessione e prima
di ogni modifica sostanziale all'architettura, alla struttura dei dati o alle
modalità di pubblicazione. Consolida in un unico testo il documento tecnico, il
dossier legale, le appendici di cybersecurity, il playbook di validazione dei
test e il playbook di continuità operativa.

> **Natura del documento.** Le parti legali NON costituiscono parere legale:
> sono una mappa dei rischi e delle clausole rilevanti, per un'interlocuzione
> informata con gli uffici legali degli enti e per individuare i pochi momenti in
> cui serve un professionista. Tali momenti sono contrassegnati **[PROFESSIONISTA]**.

## Legenda

| Simbolo | Significato |
|---|---|
| ✅ | Indicazione confermata, da applicare |
| ⚠️ | Parzialmente valida: nucleo corretto ma con elementi da correggere |
| ❌ | Errata o fuorviante: da non applicare |
| 🕐 | Dato variabile (prezzi, listini, denominazioni): verificare alla fonte prima dell'uso verso terzi |
| **[MOTORE]** | Segnaposto per il nome commerciale del software, da definire |
| **[PROFESSIONISTA]** | Punto in cui serve un legale o un commercialista |

## Indice

0. Principio organizzativo e criterio di valutazione
1. Regole permanenti (P1–P9)
2. Architettura
3. Sicurezza (con implementazioni concrete)
4. Prestazioni, traffico e costi
5. Controllo automatico della sicurezza del codice
6. Contenuti: diritti di terzi e obblighi normativi
7. Attivazione del servizio (GDPR operativo)
8. Quadro giuridico (protezione dati, responsabilità sui contenuti, IA, marchi)
9. Il contratto
10. Profili fiscali, previdenziali e assicurativi
11. Scenari di responsabilità
12. Quadro multigiurisdizionale
13. Playbook di implementazione (gate 0–8) e validazione dei test
14. Continuità operativa e rischi nel tempo
15. Decisioni assunte e quesiti istituzionali
16. Quando serve un professionista
17. Appendice — errori e imprecisioni da non commettere

---

## 0. PRINCIPIO ORGANIZZATIVO E CRITERIO DI VALUTAZIONE

### 0.1 Le due dimensioni indipendenti

**Dimensione A — completezza del prodotto.** La piattaforma si sviluppa sempre
completa: accesso, chat, notifiche, moderazione, segnalazioni, cancellazione
account, esportazione dati e pannello di amministrazione si costruiscono e
collaudano integralmente, nelle condizioni in cui funzionerebbero con migliaia di
utenti. Non esistono versioni ridotte da completare dopo.

**Dimensione B — accesso e titolarità dei dati.** Esiste un unico passaggio di
stato rilevante: **la registrazione del primo utente diverso dallo sviluppatore.**
Prima di quel momento il collaudo si esegue con account propri, su indirizzi di
posta propri: nessun profilo di rischio sulla protezione dei dati (la normativa
tutela i dati di terzi). Da quel momento si attiva la procedura della sezione 7;
poiché il software è già completo, si tratta di verifiche e pubblicazioni, non di
sviluppo.

**Criterio derivato.** Le regole disciplinano *chi accede*, *cosa si diffonde
all'esterno* e *quali costi si generano*. Nessuna regola limita ciò che si può
sviluppare: una prescrizione che impedisse lo sviluppo di una funzione sarebbe,
per ciò stesso, formulata male.

### 0.2 Criterio di valutazione preventiva di ogni nuova funzione

1. **Comporta diffusione verso l'esterno?** (invio posta, pubblicazione file,
   chiamata a terzi, contenuto accessibile senza autenticazione) → si applicano
   le sezioni 6 e 3.
2. **Può generare consumo non presidiato?** → serve un limite di frequenza e un
   tetto di spesa (4.7).
3. **Continua a funzionare senza presidio?** In caso negativo deve almeno
   segnalare il proprio malfunzionamento (2.12).
4. **Tratterà dati personali di terzi dopo l'attivazione?** → va sviluppata
   integralmente adesso e aggiunta alla procedura della sezione 7.

---

## 1. REGOLE PERMANENTI (P1–P9)

Nove prescrizioni vincolanti dall'avvio. Ciascuna oggi costa poco e in seguito
costerebbe una riscrittura.

**P1 — Nessuna credenziale conservata.** Nessuna password, in alcuna forma, in
alcuna fase. Autenticazione tramite collegamento monouso via email. Elimina la
categoria di incidente più frequente (compromissione credenziali) e le funzioni
accessorie di recupero.

**P2 — Verifica di autorizzazione su ogni richiesta.** Non basta che l'utente sia
autenticato: la risorsa richiesta deve appartenergli. È la vulnerabilità più
diffusa; introdurla dopo comporta la revisione di ogni interrogazione. Vedi 3.2.

**P3 — Il contenuto degli utenti è trattato come testo, mai come codice.** Ogni
contenuto utente entra nella pagina solo tramite costrutti che ne impediscono
l'interpretazione. Altrimenti può contenere istruzioni eseguibili nel browser di
chi lo visualizza (sottrazione di sessione).

**P4 — Nessun segreto nel codice pubblicato.** Chiavi, token, credenziali di
servizio, stringhe di connessione non compaiono nei file versionati. Un controllo
automatico ne verifica l'assenza prima di ogni pubblicazione. I sistemi automatici
che scandiscono i repository pubblici trovano una credenziale esposta in minuti.
Distinzione essenziale fra chiave pubblica di servizio e chiave riservata: 2.6.

**P5 — Nessuna risorsa caricata da server di terzi nel browser dell'utente.**
Caratteri, librerie, icone, fogli di stile sono ospitati sull'infrastruttura del
progetto. Ogni risorsa richiesta a un server esterno trasmette a quel server
l'IP dell'utente: è trattamento e, se il server è extraeuropeo, trasferimento di
dati personali. Vedi 6.1 e 8 (trasferimenti).

**P6 — Ogni servizio a consumo ha un limite di spesa configurato prima
dell'attivazione.** Vale per IA, cloud, invio email. I servizi a scalabilità
automatica fatturano ogni richiesta e non impongono limiti propri: un errore o un
abuso possono generare importi rilevanti in poche ore.

**P7 — Ogni contenuto generato automaticamente è identificato come tale.** Riporta
in modo visibile fonte, data, sistema usato, indicazione di contenuto generato e
non verificato, e un canale per segnalare errori. Obbligo normativo dal 2 agosto
2026 (6.5) e presidio di attendibilità scientifica.

**P8 — Ogni dichiarazione dell'informativa è vincolante.** Non si dichiarano
garanzie che il sistema non mantiene. Le tre dichiarazioni non veritiere più
ricorrenti: cifratura punto a punto, non uscita dei dati dall'UE, cancellazione
immediata. Formulazioni corrette in 6.6.

**P9 — Ogni dato deve poter essere estratto.** Esportazione in formati standard;
nessuna logica applicativa in contesti da cui non sia recuperabile. Necessario per
i diritti degli interessati, per l'eventuale trasferimento della gestione, per la
chiusura ordinata e per la replicabilità del modello.

**Prescrizione ulteriore.** Il prototipo non viene indicizzato dai motori di
ricerca fino all'eventuale ufficializzazione (una riga di configurazione).

---

## 2. ARCHITETTURA

### 2.1 Schema generale

```
   PROCESSI AUTOMATICI (server dedicato)      APPLICAZIONE (file statici)
   ─────────────────────────────────────      ──────────────────────────────
   notizie dei siti istituzionali             HTML, CSS, JavaScript
   bandi e scadenze              ─────────►   senza framework
   articoli e podcast            producono    suddivisa in moduli
   trascrizioni e materiali      file JSON        │
                                                  ▼
                                    SERVIZIO GESTITO (regione europea)
                                    ─────────────────────────────────
                                    account, contenuti degli utenti,
                                    messaggistica, segnalazioni,
                                    notifiche, archiviazione file
```

### 2.2 Criterio di ripartizione

Non tecnologico ma legato alla natura del dato. Un dato identico per tutti,
aggiornato con cadenza giornaliera e non modificabile dall'app, non richiede un
database (→ file JSON serviti staticamente, costo nullo). Un dato differenziato
per utente, in modifica continua e da proteggere individualmente, lo richiede
(→ database, costo nullo fino a qualche centinaio di utenti). La componente a file
dà resilienza: l'interruzione di un processo automatico non ferma l'app, che
continua a esporre l'aggiornamento precedente. I contenuti redazionali non vanno
nel database nemmeno quando disponibile.

### 2.3 Componente di presentazione

HTML, CSS, JavaScript in moduli. **Esclusi i framework applicativi**: comportano
sistema di compilazione, gestore di pacchetti e centinaia/migliaia di dipendenze,
ciascuna superficie di attacco, licenza da verificare ed elemento soggetto a
rottura; il beneficio (gestione di interfacce complesse) non serve al progetto.
**Vincolo funzionale:** la navigazione fra sezioni resta su schermata unica, senza
caricamento di pagine distinte — compatibile con la suddivisione in moduli.

### 2.4 Suddivisione del codice

Quattro categorie di file:

- **File di configurazione (unico):** denominazione, marchio, palette, elenco
  atenei, lingue attive, contatti, riferimenti ai testi legali. È l'elemento che
  rende il progetto replicabile presso un'altra alleanza cambiando poche righe;
  traduce sul piano tecnico l'assetto proprietario (9.2). Adottarlo dopo = riscrittura.
- **File dei testi dell'interfaccia (uno per lingua):** tutte le stringhe visibili,
  mai nel codice. Aggiungere una lingua dopo, senza questa separazione, = revisione
  integrale.
- **File di dati (uno per sezione),** prodotti dai processi automatici e caricati
  su richiesta. La sezione sociale non deve caricare i dati della didattica
  (determinante sui dispositivi di fascia bassa).
- **Moduli di codice (uno per sezione),** caricati su richiesta.

### 2.5 Componente a database — servizio gestito PostgreSQL, regione europea

Motivazioni in ordine di rilevanza:

- **Natura relazionale del dominio.** Studente→ateneo, contenuti, risposte,
  progetti su bandi: un DB relazionale gestisce nativamente le relazioni. Un DB
  documentale non ha il concetto di relazione: impone la **duplicazione dei dati**
  (denormalizzazione), e ogni duplicazione è un punto di divergenza (modificare
  l'immagine di profilo comporta riscriverla in tutti i contenuti, con stato
  incoerente in caso di interruzione).
- **Verificabilità delle regole di sicurezza.** Su PostgreSQL la regola che limita
  le conversazioni ai partecipanti è poche righe dichiarative, verificabili da un
  tecnico terzo. Essenziale per un progetto la cui criticità è la dipendenza da un
  unico sviluppatore (14/11.3).
- **Prevedibilità della spesa.** I sistemi documentali a consumo fatturano ogni
  lettura, senza tetto. Un servizio a canone fisso, al superamento delle risorse,
  degrada le prestazioni invece di aumentare la fattura.
- **Ricerca testuale nativa** (requisito del progetto), comprensiva delle forme
  flesse. I documentali richiedono un servizio esterno a pagamento da sincronizzare.
- **Portabilità:** una copia PostgreSQL è ripristinabile ovunque.
- **Servizi inclusi:** autenticazione via magic link, aggiornamento in tempo reale
  per la messaggistica, archiviazione file, regione UE, piano gratuito adeguato allo
  sviluppo.
- **Esclusa l'installazione su server proprio:** comporterebbe gestione diretta di
  copie di sicurezza, aggiornamenti del SO e continuità; il server dedicato resta
  per le elaborazioni pesanti programmate.

### 2.6 Elementi caratteristici del servizio gestito

**Chiave pubblica nel codice dell'app.** La chiave d'identificazione dell'app è
nel codice pubblicato ed è conforme: non conferisce privilegi. **L'intero presidio
di sicurezza sono le politiche di accesso sulle tabelle (RLS).** Conseguenza
vincolante: ogni tabella ha le proprie politiche, definite prima del primo record e
collaudate con tentativo effettivo di accesso ai dati di un altro utente. **Una
tabella priva di politiche espone i dati a chiunque.** La chiave di servizio (che
scavalca le politiche) risiede solo sul server e non compare mai nel codice dell'app
(P4).

**Sospensione dei progetti inattivi.** Il piano gratuito sospende i progetti dopo
un periodo di inattività: rilevante per le presentazioni. Contromisura: processo
giornaliero che effettua una richiesta, oppure piano a pagamento nel periodo delle
presentazioni.

**Regione non modificabile:** si definisce alla creazione e va scelta nell'UE.

### 2.7 Decisioni sul modello dei dati (onerose da cambiare dopo)

a) **Identificativi casuali** (non progressivi): i progressivi rivelano il numero
di record e ne consentono l'enumerazione.
b) **Contatori atomici:** usare l'incremento atomico del DB o calcolare il valore
alla lettura; leggere-incrementare-riscrivere perde aggiornamenti in concorrenza.
c) **Cancellazione account con anonimizzazione dei contenuti:** si sostituisce il
riferimento all'autore con un segnaposto (le conversazioni altrui restano leggibili).
Da indicare nei termini d'uso (P8).
d) **Marcatura dei dati di collaudo:** un campo per riga identifica i record di
test → rimozione selettiva all'attivazione e permanenza dei dati per la modalità
dimostrativa (7.6).
e) **Data di creazione e ultima modifica su ogni record.**
f) **Date e orari in formato universale;** conversione al fuso dell'utente solo in
visualizzazione (rilevante per le scadenze dei bandi).

### 2.8 Processi automatici

- **Idempotenza:** ogni fase salva il risultato e può essere rieseguita senza
  effetti collaterali (riavvio dopo interruzione senza stati incoerenti).
- **Segnalazione di completamento:** il malfunzionamento si rileva dall'assenza
  della segnalazione, non dalle lamentele degli utenti.
- **Rimozione dei file temporanei sempre,** anche in caso di errore.
- **Suddivisione delle elaborazioni** lunghe in fasi persistenti (acquisizione,
  trascrizione, sintesi, generazione).
- **Versioni bloccate** di librerie e interfacce esterne (mai "ultima versione").
- **Conservazione dei dati precedenti** per alcuni cicli (tutela da modifiche
  strutturali delle fonti).

### 2.9 Compatibilità fra versioni

Al rilascio, parte degli utenti ha ancora la versione precedente in cache. Ai file
di dati si aggiungono campi, non se ne rinominano/rimuovono; ogni file di dati ha
un numero di versione e il codice sa interpretare la precedente; i dati locali si
migrano previa copia; il ricaricamento forzato avviene con preavviso e senza
perdita dei contenuti in redazione.

### 2.10 Dati sul dispositivo

Annotazioni, evidenziazioni, bacheca restano sul dispositivo dell'utente (nessun
costo, nessuna esposizione, nessun obbligo di trattamento). L'eventuale
sincronizzazione fra dispositivi è facoltativa, **disattivata per impostazione
predefinita**, cifrata, con avviso esplicito. Serve un avviso e un'esportazione
immediata perché la cancellazione dei dati del browser perde i materiali. **Gestione
dei conflitti per costruzione:** i materiali personali non si sincronizzano affatto;
le operazioni verso il server si accodano e si trasmettono al ripristino della
connessione, con coda visibile all'utente.

### 2.11 Gestione del codice

- Ogni modifica passa dal controllo di versione; mai interventi diretti
  sull'ambiente pubblicato (senza cronologia non c'è ripristino).
- Ramo di sviluppo distinto dal ramo pubblicato; ambiente di collaudo separato
  appena esistono dati non riproducibili.
- Registro delle versioni rilasciate (anche prova della data di realizzazione: 9.3).

### 2.12 Rilevazione dei malfunzionamenti (tutti a costo nullo)

- **Raccolta degli errori applicativi,** configurata per non trasmettere il
  contenuto delle pagine né dati degli utenti; indicata nell'informativa.
- **Canale di segnalazione interno all'app** che acquisisce dispositivo, browser,
  sezione, con smistamento in coda.
- **Controllo di disponibilità del servizio** con notifica.

---
## 3. SICUREZZA (con implementazioni concrete)

### 3.1 Modello delle minacce

| Soggetto | Probabilità | Obiettivo | Contromisura principale |
|---|---|---|---|
| **Errore dello sviluppatore** | **Molto alta** | — | controlli automatici, copie di sicurezza, ambiente di collaudo |
| Utente che sperimenta con gli strumenti del browser | Alta | dati di altri utenti | verifica di autorizzazione (3.2) |
| Utente che molesta un altro utente | Alta | contatto reiterato, elusione del blocco | blocco efficace, limiti, moderazione |
| Sistemi automatici di scansione | Alta | credenziali esposte, moduli da saturare | assenza di segreti, limiti di frequenza |
| Raccolta automatizzata di dati | Media | elenco degli utenti | limiti di frequenza, assenza di elenchi completi |
| Attacco a fini di consumo economico | Media | generare costi | tetti di spesa, allarmi, funzioni onerose non esposte |
| Attaccante specializzato | Bassa | dati riservati | le contromisure precedenti alzano la soglia |

Lo scenario prevalente è l'errore proprio: le contromisure contro l'errore
proprio hanno priorità su tutte le altre.

### 3.2 Autorizzazione / IDOR / Row Level Security — IL PUNTO PIÙ CRITICO

Alla richiesta di una risorsa vanno eseguite **due verifiche distinte**:
1. **Autenticazione** — l'utente è riconosciuto.
2. **Autorizzazione** — la risorsa è riferibile a quell'utente.

Omettere la seconda consente a qualunque utente autenticato di accedere alle
risorse altrui modificando il riferimento nella richiesta: è la vulnerabilità
**IDOR (Insecure Direct Object Reference)**, rilevabile in tempi brevissimi anche
da non specializzati; su dati personali è una violazione soggetta a notifica.

**Criterio di progettazione.** L'identità del richiedente si ricava
**esclusivamente dal token di sessione**, mai da parametri trasmessi dall'app. Si
verifica poi la relazione fra tale identità e la risorsa.

**Presidio a livello di database.** Su PostgreSQL la verifica è una policy sulla
tabella: è il DB stesso a rifiutare le righe non riferibili al richiedente. Opera
anche in presenza di difetti nel codice applicativo. È l'unico presidio effettivo.

**Regola d'oro:** ogni tabella con dati riferibili a un utente ha almeno una policy
`SELECT` che limita l'accesso all'utente autenticato.

**Scenario A — lettura di messaggi altrui.** C (non partecipante) invia
`GET /api/messages?conversation_id=12345` col proprio token. Se la policy è
assente o errata, riceve i messaggi.

Policy CORRETTA:
```sql
CREATE POLICY "messages_select_policy" ON messages
FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
    )
);
```
Policy ERRATA (che l'IA potrebbe generare):
```sql
CREATE POLICY "Users can read messages" ON messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```
Perché è errata: presuppone `sender_id`/`receiver_id` nella tabella messaggi. Se il
modello usa una tabella di partecipazione separata, la condizione non trova
corrispondenze e la policy **non limita nulla**.

**Scenario B — modifica di contenuti altrui.** `PUT /api/posts/67890` col token di
B su un post di A.
```sql
CREATE POLICY "Users can update their own posts" ON posts
FOR UPDATE USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);
```
Errore comune: dimenticare `WITH CHECK`. `UPDATE` richiede entrambe: `USING`
(righe modificabili) e `WITH CHECK` (verifica del risultato). Senza `WITH CHECK`
un utente potrebbe modificare un post facendone diventare autore un altro.

**Scenario C — cancellazione account altrui.** L'ID utente si ricava **solo** dal
token; l'endpoint è `DELETE /api/users/me` e non accetta parametri (mai
`DELETE /api/users/12345`).

**Scenario D — accesso dopo l'uscita dalla conversazione.**
```sql
CREATE POLICY "Access only while participating" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
        AND (leave_date IS NULL OR leave_date > messages.created_at)
    )
);
```

Policy di inserimento e cancellazione per `messages`:
```sql
CREATE POLICY "messages_insert_policy" ON messages
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
    )
);
CREATE POLICY "messages_delete_policy" ON messages
FOR DELETE USING (auth.uid() = sender_id);
```

**Workflow TDD (obbligatorio per ogni endpoint che accede a dati di un utente):**
1. Scrivi il test che **tenta** di accedere ai dati di un altro utente.
2. Eseguilo → **deve fallire** (policy non ancora esistente).
3. Scrivi la policy RLS.
4. Eseguilo → **deve passare**.

Il test va scritto PRIMA della policy: se scritto dopo, viene "aggiustato" per
passare e maschera la vulnerabilità. Vedi 3.15 per la validazione dei test e 13
(Gate 2) per l'elenco completo dei test di autorizzazione.

**Collaudo manuale** (non lettura del codice): due account, si genera un contenuto
col primo e si tenta l'accesso col secondo invocando direttamente il servizio,
senza l'interfaccia. Da ripetere per ogni tabella con dati personali e a ogni
nuova tabella.

### 3.3 Accesso e sessioni

- Collegamento monouso, validità pochi minuti, un solo uso, non prevedibile.
- Elenco chiuso dei domini di posta ammessi (atenei dell'alleanza).
- **I messaggi di errore non rivelano se un indirizzo è registrato:** messaggio
  invariante ("se l'indirizzo è valido, riceverà il collegamento"). Altrimenti si
  ricostruisce l'elenco utenti per tentativi.
- Sessione di durata contenuta con rinnovo in presenza di attività; revoca di
  tutte le sessioni attive.
- Verifica periodica del permanere del rapporto con l'ateneo (le caselle degli ex
  studenti restano attive a lungo): scadenza account con riconferma periodica.

Generazione e verifica del magic link, con hash del token in DB:
```python
import secrets, hashlib
from datetime import datetime, timedelta

def generate_magic_token(email):
    token = secrets.token_hex(32)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    store_token_in_db(email, token_hash, expires_at)
    send_email(email, token)  # token in chiaro solo al destinatario

def verify_magic_token(token, email):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    record = get_token_from_db(token_hash)
    if not record or record['expires_at'] < datetime.utcnow():
        raise InvalidTokenError()
    if record['used']:
        raise TokenAlreadyUsedError()
    mark_token_as_used(record['id'])
    return create_session(email)
```

Cookie di sessione — **`HttpOnly`, `Secure`, `SameSite=Lax`**, durata 24 ore con
rinnovo in presenza di attività:
```python
response.set_cookie(
    key='session_id', value=session_id,
    httponly=True, secure=True, samesite='Lax', max_age=86400
)
```
Se il token stesse in `localStorage` o in un cookie leggibile da JavaScript, un
XSS ne consentirebbe la sottrazione; `HttpOnly` lo impedisce.

### 3.4 Contenuti pubblici

- Contenuto trattato come testo (P3).
- Limiti di frequenza su pubblicazioni, risposte, segnalazioni.
- Modifica/cancellazione riservate all'autore; cancellazione account con
  anonimizzazione (2.7c).
- Segnalazione su ogni elemento, sempre visibile.
- **Insieme dei caratteri ammessi negli pseudonimi limitato in generazione:** uno
  pseudonimo compare in molti contesti; se contenesse caratteri di controllo
  sarebbe un vettore di iniezione in ciascuno.

### 3.5 Messaggistica e contatti (attiene anche alla sicurezza personale)

- **Policy sul DB che nega la lettura ai non partecipanti (3.2): è il presidio
  effettivo;** i controlli applicativi sono solo di usabilità.
- Apertura conversazione subordinata ad accettazione reciproca (elimina il
  messaggio non sollecitato, vettore principale delle molestie).
- Blocco esteso alle nuove richieste di contatto, non percepibile dal bloccato.
- Limite alle richieste reiterate verso lo stesso destinatario.
- Avviso allo scambio di recapiti (uscita dall'ambito della piattaforma).
- Numero di telefono escluso dalla prima versione.
- Cancellazione automatica a fine conservazione (eccezione: sospensione del termine
  in pendenza di segnalazione, vedi 7 e 8).
- Nessuna dichiarazione di cifratura punto a punto (P8); formulazione corretta 6.6.
- Percorso prioritario per molestie, minacce, rischio per l'incolumità (7.5).

### 3.6 File caricati

- Compressione e ridimensionamento nel browser prima della trasmissione (4.2).
- **Limiti di dimensione e tipo applicati anche lato server** (i controlli nel
  browser sono eludibili — principio generale: ogni controllo lato browser va
  replicato sul server).
- Verifica del tipo sul contenuto del file, non sull'estensione.
- I file caricati non sono serviti dal dominio dell'app (un file interpretabile
  non deve acquisire i privilegi dell'app).
- **Rimozione automatica dei metadati dalle immagini** (spesso contengono le
  coordinate GPS di scatto).

### 3.7 Collegamenti esterni

- Solo protocolli sicuri.
- Apertura con attributi che impediscono alla pagina di destinazione di operare
  sulla pagina di origine.
- Pagina intermedia con il dominio effettivo di destinazione (tutela dai link
  mascherati).
- **Nessun reindirizzamento che accetti la destinazione come parametro** (metodo
  consueto per link fraudolenti che mostrano il dominio legittimo come origine).

### 3.8 Intestazioni di sicurezza, CSP e CORS

- **Divieto di incorporamento in pagine di terzi** (contro sovrapposizione di
  elementi invisibili e induzione ad azioni non volute).
- **Politica sui contenuti (CSP):** definisce quali codici il browser esegue e da
  quali origini; configurata bene neutralizza un'eventuale iniezione.
- **Trasporto sicuro obbligatorio (HSTS).**
- **CORS** configurato per accettare richieste solo dal dominio dell'app.

Esempio CSP:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.erua-connect.eu
```
*Presupposto:* l'efficacia della CSP richiede l'assenza di codice nel markup
(niente gestori di eventi in linea né blocchi in linea): da fare insieme alla
suddivisione del codice (2.4).

### 3.9 Abuso della logica applicativa

- Limiti per utente e per unità di tempo su pubblicazione, messaggi, richieste di
  contatto, segnalazioni, ricerche, generazione materiali.
- Limite complessivo ulteriore sulle operazioni onerose.
- Nessuna funzione onerosa accessibile senza autenticazione.
- Contro le registrazioni automatiche: campi non visibili all'utente ma compilati
  dai bot, e verifica comportamentale (rischio contenuto con accesso vincolato ai
  domini istituzionali; i moduli pubblici di contatto restano esposti).
- Contro la raccolta automatizzata: nessun elenco completo ottenibile con una sola
  richiesta, limiti sulle interrogazioni reiterate, protezioni del livello di
  distribuzione.

### 3.10 Catena di fornitura del software

- Dipendenze al minimo (la condizione attuale, prossima all'assenza di dipendenze,
  è un vantaggio di sicurezza, costo e licenze).
- Le librerie indispensabili si ospitano localmente, versione vincolata e verifica
  d'integrità del file.
- Verifica automatica delle vulnerabilità note nelle dipendenze.
- **Rischio dei pacchetti inesistenti:** i sistemi di generazione del codice
  possono indicare librerie non esistenti; esistono soggetti che pubblicano
  pacchetti con quei nomi in attesa di installazioni automatiche. Contromisura in 5.3.

### 3.11 Registrazione degli eventi (logging)

Si registrano: accessi, azioni amministrative, decisioni di moderazione,
esportazioni, modifiche dei permessi. **Non** si registrano: contenuto dei
messaggi, token integrali. Gli IP nei registri sono dati personali (conservazione
limitata, 7.9). **Il registro delle azioni amministrative non è modificabile da
chi ha privilegi amministrativi** (altrimenti non ha valore probatorio).

Cosa loggare / cosa no:

| Categoria | Loggare | Non loggare |
|---|---|---|
| Accessi | email (hash), timestamp, esito, IP (hash) | password, token in chiaro |
| Richieste API | endpoint, metodo, user_id, timestamp | corpo della richiesta, parametri sensibili |
| Errori | tipo, stack trace anonimizzato, timestamp | contenuto della richiesta, dati utente |
| Azioni amministrative | chi/cosa/quando | dati modificati in chiaro |
| Segnalazioni | id segnalante/segnalato, motivazione, esito | contenuto (conservato separatamente) |

Formato log (esempio) e conservazione: accessi/operazioni 30 giorni; sicurezza
(accessi falliti, tentativi di escalation) 90 giorni; amministrativi 24 mesi.
```json
{ "timestamp": "2026-08-09T22:30:00Z", "level": "info", "service": "erua-api",
  "event": "user_login", "user_id": "…", "ip_hash": "…", "success": true }
```

### 3.12 Contromisure contro l'errore proprio (priorità assoluta)

- **Verifica automatica dell'assenza di segreti prima di ogni pubblicazione,** con
  interruzione in caso di rilevamento (miglior rapporto danno evitato/onere;
  implementare per prima).
- **Copie di sicurezza automatiche con ripristino verificato almeno una volta** su
  ambiente distinto (una copia mai ripristinata non è una garanzia).
- **Ambiente di collaudo separato.**
- **Commutazione in sola lettura** eseguibile in tempi brevi.
- **Verifiche automatiche sui tre flussi critici** prima dell'attivazione: accesso,
  pubblicazione di un contenuto, invio di un messaggio.

### 3.13 Sanitizzazione input e dati personali nei prompt IA

**XSS.** Ogni contenuto utente visualizzato in HTML passa da una funzione di escape:
```python
def escape_html(text):
    if not text: return ''
    for old, new in {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','/':'&#x2F;'}.items():
        text = text.replace(old, new)
    return text
```

**PII nei prompt IA.** La generazione di materiali parte da contenuti didattici; un
PDF caricato può contenere dati personali (nome, email, matricola, data di nascita,
firma). Includerli nel prompt configura: data breach (trasmissione a un terzo senza
base giuridica), violazione delle condizioni d'uso del servizio IA, ed eventuale
trasferimento extra-UE. Contromisure:

1. **Sanitizzazione del prompt** prima dell'invio:
```python
import re
def sanitize_prompt_for_ai(text):
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL]', text)
    text = re.sub(r'\+?[0-9\s\-\(\)]{8,15}', '[TELEFONO]', text)
    text = re.sub(r'[A-Z]{2}\d{4,6}', '[MATRICOLA]', text)  # pattern ateneo da configurare
    # nomi propri: la via robusta è un riconoscitore di entità (NER); in sua
    # assenza, chiedere conferma all'utente
    return text
```
2. **Esclusione dei metadati del file** dall'estrazione del testo.
3. **Prompt design:** includere l'istruzione esplicita —
   *"Il testo seguente può contenere dati personali. Non restituirli nella risposta.
   Restituisci esclusivamente il contenuto didattico. Non imparare da questo testo;
   non conservarlo."*
4. **Checklist di sterilizzazione:** email rimosse, telefoni rimossi, matricole
   rimosse, firma rimossa, nomi propri sostituiti (se rilevabili), metadati esclusi.
5. **Prompt injection:** contenuto che sembra un'istruzione ("Ignora le istruzioni")
   va bloccato.

**Limite:** la sanitizzazione non è perfetta. In caso di dubbio, segnalare
all'utente e chiedere conferma; **non inviare mai all'IA in assenza di sanitizzazione.**
Regola conseguente (posizione di deployer, 8): **nessun dato personale degli utenti
confluisce nelle istruzioni ai modelli**, salvo necessità dichiarata nell'informativa.

### 3.14 Backup cifrati

I backup sono il secondo punto di esposizione più critico dopo il DB attivo. I
servizi gestiti cifrano il DB attivo, ma i dump esportati spesso viaggiano in
chiaro. Rischi: bucket reso pubblico per errore; backup non cifrato leggibile via
altra vulnerabilità (LFI).

```bash
# Backup notturno cifrato
pg_dump "$DATABASE_URL" | gpg --symmetric --cipher-algo AES256 \
  --passphrase-file /run/secrets/backup_key.gpg > /backups/$(date +%Y%m%d)_db.sql.gpg
# Upload su storage PRIVATO
aws s3 cp /backups/$(date +%Y%m%d)_db.sql.gpg s3://erua-backups/ --storage-class STANDARD_IA
```
Regole: cifratura anche in transito (HTTPS/SFTP); bucket privato; **chiave di
cifratura conservata separatamente** dal codice e dalla produzione (KMS o supporto
fisico); **rotazione della chiave ogni 6 mesi**; **test di ripristino cifrato**
periodico (decifra → importa in DB di test → verifica integrità e conteggi).
Responsabilità della cifratura: del responsabile del trattamento (lo sviluppatore).

### 3.15 Validazione dei test di sicurezza generati dall'IA

Un test di sicurezza che passa **per il motivo sbagliato** è peggio di un test che
fallisce: dà falsa sicurezza. Esempi di passaggio errato: il test accede a un ID
inesistente (403 mascherato da 404); interpreta un 404 come 403; non copre un
endpoint correlato (modifica di stato, cancellazione).

**Quattro livelli di validazione:**

| Livello | Descrizione | Chi |
|---|---|---|
| 1. Scrittura del test | l'IA scrive il test (TDD) | IA |
| 2. Test del tester | esegui manualmente lo scenario d'attacco (Postman/Bruno/curl) | Tu |
| 3. Revisione del test | chiedi all'IA di spiegare il test e trovarne i buchi | IA |
| 4. Secondo paio di occhi | un terzo tenta di violare il sistema con un account | Terzo |

**Livello 2 — procedura.** Crea utenti reali A (crea conversazione con B), B
(partecipa), C (non partecipa); ottieni i token; con il token di C tenta la lettura:
```
GET /api/messages?conversation_id=conversation_12345
Authorization: Bearer <token_di_C>
→ atteso: 403 Forbidden oppure []  (se ottieni i messaggi: RLS fallata, IDOR → fermati)
```
Varia: token scaduto; senza token; token di A ma ID di un'altra conversazione;
modifica di un messaggio di A col token di B; cancellazione di un messaggio di A
col token di B.

**Livello 3 — prompt:** *"Hai scritto questo test [incolla]. Dimmi: 1) quali
scenari d'attacco copre; 2) quali NON copre; 3) cosa potrebbe andare storto (passa
per il motivo sbagliato? usa un ID inesistente? verifica il 403 effettivo?);
4) come migliorarlo."*

**Livello 4 — istruzioni al terzo:** provare a leggere messaggi altrui, modificare
un post non proprio, cancellare un messaggio non inviato, accedere a una
conversazione non propria; riferire come ci è riuscito o cosa ha provato. Un occhio
esterno prova cose che a chi ha scritto il codice non vengono in mente.

**Checklist per ogni test di sicurezza:** usa un ID esistente (non inesistente);
verifica il flusso felice (utente autorizzato); verifica il flusso infelice (non
autorizzato); verifica il codice HTTP corretto (403, non 404); verifica che il
contenuto non sia restituito ([] ); copre almeno 3 scenari; eseguito manualmente da
te; riesaminato da un terzo.

**Regola d'oro: se un test di sicurezza non è stato eseguito manualmente da te, non
esiste.** L'IA non immagina l'attacco: risponde a una descrizione dell'attacco. Se
non sai quali attacchi sono possibili, l'IA non li genererà; non fidarti di "sembra
sicuro".

---
## 4. PRESTAZIONI, TRAFFICO E COSTI

### 4.1 Modello di costo

Nei servizi a consumo si tariffa il **movimento** del dato, non la giacenza: ogni
trasferimento, ogni lettura dal DB, ogni esecuzione di funzione. Il costo è
proporzionale alla quantità di operazioni non necessarie. Le prime due leve sotto
determinano oltre il 90% del risultato.

### 4.2 Compressione delle immagini in caricamento

Un'immagine da mobile è 8–15 MB. La trasformazione avviene **sul dispositivo**,
prima della trasmissione: ridisegno a **1200 px sul lato maggiore** e conversione
in **WebP qualità 80%**. Risultato: 200–300 KB, **riduzione del traffico
all'origine 95–98%**, senza degrado percepibile. Presidio server: rifiuto dei file
oltre la dimensione massima (**3 MB** adeguato) e di tipo non previsto.

### 4.3 Versioni ridotte

Due derivate: ~150 px (profili, anteprime), ~800 px (scorrimento). La versione
integrale si carica solo su richiesta di ingrandimento (ulteriore riduzione ×3–4).

### 4.4 Livello di distribuzione (CDN)

Un livello di distribuzione fra utenti e archiviazione conserva copia del file nei
propri nodi: il primo accesso trasferisce dall'archiviazione, i successivi sono
serviti dal livello senza costo. Riduce il costo di trasferimento a valori prossimi
allo zero. Condizione: riferimenti stabili e conservazione prolungata, includendo
nel nome del file un elemento derivato dal contenuto (varia col contenuto). I piani
gratuiti coprono il caso d'uso e includono protezioni contro bot e saturazione.

### 4.5 Caricamento differito

Immagini caricate all'ingresso nell'area visibile; dati per blocchi in base allo
scorrimento; moduli su richiesta; **componenti video non caricati fino all'azione
dell'utente** (anteprima + comando di avvio → contiene il traffico ed è conforme
in materia di cookie di terze parti, 7.4).

### 4.6 Contenimento delle interrogazioni al DB

Ogni schermata: numero di interrogazioni fisso e ridotto, indipendente dal numero
di elementi. Errore ricorrente: un'interrogazione per l'elenco più una per ciascun
elemento (venti elementi → decine di interrogazioni). Su DB relazionale una sola
interrogazione unisce le entità correlate. Inoltre: indici sulle colonne di
selezione/ordinamento; cache locale dei dati già acquisiti; contatori solo ad alti
volumi, con aggiornamento atomico (2.7b).

### 4.7 Notifiche e limiti di spesa

Notifiche: invio scaglionato; raggruppamento degli eventi ravvicinati sullo stesso
contenuto; esclusione degli inattivi; rispetto delle preferenze con disiscrizione
in un'azione; configurazione dei tre meccanismi di autenticazione del dominio di
posta (altrimenti i messaggi finiscono nell'indesiderata). Limiti di spesa: tetto
su ogni servizio a consumo prima dell'attivazione (P6); allarmi di budget su soglie
progressive; limite di esecuzioni concorrenti sulle funzioni server; nessuna
funzione onerosa senza autenticazione; verifica che le richieste provengano dall'app.

### 4.8 Ordini di grandezza

- Sviluppo: **costo nullo** (statico gratuito, server già in esercizio, piano
  gratuito del servizio gestito; eccezione: piano a pagamento nel periodo delle
  presentazioni per evitare la sospensione).
- Alcune centinaia di utenti attivi: piani gratuiti o poche decine di €/mese.
- **5.000 utenti attivi/mese: 100–300 €/mese**, prevalentemente database, invio
  posta ed eventuale autenticazione federata (tariffata per utente attivo). Le
  stime superiori dell'istruttoria si riferivano a 20.000 utenti e a un'architettura
  priva delle misure 4.2–4.6, che riducono il traffico di un fattore 20–30.

### 4.9 Rappresentazione del costo in sede istituzionale

Presentare il costo in termini comparativi rispetto all'alternativa (società di
sviluppo esterna) e con la previsione espressa che **i costi dell'infrastruttura
sono a carico dell'ente committente, non del fornitore** (anticiparli configura un
finanziamento del committente e una posizione da cui non è agevole recedere).

---

## 5. CONTROLLO AUTOMATICO DELLA SICUREZZA DEL CODICE

### 5.1 Impostazione

Sottoporre periodicamente l'intera base di codice a un'IA è inefficace (segnalazioni
non pertinenti, contesto disperso, consumo). Gli strumenti di analisi statica
operano su regole sintattiche deterministiche: individuano le occorrenze, senza
inventare. Ripartizione corretta: **gli strumenti deterministici individuano, l'IA
propone la correzione, i controlli automatici verificano, l'approvazione resta umana.**

### 5.2 Sequenza

```
modifica al codice
   │
   ▼
1. RICERCA DI SEGRETI ──── rilevamento? ──► interruzione
   │ (negativo)
   ▼
2. ANALISI STATICA ─────── nessun rilievo? ──► pubblicazione
   │ (vulnerabilità)
   ▼
3. GENERAZIONE DELLA CORREZIONE (all'IA solo il frammento + il rapporto dello strumento)
   ▼
4. PROPOSTA + controlli automatici
   ▼
5. APPROVAZIONE (umana)
```

### 5.3 Vincoli

- **La correzione non si applica automaticamente all'ambiente pubblicato:** è una
  proposta soggetta a revisione (una correzione di sicurezza errata applicata da
  sola è peggio della vulnerabilità).
- **La ricerca dei segreti precede l'invio al sistema esterno** (altrimenti si
  trasmetterebbero a terzi eventuali credenziali nel codice).
- **L'IA può usare solo le librerie già presenti nel progetto** (contromisura al
  rischio dei pacchetti inesistenti, 3.10).

### 5.4 Formulazione dell'istruzione

L'IA restituisce solo il frammento corretto, in formato elaborabile; mantiene
invariata la logica; limita l'intervento al frammento; dichiara l'incertezza invece
di produrre una soluzione non verificata.

### 5.5 Costo e priorità

Approccio mirato (IA solo in presenza di un rilievo, sul solo frammento): pochi
€/mese, contro alcune decine dell'approccio non selettivo. 🕐 Denominazioni dei
modelli e tariffe vanno riverificate. In caso di adozione parziale, implementare
per prima la **verifica automatica dell'assenza di segreti**.

### 5.6 Limite degli strumenti automatici

Gli analizzatori statici **non individuano tutte le vulnerabilità**: solo le
occorrenze corrispondenti alle proprie regole. Non rilevano difetti di logica
applicativa, errori di configurazione né policy di accesso inadeguate. La
vulnerabilità 3.2 (omessa autorizzazione) è **non rilevabile automaticamente**:
l'esito favorevole dell'analisi non è una garanzia, e il collaudo manuale (3.2 e
3.15) resta necessario.

---

## 6. CONTENUTI: DIRITTI DI TERZI E OBBLIGHI NORMATIVI

Voci ordinate per rischio effettivo (probabilità che il titolare del diritto agisca).

### PRIORITÀ ALTA

**6.1 Risorse caricate da server di terzi.** Caricare un carattere/una libreria/
un'icona da un server esterno trasmette a quel server l'IP dell'utente (dato
personale); se il server è extra-UE, trasferimento privo di base e informativa. Nel
2022 un tribunale tedesco ha riconosciuto il risarcimento a un singolo visitatore
per caratteri caricati dinamicamente da un operatore extraeuropeo → prassi di
diffide seriali; un ateneo dell'alleanza è in Germania. **Adempimento:** scaricare i
caratteri e ogni libreria, ospitarli nel progetto, dichiararli nel foglio di stile;
conservare i file di licenza. Alcuni caratteri sono gratuiti per il web ma non per
l'inclusione in app/marchi: verificare la licenza prima di adottarne di nuovi.

**6.2 Immagini a corredo delle notizie aggregate.** Le fonti sono i siti
istituzionali (bandi, call, iniziative): il rischio dei **testi** è contenuto (gli
enti hanno interesse alla diffusione). Il rischio residuo è nelle **immagini** di
repertorio con licenza intestata all'ateneo, non estensibile a chi ripubblica; le
banche immagini hanno rilevamento automatizzato e prassi di richiesta di pagamento.
**Adempimento:** titolo, ente, estratto ridotto, collegamento alla fonte; le
immagini delle fonti non si copiano — l'elemento visivo è generato dall'app (colore,
simbolo, sigla) o materiale grafico espressamente autorizzato.

**6.3 Elaborazione di contenuti video con strumenti di terzi.** Tre livelli:
(1) incorporazione e fruizione col componente ufficiale e i sottotitoli della
piattaforma → conforme; (2) elaborazione con lo strumento di sintesi in uso manuale
(accetta ufficialmente i link video) → conforme; (3) **automazione tramite
interfacce non ufficiali** → non prevista dalle condizioni d'uso: rischi operativi
(fragilità: una modifica interna interrompe il processo senza preavviso; limitazione
dell'account per traffico anomalo) e reputazionale in sede tecnica.
**Adempimento:** livelli 1–2 nessuna misura; livello 3 confinato agli strumenti
interni di sperimentazione, su contenuti liberamente accessibili, senza dati
personali e fuori dall'infrastruttura presentata; per l'esercizio, passaggio a
interfacce ufficiali (o a un servizio di modello linguistico ordinario, sufficiente
per generare materiali da trascrizioni).

**6.4 Marchi e identità visiva.** Denominazione dell'alleanza, suo segno e stemmi
degli atenei sono marchi tutelati; ogni ateneo ha un manuale d'identità vincolante.
Rischio attualmente contenuto (nessuna finalità commerciale, no indicizzazione),
crescente con promozione, corrispettivi o confusione con canali ufficiali.
**Adempimenti immediati:** dicitura in calce a ogni pagina, in inglese —
*"Independent prototype. Not an official service of ERUA or of its member
universities. All trademarks belong to their respective owners."*; esclusione
dall'indicizzazione. Adempimento strutturale: 9.2. In sede di primo confronto,
formulare la questione come quesito sulle modalità di presentazione in fase
preliminare, non come richiesta di autorizzazione all'uso del marchio.

**6.5 Identificazione dei contenuti generati automaticamente.** Regolamento UE
sull'IA in vigore da agosto 2024, applicazione progressiva; modifiche primavera
2026 hanno differito alcuni termini.

| Termine | Contenuto |
|---|---|
| **2 agosto 2026** | Obblighi di **trasparenza**. Non differito. |
| 2 dicembre 2026 | Divieti ulteriori; trasparenza estesa ai sistemi preesistenti |
| **2 dicembre 2027** | Obblighi per i sistemi **ad alto rischio** (differiti da agosto 2026) |
| 2 agosto 2028 | Alto rischio integrato in prodotti regolamentati |

**Qualificazione.** L'alto rischio comprende, per l'istruzione: accesso/ammissione,
**valutazione dei risultati dell'apprendimento**, determinazione del livello,
sorveglianza nelle prove. I quiz sono di **autovalutazione**: l'esito non è
trasmesso né usato per decisioni → il sistema **non** è ad alto rischio.
**Condizioni per restarne fuori:** (1) gli esiti non lasciano il dispositivo e non
sono accessibili a docenti/amministratori; (2) nessuna graduatoria o comparazione
fra utenti sui risultati (i meccanismi di ingaggio si fondano su partecipazione e
contributi); (3) nessuna funzione che orienti valutazione, ammissione, indirizzamento.
La richiesta di un docente di accedere agli esiti dei propri studenti va soddisfatta
solo con dati aggregati e non riferibili (in forma individuale attirerebbe l'intero
regime dell'alto rischio). **Adempimenti entro il 2 agosto 2026:** (1) identificazione
visibile e non ambigua di ogni contenuto generato, sull'elemento e non solo nei
termini; (2) informazione sulla natura automatica degli eventuali sistemi
conversazionali; (3) pagina informativa su modalità di generazione, limiti e
necessità di verifica (coincide con: fonte, data, sistema, "non verificato", canale
di segnalazione).

**6.6 Dichiarazioni non sostenibili** (l'informativa è vincolante, P8):

| Dichiarazione | Perché è inesatta | Formulazione corretta |
|---|---|---|
| Cifratura punto a punto | non implementata; incompatibile con l'ostensione all'autorità e con la gestione delle segnalazioni | vedi sotto |
| Dati che non lasciano l'UE | conservazione europea, ma il fornitore può accedervi da paesi terzi per assistenza | "i dati sono conservati nell'UE; il fornitore può accedervi per assistenza sulla base di [clausole contrattuali]" |
| Cancellazione immediata | le copie di sicurezza ruotano | "il dato è rimosso anche dalle copie di sicurezza entro [n] giorni" |

Formulazione per la messaggistica: *"I messaggi privati non sono oggetto di lettura
né di analisi. Sono conservati in forma cifrata e accessibili esclusivamente su
segnalazione dell'utente o su richiesta dell'autorità giudiziaria. Sono cancellati
automaticamente decorsi sei mesi."*

**6.7 Licenze delle componenti software.** Alcune licenze di software libero
impongono di rilasciare l'intera opera derivata con la stessa licenza: incorporarle
nel motore impedirebbe di concederlo in licenza e replicarlo. **Adempimento:** solo
licenze permissive e verifica automatica delle licenze delle componenti introdotte.

### PRIORITÀ MEDIA

**6.8 Materiali didattici ad accesso aperto.** Le trascrizioni usate hanno licenza
con attribuzione, non commerciale e condivisione con la stessa licenza (estendibile
alle opere che le incorporano). **Adempimento:** attribuzione visibile
nell'interfaccia; rivedere la non commercialità in caso di servizio oneroso.

**6.9 Aggregazione di notizie.** L'UE tutela l'investimento nelle banche dati a
prescindere dalla proteggibilità delle singole informazioni: l'estrazione
sistematica di una parte sostanziale può interferire con tale tutela. **Adempimento:**
titolo, estratto contenuto, collegamento, testata; rispetto delle indicazioni per i
bot sui siti di origine; acquisizione giornaliera; identificazione del processo con
denominazione e recapito. Il valore è l'aggregazione multilingue e il reindirizzamento
alla fonte, non la sua sostituzione.

**6.10 Immagini di persone identificabili.** Sono dati personali e diritto
all'immagine. In sviluppo l'uso è compatibile con la destinazione dimostrativa;
all'attivazione servono le liberatorie (di norma della redazione che ha pubblicato)
o la sostituzione dei ritratti.

### PRIORITÀ CONTENUTA

**6.11 Materiali della rivista studentesca, audio istituzionali, corsi aperti.**
Contenuti pubblicati apertamente dagli enti, in un'installazione non indicizzata e
dimostrativa: rischio contenuto, alto valore dimostrativo. **Adempimento:**
attribuzione completa (autore, numero, link all'originale) e recapito per le
rimozioni; l'autorizzazione formale è opportuna ma non preliminare allo sviluppo.

**6.12 Strumenti interni di sperimentazione** su infrastruttura e contenuti propri,
senza diffusione: fuori dall'ambito di questo documento.

**6.13 Materiali forniti dai docenti.** Su caricamento o autorizzazione espressa del
titolare, revocabile. **La revoca comporta la rimozione dei materiali derivati**
(sintesi, schede, quiz), non del solo originale: ogni materiale generato mantiene il
riferimento alla fonte (senza, la revoca non è eseguibile). I materiali già sui
dispositivi degli utenti non sono recuperabili: rappresentarlo al titolare.

---

## 7. ATTIVAZIONE DEL SERVIZIO (GDPR OPERATIVO)

Procedura dalla registrazione del primo utente terzo. Software già completo →
verifiche e pubblicazioni.

### 7.0 Il "momento zero" (la vulnerabilità più pericolosa, perché procedurale)

**Regola di ferro: non si registra alcun utente reale (diverso dallo sviluppatore)
finché** (1) un ente ha assunto per iscritto la **titolarità del trattamento**;
(2) è stato sottoscritto l'**accordo sul trattamento** Titolare↔Responsabile;
(3) il Titolare ha designato un **referente per la moderazione**; (4) è pubblicata
l'**informativa** conforme. Fino ad allora il collaudo usa solo identità fittizie su
indirizzi propri. Testare "dal vivo" con amici studenti = trattare dati personali
senza titolare; a trattativa avviata, la cessione della titolarità incontra
resistenze ("chi ha gestito quei dati?").

### 7.1 Presupposti istituzionali

- **Titolare del trattamento:** un ente (alleanza o ateneo) assume per iscritto la
  qualità. Lo sviluppatore è **responsabile**, su istruzione documentata. La
  titolarità in capo allo sviluppatore non è praticabile (nessun ateneo consente che
  i dati dei propri studenti siano su infrastrutture di un privato). ⚠️ Assumere
  decisioni autonome sulle finalità determina la qualifica di **contitolare** a
  prescindere dal contratto: ogni nuova categoria di dati va comunicata al titolare.
- **Referente per la moderazione:** nominativo e casella funzionale (non recapito
  personale), distribuito per ateneo (l'illiceità di un contenuto varia per Stato).
- **Autorizzazione all'uso di denominazione e marchi** (6.4).

### 7.2 Basi giuridiche

| Trattamento | Base | Note |
|---|---|---|
| Indirizzo istituzionale per l'accesso | esecuzione del contratto | il consenso non serve per erogare il servizio richiesto |
| Contenuti pubblici | esecuzione del contratto | sono il servizio |
| Messaggistica privata | esecuzione del contratto | |
| Segnalazioni e decisioni di moderazione | obbligo legale + legittimo interesse | la conservazione prescinde dalla volontà del segnalato |
| Notifiche transazionali | esecuzione del contratto | |
| Comunicazioni promozionali | **consenso** | autonomo, revocabile, disiscrizione immediata |
| Statistiche | legittimo interesse se aggregate; fuori ambito se anonime | |
| Immagini di persone identificabili | consenso | 6.10 |

Il consenso è la base **meno idonea** per i trattamenti necessari al servizio
(revocabile, con onere di prova): riservarlo ai trattamenti facoltativi.

### 7.3 Documentazione da pubblicare (predisposta prima, pubblicata all'attivazione)

- **Informativa:** identità e recapiti del titolare, recapiti del DPO, categorie,
  finalità, basi giuridiche, conservazione, destinatari, trasferimenti extra-UE,
  diritti e modalità, reclamo all'autorità.
- **Termini d'uso:** accesso, condotte vietate, conseguenze, assetto proprietario,
  limitazioni di responsabilità, legge applicabile. Clausola sui contenuti utente:
  l'utente **conserva la titolarità**; concede una **licenza non esclusiva e
  gratuita, limitata alle finalità del servizio** (visualizzazione, conservazione,
  traduzione, moderazione); **garantisce la disponibilità dei diritti** e tiene
  indenne il gestore (presidio contro l'immissione di materiale altrui).
- **Regolamento della comunità** in linguaggio accessibile.
- **Dichiarazione di accessibilità** con non conformità residue e recapito.

Tutto nelle lingue di erogazione o almeno in inglese, con versione facente fede.
Registro delle versioni e comunicazione preventiva delle modifiche sostanziali.

### 7.4 Cookie e tracciamento

Gli strumenti non necessari richiedono consenso espresso e granulare; i tecnici no.
Con le misure 4.5 e 6.1 (niente profilazione, componenti video differiti, risorse
locali) **il servizio non installa strumenti non necessari** → una sola informativa,
nessun modulo di consenso. Introdurre poi un qualunque strumento di terzi che
installi identificativi riattiva l'intera disciplina: vagliare ogni introduzione.

### 7.5 Moderazione e obblighi sui contenuti

Il prestatore che ospita contenuti di terzi è soggetto agli obblighi di base (i
rafforzati riguardano le piattaforme di dimensioni rilevanti). **Adempimenti:**
(1) segnalazione accessibile su ogni contenuto; (2) registro delle segnalazioni con
data, contenuto, motivazione, decisione, decidente, data — **non modificabile**;
(3) riscontro motivato a segnalante e destinatario; (4) termine di riscontro
dichiarato (un giorno lavorativo è adeguato); (5) recapito pubblico per sicurezza e
contenuti. L'esenzione di responsabilità opera fino alla **conoscenza effettiva**:
una segnalazione circostanziata non seguita da intervento la fa venire meno.
**Trattazione prioritaria** (predefinita): rischio per l'incolumità (autolesività,
minacce) → trattazione immediata con riferimenti dei servizi di sostegno del paese
dell'utente; materiale soggetto a obbligo di segnalazione → conservazione, niente
cancellazione, trasmissione al referente istituzionale; provvedimenti dell'autorità
→ al titolare.

### 7.6 Modalità di accesso dimostrativa

Le presentazioni non consentono la verifica via posta istituzionale: serve un
accesso a un profilo precaricato, con contenuti già presenti, abilitato a
consultazione e pubblicazione, sviluppato insieme al resto. La marcatura dei dati di
collaudo (2.7d) consente la rimozione selettiva dei dati di sviluppo mantenendo
quelli della modalità dimostrativa.

### 7.7 Funzioni per i diritti degli interessati (entro un mese dalla richiesta)

| Funzione | Diritto |
|---|---|
| Esportazione integrale in formato leggibile | accesso e portabilità |
| Modifica dei dati di profilo | rettifica |
| Cancellazione account con anonimizzazione | cancellazione |
| Disattivazione delle notifiche | opposizione |
| Sospensione account con mantenimento visibilità | limitazione |
| Registro e riscontro delle segnalazioni | obblighi sui contenuti |

Vanno progettate insieme alla struttura dati (una struttura che non consenta di
individuare tutti i dati di un soggetto va riprogettata).

### 7.8 Valutazione d'impatto (DPIA)

Richiesta per i trattamenti ad alto rischio: qui almeno tre elementi (dimensione
significativa; interessati in soggezione con possibile presenza di minori;
combinazione di insiemi di dati). Compete al titolare, sulla base della
documentazione tecnica del responsabile. Predisporre: registro dei trattamenti (una
voce per tipologia), schema dei flussi, elenco fornitori, termini di conservazione,
misure. Il registro va istituito subito, anche essenziale. Vedi 13 (Gate 7) per il
Data Flow Diagram da consegnare.

### 7.9 Termini di conservazione (definirli prima della struttura dati)

| Categoria | Termine | Effetto |
|---|---|---|
| Account inattivo | 24 mesi dall'ultimo accesso | preavviso, poi cancellazione/anonimizzazione |
| Contenuti pubblici | fino a cancellazione dell'autore | anonimizzazione se si cancella l'account |
| Messaggistica privata | 6 mesi | cancellazione (salvo sospensione in pendenza di segnalazione) |
| Registri tecnici con IP | 30 giorni | cancellazione automatica |
| Segnalazioni e decisioni | 24 mesi | conservazione a fini difensivi |
| Copie di sicurezza | 35 giorni, con rotazione | **da indicare nell'informativa** |
| Materiali derivati da fonti dei docenti | fino a revoca | cancellazione dei derivati |

La cancellazione non rimuove subito dalle copie di sicurezza (avviene alla
rotazione): ammesso, ma da dichiarare (P8).

### 7.10 Procedura in caso di violazione dei dati (su supporto esterno al sistema)

- Il **titolare** notifica all'autorità entro **72 ore** dalla conoscenza.
- Il **responsabile** informa il titolare **senza ingiustificato ritardo** (non 72
  ore: immediato). Il ritardo del responsabile è un suo autonomo inadempimento.
- Con rischio elevato, informare gli interessati (salvo misure, es. cifratura, che
  rendano il rischio non più probabile).

Predisporre: recapito unico presso l'ente; modello di comunicazione (natura, data,
categorie, numero interessati, misure); capacità di ricostruzione degli accessi
(richiede i registri 3.11); funzione di sola lettura (3.12). **Il giorno
dell'evento:** contenere (sola lettura, revoca sessioni, rotazione chiavi);
informare subito il titolare integrando progressivamente; documentare ogni azione
con orario; **non cancellare nulla** (gli elementi della violazione sono anche
quelli della difesa); le comunicazioni pubbliche competono al titolare.

### 7.11 Utenti minori

Acquisizione della sola dichiarazione di maggiore età; conservazione del solo esito;
per i minori, esclusione di messaggistica privata e scambio di recapiti, solo
interazione pubblica. È più restrittiva del minimo richiesto in ciascuno Stato
(l'età del consenso varia fra 13 e 16 anni; in vari ordinamenti l'università inizia
a 17) → un'unica implementazione. La dichiarazione non è verifica: indicarlo nei
termini, con disciplina della dichiarazione non veritiera (sospensione, non
cancellazione immediata).

### 7.12 Accessibilità

**Un ente pubblico non può adottare formalmente uno strumento non accessibile:** è
condizione, non raccomandazione. Standard europeo EN 301 549 (rinvia a WCAG AA);
dichiarazione di accessibilità con non conformità residue; meccanismo di
segnalazione e riscontro. **In sviluppo:** verifica del contrasto cromatico (prima
di consolidare la palette — le palette a bassa saturazione spesso non sono conformi);
navigazione da tastiera su tutti gli elementi con focus visibile e alternativa da
tastiera a ogni gesto; testi alternativi per immagini, icone, marchi; struttura
semantica corretta; rispetto della preferenza di riduzione del movimento; sottotitoli
per i video e trascrizione per gli audio (producibili coi processi automatici, doppia
funzione di accessibilità e arricchimento). La verifica con lettori di schermo da
parte di utenti abituali vale più di quelle automatiche ed è qualificante in sede
istituzionale.

---
## 8. QUADRO GIURIDICO

Fondamenti giuridici delle regole operative delle sezioni 6–7. Non è parere legale.

### 8.1 Posizione attuale e i tre eventi che la mutano

Oggi lo sviluppatore è persona fisica che ha reso raggiungibile un software, senza
utenti, senza dati di terzi, senza corrispettivi, senza contratti. Quattro esclusioni:
non è titolare/responsabile del trattamento; non è prestatore di memorizzazione; non
esercita attività economica; non ha obbligazioni contrattuali. È la configurazione
più protetta: va **conservata per l'intero sviluppo** e lasciata in modo ordinato.

Tre eventi la mutano, da riconoscere come soglie:
1. **Registrazione del primo utente terzo** → dati personali oggetto di trattamento
   (titolare/responsabile) e qualità di prestatore di memorizzazione.
2. **Percezione del primo corrispettivo** → attività economica (obblighi
   dichiarativi/di inquadramento); se da fondi europei, regole di rendicontazione,
   conflitto d'interessi, doppio finanziamento; il corrispettivo diventa parametro
   del massimale di responsabilità (la gratuità è anche contenimento del rischio).
3. **Sottoscrizione del primo contratto** → obbligazioni esigibili; il patrimonio
   personale risponde; le clausole (anche non lette) vincolano.

**Sequenza corretta:** prima l'assetto istituzionale (ente titolare + intestazione
infrastruttura); poi la formalizzazione scritta del ruolo dello sviluppatore; solo
dopo, e solo con corrispettivo, l'inquadramento fiscale e l'assicurazione. La
sequenza inversa attrezza la persona fisica a sopportare rischi che l'assetto
corretto avrebbe allocato altrove: **è l'errore strutturale da evitare.**
**[PROFESSIONISTA]** legale: solo quando esiste una bozza contrattuale da firmare.

### 8.2 Ruoli

- **Titolare:** determina finalità e mezzi; risponde all'autorità e agli interessati
  (l'alleanza o un ateneo capofila).
- **Responsabile:** tratta per conto del titolare su istruzioni documentate (lo
  sviluppatore, dall'attivazione).
- **Sub-responsabili:** i fornitori (cloud, email, error tracking); richiedono
  autorizzazione del titolare e trasmissione contrattuale degli obblighi.

La qualificazione discende dalla **sostanza**, non dalle etichette: decidere in
autonomia le finalità determina la **contitolarità** (responsabilità solidale,
posizione più esposta). Regola: dopo l'attivazione, ogni nuova categoria di dati o
nuovo uso va **proposto al titolare e documentato come sua istruzione** (ciò che è
eseguito su istruzione documentata ricade nella responsabilità del titolare).

Perché la titolarità non può essere dello sviluppatore: esposizione personale
(sanzioni, reclami, azioni); impraticabilità istituzionale (nessun ateneo lo
consente); impraticabilità tecnica (l'accesso federato alle identità di ateneo è
riservato alle organizzazioni, non alle persone fisiche).

### 8.3 Basi giuridiche e principi

Basi: vedi tabella 7.2. Il consenso è la base meno idonea per i trattamenti
necessari (revocabile, con onere probatorio). Il legittimo interesse richiede un
bilanciamento documentato.

Principi con conseguenze progettuali: **minimizzazione** (solo maggiore età, no
telefono, pseudonimo); **limitazione della finalità** (i dati di autenticazione non
alimentano profili; i contenuti didattici non alimentano valutazioni);
**limitazione della conservazione** (7.9); **esattezza** (modifica dei dati);
**integrità e riservatezza** (misure sez. 3); **responsabilizzazione** (dimostrare
la conformità: la conformità non documentata è inesistente); **protezione fin dalla
progettazione e per impostazione predefinita** (le impostazioni più protettive sono
attive in assenza di scelta; la sincronizzazione è disattivata di default).

### 8.4 Diritti degli interessati e limiti opponibili

Diritti/funzioni: vedi 7.7. Termine: un mese (prorogabile di due). **Limiti
legittimi e doverosi:** la cancellazione non travolge i dati necessari a obblighi
legali o alla difesa (registro delle segnalazioni per il suo termine); non impone la
distruzione immediata dalle copie di sicurezza (rimozione alla rotazione, entro il
termine dichiarato); l'anonimizzazione dei contenuti pubblici in luogo della
rimozione, a tutela delle conversazioni altrui, è legittima **se dichiarata nei
termini**.

### 8.5 Funzione giuridica delle misure di sicurezza

Le misure adottate vanno descritte in un **allegato tecnico**. La descrizione:
adempie la responsabilizzazione; **delimita l'obbligazione del responsabile alle
misure dichiarate** (non a uno standard indeterminato); in caso di violazione, prova
la diligenza. **Un incidente subìto nonostante misure adeguate e documentate non è,
di per sé, un inadempimento:** il regolamento impone l'adeguatezza, non l'invulnerabilità.

### 8.6 Violazione dei dati

Nozione ampia (riservatezza, integrità, disponibilità): comprende l'errore di
configurazione che espone una tabella, l'invio ai destinatari sbagliati, la perdita
per difetto di procedura. Obblighi e termini: vedi 7.10. Predisporre anche un
**registro interno delle violazioni**, comprese quelle non notificabili (l'obbligo
di documentazione prescinde da quello di notifica).

### 8.7 Trasferimenti verso paesi terzi e risorse esterne

Il trasferimento fuori dallo SEE è ammesso solo con adeguatezza, garanzie (clausole
tipo) o deroghe; la nozione comprende **l'accesso** da un paese terzo, anche per
sola assistenza. La regione UE risolve la **conservazione**, non l'accesso della
casa madre extra-UE per assistenza (da dichiarare, 6.6). Le risorse caricate dal
browser da server esterni configurano un trasferimento (6.1): ospitalità locale.

### 8.8 Responsabilità sui contenuti di terzi (servizi digitali)

Chi ospita contenuti di terzi è prestatore di memorizzazione (dalla registrazione
del primo utente terzo, a prescindere dalle dimensioni). **Non è responsabile** a
condizione che non abbia conoscenza effettiva o, acquisita, agisca immediatamente:
è un'esenzione **condizionata alla reattività**, non un'immunità. Nessun obbligo
generale di sorveglianza preventiva, ma reazione tempestiva dovuta. Gli obblighi
rafforzati riguardano le piattaforme di dimensioni rilevanti (esclusioni per micro/
piccole imprese). Adempimenti effettivi: 7.5. **La nozione di illiceità varia per
Stato** → moderazione distribuita per ateneo con referenti locali. Tre fattispecie
penalmente rilevanti con procedure predefinite: rischio per l'incolumità; materiale
la cui detenzione/diffusione è reato (conservare, non cancellare, trasmettere al
referente); provvedimenti dell'autorità (al titolare).

### 8.9 Messaggistica privata

Tutela rafforzata della corrispondenza. Assetto: nessuna lettura né analisi;
accesso al contenuto solo su allegazione del segnalante o su provvedimento
dell'autorità. Regole: nessuna funzione di lettura amministrativa (nemmeno per
moderazione preventiva: opera solo su segnalazione, sugli elementi allegati); nessuna
dichiarazione di cifratura punto a punto (6.6); conservazione limitata con
sospensione in pendenza di segnalazione (7.9). **Ostensione all'autorità:** nei
limiti del provvedimento, per il tramite del titolare, con documentazione;
predisporre la capacità di **estrazione selettiva e integra** (l'impossibilità di
adempiere a un ordine legittimo è essa stessa fonte di responsabilità).

### 8.10 Contenuti immessi dagli utenti

L'utente è autore e titolare; la piattaforma necessita di una licenza per le
operazioni tecniche (memorizzazione, riproduzione nella piattaforma, traduzione,
adattamenti, conservazione per moderazione). Clausola: titolarità che permane;
licenza non esclusiva, gratuita, limitata alle finalità del servizio; persistenza
sui contenuti anonimizzati dopo la cancellazione dell'account. **Da escludere** le
formulazioni espansive dei modelli statunitensi (perpetua, irrevocabile,
sublicenziabile, per ogni finalità): sproporzionate e censurabili come abusive.
**Garanzia dell'utente:** dispone dei diritti e tiene indenne il gestore (presidio
civilistico, opera insieme a segnalazione/rimozione). Contenuti prodotti dagli
utenti con IA: ammessi, responsabilità del contenuto all'utente, finalità di
supporto allo studio distinta dalla produzione di elaborati da valutare.

### 8.11 Diritto d'autore su software e materiali generati

Il software è tutelato senza formalità; i diritti patrimoniali sono trasferibili, i
morali no. La **prova della data** (cronologia del controllo di versione, rilasci
datati) consente di opporre la preesistenza (9.3). Il codice prodotto con l'ausilio
di IA: il contributo umano di selezione/direzione/revisione fonda la titolarità; le
condizioni d'uso dei fornitori attribuiscono i diritti sull'output; documentare il
processo rafforza la posizione. I materiali generati da fonti (sintesi, schede,
quiz) sono **opere derivate**: per i docenti serve consenso preventivo (6.13); per
le licenze aperte, rispetto delle condizioni (anche la condivisione conforme).

### 8.12 IA — posizione di deployer

Con modelli di terzi tramite interfacce ufficiali, gli obblighi sul modello sono del
fornitore. Restano al deployer: trasparenza verso gli utenti (6.5); uso conforme
alle condizioni del fornitore; responsabilità per i dati immessi. Regola: **nessun
dato personale degli utenti nelle istruzioni ai modelli**, salvo necessità
dichiarata; le elaborazioni riguardano i contenuti didattici (3.13).

### 8.13 Marchi e assetto proprietario

Il nucleo della tutela è il **rischio di confusione**. Misure: dicitura di
non-ufficialità (6.4); esclusione dall'indicizzazione; in sede di confronto, quesito
sulle modalità di presentazione; uso degli stemmi conforme ai manuali e rimozione a
richiesta. **Separazione motore/installazione:** il software (**[MOTORE]**) ha una
denominazione autonoma di titolarità dello sviluppatore; "ERUA connect" è **una
installazione** concessa in uso. Effetti: elimina il conflitto sui segni; consente
la replicabilità presso altre alleanze; impone che denominazione, segni, palette,
atenei, lingue risiedano in un file di configurazione (2.4). Alla definizione del
nome: verifica di anteriorità su marchi europei e domini; registrazione del dominio;
il deposito del marchio è rinviabile a quando la replicabilità è concreta.
**[PROFESSIONISTA]** per il deposito.

---

## 9. IL CONTRATTO

Da riprendere integralmente in presenza di una bozza. **[PROFESSIONISTA]** sulla
bozza definitiva: è il momento, unico, in cui l'assistenza legale è necessaria. Il
contratto con un ente pubblico è predisposto dall'ente; il margine del fornitore è
la **richiesta di modifiche puntuali** su cinque clausole decisive: oggetto,
proprietà intellettuale, livelli di servizio, limitazione di responsabilità, manleve.

### 9.1 Sequenza degli adempimenti

1. L'ente assume la titolarità del trattamento e l'intestazione dell'infrastruttura.
2. Si definisce per iscritto l'oggetto della prestazione.
3. Solo con corrispettivo, aspetti fiscali e assicurativi.

Soglie che mutano la posizione: registrazione di utenti terzi (responsabile/titolare;
prestatore di memorizzazione); percezione di corrispettivo (attività economica);
sottoscrizione (obbligazioni, penali, responsabilità patrimoniale). Il massimale si
commisura ai corrispettivi: a corrispettivo nullo, massimale nullo.

### 9.2 Assetto proprietario

Denominazione dell'installazione cedibile all'alleanza; **titolarità del motore in
capo allo sviluppatore**. Da escludere: previsioni che attribuiscano al committente
i risultati o qualifichino l'opera come su commissione. Da proporre:
> *"Il Fornitore è e resta titolare esclusivo di tutti i diritti di proprietà
> intellettuale sul Software, ivi compresi il codice sorgente, l'architettura, la
> documentazione e gli sviluppi successivi. Il Fornitore concede al Committente una
> licenza d'uso non esclusiva e non trasferibile, limitata alle finalità di cui
> all'art. [oggetto] e alla durata del contratto. I dati inseriti dagli utenti e i
> contenuti prodotti dal Committente restano nella titolarità del Committente."*

Argomento risolutivo: l'interesse dell'ente è la disponibilità **dei dati**, non del
codice. Alla cessazione: licenza perpetua sulla versione in essere, senza
aggiornamenti, con consegna dei dati. **Deposito del codice presso terzi** (rilascio
condizionato all'indisponibilità del fornitore): richiesta legittima e proposta
vantaggiosa se avanzata dal fornitore (risolve la dipendenza dal singolo senza
cessione).

### 9.3 Prova della data e finanziamenti europei

Gli atti di concessione dei finanziamenti UE disciplinano la titolarità dei
**risultati** (di norma del beneficiario = l'ente, non il singolo). Rischio: il
software sviluppato dentro il progetto diventa risultato dell'ente, con obblighi di
pubblicazione incompatibili con la replicabilità. **Misure:** (1) sviluppo
**anteriore e autonomo** rispetto a qualunque candidatura (materiale preesistente);
(2) **prova della data** (cronologia del controllo di versione, rilasci datati);
(3) dichiarazione in candidatura — *"La piattaforma costituisce asset preesistente
sviluppato dal proponente; il progetto ne prevede l'utilizzo a titolo gratuito e non
finanzia lo sviluppo software"*; (4) **nessuna voce di spesa per sviluppo software**
(richiedere risorse per le attività: eventi, mobilità, materiali, coinvolgimento);
(5) esame preventivo delle clausole da parte dell'ufficio progetti dell'ateneo.
Formulazione corretta: non "il progetto svilupperà una piattaforma" ma "il progetto
realizzerà [attività] utilizzando una piattaforma preesistente messa a disposizione
gratuitamente". **Conflitto d'interessi** (studente + fornitore/beneficiario nello
stesso ateneo): da **dichiarare** spontaneamente. **Divieto di doppio finanziamento:**
dichiarare le componenti riutilizzate.

### 9.4 Oggetto e livelli di servizio

**Oggetto:** elencare le prestazioni **escluse** (formazione utenti, assistenza di
primo livello, produzione di contenuti, migrazione, integrazioni non elencate, nuove
funzionalità) —
> *"Sono esclusi dall'oggetto, e potranno formare oggetto di separato accordo, tutti
> i servizi non espressamente elencati, e in particolare: [elenco]."*

**Livelli di servizio.** Da escludere: disponibilità ≥ 99,9%; termini garantiti di
**risoluzione**; reperibilità continuativa. Da proporre: disponibilità 99% mensile
al netto delle indisponibilità di terzi e delle manutenzioni comunicate con 48 ore;
termini di **presa in carico** in giorni lavorativi per gravità (critico 1, alto 3,
ordinario 10); penali come riduzione del canone, con tetto, senza effetto
risarcitorio; finestra di manutenzione; fascia oraria di presidio (con eventuale
fuso diverso) e recapito per le emergenze.

### 9.5 Limitazione di responsabilità

> *"La responsabilità complessiva del Fornitore, per qualsiasi titolo derivante dal
> presente contratto, è limitata all'importo dei corrispettivi effettivamente
> percepiti nei dodici mesi precedenti l'evento dannoso. È in ogni caso esclusa la
> responsabilità per danni indiretti, perdita di profitto, danno reputazionale e
> interruzione dell'attività, nonché per le pretese di rivalsa relative a sanzioni
> amministrative irrogate al Committente, salvo che derivino da inadempimento doloso
> o gravemente colposo del Fornitore."*

Dolo e colpa grave non sono escludibili (la clausola opera sugli inadempimenti
ordinari). La previsione sulle **rivalse** è la più omessa e necessaria: le sanzioni
colpiscono il titolare, che può rivalersi sul responsabile inadempiente.

### 9.6 Manleve (bidirezionali e asimmetriche)

- **A favore del committente,** circoscritta alle pretese di terzi sulla proprietà
  intellettuale del software (paternità/originalità del codice).
- **A favore del fornitore,** da richiedere (mai offerta):
  > *"Il Committente tiene indenne il Fornitore da ogni pretesa di terzi relativa ai
  > contenuti pubblicati dagli utenti, alle decisioni di moderazione assunte dai
  > referenti del Committente e all'esecuzione di istruzioni documentate impartite dal
  > Committente."*

  Argomento: la denominazione sulla piattaforma è dell'alleanza (rischio
  reputazionale), quindi il controllo delle decisioni editoriali e la relativa
  responsabilità sono dell'ente.

### 9.7 Accordo sul trattamento dei dati

Atto obbligatorio, con contenuto minimo (oggetto, durata, natura, finalità; tipi di
dati e interessati; trattamento su sola istruzione; riservatezza; misure; condizioni
per i sub-responsabili; assistenza per diritti/violazioni/DPIA; cancellazione o
restituzione a fine rapporto; elementi dimostrativi e facoltà di verifica). Punti da
negoziare: **autorizzazione generale ai sub-responsabili** (comunicazione a 30 gg,
opposizione motivata); **verifiche contenute** (una annuale, preavviso 30 gg, orario
lavorativo, spese del titolare salvo violazioni gravi); **allegato tecnico redatto
dal fornitore** (delimita l'obbligazione alle misure dichiarate).

### 9.8 Durata, recesso, cessazione, legge applicabile

Durata determinata, rinnovo espresso; recesso con preavviso ≥ 90 giorni bilaterale;
in caso di recesso anticipato, corrispettivi maturati e costi impegnati; clausola di
uscita (oggetto, formato, termine della consegna dati, oneri); cessazione con
cancellazione dei dati dai sistemi del fornitore ed attestazione; sopravvivenza di
riservatezza, PI, limitazione di responsabilità, obblighi sui dati. Legge e foro:
> *"Il presente contratto è regolato dalla legge italiana. Per ogni controversia è
> competente in via esclusiva il Foro di [sede]."*

In difetto, norme di conflitto con possibile foro straniero (insostenibile per una
persona fisica). Alternativa: mediazione preventiva in sede europea. **Foro straniero
+ corrispettivo contenuto = da non sottoscrivere.**

### 9.9 Clausole da NON sottoscrivere in alcuna versione

1. Partenariati/consorzi con **responsabilità solidale** (la posizione corretta è
   fornitore con contratto bilaterale).
2. **Cessione della titolarità** del motore (inclusa l'opera su commissione).
3. Disponibilità > 99% o reperibilità continuativa.
4. Responsabilità **priva di massimale**.
5. Foro straniero senza contropartita.
6. **Esclusiva o non concorrenza** che precluda installazioni presso altri soggetti
   (la più insidiosa: sembra innocua, distrugge il valore prospettico del motore).
7. Assunzione della qualità di **titolare del trattamento**.

---

## 10. PROFILI FISCALI, PREVIDENZIALI E ASSICURATIVI

In assenza di corrispettivi, nessun adempimento. Alla maturazione di un corrispettivo:

- **Prestazione occasionale** (compensi una tantum): ritenuta d'acconto del
  committente; soglia annua oltre cui sorgono obblighi contributivi (gestione
  separata); nessuna posizione da aprire. 🕐 soglie da verificare.
- **Attività abituale** (canone periodico): apertura della posizione fiscale, con
  eventuale regime agevolato. Un canone mensile non è gestibile come occasionale.
- **Committente estero intra-UE:** iscrizione all'archivio dei soggetti abilitati
  alle operazioni intracomunitarie e fatturazione con inversione contabile;
  l'omissione blocca i pagamenti. **[PROFESSIONISTA]** commercialista, alla prima
  cifra concreta.
- **Compensi da progetti finanziati:** regole di ammissibilità del bando + reddito +
  dichiarazione di conflitto d'interessi.

**Compatibilità con altri rapporti in corso** (servizio civile e figure affini): la
verifica di compatibilità **precede** l'accettazione di qualunque compenso (la
violazione comporta di norma la decadenza dal programma).

**Copertura assicurativa** RC professionale, necessaria dalla sottoscrizione del
primo contratto: estensione a **violazione di dati personali** e **interruzione del
servizio**; operatività per l'attività **dall'estero**; massimale coerente con quello
contrattuale; retroattività ove ottenibile.

---

## 11. SCENARI DI RESPONSABILITÀ (assetto raccomandato)

- **Violazione dati per vulnerabilità del codice.** Comunicazione immediata al
  titolare (→ 72 ore all'autorità). Responsabilità del responsabile solo se viola le
  misure **dichiarate** o la diligenza. Tutele: allegato tecnico veritiero,
  massimale, assicurazione, documentazione dei collaudi (verifiche di autorizzazione
  per tabella). Aggravamento senza ente titolare: la persona fisica è destinataria
  diretta di notifica, reclami, sanzioni, azioni.
- **Contenuto illecito di un utente.** Esenzione fino alla conoscenza effettiva; la
  diffida circostanziata fa decorrere il dovere di trattazione; valutazione al
  referente dell'ateneo, decisione nel registro. Tutele: registro, manleva del
  committente, garanzia dell'utente. Errore da evitare: rimozione automatica a ogni
  diffida (espone al reclamo simmetrico e presta il sistema all'uso censorio).
- **Errore in un materiale generato.** Contenuto identificato come generato e non
  verificato, fonte accessibile → profilo non risarcitorio ma reputazionale. Tutele:
  P7, correzione puntuale, approvazione del docente sui derivati.
- **Indisponibilità prolungata.** L'indisponibilità di terzi è esclusa dal computo;
  termini di presa in carico; penale come riduzione del canone. La resilienza della
  componente a file riduce l'impatto.
- **Richiesta dell'autorità su comunicazioni private.** Trasmissione al titolare;
  estrazione limitata al provvedimento con documentazione; niente comunicazione
  all'interessato se vietata; sospensione dei termini di conservazione. Predisporre
  l'estrazione selettiva e integra.
- **Utente rivelatosi minorenne.** Sospensione secondo i termini; conservazione dei
  dati necessari alle segnalazioni; niente cancellazione immediata. Tutela:
  l'impostazione restrittiva preesistente e la dichiarazione del carattere
  autodichiarato dell'età.
- **Rivendicazione sul software da parte dell'ente.** Cronologia e rilasci datati
  provano l'anteriorità; la dichiarazione di asset preesistente e la clausola di PI
  escludono la qualificazione come risultato; l'assenza di spese per sviluppo priva
  la pretesa di fondamento economico.
- **Profili penali.** Le fattispecie astratte presuppongono condotte dolose o
  gravemente devianti dalle procedure. Il presidio è l'**aderenza documentata** alle
  procedure (niente lettura dei messaggi; trattazione documentata; trasmissione al
  titolare; conservazione delle prove).

---

## 12. QUADRO MULTIGIURISDIZIONALE

| Materia | Regime | Rilevanza operativa |
|---|---|---|
| Protezione dei dati | Regolamento direttamente applicabile: uniforme | Un'unica implementazione |
| Età del consenso digitale | 13–16 anni per Stato | Assorbita dalla soglia unica dei 18 anni per le funzioni sensibili |
| Servizi digitali | Regolamento: uniforme | Un'unica implementazione |
| Contenuto illecito (diffamazione, odio, vilipendio) | **Varia per Stato** | Moderazione distribuita per ateneo |
| Diritto d'autore | Direttive armonizzate | Le regole prudenziali (estratti, link, attribuzione) sono conformi ovunque |
| Diritto all'immagine | Difforme | Liberatorie alla fonte; garanzia dell'utente |
| Contratti | **Determinato dalla clausola di scelta** | Legge e foro italiani da pattuire |
| Autorità di controllo | Stato dell'interessato, con cooperazione | Interlocuzione in capo al titolare |
| Fisco | Stato di stabilimento, con adempimenti transfrontalieri | Sez. 10 |
| Accessibilità | Direttiva con standard comune (EN 301 549) | Un'unica implementazione |

La pluralità di Stati non moltiplica gli ordinamenti: concentra la variabilità in due
punti (clausola contrattuale di legge/foro; valutazione locale dei contenuti),
entrambi presidiati dall'assetto raccomandato.

---
## 13. PLAYBOOK DI IMPLEMENTAZIONE (GATE 0–8)

Sequenza a cancelli: ogni gate va completato prima del successivo. Il superamento di
tutti porta alla soglia stimata del 97–98% di copertura (il 2–3% residuo è zero-day,
errori umani non rilevati dai test, vulnerabilità future).

| Gate | Ambito | Obiettivo |
|---|---|---|
| 0 | Preparazione | strumenti e ambiente di test |
| 1 | Autenticazione e sessioni | solo l'utente legittimo accede (3.3) |
| 2 | Autorizzazione (RLS) | ognuno vede solo i propri dati (3.2) |
| 3 | Sanitizzazione input e IA | neutralizzare XSS, iniezioni e fughe di PII (3.13) |
| 4 | Backup e ripristino | recuperabilità cifrata (3.14) |
| 5 | Logging e monitoraggio | rilevare incidenti (3.11, 14.1) |
| 6 | Incident Response | sapere cosa fare (7.10, 14.5) |
| 7 | DPIA e documentazione | dare al Titolare tutto (7.8) |
| 8 | Go-Live | verifica finale prima del primo utente reale |

**Gate 0 — strumenti:** ambiente di test separato; PostgreSQL con RLS; client REST
(Postman/Bruno); framework di test (pytest/Jest); script di seeding. Configurazione
del DB di test:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

INSERT INTO users (id, email, pseudonym) VALUES
  ('11111111-1111-1111-1111-111111111111', 'utente_a@test.com', 'A'),
  ('22222222-2222-2222-2222-222222222222', 'utente_b@test.com', 'B'),
  ('33333333-3333-3333-3333-333333333333', 'utente_c@test.com', 'C');
INSERT INTO conversations (id) VALUES ('conversation_12345');
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
  ('conversation_12345', '11111111-1111-1111-1111-111111111111'),
  ('conversation_12345', '22222222-2222-2222-2222-222222222222');
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
  ('conversation_12345', '11111111-1111-1111-1111-111111111111', 'Messaggio di A a B', NOW()),
  ('conversation_12345', '22222222-2222-2222-2222-222222222222', 'Messaggio di B a A', NOW());
```

**Gate 1 — test di autenticazione:** token valido → 200 + cookie; token scaduto →
401; token già usato → 401; token per email diversa → 401; sessione scaduta → 401;
revoca sessione → 401.

**Gate 2 — test di autorizzazione:** lettura dei propri messaggi → 200; lettura di
messaggi altrui → 403/[]; lettura dopo l'uscita (precedenti sì, successivi no);
inserimento in conversazione non propria → 403; cancellazione di messaggio altrui →
403; accesso a conversazione cancellata → 404; accesso non autenticato → 401; token
di un utente non scavalca la RLS → 403.

**Gate 3 — test di sanitizzazione:** email/telefono/matricola sostituiti; nomi
propri sostituiti o segnalati; prompt injection bloccato.

**Gate 8 — Go-Live checklist (prima del primo utente reale):**

*Sicurezza:* RLS abilitata su tutte le tabelle con dati utente; ogni policy testata
con scenari IDOR; cookie `HttpOnly`/`Secure`/`SameSite=Lax`; intestazioni di
sicurezza (CSP, HSTS, X-Content-Type-Options); tutti i prompt IA sanitizzano le PII;
backup cifrati e ripristino testato; log senza dati personali in chiaro; limiti di
spesa su tutti i servizi a consumo.

*Legale/istituzionale:* nomina del Titolare firmata; accordo sul trattamento
sottoscritto; referente per la moderazione designato; informativa, termini,
regolamento della comunità e dichiarazione di accessibilità pubblicati; Data Flow
Map consegnata al Titolare.

*Operativo:* procedura di Incident Response documentata e comunicata; monitoraggio
attivo configurato; funzioni testate: cancellazione account (esportazione +
anonimizzazione), segnalazione, blocco utenti, esportazione dati.

## 14. CONTINUITÀ OPERATIVA E RISCHI NEL TEMPO

### 14.1 Monitoraggio attivo e allerting

| Categoria | Cosa monitorare | Soglia | Azione |
|---|---|---|---|
| Accessi | login falliti per stesso utente | >5 in 10 min | possibile attacco a credenziali |
| Autorizzazione | tentativi di accesso a risorse altrui (403) | >10 in 5 min | possibile IDOR |
| Traffico | richieste totali | >media giornaliera ×3 | possibile DDoS/saturazione |
| Errori | 500 (server) | >5 in 5 min | possibile bug o attacco |
| Latenza | tempo di risposta | >2 s per 5 richieste consecutive | possibile degrado/attacco |
| Backup | backup notturno | non completato entro le 2:00 | perdita di copia |
| Spesa | costo dei servizi a consumo | >70% del budget mensile | possibile attacco economico |

Con i servizi gestiti gran parte del monitoraggio è disponibile: si configurano gli
alert (webhook Telegram/Slack, UptimeRobot, log del provider). Middleware con
metriche e alert sulle risposte lente; query periodica sui login falliti anomali.

### 14.2 Aggiornamenti di sicurezza

Obiettivo: patchare le vulnerabilità note entro 24 ore dall'advisory. Monitorare:
advisory PostgreSQL, Node.js/Python, librerie (`npm audit`/`pip-audit`), provider.
Processo: valutare (interessa il sistema? rischio? patch esistente?) → applicare su
test → eseguire i test di sicurezza (RLS, autenticazione, sanitizzazione) → se
passano, produzione con rollback pronto → monitorare 24 ore. Alto/critico entro 24
ore; basso/medio entro 7 giorni. Script quotidiano che esegue `npm audit`/`pip-audit`
e invia un allarme via webhook sulle vulnerabilità critiche.

### 14.3 Indipendenza dai fornitori

Ogni servizio critico deve poter essere sostituito senza riscrivere il sistema.

| Servizio | Alternative | Note |
|---|---|---|
| Database (PostgreSQL) | Neon, AWS RDS, self-hosted | tutti PostgreSQL → migrazione semplice |
| Autenticazione | Auth0, Clerk, self-hosted | magic link è standard |
| Storage | MinIO, GCS | API S3-compatibile |
| IA | fornitori UE, Anthropic, self-hosted | tutte le chiamate IA transitano da un unico punto del codice (una funzione che riceve l'istruzione e restituisce il risultato): sostituire il fornitore = modificare quella funzione |
| Email | AWS SES, Mailgun | SMTP standard |
| Hosting | Netlify, AWS, self-hosted | sito statico + API |

Implementazione: interfaccia astratta del fornitore con più implementazioni,
selezione via variabile d'ambiente; l'alternativa configurata su un ambiente di test;
migrazione dei dati con script separato.

### 14.4 Monitoraggio normativo

Monitorare Garante Privacy (mensile), EDPB (mensile), Commissione UE, AI Act, DSA
(trimestrale). Processo: rilevare → valutare (già conforme? impatto?) → implementare
→ verificare → comunicare al Titolare e aggiornare la documentazione.

### 14.5 Incident Response — principi e scenari

Principi: **isolare** (sola lettura, revoca sessioni, blocco IP) → **analizzare**
(cosa, quando, quali dati) → **documentare** (ogni azione con orario) → **comunicare**
(titolare, immediato) → **correggere** → **ripristinare** → **retrospettiva**. Tempi:
contenimento entro 15 minuti; analisi entro 2 ore; notifica al titolare immediata;
notifica all'autorità entro 72 ore (dal titolare); ripristino entro 24 ore. Scenari:
sospetto accesso non autorizzato; saturazione (DDoS/abuso); compromissione di un
account amministratore/moderatore (valutare 2FA per i ruoli critici). Template di
notifica al Titolare: data/ora, natura, categorie e numero di dati coinvolti, misure
adottate, prossimi passi, referente.

### 14.6 Retrospettiva e mantenimento

Dopo ogni incidente: registrazione, analisi delle cause (tecnica/procedurale/umana),
azioni correttive (test, codice, procedure) con responsabile e termine, verifica.
**Checklist di mantenimento:** controllo vulnerabilità (settimanale); revisione log
di sicurezza (settimanale); test di ripristino dei backup (mensile); revisione RLS
(a ogni nuova tabella); aggiornamento documentazione (a ogni modifica); revisione
normativa (mensile); test di sicurezza IDOR/autenticazione (trimestrale);
retrospettiva (dopo ogni incidente); comunicazione al Titolare (a ogni aggiornamento
significativo).

### 14.7 Documenti da mantenere aggiornati per il Titolare

Informativa, termini, regolamento (a ogni modifica sostanziale + revisione annuale);
Data Flow Map (a ogni modifica dell'architettura); allegato tecnico delle misure (a
ogni modifica delle misure); registro dei trattamenti (a ogni nuova categoria);
registro delle segnalazioni (continuo); registro delle violazioni (ogni violazione,
anche non notificata).

---

## 15. DECISIONI ASSUNTE E QUESITI ISTITUZIONALI

### 15.1 Decisioni assunte

| Data | Decisione |
|---|---|
| 6 ago 2026 | I progetti personali preesistenti restano esclusi dalle candidature e distinti dalla piattaforma |
| 6 ago 2026 | Titolarità del trattamento all'alleanza o a un ateneo |
| 6 ago 2026 | Moderazione distribuita per ateneo |
| 6 ago 2026 | Accesso mediante indirizzo istituzionale; consultazione libera senza registrazione |
| 6 ago 2026 | Messaggistica subordinata ad accettazione reciproca, con termine di conservazione |
| 6 ago 2026 | Sola dichiarazione di maggiore età; limitazioni per i minori |
| 8 ago 2026 | Quiz di sola autovalutazione; materiali dei docenti previo consenso |
| 8 ago 2026 | Strumenti di sperimentazione confinati all'ambito interno |
| 8 ago 2026 | Sviluppo integrale del prodotto; unico passaggio di stato alla prima registrazione di un utente terzo |
| 8 ago 2026 | Architettura: processi automatici su server dedicato, file di dati, app statica, servizio gestito in regione UE |
| 8 ago 2026 | Esclusione dei sistemi documentali proprietari e dei framework applicativi |
| 8 ago 2026 | Contenuti istituzionali pubblici in fase dimostrativa, con attribuzione |
| 8 ago 2026 | Assetto proprietario: cessione della denominazione dell'installazione, mantenimento della titolarità del motore |
| 8 ago 2026 | Interfaccia in inglese con strumento di traduzione integrato |

### 15.2 Decisioni ancora da assumere (con ciò che condizionano)

- **Denominazione del motore** [MOTORE] → file di configurazione, dominio di posta;
  prima della suddivisione del codice.
- **Dominio da registrare** → reputazione del mittente di posta; prima dello sviluppo
  delle notifiche (la reputazione di un dominio si costruisce nel tempo).
- **Eventuale candidatura a bandi** → formulazione delle clausole su risultati e
  materiale preesistente (9.3).

Le deroghe consapevoli alle regole permanenti vanno annotate con data, motivazione e
termine di rientro.

### 15.3 Quesiti da porre in sede di primo confronto istituzionale

1. Titolare del trattamento dei dati degli studenti.
2. Referenti per la moderazione, termini di riscontro, responsabilità delle decisioni.
3. Formalizzazione dell'assetto proprietario del software e della licenza d'uso.
4. Modalità di presentazione in fase preliminare e uso della denominazione.
5. Intestazione e imputazione dei costi dell'infrastruttura, con procedura interna.
6. Referenti delle strutture informatica e legale ed elementi per i pareri.
7. Ateneo capofila e relativo responsabile della protezione dei dati.
8. Soggetto competente alla verifica di accessibilità e obblighi applicabili.

---

## 16. QUANDO SERVE UN PROFESSIONISTA

| Momento | Professionista | Perimetro |
|---|---|---|
| Bozza contrattuale da sottoscrivere | Legale | Cinque clausole decisive; accordo sul trattamento; clausole vietate |
| Candidatura con clausole sui risultati | Ufficio progetti dell'ateneo; in subordine legale | Clausole su risultati e materiale preesistente |
| Prima cifra concreta da percepire | Commercialista | Inquadramento; adempimenti transfrontalieri; compatibilità |
| Deposito del marchio del motore | Consulente in proprietà industriale | Quando la replicabilità è concreta |

In ogni altro momento l'assistenza professionale è prematura e questo documento è la
base operativa sufficiente.

---

## 17. APPENDICE — ERRORI E IMPRECISIONI DA NON COMMETTERE

Voci ❌ (errate) e ⚠️ (parzialmente valide) emerse dalla validazione delle indicazioni
raccolte in fase istruttoria. Da tenere presenti per non reintrodurre errori.

- ❌ **"Gli strumenti di analisi statica individuano tutte le vulnerabilità."** Falso:
  individuano solo le occorrenze corrispondenti alle regole; non i difetti di logica,
  gli errori di configurazione né le policy di accesso inadeguate. L'omessa
  autorizzazione (3.2) è nella categoria non rilevabile → serve il collaudo manuale
  (3.2, 3.15, 5.6).
- ❌ **Adozione di una piattaforma documentale proprietaria.** Non idonea al caso:
  natura relazionale del dominio, non verificabilità delle regole di sicurezza da
  parte di terzi, assenza di tetto di spesa, assenza di ricerca testuale nativa,
  limitata portabilità (2.5).
- ⚠️ **La necessità di denormalizzare non è un pregio.** È un argomento **contro** i
  sistemi documentali: duplicare i dati crea punti di divergenza e stati incoerenti.
- ⚠️ **Autenticazione federata di ateneo subito.** Le federazioni ammettono le
  organizzazioni, non le persone fisiche: in fase iniziale, magic link su elenco
  chiuso di domini, dichiarandone i limiti (3.3, 8.2).
- ⚠️ **Percentuali di correttezza delle correzioni generate dall'IA** e ⚠️ **stime di
  costo/utenza istruttorie:** privi di fonte o riferiti a scenari diversi (20.000
  utenti, architettura senza le misure 4.2–4.6); i valori non sono utilizzabili in
  documentazione, l'impostazione sì (4.8).
- ⚠️ **Automazione tramite interfacce non ufficiali di strumenti video** confinata
  agli strumenti interni; fruizione ed elaborazione manuale sono conformi (6.3).
- ⚠️ **"Il responsabile risponde di qualunque violazione":** formulazione eccedente —
  risponde dei propri inadempimenti (8.5). Resta corretto il rilievo sull'indeterminatezza
  della posizione senza atto scritto.
- ⚠️ **Obblighi di accessibilità:** la disciplina applicabile è quella dei siti degli
  enti pubblici (non quella dei servizi ai consumatori); lo standard EN 301 549 e la
  conclusione (niente adozione senza conformità) restano corretti (7.12).
- ⚠️ **Obblighi sui contenuti:** i rafforzati riguardano le piattaforme di dimensioni
  rilevanti; gli adempimenti effettivi sono in 7.5.
- ⚠️ **Sequenza fiscale/contrattuale/assicurativa invertita:** è il profilo di
  maggiore criticità dell'istruttoria — orientava verso la posizione di fornitore
  prima dell'assetto istituzionale. Sequenza corretta in 8.1/9.1.
- ⚠️ **Frammentazione dei dispositivi:** la soluzione con sistema di compilazione non
  serve; il fattore determinante sui dispositivi di fascia bassa è il peso della
  pagina (2.3, 4).
- ⚠️ **Pluralità di ordinamenti sovradimensionata:** la protezione dei dati è un
  regolamento direttamente applicabile; la variabilità si concentra in due punti (12).

---

*Foglietto di riferimento unico ERUA connect. Consolida il documento tecnico, il
dossier legale, le appendici di cybersecurity e i playbook operativi. I dati 🕐
(prezzi, listini, denominazioni) vanno verificati alla fonte prima dell'uso verso
terzi. Non costituisce parere legale.*
