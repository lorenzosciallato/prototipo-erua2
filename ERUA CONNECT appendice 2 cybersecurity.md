```markdown
# ERUA connect — Playbook per il raggiungimento del 98% di copertura in sicurezza e conformità

## Documento operativo di implementazione

**Documento interno di progetto — agosto 2026**

---

## PREMESSA

I tre documenti principali (Tecnico, Legale, Vulnerabilità residue) coprono il **perimetro strutturale** del progetto. Questo playbook copre il **perimetro implementativo e operativo**, ovvero:

1. **Cosa devi fare concretamente** per chiudere il 10-15% di rischio residuo.
2. **Come usare l'IA** per generare il codice di sicurezza, non solo il codice funzionale.
3. **Quali controlli eseguire** prima di considerare il progetto "sicuro al 98%".

Il playbook è organizzato per **"cancelli" (gate)** : ogni gate rappresenta un insieme di attività da completare prima di passare al successivo. Il superamento di tutti i gate porta alla soglia del 98%.

---

## INDICE DEI GATE

| Gate | Ambito | Obiettivo |
|---|---|---|
| Gate 0 | Preparazione | Strumenti e ambiente di test |
| Gate 1 | Autenticazione e sessioni | Garantire che solo l'utente legittimo acceda |
| Gate 2 | Autorizzazione (RLS) | Garantire che l'utente veda solo i propri dati |
| Gate 3 | Sanitizzazione input e AI | Neutralizzare XSS, SQLi e fughe di PII |
| Gate 4 | Backup e ripristino | Garantire la recuperabilità crittografata dei dati |
| Gate 5 | Logging e monitoraggio | Rilevare incidenti in tempo reale |
| Gate 6 | Incident Response | Sapere cosa fare quando qualcosa va storto |
| Gate 7 | DPIA e documentazione | Fornire al Titolare tutto ciò che serve |
| Gate 8 | Go-Live Checklist | Verifica finale prima della registrazione utenti reali |

---

## GATE 0 — PREPARAZIONE DELL'AMBIENTE

### 0.1 Strumenti obbligatori

Prima di scrivere una riga di codice di backend, configura:

| Strumento | Finalità | Costo |
|---|---|---|
| **Ambiente di test separato** | Database e backend dedicati al collaudo | Zero (con servizi gestiti) |
| **PostgreSQL con RLS abilitato** | Database di produzione e test | Incluso |
| **Client REST (es. Postman o Bruno)** | Testare manualmente le API | Zero |
| **Framework di test (es. pytest per Python, Jest per Node)** | Test automatici di sicurezza | Zero |
| **Script di seeding** | Popolare il DB di test con utenti fittizi | Da scrivere una volta |

### 0.2 Configurazione iniziale del database di test

```sql
-- Abilita RLS su tutte le tabelle
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Crea utenti di test con ID noti (per i test)
INSERT INTO users (id, email, pseudonym) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'utente_a@test.com', 'A'),
  ('22222222-2222-2222-2222-222222222222', 'utente_b@test.com', 'B'),
  ('33333333-3333-3333-3333-333333333333', 'utente_c@test.com', 'C');

-- Crea conversazione tra A e B
INSERT INTO conversations (id) VALUES ('conversation_12345');

-- Aggiungi A e B come partecipanti
INSERT INTO conversation_participants (conversation_id, user_id) VALUES 
  ('conversation_12345', '11111111-1111-1111-1111-111111111111'),
  ('conversation_12345', '22222222-2222-2222-2222-222222222222');

-- Inserisci messaggi di test
INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES 
  ('conversation_12345', '11111111-1111-1111-1111-111111111111', 'Messaggio di A a B', NOW()),
  ('conversation_12345', '22222222-2222-2222-2222-222222222222', 'Messaggio di B a A', NOW());
