# ERUA connect

**Prima di qualsiasi lavoro sostanziale su architettura, dati o pubblicazione,
leggi `RIFERIMENTO.md`.** Contiene tutto: architettura, sicurezza, quadro legale,
contratto, gate di implementazione. Questo file tiene davanti solo l'essenziale.

## Da non derogare mai
- **P1** Nessuna password conservata. Accesso solo via collegamento monouso email.
- **P2** Su ogni richiesta verifica che la risorsa appartenga all'utente (RLS). Ogni
  tabella con dati utente ha le sue policy, collaudate con un tentativo reale di
  accesso ai dati di un altro. Vedi `RIFERIMENTO.md` §3.2.
- **P3** Il contenuto degli utenti è testo, mai codice (escape prima di mostrarlo).
- **P4** Nessun segreto (chiavi, token) nel codice pubblicato; controllo automatico
  prima di ogni pubblicazione.
- **P6** Tetto di spesa su ogni servizio a consumo prima di attivarlo.
- **P7** Ogni contenuto generato dall'IA è marcato come tale (fonte, data, "non
  verificato").
- **Momento zero:** nessun utente reale finché un ente non ha assunto per iscritto la
  titolarità del trattamento. Fino ad allora si collauda solo con account propri.
- Prima di ogni modifica al codice: fai i test di sicurezza (che devono fallire)
  *prima* di scrivere la policy o la funzione, mai dopo.

## Come lavorare
- Prodotto sempre completo; nessuna versione ridotta "da finire dopo".
- Niente framework applicativi; HTML/CSS/JS in moduli. PostgreSQL con RLS in regione UE.
- A ogni modifica di un file di codice, dammi i comandi esatti da incollare nel
  terminale.

Per il resto: **`RIFERIMENTO.md`**.
