# I robot

Scrivono i file in `dati/`. Il sito li legge e non sa né vuole sapere chi
li ha scritti: è lo stesso contratto che vale se un giorno li compilasse
una persona a mano.

```
node robot/notizie.js  --prova     mostra cosa farebbe, non scrive
node robot/ascolta.js              aggiorna davvero
node robot/didattica.js            controlla che i video dichiarati esistano ancora
node robot/studenti.js             tiene il posto: oggi non produce niente
node robot/comune/registro.js 36   chi non dà segno di vita da 36 ore
robot/giro.sh                      il giro completo, da cron sul server
```

## Le tre regole che contano

**Il vuoto non si pubblica.** Se una fonte cambia struttura, il lettore
non la capisce più e restituisce zero elementi. Senza controllo quello
zero cancellerebbe una sezione. `comune/scrivi.js` rifiuta di scrivere un
risultato molto più povero del precedente: resta l'aggiornamento di ieri,
vecchio ma vero. Se il calo è reale, si rilancia con `--forza`.

**Il silenzio si nota.** Un robot che va in errore lo si scopre subito;
uno che smette di partire non produce errori, produce niente — e nessuno
se ne accorge per settimane. Per questo ogni giro scrive in
`robot/stato.json`, e `comune/registro.js` esce con errore se qualcuno
tace da troppo, così cron manda la mail senza bisogno di altro.

**Chi non si aggiorna non si cancella.** Un ateneo senza feed, o
irraggiungibile in quel momento, conserva le sue notizie. Meglio un
elenco per metà vecchio che una sezione mezza vuota.

## Cosa NON fanno, e perché

**Non copiano immagini dalle fonti.** Dei testi delle notizie
istituzionali il rischio è contenuto — gli enti hanno interesse a
diffonderle — ma le immagini hanno licenza intestata all'ateneo, non
estensibile a chi ripubblica (§6.2). L'elemento visivo accanto alla
notizia lo genera l'applicazione: colore, simbolo, sigla.

**Non usano interfacce non ufficiali.** §6.3 le esclude dall'esercizio.
Il robot delle puntate legge il feed che YouTube pubblica da sé per ogni
canale — nessuna chiave, nessun accesso al canale. Per questo funziona
già oggi che l'accesso non c'è.

**Non scelgono i corsi.** La vetrina della didattica è una selezione
editoriale, non un aggregato. Il robot controlla soltanto che i video
dichiarati rispondano ancora, e segnala quelli spenti: togliere o
sostituire un corso è una decisione, non un automatismo.

**Non inventano contenuti studenteschi.** `studenti.js` produce un elenco
vuoto ed è il suo comportamento giusto: riempirlo di esempi verosimili
farebbe credere che quella parte esista.

## Provenienza, su ogni elemento

Ogni voce porta `origine`: da quale fonte, a quale indirizzo, letta
quando. E `generato`, oggi sempre `null`.

Quel campo va valorizzato — `{ sistema, data, verificato: false }` —
appena una macchina scriverà una qualunque di quelle righe: un riassunto,
un occhiello, una traduzione. L'obbligo di trasparenza del regolamento
europeo sull'IA è **in vigore dal 2 agosto 2026** (§6.5, termine non
differito), e chiede l'identificazione visibile sull'elemento, non nei
termini d'uso. La casella esiste da subito proprio per non dover
ripassare tutti i file il giorno in cui servirà.

## Se aggiungi una fonte

Si tocca `configurazione.js`, sotto `fonti`. Qui dentro non si tocca
niente: `feed: null` significa "non ne ho ancora trovato uno", e quella
fonte viene saltata dicendolo, invece di essere letta in qualche altro
modo.
