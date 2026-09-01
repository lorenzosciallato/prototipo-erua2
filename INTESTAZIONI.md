# Intestazioni di sicurezza

GENERATO DA `node robot/scrivi-csp.js` — non si modifica a mano.

La politica sui contenuti sta **dentro `index.html`**, in una `<meta>`, ed è
attiva adesso. Le altre intestazioni qui sotto una `<meta>` non può darle:
vanno impostate dal servizio che pubblica il sito, e oggi non lo sono.

GitHub Pages non permette di impostare intestazioni. Finché il sito sta lì,
quello che segue resta da fare — e non è un dettaglio rimandabile a piacere:
`frame-ancestors` e HSTS sono due delle quattro voci di §3.8.

## Attiva adesso, nella pagina

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://www.youtube.com https://s.ytimg.com; style-src 'self' 'unsafe-inline' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com; img-src 'self' data: https://i.ytimg.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com; font-src 'self'; connect-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'none'
```

## Da impostare sul server, quando ci sarà

| Intestazione | Valore | A cosa serve |
|:--|:--|:--|
| `Content-Security-Policy` | come sopra | meglio come intestazione che come `<meta>`: vale anche per la pagina stessa |
| `Content-Security-Policy` | `frame-ancestors 'none'` | §3.8, divieto di incorporamento in pagine di terzi. **Una `<meta>` non può darla**: si può solo come intestazione |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | §3.8, trasporto sicuro obbligatorio |
| `X-Content-Type-Options` | `nosniff` | impedisce al browser di indovinare il tipo di un file e di eseguirlo come codice |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | non manda l'indirizzo completo della pagina ai siti verso cui si esce |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | niente di tutto questo serve, e dirlo chiude la porta |

## Cosa resta aperto, e perché

- **`style-src 'unsafe-inline'`.** Il progetto genera 69 attributi `style=` con
  valori che cambiano da elemento a elemento: la tinta dell'ateneo, la
  proporzione di una fotografia. La via d'uscita è scriverli da JavaScript con
  `elemento.style.setProperty()`, che la CSP non tocca — sessantanove punti in
  tutti i moduli. Uno stile in linea non esegue niente: al peggio deforma la
  pagina. È la voce meno grave, ed è l'unica rimasta.
- **Le origini della traduzione.** Google Translate è codice di terzi che gira
  nella nostra pagina: è una scelta già presa e dichiarata (§7.4), e la CSP la
  scrive per esteso invece di lasciarla implicita.
- **CORS** (§3.8) non si applica ancora: non c'è nessuna interfaccia nostra da
  cui accettare richieste. Tornerà con la base di dati.
