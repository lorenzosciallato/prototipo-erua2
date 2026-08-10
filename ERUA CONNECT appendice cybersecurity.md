```markdown
# ERUA connect — Analisi delle vulnerabilità residue e criticità implementative

## Documento integrativo di sicurezza e conformità

**Documento interno di progetto — agosto 2026**

---

## AVVERTENZA

Il presente documento integra il Documento tecnico di riferimento e il Dossier legale, approfondendo gli aspetti che da tali documenti emergono come **criticità residue** o come **punti di attenzione implementativa** non sufficientemente dettagliati.

Il documento è redatto sulla base dell'analisi complessiva dei materiali di progetto e delle vulnerabilità tipiche di architetture analoghe. Non costituisce sostituzione delle verifiche tecniche da eseguire in fase di collaudo, né delle valutazioni legali da sottoporre a professionista abilitato.

**Finalità:** fornire allo sviluppatore un riferimento operativo per la gestione degli scenari di rischio che i documenti principali presuppongono ma non esplicitano nella loro implementazione pratica.

---

## 1. LA VULNERABILITÀ DELL'AUTORIZZAZIONE (IDOR)

### 1.1 Definizione e rilevanza

La vulnerabilità **Insecure Direct Object Reference** (IDOR) si verifica quando un sistema espone un riferimento a un oggetto interno (un ID di conversazione, un identificativo di messaggio, un ID di contenuto) e non verifica che l'utente richiedente abbia effettivamente il diritto di accedervi.

**Rilevanza per il progetto**: massima. L'intera architettura della messaggistica privata e della moderazione si basa sulla corretta implementazione di questo controllo. Una singola policy RLS scritta in modo errato espone l'intero database.

### 1.2 Scenari di attacco concreti

**Scenario A — Lettura di messaggi altrui**

L'utente A e l'utente B hanno una conversazione privata. L'utente malintenzionato C (che non partecipa alla conversazione) invia una richiesta HTTP al seguente endpoint:

```
GET /api/messages?conversation_id=12345
Authorization: Bearer <token_di_C>
```

**Se la policy RLS è assente o errata**, il sistema restituisce tutti i messaggi della conversazione 12345 a C, che non vi partecipa.

**Policy RLS corretta (PostgreSQL)**:
```sql
CREATE POLICY "Users can read messages they participate in" ON messages
FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM conversation_participants WHERE conversation_id = messages.conversation_id)
);
```

**Policy RLS errata (quella che l'IA potrebbe generare)**:
```sql
CREATE POLICY "Users can read messages" ON messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```

**Perché è errata:** presuppone che i messaggi abbiano `sender_id` e `receiver_id` direttamente nella tabella dei messaggi. Se il modello dati utilizza una tabella di partecipazione separata, la policy restituisce **tutti i messaggi** perché la condizione `auth.uid() = sender_id` non trova corrispondenze (i `sender_id` sono di altri utenti) e la condizione `OR` non si attiva. Il risultato è che la policy, invece di limitare, **non limita nulla** se non trova corrispondenze.

**Scenario B — Modifica di contenuti altrui**

L'utente A ha pubblicato un post. L'utente B invia:

```
PUT /api/posts/67890
Authorization: Bearer <token_di_B>
Body: { "content": "contenuto modificato" }
```

**Policy RLS corretta**:
```sql
CREATE POLICY "Users can update their own posts" ON posts
FOR UPDATE USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);
```

**Errore comune:** dimenticare la clausola `WITH CHECK`. La policy permette la lettura dei propri post, ma la modifica (`UPDATE`) richiede entrambe le clausole: `USING` (seleziona le righe modificabili) e `WITH CHECK` (verifica il risultato della modifica). Senza `WITH CHECK`, un utente potrebbe modificare un post e farne diventare l'autore un altro utente.

**Scenario C — Cancellazione di account altrui**

Endpoint di cancellazione account:
```
DELETE /api/users/me
```

L'utente malintenzionato tenta:
```
DELETE /api/users/12345
```

**Se l'endpoint accetta un parametro ID senza verificare che corrisponda all'utente autenticato**, l'attacco riesce.

**Implementazione corretta**:
- L'ID dell'utente si ricava **esclusivamente** dal token di autenticazione, mai dai parametri della richiesta.
- L'endpoint è `DELETE /api/users/me` e non accetta parametri.

**Scenario D — Accesso a conversazioni dopo l'uscita**

L'utente A e B hanno una conversazione. A esce dalla conversazione (o viene rimosso). La policy deve negare l'accesso ad A ai messaggi successivi all'uscita.

**Policy con logica temporale**:
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

### 1.3 Il problema del testing

**L'IA genera codice che sembra funzionare, ma non genera test esaustivi.** Lo sviluppatore che si affida all'IA deve imporre il seguente flusso di lavoro, **prima di scrivere qualunque funzione di accesso ai dati**:

1. Scrivere il test di integrazione che **tenta** di accedere a un dato altrui.
2. Verificare che il test fallisca (perché la policy non esiste ancora).
3. Scrivere la policy RLS.
4. Verificare che il test ora passi.

**Esempio di test da chiedere all'IA**:
```
"Scrivimi un test di integrazione in Python (pytest) che:
1. Crea due utenti (A e B) nel database di test.
2. Crea una conversazione privata tra A e B.
3. Autentica l'utente C (un terzo utente).
4. Tenta di leggere i messaggi della conversazione tra A e B.
5. Verifica che la risposta sia 403 (Forbidden) o che l'array dei messaggi sia vuoto.
6. Verifica che l'utente A possa leggere i propri messaggi.
7. Verifica che l'utente B possa leggere i propri messaggi.
"