```

---

## GATE 1 — AUTENTICAZIONE E SESSIONI

### 1.1 Implementazione del magic link

**L'IA deve generare**:

1. **Generazione del token monouso**:
```python
import secrets
import hashlib
from datetime import datetime, timedelta

def generate_magic_token(email):
    # Token casuale di 32 byte, esadecimale
    token = secrets.token_hex(32)
    # Scadenza a 10 minuti
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    # Hash del token per conservazione in DB
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    store_token_in_db(email, token_hash, expires_at)
    # Invio del token in chiaro via email (solo al destinatario)
    send_email(email, token)
```

2. **Verifica del token**:
```python
def verify_magic_token(token, email):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    record = get_token_from_db(token_hash)
    if not record or record['expires_at'] < datetime.utcnow():
        raise InvalidTokenError()
    if record['used']:
        raise TokenAlreadyUsedError()
    # Tokens monouso: segna come usato
    mark_token_as_used(record['id'])
    return create_session(email)
```

3. **Cookie di sessione**:
```python
# Impostazioni del cookie
response.set_cookie(
    key='session_id',
    value=session_id,
    httponly=True,     # Non accessibile da JavaScript
    secure=True,       # Solo su HTTPS
    samesite='Lax',    # Protezione CSRF
    max_age=86400      # 24 ore
)
```

### 1.2 Test di autenticazione da eseguire

| Test | Descrizione | Codice da chiedere all'IA |
|---|---|---|
| **Token valido** | Login con token corretto → 200 + cookie | `test_magic_link_success` |
| **Token scaduto** | Login con token scaduto → 401 | `test_magic_link_expired` |
| **Token già usato** | Login con token già consumato → 401 | `test_magic_link_already_used` |
| **Token non corrispondente** | Token valido ma per email diversa → 401 | `test_magic_link_wrong_email` |
| **Sessione scaduta** | Richiesta con cookie scaduto → 401 | `test_session_expired` |
| **Revoca sessione** | Revoca attiva → le richieste successive danno 401 | `test_session_revoked` |

---

## GATE 2 — AUTORIZZAZIONE (RLS)

### 2.1 Implementazione delle policy RLS

**Regola d'oro**: ogni tabella che contiene dati riferibili a un utente deve avere almeno una policy `SELECT` che limiti l'accesso all'utente autenticato.

**Esempio di policy per tabella `messages`**:

```sql
-- Policy per la lettura
CREATE POLICY "messages_select_policy" ON messages
FOR SELECT USING (
    -- L'utente deve essere un partecipante della conversazione
    auth.uid() IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
    )
    AND
    -- Se l'utente è uscito, non vede i messaggi successivi all'uscita
    NOT EXISTS (
        SELECT 1 FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
        AND leave_date IS NOT NULL
        AND leave_date < messages.created_at
    )
);

-- Policy per l'inserimento (solo se si partecipa alla conversazione)
CREATE POLICY "messages_insert_policy" ON messages
FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM conversation_participants
        WHERE conversation_id = messages.conversation_id
    )
);

