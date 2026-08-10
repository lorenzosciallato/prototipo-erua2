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
| `collaudo/` | le prove automatiche |

Chi apre solo la rivista non scarica più la didattica né le trascrizioni delle
lezioni: prima arrivava tutto a ogni visita.

Non esiste ancora nessuna componente a database: niente PostgreSQL, niente
policy di riga (RLS), niente accesso via collegamento monouso. Tutto quello che
si vede gira nel browser.

## Cosa manca, in ordine

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

Ultimo salvataggio: **10/08/2026 alle 21:03** — file toccato: `index.html`

| File | Righe | Peso |
|:--|--:|--:|
| `avvio.js` | 38 | 4.0K |
| `configurazione.js` | 177 | 12K |
| `index.html` | 356 | 28K |
| `moduli/articolo.js` | 569 | 24K |
| `moduli/ascolta.js` | 170 | 8.0K |
| `moduli/aula.js` | 842 | 44K |
| `moduli/didattica.js` | 420 | 20K |
| `moduli/lingua.js` | 164 | 8.0K |
| `moduli/navigazione.js` | 97 | 4.0K |
| `moduli/notizie.js` | 101 | 8.0K |
| `moduli/nucleo.js` | 253 | 16K |
| `moduli/rivista.js` | 294 | 16K |
| `moduli/sociale.js` | 237 | 12K |
| `moduli/storie.js` | 100 | 8.0K |
| `stile/articolo.css` | 132 | 12K |
| `stile/ascolta.css` | 129 | 12K |
| `stile/aula.css` | 459 | 32K |
| `stile/base.css` | 209 | 12K |
| `stile/didattica.css` | 163 | 12K |
| `stile/notizie.css` | 125 | 12K |
| `stile/rivista.css` | 100 | 8.0K |
| `stile/sociale.css` | 549 | 40K |
| `stile/storie.css` | 48 | 4.0K |

<!-- fine timbro automatico -->