```

**Questo test deve essere scritto PRIMA della policy RLS.** Se l'IA scrive il test dopo, il test sarà probabilmente "aggiustato" per passare, mascherando la vulnerabilità.

---

## 2. LA FALLA DEI DATI PERSONALI NEI PROMPT AI

### 2.1 Definizione del problema

Il sistema genera materiali didattici (sintesi, schede, quiz) utilizzando servizi di intelligenza artificiale. La generazione avviene a partire da **contenuti didattici** (trascrizioni di lezioni, testi, PDF). Il prompt inviato all'AI contiene tali contenuti.

**Il problema**: un documento PDF caricato da un utente o un docente potrebbe contenere dati personali: nome, cognome, email, matricola, data di nascita, firma.

Se tali dati vengono **inclusi nel prompt** inviato all'AI, si configura:

1. **Data breach**: i dati personali sono stati trasmessi a un fornitore terzo (l'AI) senza base giuridica.
2. **Violazione delle condizioni d'uso** del servizio AI (che tipicamente vietano l'invio di dati personali identificativi).
3. **Trasferimento extra-UE**: se il fornitore AI è extraeuropeo, si configura un trasferimento privo delle garanzie previste dal GDPR.

### 2.2 Scenario concreto

**Caricamento di un PDF da parte di un docente**:
Il docente carica un PDF di una lezione. Il PDF è stato generato da un editor di testo e contiene, nei metadati o nel corpo, il nome del docente e l'email istituzionale.

Il sistema estrae il testo dal PDF e lo invia all'AI per generare una sintesi.

**Se il sistema non sterilizza il prompt**, il prompt inviato all'AI è:

```
"Genera una sintesi del seguente testo: [testo del PDF, contenente 'Prof. Mario Rossi, mario.rossi@universita.it']"
```

I dati personali del docente **escono verso il fornitore AI**. Il docente non ha mai acconsentito a tale trattamento.

### 2.3 Soluzione implementativa

1. **Sanitizzazione automatica del prompt**:
   - Rimozione di email, numeri di telefono, matricole e nomi propri.
   - Utilizzo di una regex configurata per il contesto (es. riconoscimento di pattern `[\w\.-]+@[\w\.-]+\.\w+` per le email).
   - Se il sistema non è in grado di identificare con certezza un nome proprio, lo sostituisce con un segnaposto neutro (`[nome]`, `[docente]`).

2. **Esclusione dei metadati**:
   - I metadati del file (autore, data di creazione, software utilizzato) non vengono mai inclusi nell'estrazione del testo.

3. **Prompt design**:
   Il prompt deve includere esplicitamente l'istruzione di non restituire dati personali:
   ```
   "Il testo seguente può contenere dati personali. Non restituirli nella sintesi. Restituisci esclusivamente il contenuto didattico."
   ```

4. **Checklist di sterilizzazione**:
   - [ ] Email rimosse (`[\w\.-]+@[\w\.-]+\.\w+`)
   - [ ] Numeri di telefono rimossi (`\+?[0-9\s\-()]{8,15}`)
   - [ ] Matricole rimosse (pattern specifico dell'ateneo, da configurare)
   - [ ] Firma digitale rimossa
   - [ ] Nomi propri sostituiti (se rilevabili)
   - [ ] Metadati del file esclusi dall'estrazione

### 2.4 Limite della soluzione

La sanitizzazione automatica non è perfetta: un nome proprio scritto in modo non standard potrebbe non essere riconosciuto. In tali casi, la strategia è:
- **Segnalare all'utente** che il contenuto può contenere dati personali e chiedere conferma prima dell'elaborazione.
- **Non inviare mai il contenuto all'AI** in assenza di sanitizzazione.

---

## 3. LA CRITTOGRAFIA DEI BACKUP

### 3.1 Il rischio

I backup del database rappresentano il **secondo punto di esposizione** più critico dopo il database attivo. Un backup non cifrato esposto (es. bucket S3 pubblico, o file system non protetto) consente l'accesso in chiaro a tutti i dati degli utenti.

**I servizi gestiti forniscono crittografia a riposo per il database attivo**, ma i backup esportati (dump SQL) spesso viaggiano in chiaro o vengono salvati senza crittografia aggiuntiva.

### 3.2 Scenario concreto

**Bucket di backup pubblico per errore di configurazione**:
Lo sviluppatore configura un bucket S3 per i backup automatici. Per semplicità, imposta il bucket come "pubblico" per consentire il download diretto. Un attaccante scopre l'esistenza del bucket (es. enumerando gli URL) e scarica i dump SQL contenenti: nomi, email, contenuti dei messaggi, password (se presenti), pseudonimi.

**Backup non cifrato sul server**:
I backup vengono salvati sul server nella directory `/backups/`. Il server è protetto, ma un attacco di tipo "Local File Inclusion" (LFI) su un'altra vulnerabilità dell'applicazione consente di leggere i file di backup.

### 3.3 Soluzione implementativa

1. **Cifratura dei dump prima del trasferimento**:
   ```bash
   pg_dump database_name | gpg --symmetric --cipher-algo AES256 --passphrase-file /secure/passphrase > backup.sql.gpg
   ```

2. **Cifratura anche in transito**: il trasferimento verso lo storage deve avvenire su canale crittografato (HTTPS, SFTP).

3. **Bucket di storage privato**: il bucket di backup non è pubblico; l'accesso è limitato a specifici ruoli.

4. **Chiave di cifratura separata**: la chiave di cifratura dei backup non è memorizzata nel codice dell'applicazione né sul server di produzione. È conservata su un sistema di gestione delle chiavi (KMS) o su un supporto fisico separato.

5. **Rotazione delle chiavi**: la chiave di cifratura dei backup viene ruotata periodicamente.

6. **Test di ripristino crittografato**:
   ```
   "Verificare che il ripristino da backup cifrato funzioni correttamente: decifrare il dump, importarlo in un database di test, verificare l'integrità dei dati."
   ```

### 3.4 Responsabilità

La responsabilità della cifratura dei backup è del **responsabile del trattamento** (lo sviluppatore), che deve garantirla come misura tecnica di sicurezza. Il titolare del trattamento (l'ente) può richiedere la documentazione delle misure adottate.

---

## 4. IL FLUSSO DEI DATI PER LA DPIA

### 4.1 La carenza nei documenti principali

Il Dossier legale (sezione 9.8) richiede una Valutazione d'Impatto sulla Protezione dei Dati (DPIA) in presenza di trattamenti ad alto rischio. La DPIA è di competenza del Titolare, ma richiede **documentazione tecnica dettagliata** da parte del Responsabile.

Il Documento tecnico descrive l'architettura, ma **non contiene uno schema esplicito dei flussi di dati** che indichi:
- Da dove parte il dato (origine).
- Dove transita (servizi intermedi, CDN, server).
- Dove viene elaborato (AI, backend).
- Dove viene conservato (database, storage, cache).
- Quando viene cancellato (tempi e modalità).

### 4.2 Perché è essenziale

**Scenario**: il Garante della Privacy effettua un accertamento a seguito di un reclamo. La prima domanda è:

> "Dove vanno a finire i dati degli studenti in ogni fase del processo?"

Se il responsabile non è in grado di rispondere con uno schema chiaro e documentato, il Titolare non può difendersi. La responsabilità, sebbene formalmente del Titolare, si riverbera sul Responsabile per "carenza di supporto tecnico".

### 4.3 Esempio di Data Flow Diagram (testuale)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FLUSSO DEI DATI — ERUA connect                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  UTENTE (studente/docente)                                                  │
│      │                                                                      │
│      ▼                                                                      │
│  CLIENT (browser)                                                           │
│      │ - pseudonimo                                                         │
│      │ - contenuti pubblici                                                 │
│      │ - messaggi privati                                                   │
│      │ - materiali didattici                                                │
│      ▼                                                                      │
│  API GATEWAY (Vercel / Fly.io)                                              │
│      │ - autenticazione (magic link)                                        │
│      │ - validazione input                                                  │
│      │ - rate limiting                                                      │
│      ▼                                                                      │
│  BACKEND (Node.js / Python)                                                 │
│      │ - verifica di autorizzazione (RLS)                                   │
│      │ - elaborazione AI (sanitizzata)                                      │
│      │ - logging (anonimizzato)                                             │
│      ▼                                                                      │
│  DATABASE (PostgreSQL, EU region)                                           │
│      │ - utenti (pseudonimo, email, hash)                                   │
│      │ - contenuti (testo, metadati)                                        │
│      │ - messaggi (testo, timestamp)                                        │
│      │ - conversazioni (partecipanti)                                       │
│      │ - segnalazioni (conservazione 24 mesi)                               │
│      │                                                                      │
│      ▼                                                                      │
│  STORAGE (S3 / R2, EU region)                                               │
│      │ - immagini caricate (compresse, metadati rimossi)                    │
│      │ - file didattici (PDF, solo per autenticati)                         │
│      │ - backup (cifrati, rotazione 35 gg)                                  │
│      │                                                                      │
│      ▼                                                                      │
│  SERVIZI DI TERZI                                                           │
│      │ - AI (sanitizzazione PII)                                            │
│      │ - invio mail (magic link, notifiche)                                 │
│      │ - rilevazione errori (anonimizzato)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Elementi da documentare per la DPIA

Ogni flusso deve essere corredato da:
- **Categoria di dati**: pseudonimo, email, contenuti, metadati.
- **Finalità**: autenticazione, pubblicazione, messaggistica, generazione materiali.
- **Base giuridica**: esecuzione del contratto, consenso, obbligo legale.
- **Periodo di conservazione**: 6 mesi per messaggi, 24 mesi per segnalazioni, 35 gg per backup.
- **Destinatari**: fornitori di servizi (AI, email, storage), con indicazione della loro ubicazione.
- **Trasferimenti extra-UE**: se previsti, indicare le garanzie (clausole contrattuali tipo).

---

## 5. IL MOMENTO ZERO — ATTIVAZIONE DEL SERVIZIO

### 5.1 La vulnerabilità istituzionale

I documenti principali stabiliscono chiaramente che la registrazione del primo utente terzo modifica la qualificazione giuridica: lo sviluppatore da "persona che sperimenta" diventa "responsabile del trattamento" (o, peggio, "titolare" in assenza di nomina formale).

**Questa è la vulnerabilità più pericolosa**, perché non è tecnica ma procedurale. Può essere prevenuta esclusivamente con un atto formale.

### 5.2 Il rischio concreto

**Scenario**: lo sviluppatore completa il backend, implementa tutte le policy RLS, configura i backup crittografati, e decide di testare il sistema "dal vivo" con un gruppo di amici (studenti ERUA). Apre le registrazioni a un gruppo ristretto.

**Conseguenze**:
- I dati di questi studenti (email, pseudonimi, contenuti) sono dati personali trattati senza che un ente abbia assunto la titolarità.
- Se uno studente presenta un reclamo, lo sviluppatore è il Titolare e risponde in proprio.
- Se il sistema subisce una violazione (anche per errore), lo sviluppatore è responsabile della notifica all'autorità di controllo.
- Se l'ente (l'alleanza) decide di adottare la piattaforma, il trasferimento della titolarità richiede un atto formale che, a trattativa avviata, può incontrare resistenze (es. "ma il sistema è già stato usato, chi ha gestito quei dati?").

### 5.3 La soluzione

**Regola di ferro**: non si registra alcun utente reale (diverso dallo sviluppatore) fino a quando:

1. Un ente (l'alleanza o un ateneo) ha formalmente assunto la titolarità del trattamento, con atto scritto.
2. È stato sottoscritto l'accordo sul trattamento dei dati tra Titolare e Responsabile.
3. Il Titolare ha designato un referente per la moderazione.
4. È stata pubblicata l'informativa privacy conforme.

Fino a quel momento, il collaudo si esegue esclusivamente con identità fittizie create dallo sviluppatore su indirizzi di posta propri.

### 5.4 Checklist di attivazione

Prima di aprire le iscrizioni a utenti reali:

- [ ] Nomina del Titolare del trattamento (atto formale dell'ente).
- [ ] Accordo sul trattamento dei dati sottoscritto.
- [ ] Referente per la moderazione designato (con recapito funzionale).
- [ ] Informativa privacy pubblicata e conforme.
- [ ] Termini d'uso pubblicati.
- [ ] Regolamento della comunità pubblicato.
- [ ] Procedura di violazione dei dati predisposta.
- [ ] Data Flow Diagram consegnato al Titolare.
- [ ] Copertura assicurativa per responsabilità civile attivata (se previsto).
- [ ] Limite di spesa configurato su tutti i servizi a consumo.

---

## 6. LA SICUREZZA DELL'INFRASTRUTTURA (BACKUP E CONFIGURAZIONE)

### 6.1 Backup crittografati

**Sezione aggiuntiva da integrare nel Documento tecnico, 5.12**:

> Le copie di sicurezza del database vengono crittografate prima del trasferimento allo storage. La chiave di cifratura è conservata separatamente dal sistema di produzione. La rotazione delle chiavi è pianificata. Il ripristino da backup crittografato è testato periodicamente su un ambiente di collaudo.

**Implementazione**:
```bash
# Backup notturno
pg_dump $DATABASE_URL | gpg --symmetric --cipher-algo AES256 \
  --passphrase-file /run/secrets/backup_key.gpg \
  > /backups/$(date +%Y%m%d)_db.sql.gpg