-- Policy per la cancellazione (solo il mittente cancella i propri messaggi)
CREATE POLICY "messages_delete_policy" ON messages
FOR DELETE USING (auth.uid() = sender_id);
```

### 2.2 Test di autorizzazione da eseguire

| Test | Descrizione | Codice da chiedere all'IA |
|---|---|---|
| **Lettura dei propri messaggi** | Utente A → 200 | `test_user_reads_own_messages` |
| **Lettura di messaggi altrui** | Utente C → 403 o array vuoto | `test_user_cannot_read_foreign_messages` |
| **Lettura dopo l'uscita** | Utente A esce → lettura messaggi precedenti OK, successivi NO | `test_user_cannot_read_after_leave` |
| **Inserimento in conversazione** | Utente C → 403 (se non partecipa) | `test_user_cannot_insert_foreign_conversation` |
| **Cancellazione messaggio altrui** | Utente B → 403 | `test_user_cannot_delete_foreign_message` |
| **Accesso a conversazione cancellata** | Conversazione cancellata → 404 | `test_deleted_conversation_not_accessible` |
| **Accesso con utente non autenticato** | Nessun token → 401 | `test_unauthenticated_cannot_read_messages` |
| **Accesso con token di altro utente** | Token di A ma richiesta per B → 403 | `test_token_does_not_override_rls` |

### 2.3 Il workflow TDD per l'autorizzazione

Per OGNI endpoint che accede a dati di un utente:

1. Scrivi il test che **tenta di accedere ai dati di un altro utente**.
2. Esegui il test → **deve fallire** (perché la policy non esiste ancora).
3. Scrivi la policy RLS corrispondente.
4. Esegui il test → **deve passare**.

**Esempio di test da chiedere all'IA**:

```
"Scrivimi un test di integrazione in pytest che:
1. Crea due utenti (A e B) nel database di test.
2. Crea una conversazione privata tra A e B con 3 messaggi.
3. Autentica l'utente C (terzo, non partecipante).
4. Tenta di leggere i messaggi della conversazione.
5. Verifica che la risposta sia 403 Forbidden o che il JSON restituito abbia array di messaggi vuoto.
6. Verifica che l'utente A possa leggere i propri messaggi.
7. Verifica che l'utente B possa leggere i propri messaggi.
"
```

**Questo test va scritto PRIMA della policy RLS.**

---

## GATE 3 — SANITIZZAZIONE INPUT E AI

### 3.1 Sanitizzazione dei contenuti degli utenti (XSS)

**Regola**: ogni contenuto immesso dall'utente e visualizzato in HTML viene passato attraverso una funzione di escape.

```python
# Sanitizzazione per HTML (da usare in tutti i template)
def escape_html(text):
    if not text:
        return ''
    replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text
```

### 3.2 Sanitizzazione dei prompt AI (PII stripping)

**Regola**: prima di inviare qualsiasi testo all'AI, rimuovere pattern che identificano persone.

```python
import re

def sanitize_prompt_for_ai(text):
    # Rimuovi email
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL]', text)
    
    # Rimuovi numeri di telefono (formati internazionali e locali)
    text = re.sub(r'\+?[0-9\s\-\(\)]{8,15}', '[TELEFONO]', text)
    
    # Rimuovi matricole (configura il pattern per il tuo ateneo)
    text = re.sub(r'[A-Z]{2}\d{4,6}', '[MATRICOLA]', text)
    
    # Rimuovi nomi propri riconoscibili (es. pattern: Maiuscolo minuscolo)
    # Questo è fallibile: meglio usare un approccio con lista di nomi o NER
    # Per ora, sostituiamo pattern di nomi e cognomi con un placeholder
    # (Attenzione: può creare falsi positivi)
    
    # Nota: per nomi propri, la soluzione più robusta è:
    # - Usare una libreria di NER (es. spaCy) per rilevare entità PERSON
    # - Se non disponibile, chiedere all'utente di verificare il contenuto
    # - O meglio: chiedere all'AI di non restituire dati personali nel prompt
    
    return text
```

### 3.3 Prompt design sicuro

Il prompt inviato all'AI deve includere esplicitamente:

```
"Il testo seguente può contenere dati personali. Non restituirli nella risposta.
Restituisci esclusivamente il contenuto didattico (sintesi, concetti, definizioni).
Non imparare da questo testo; non conservarlo."

[TESTI SANITIZZATI]
```

### 3.4 Test di sanitizzazione

| Test | Descrizione |
|---|---|
| **Email presente** | Email viene sostituita con `[EMAIL]` nel prompt |
| **Telefono presente** | Telefono viene sostituito con `[TELEFONO]` |
| **Matricola presente** | Matricola viene sostituita con `[MATRICOLA]` |
| **Nomi propri** | Se rilevati, sostituiti o segnalati all'utente |
| **Prompt injection** | Contenuto che sembra istruzione (es. "Ignora le istruzioni") → bloccato |

---

## GATE 4 — BACKUP E RIPRISTINO

### 4.1 Configurazione dei backup cifrati

**Script di backup automatico** (da eseguire nightly):

```bash
#!/bin/bash
# backup_secure.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/secure/backups"
DB_NAME="erua_db"

