#!/usr/bin/env node
/* ERUA connect — la politica sui contenuti, ricavata dalla configurazione
   ==================================================================
   Scrive dentro `index.html` la CSP, e in `INTESTAZIONI.md` l'elenco
   completo delle intestazioni di sicurezza per il giorno in cui il sito
   starà su un server nostro.

   **Perché generarla e non scriverla a mano.** Una CSP scritta a mano
   invecchia in silenzio: si aggiunge un servizio, ci si dimentica di
   aggiornarla, e o il servizio non funziona o — peggio — si allarga la
   regola "per sicurezza" finché non protegge più niente. Le origini da
   cui la pagina carica qualcosa stanno già in un posto solo,
   `configurazione.js`, ed è da lì che questa nasce. Se domani si toglie
   un servizio, si rilancia e la regola si stringe da sé.

   **Cosa la CSP fa.** Dice al browser da quali indirizzi può eseguire
   codice, prendere fogli di stile, immagini, caratteri. Se qualcuno
   riuscisse a infilare uno `<script>` in una pagina — per esempio
   attraverso un post scritto da un utente — il browser si rifiuterebbe
   di eseguirlo, perché non verrebbe da un'origine consentita. È la rete
   sotto il trapezio di P3 (riferimento.md §3.8).

   **Il presupposto.** §3.8 dice che una CSP vale davvero solo se nel
   markup non c'è codice in linea. Verificato: nessun gestore di eventi
   `on…=`, e nessun blocco `<script>` scritto dentro l'HTML. Restano gli
   attributi `style=`, e per quelli vedi il commento su `style-src`.

   Si rilancia quando cambia un servizio esterno:  node robot/scrivi-csp.js
*/

const fs = require('fs');
const path = require('path');

const RADICE = path.join(__dirname, '..');
const PAGINA = path.join(RADICE, 'index.html');
const DOCUMENTO = path.join(RADICE, 'INTESTAZIONI.md');

const APRE = '<!-- CSP: GENERATA — node robot/scrivi-csp.js -->';
const CHIUDE = '<!-- fine CSP generata -->';

/* Si legge la configurazione senza importarla: questo è uno script
   `require`, quella è un modulo `export`. Leggere il testo e ritagliarne
   gli indirizzi evita di dover trasformare l'uno nell'altro solo per
   sapere quali origini ci sono dentro. */
const config = fs.readFileSync(path.join(RADICE, 'configurazione.js'), 'utf8');

/* Si ritaglia con precisione, un campo per volta. Il primo tentativo
   prendeva "duemila caratteri a partire da qui" e si portava dentro il
   blocco successivo: ogni regola finiva per consentire anche YouTube,
   compreso `font-src`. Una CSP più larga della realtà non protegge da
   niente, e non lo dice — quindi qui si chiede il campo per nome. */
function campo(nome) {
  const m = config.match(new RegExp(nome + `:\\s*'(https://[a-z0-9.\\-/_]+)'`));
  if (!m) return null;
  return new URL(m[1]).origin;
}

function lista(nome) {
  const i = config.indexOf(nome + ': [');
  if (i < 0) return [];
  const pezzo = config.slice(i, config.indexOf(']', i));
  return [...new Set([...pezzo.matchAll(/'(https:\/\/[a-z0-9.-]+)'/g)].map(m => m[1]))];
}

const TRADUZIONE = lista('origini');
const INCORPORA = campo('incorpora');
const ANTEPRIME = campo('anteprime');
const API_VIDEO = campo('api');
const CODICE_PLAYER = campo('codicePlayer');

const mancanti = Object.entries({ TRADUZIONE, INCORPORA, ANTEPRIME, API_VIDEO, CODICE_PLAYER })
  .filter(([, v]) => !v || (Array.isArray(v) && !v.length)).map(([k]) => k);
if (mancanti.length) {
  console.error('Non ho trovato in configurazione.js:', mancanti.join(', '));
  console.error('Meglio fermarsi che scrivere una regola incompleta: bloccherebbe qualcosa senza dire cosa.');
  process.exit(1);
}

const REGOLE = [
  ['default-src', ["'self'"]],

  /* Il traduttore è codice di terzi che gira nella nostra pagina. È una
     scelta già presa e dichiarata (§7.4): qui la si scrive per esteso,
     invece di lasciarla implicita. */
  /* Due terze parti eseguono codice qui dentro, ed è bene che si veda:
     il traduttore, e l'API dei video che l'aula carica per poter
     comandare la riproduzione. Quest'ultima si scarica poi da sé il
     codice del lettore, da un altro indirizzo ancora. */
  ['script-src', ["'self'", ...TRADUZIONE, API_VIDEO, CODICE_PLAYER]],

  /* `'unsafe-inline'` qui e non su `script-src`: il progetto genera 69
     attributi `style=` con valori che cambiano da elemento a elemento —
     la tinta dell'ateneo, la proporzione di una fotografia. Senza questo
     le schede perderebbero i colori.

     Non è una svista ed è meno grave di quanto suoni: uno stile in linea
     non esegue niente, al peggio deforma la pagina. La via d'uscita c'è
     ed è nota — scrivere quei valori da JavaScript con
     `elemento.style.setProperty()`, che la CSP non tocca — ma sono
     sessantanove punti sparsi in tutti i moduli, e vanno rifatti quando
     non si sta rincorrendo altro. Finché resta, sta scritto qui perché
     nessuno lo scambi per una regola pensata. */
  ['style-src', ["'self'", "'unsafe-inline'", ...TRADUZIONE]],

  ['img-src', ["'self'", 'data:', ...VIDEO_IMMAGINI, ...TRADUZIONE]],

  /* I caratteri sono nostri, e devono restare tali: §6.1. Nessuna
     origine esterna qui è anche il modo di accorgersene se qualcuno ne
     rimettesse una. */
  ['font-src', ["'self'"]],

  ['connect-src', ["'self'", ...TRADUZIONE]],

  /* I video si vedono dentro un riquadro, dal dominio senza cookie. */
  ['frame-src', VIDEO_INCORPORA],

  /* Niente `<object>`, niente `<embed>`: non se ne usano, e sono una
     porta d'ingresso classica. */
  ['object-src', ["'none'"]],

  /* Nessuno può cambiare la base da cui si risolvono gli indirizzi
     relativi: senza, un `<base>` iniettato dirotterebbe ogni richiesta. */
  ['base-uri', ["'self'"]],

  /* Non c'è un solo modulo da inviare in tutto il sito. Quando ce ne
     sarà uno, questa riga andrà aperta — e il fatto che oggi sia chiusa
     è quello che lo farà notare. */
  ['form-action', ["'none'"]],
];