# Upload su storage privato
aws s3 cp /backups/$(date +%Y%m%d)_db.sql.gpg s3://erua-backups/ --storage-class STANDARD_IA
```

### 6.2 Autenticazione e sessioni

**Sezione aggiuntiva da integrare nel Documento tecnico, 5.3**:

> Il token di sessione è trasmesso esclusivamente tramite cookie `HttpOnly`, `Secure`, `SameSite=Lax`. Il token non è accessibile dal codice JavaScript. La durata della sessione è di 24 ore, con rinnovo automatico in presenza di attività. L'utente può revocare tutte le sessioni attive.

**Perché è importante**: se il token fosse memorizzato in `localStorage` o in un cookie accessibile da JavaScript, un attacco XSS (Cross-Site Scripting) consentirebbe la sua sottrazione. L'utilizzo di cookie `HttpOnly` lo impedisce.

### 6.3 CORS e sicurezza delle richieste

**Sezione aggiuntiva da integrare nel Documento tecnico, 5.8**:

> Le politiche CORS sono configurate per accettare richieste esclusivamente dal dominio dell'applicazione. Le intestazioni di sicurezza (CSP, HSTS, X-Content-Type-Options) sono abilitate.

**Esempio di configurazione CSP**:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.erua-connect.eu
```

---