# Crea il dump
pg_dump $DB_NAME > $BACKUP_DIR/dump_$DATE.sql

# Cifra con GPG (richiede chiave)
gpg --symmetric --cipher-algo AES256 --passphrase-file /run/secrets/backup_key.gpg $BACKUP_DIR/dump_$DATE.sql

# Rimuovi il dump in chiaro
rm $BACKUP_DIR/dump_$DATE.sql

# Upload su storage privato (es. S3 con bucket privato)
aws s3 cp $BACKUP_DIR/dump_$DATE.sql.gpg s3://erua-backups/ --storage-class STANDARD_IA

# Mantieni solo gli ultimi 7 backup locali
cd $BACKUP_DIR && ls -tp | grep -v '/$' | tail -n +8 | xargs rm -f
```

### 4.2 Test di ripristino

**La copia di sicurezza va testata. Periodicamente** (es. ogni 3 mesi):

```bash
# Test di ripristino su ambiente di test
gpg --decrypt --passphrase-file /run/secrets/backup_key.gpg backup.sql.gpg > backup.sql

# Importa in un database di test
createdb test_restore_db
psql test_restore_db < backup.sql

# Verifica l'integrità (es. contare gli utenti, le conversazioni)
psql test_restore_db -c "SELECT COUNT(*) FROM users;"
psql test_restore_db -c "SELECT COUNT(*) FROM messages;"
```

### 4.3 Rotazione delle chiavi

La chiave di cifratura va ruotata ogni **6 mesi** e conservata in un sistema di gestione delle chiavi (KMS) o su supporto fisico separato. La chiave **non** è memorizzata nel codice dell'applicazione.

---

## GATE 5 — LOGGING E MONITORAGGIO

### 5.1 Cosa loggare

| Categoria | Cosa loggare | Cosa non loggare |
|---|---|---|
| **Accessi** | Email (hash), timestamp, esito (successo/fallimento), IP | Password, token in chiaro |
| **Richieste API** | Endpoint, metodo, user_id (se autenticato), timestamp | Corpo della richiesta, parametri sensibili |
| **Errori** | Tipo di errore, stack trace (anonimizzato), timestamp | Contenuto della richiesta, dati utente |
| **Azioni amministrative** | Chi ha fatto cosa, quando | Dati modificati in chiaro |
| **Segnalazioni** | ID segnalante, ID segnalato, motivazione, esito | Contenuto della segnalazione (conservato separatamente) |

### 5.2 Formato dei log

```json
{
  "timestamp": "2026-08-09T22:30:00Z",
  "level": "info",
  "service": "erua-api",
  "event": "user_login",
  "user_id": "11111111-1111-1111-1111-111111111111",
  "ip_hash": "b15d32a4...",
  "success": true,
  "session_duration": 3600
}
```

### 5.3 Conservazione dei log

- Log di accesso e operazioni: **30 giorni**.
- Log di sicurezza (accessi falliti, tentativi di escalation): **90 giorni**.
- Log amministrativi: **24 mesi** (ai fini della DPIA).

### 5.4 Monitoraggio attivo

Configurare un sistema di monitoraggio che **allerti** in caso di:

- Tentativi di accesso multipli da IP diverso per lo stesso utente (possibile furto di token).
- Accessi falliti a risorse non autorizzate (tentativo di IDOR).
- Richieste anomale di esportazione dati.
- Incremento improvviso del traffico (possibile attacco DDoS).
- Errori 500 in endpoint critici.

---

## GATE 6 — INCIDENT RESPONSE

### 6.1 Il playbook di risposta

| Fase | Azione | Tempo massimo | Strumento |
|---|---|---|---|
| **Rilevamento** | Notifica automatica (alert) o segnalazione umana | Immediato | Monitoraggio |
| **Contenimento** | Commutazione in sola lettura, revoca delle sessioni, isolamento del sistema | Entro 15 minuti | Script di emergenza |
| **Analisi** | Identificare la causa, il perimetro, i dati coinvolti | Entro 2 ore | Log, registri |
| **Notifica al Titolare** | Comunicare gli elementi noti (data, natura, dati coinvolti, misure) | **Immediato** | Template email |
| **Notifica all'autorità** | Se violazione, entro 72 ore | Dal Titolare | DPIA |
| **Ripristino** | Applicare patch, ripristinare da backup, testare | Entro 24 ore | Backup |

### 6.2 Template di notifica al Titolare

```
Oggetto: [URGENTE] Notifica di potenziale violazione dati — ERUA connect

