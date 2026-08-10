# ERUA connect

**Prima di qualsiasi lavoro sostanziale su architettura, dati o pubblicazione,
leggi `riferimento.md`.** Contiene tutto: architettura, sicurezza, quadro legale,
contratto, gate di implementazione. Questo file tiene davanti solo l'essenziale.
`STATO.md` dice invece a che punto siamo: leggilo all'inizio di ogni sessione.

## Da non derogare mai
- **P1** Nessuna password conservata. Accesso solo via collegamento monouso email.
- **P2** Su ogni richiesta verifica che la risorsa appartenga all'utente (RLS). Ogni
  tabella con dati utente ha le sue policy, collaudate con un tentativo reale di
  accesso ai dati di un altro. Vedi `riferimento.md` §3.2.
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

## Salvataggio del codice di presentazione
Ogni Write/Edit su un file `.html`, `.css` o `.js` del progetto fa scattare da solo
`.claude/hooks/salva-html.sh`: cerca segreti, timbra `STATO.md`, registra un commit
e lo pubblica su GitHub. Non serve chiedere il permesso, ma:

- **Aggiorna la parte descrittiva di `STATO.md` nello stesso giro in cui tocchi
  l'HTML** — dove siamo, cosa manca, cosa resta da collaudare. Il timbro in fondo è
  automatico e riporta solo numeri misurati: non scriverci dentro.
- Se il salvataggio si blocca per la regola P4, **non aggirarlo**: togli la
  credenziale dal codice e dimmi che va revocata e rigenerata.
- Il controllo dei segreti riconosce forme note (chiavi AWS, GitHub, Google,
  Stripe, Anthropic, JWT, credenziali assegnate in chiaro). Non vede tutto:
  resta un cancello, non una garanzia (`riferimento.md` §5.6).

Per il resto: **`riferimento.md`**.