## 7. IL RUOLO DELL'IA NEL TESTING DI SICUREZZA

### 7.1 Il limite dell'IA

L'IA è eccellente nel generare **codice che funziona** ma non nel **testare la sicurezza**. L'IA non "capisce" la logica aziendale di accesso; esegue pattern. Può generare test di integrazione che verificano il flusso felice, ma i test di sicurezza richiedono una **mente umana** che immagina gli scenari di attacco.

**L'IA non immagina l'attacco; risponde a una descrizione dell'attacco.** Se lo sviluppatore non sa quali attacchi sono possibili, l'IA non li genererà.

### 7.2 Come usare l'IA per la sicurezza

1. **Generare i test di sicurezza prima del codice**:
   - Chiedere all'IA: "Scrivimi il test che tenta di leggere i messaggi di un altro utente."
   - Eseguire il test (deve fallire).
   - Scrivere il codice (policy RLS).
   - Eseguire il test (deve passare).

2. **Generare scenari di attacco da testare**:
   - Chiedere all'IA: "Elenca 10 possibili modi in cui un utente potrebbe tentare di accedere a dati altrui in questa architettura."
   - Per ciascuno, chiedere: "Scrivimi il test specifico per questo scenario."
   - Eseguire i test.

3. **Non fidarsi delle risposte "sembra sicuro"**:
   - L'IA non ha un modello mentale della sicurezza; può dire "sembra sicuro" anche in presenza di vulnerabilità.