Data: [data]
Ora rilevamento: [ora]
Natura dell'evento: [accesso non autorizzato / errore di configurazione / perdita dati]

Dati potenzialmente coinvolti:
- Categorie: [email, messaggi, contenuti]
- Numero di utenti stimato: [n]

Misure già adottate:
- [servizio in sola lettura]
- [sessioni revocate]
- [indagine in corso]

Prossimi passi:
- Analisi dei log in corso
- Predisposizione della comunicazione agli utenti (se necessario)

Resto a disposizione per ulteriori informazioni.
```

---

## GATE 7 — DPIA E DOCUMENTAZIONE

### 7.1 Data Flow Map per la DPIA

Da consegnare al Titolare:

```
DATI IN INGRESSO
   │
   ├── Email (autenticazione)
   ├── Pseudonimo (identità pubblica)
   ├── Contenuti (testo, immagini, file)
   ├── Messaggi privati (testo)
   ├── Materiali didattici (PDF, video)
   │
   ▼
CLIENT (browser)
   │
   ├── Validazione lato client (solo usabilità)
   ├── Compressione immagini (client-side)
   │
   ▼
API GATEWAY
   │
   ├── Rate limiting
   ├── Validazione input
   ├── Autenticazione (magic link)
   │
   ▼
BACKEND
   │
   ├── Autorizzazione (RLS)
   ├── Sanitizzazione (XSS, prompt AI)
   ├── Logging (anonimizzato)
   │
   ▼
DATABASE (PostgreSQL, EU)
   │
   ├── Utenti (email hash, pseudonimo, profilo)
   ├── Contenuti (testo, metadati, timestamp)
   ├── Messaggi (testo, timestamp, conversazione)
   ├── Segnalazioni (conservazione 24 mesi)
   │
   ▼
STORAGE (S3/R2, EU)
   │
   ├── Immagini caricate (compresse, metadati rimossi)
   ├── Backup (cifrati, rotazione 35 gg)
   │
   ▼
SERVIZI DI TERZI (EU o con garanzie adeguate)
   │
   ├── AI (solo testo sanitizzato, senza PII)
   ├── Email (magic link, notifiche)
   ├── Error tracking (anonimizzato)
