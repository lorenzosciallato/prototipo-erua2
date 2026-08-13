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
robot/giro.sh                      il giro completo, da cron o da n8n
node robot/ricevi.js notizie       riceve dati da fuori e li scrive con le stesse cautele
```

**n8n:** guida da zero in `robot/N8N.md`. In breve: per far girare i
robot **non serve riscriverli** — n8n li lancia com'è (`giro.sh`) e
diventa la sveglia con l'interfaccia. Riscriverli serve solo per leggere
dal canale YouTube i video non elencati, che richiedono OAuth: in quel
caso n8n raccoglie e `ricevi.js` scrive.

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

## Le nove fonti delle notizie

Sette pubblicano un feed. Due no, e per loro si legge l'elenco dalla
pagina: **EUV** (il vecchio feed è morto, il portale nuovo non ne
dichiara) e **ULPGC** (nessun feed, mai avuto).

Leggere una pagina è il modo peggiore e va detto: un feed è un impegno
della fonte a mantenere una forma, una pagina no. Quando quei due siti
verranno rifatti, il robot restituirà zero notizie — non un errore.
Per questo `scrivi.js` rifiuta di pubblicare il vuoto: resteranno le
notizie di ieri e il registro dirà che qualcosa non va. Le regole di
lettura stanno in `configurazione.js`, accanto alla fonte: si aggiusta
una riga, non un programma.

Due dettagli che è costato fatica trovare, e che si dimenticano:

- **NBU**: il feed è a `/bg/rss/news`, non a `/bg/rss` — quello risponde
  `no news found` e sembra rotto. La versione inglese esiste ma è ferma
  al 2016: si usa la bulgara.
- **ULPGC**: si legge da `www10.ulpgc.es` ma i collegamenti che diamo al
  lettore puntano a `www.ulpgc.es`, che è l'indirizzo ufficiale.

## Come ci presentiamo

`Mozilla/5.0 (compatible; ERUA-connect/1.0; +indirizzo)` — la forma
convenzionale dei lettori automatici che si comportano bene, la stessa
che usa Googlebot. Non è un travestimento: chi guarda i propri registri
legge il nostro nome e sa a chi scrivere. Con un nome secco alcuni
filtri rispondono 403 anche quando il loro `robots.txt` consente la
lettura — è il caso di ULPGC, che dichiara `Crawl-delay: 10` e nessun
divieto sulle notizie. Noi facciamo una richiesta per sito a ogni giro,
quindi siamo ampiamente dentro.

## Le destinazioni: due fonti, due mondi

**ULPGC** ha una banca dati interrogabile in JSON. È il caso fortunato:
i nomi arrivano col codice Erasmus ufficiale davanti, che identifica
l'ateneo senza ambiguità.

**UniMC** pubblica le destinazioni nell'allegato del bando: trenta pagine
di tabella stampata in PDF. Tre cose imparate leggendola, che varranno
per qualunque altro allegato:

1. L'intestazione della tabella **non è allineata** al corpo — codice e
   materia stavano venti caratteri più a sinistra del loro titolo.
   Ricavare le colonne dall'intestazione dava zero risultati **senza
   nessun errore**, che è il modo peggiore di sbagliare.
2. Una voce occupa **più righe**. Leggere riga per riga attaccava il
   pezzo di un ateneo a quello prima, e il risultato sembrava giusto.
3. I nomi lunghi **sbordano** nella colonna del paese. Per questo i
   numeri si cercano *in fondo alla riga*, dove stanno sempre.

E un errore che vale la pena ricordare: la tabella dei paesi era ricavata
da quella di ULPGC, che per forza di cose **non contiene la Spagna** —
è casa loro. Quarantuno destinazioni spagnole finivano fra le scartate
con un «paese sconosciuto: ES» che sembrava un problema dei dati.

## I loghi degli atenei di destinazione

Vengono da **Wikidata e Wikimedia Commons**, non dai siti degli atenei:
là ogni immagine porta licenza e autore in forma leggibile dalla
macchina, quindi si può tenere solo ciò che è libero e scrivere sempre
chi l'ha fatto. Un logo preso dal sito di un'università è un file con
licenza sua, che non si estende a chi lo ripubblica (§6.2).

Per non prendere il logo sbagliato — cercare un nome restituisce anche
facoltà, ospedali universitari, omonimi — si accetta un risultato solo se
**è un ente di istruzione superiore** e **sta nel paese giusto**, che
sappiamo già dalla destinazione.

La copertura non sarà mai piena: molti atenei su Wikidata non hanno un
logo, altri non si identificano con sicurezza. Dove manca restano le
iniziali su fondo pastello, che è una scelta grafica e non un buco.

Wikimedia limita chi scarica in fretta e risponde `429`: non è un
guasto, è un cartello che dice di rallentare. Il robot rallenta e
riprova. C'è anche una memoria delle ricerche già fatte
(`robot/.ricerche-loghi.json`, fuori dal controllo di versione): senza,
ogni ritentativo rifarebbe sei minuti di interrogazioni.

**Il marchio resta comunque loro.** Una licenza sul file è una cosa, il
marchio un'altra (§6.4). Per questo il piè di pagina dichiara, in
inglese e senza traduzione automatica, che il prototipo non è un
servizio di ERUA né degli atenei e che i marchi appartengono ai
rispettivi titolari.

## Se aggiungi una fonte

Si tocca `configurazione.js`, sotto `fonti`. Qui dentro non si tocca
niente: `feed: null` senza regole di pagina significa "non ne ho ancora
trovato uno", e quella fonte viene saltata dicendolo.