### 7.3 Checklist di test di sicurezza da chiedere all'IA

```
"Scrivimi i test di integrazione per verificare che:

1. Un utente non possa leggere messaggi di conversazioni a cui non partecipa.
2. Un utente non possa modificare contenuti che non ha creato.
3. Un utente non possa cancellare account altrui.
4. Un utente non autenticato non possa accedere a contenuti riservati.
5. Un utente con token scaduto non possa accedere.
6. Un utente bloccato non possa inviare messaggi al bloccante.
7. Un utente non possa eludere la moderazione ricreando contenuti rimossi.
8. Un utente non possa saturare il sistema con richieste ripetute.
9. Un utente non possa caricare file di tipo non ammesso.
10. Un utente non possa accedere a file caricati da altri utenti.
"
```

---

## APPENDICE A — RIEPILOGO DELLE MISURE AGGIUNTIVE

| Misura | Sezione | Priorità | Verifica |
|---|---|---|---|
| Sanitizzazione dei prompt AI (rimozione PII) | 2 | Critica | Test con PDF contenenti dati personali |
| Cifratura dei backup | 3 | Alta | Tentativo di lettura del dump senza chiave |
| Data Flow Diagram per DPIA | 4 | Alta | Consegna al Titolare prima dell'attivazione |
| Attivazione solo dopo nomina formale | 5 | Critica | Verifica documentale prima della registrazione utenti |
| Cookie di sessione HttpOnly/Secure | 6.2 | Alta | Ispezione dei cookie nel browser |
| Test di sicurezza TDD (prima del codice) | 7 | Critica | Verifica che i test di sicurezza falliscano prima dell'implementazione |

---

*Documento integrativo — revisione di agosto 2026. Da consultare congiuntamente al Documento tecnico di riferimento e al Dossier legale. Le vulnerabilità residue sono di natura implementativa e procedurale; i documenti principali forniscono il quadro, il presente documento le specifiche esecutive.*
```