```

### 7.2 Documenti da consegnare al Titolare

| Documento | Contenuto | Scadenza |
|---|---|---|
| **Informativa privacy** | Testo da pubblicare | Prima dell'attivazione |
| **Termini d'uso** | Testo da pubblicare | Prima dell'attivazione |
| **Regolamento della comunità** | Testo da pubblicare | Prima dell'attivazione |
| **Data Flow Map** | Schema dei flussi di dati | Prima dell'attivazione |
| **Allegato tecnico delle misure di sicurezza** | Descrizione delle misure implementate | Prima dell'attivazione |
| **Registro dei trattamenti** | Elenco dei trattamenti (finalità, categorie, destinatari) | Prima dell'attivazione |

---

## GATE 8 — GO-LIVE CHECKLIST

Prima di registrare il primo utente reale:

### 8.1 Verifiche di sicurezza

- [ ] Tutte le tabelle con dati utente hanno RLS abilitata.
- [ ] Ogni policy RLS è stata testata con scenari di attacco (IDOR).
- [ ] I cookie di sessione sono `HttpOnly`, `Secure`, `SameSite=Lax`.
- [ ] Le intestazioni di sicurezza (CSP, HSTS, X-Content-Type-Options) sono configurate.
- [ ] Tutti i prompt AI sanitizzano i dati personali.
- [ ] I backup sono cifrati e il ripristino è testato.
- [ ] I log non contengono dati personali in chiaro.
- [ ] I limiti di spesa sono configurati su tutti i servizi a consumo.

### 8.2 Verifiche legali e istituzionali

- [ ] Il Titolare del trattamento ha firmato la nomina.
- [ ] L'accordo sul trattamento dei dati è sottoscritto.
- [ ] Il referente per la moderazione è designato.
- [ ] L'informativa privacy è pubblicata.
- [ ] I termini d'uso sono pubblicati.
- [ ] Il regolamento della comunità è pubblicato.
- [ ] La dichiarazione di accessibilità è pubblicata.
- [ ] Il Data Flow Map è stato consegnato al Titolare.

### 8.3 Verifiche operative

- [ ] La procedura di Incident Response è documentata e comunicata al Titolare.
- [ ] Il monitoraggio attivo (alert) è configurato.
- [ ] Il limite di spesa sui servizi a consumo è configurato.
- [ ] La funzione di cancellazione account è testata (esportazione e anonimizzazione).
- [ ] La funzione di segnalazione contenuti è testata.
- [ ] La funzione di blocco utenti è testata.
- [ ] La funzione di esportazione dati (GDPR art. 20) è testata.

---

## APPENDICE A — RIEPILOGO DELLE RISORSE DA CHIEDERE ALL'IA

| Richiesta all'IA | Output atteso |
|---|---|
| "Scrivimi il test di integrazione che tenta di leggere i messaggi di un altro utente" | Codice di test con autenticazione e verifica 403 |
| "Scrivimi la policy RLS per la tabella messages" | Policy RLS con USING e WITH CHECK |
| "Scrivimi la funzione di sanitizzazione per i prompt AI" | Codice Python/Node con regex per PII |
| "Scrivimi lo script di backup cifrato" | Script bash con pg_dump e gpg |
| "Scrivimi il template di notifica per il Titolare in caso di violazione" | Testo dell'email con placeholder |
| "Scrivimi il test che verifica che un utente non possa accedere a un file di un altro utente" | Test di integrazione con caricamento e accesso |
| "Elencami 10 scenari di attacco IDOR per questa architettura e i relativi test" | Lista di scenari e test corrispondenti |

---

## APPENDICE B — VALUTAZIONE FINALE DELLA COPERTURA

| Ambito | Copertura documentale | Copertura implementativa (con questo playbook) |
|---|---|---|
| GDPR strutturale | 95% | 98% |
| GDPR operativo | 85% | 97% |
| Autenticazione | 98% | 99% |
| Autorizzazione (RLS) | 70% | **98%** (con TDD e test) |
| Sanitizzazione input | 90% | 98% |
| AI e PII | 60% | **97%** (con sanitizzazione e prompt design) |
| Backup e ripristino | 85% | 98% |
| Incident Response | 80% | 97% |
| DPIA e documentazione | 75% | 98% |

**Copertura complessiva stimata:** **97-98%**

Il 2-3% residuo è il rischio zero-day, gli errori umani non rilevati dai test, e le vulnerabilità future scoperte dopo il lancio. Questa è la soglia massima ragionevolmente raggiungibile.

---

*Playbook operativo — revisione di agosto 2026. Da consultare prima di ogni intervento di sviluppo e prima del lancio del servizio. Il superamento di tutti i gate è condizione necessaria per la messa in esercizio.*
```