const CSP = REGOLE.filter(([, v]) => v.length).map(([k, v]) => `${k} ${v.join(' ')}`).join('; ');

/* ── nella pagina ─────────────────────────────────────────────────── */
let html = fs.readFileSync(PAGINA, 'utf8');
const meta = `${APRE}\n<meta http-equiv="Content-Security-Policy" content="${CSP}">\n${CHIUDE}`;

if (html.includes(APRE)) {
  html = html.replace(new RegExp(APRE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + CHIUDE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), meta);
} else {
  /* Va nel `<head>`, e il più in alto possibile: una CSP vale solo per
     quello che il browser incontra dopo averla letta. */
  const dove = html.indexOf('<meta charset');
  if (dove < 0) { console.error('Non trovo dove metterla: manca <meta charset> in index.html.'); process.exit(1); }
  const fine = html.indexOf('>', dove) + 1;
  html = html.slice(0, fine) + '\n\n' + meta + html.slice(fine);
}
fs.writeFileSync(PAGINA, html);

/* ── e il resto, che una `<meta>` non può dire ─────────────────────── */
fs.writeFileSync(DOCUMENTO,
`# Intestazioni di sicurezza

GENERATO DA \`node robot/scrivi-csp.js\` — non si modifica a mano.

La politica sui contenuti sta **dentro \`index.html\`**, in una \`<meta>\`, ed è
attiva adesso. Le altre intestazioni qui sotto una \`<meta>\` non può darle:
vanno impostate dal servizio che pubblica il sito, e oggi non lo sono.

GitHub Pages non permette di impostare intestazioni. Finché il sito sta lì,
quello che segue resta da fare — e non è un dettaglio rimandabile a piacere:
\`frame-ancestors\` e HSTS sono due delle quattro voci di §3.8.

## Attiva adesso, nella pagina

\`\`\`
Content-Security-Policy: ${CSP}
\`\`\`

## Da impostare sul server, quando ci sarà

| Intestazione | Valore | A cosa serve |
|:--|:--|:--|
| \`Content-Security-Policy\` | come sopra | meglio come intestazione che come \`<meta>\`: vale anche per la pagina stessa |
| \`Content-Security-Policy\` | \`frame-ancestors 'none'\` | §3.8, divieto di incorporamento in pagine di terzi. **Una \`<meta>\` non può darla**: si può solo come intestazione |
| \`Strict-Transport-Security\` | \`max-age=31536000; includeSubDomains\` | §3.8, trasporto sicuro obbligatorio |
| \`X-Content-Type-Options\` | \`nosniff\` | impedisce al browser di indovinare il tipo di un file e di eseguirlo come codice |
| \`Referrer-Policy\` | \`strict-origin-when-cross-origin\` | non manda l'indirizzo completo della pagina ai siti verso cui si esce |
| \`Permissions-Policy\` | \`camera=(), microphone=(), geolocation=()\` | niente di tutto questo serve, e dirlo chiude la porta |

## Cosa resta aperto, e perché

- **\`style-src 'unsafe-inline'\`.** Il progetto genera 69 attributi \`style=\` con
  valori che cambiano da elemento a elemento: la tinta dell'ateneo, la
  proporzione di una fotografia. La via d'uscita è scriverli da JavaScript con
  \`elemento.style.setProperty()\`, che la CSP non tocca — sessantanove punti in
  tutti i moduli. Uno stile in linea non esegue niente: al peggio deforma la
  pagina. È la voce meno grave, ed è l'unica rimasta.
- **Le origini della traduzione.** Google Translate è codice di terzi che gira
  nella nostra pagina: è una scelta già presa e dichiarata (§7.4), e la CSP la
  scrive per esteso invece di lasciarla implicita.
- **CORS** (§3.8) non si applica ancora: non c'è nessuna interfaccia nostra da
  cui accettare richieste. Tornerà con la base di dati.
`);

console.log('  Content-Security-Policy:\n');
for (const [k, v] of REGOLE.filter(([, v]) => v.length)) console.log(`    ${k} ${v.join(' ')}`);
console.log(`\n  scritta in    index.html  (${CSP.length} caratteri)`);
console.log('  il resto in   INTESTAZIONI.md');
