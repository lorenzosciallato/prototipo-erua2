# n8n, partendo da zero

Guida scritta per chi n8n non l'ha mai aperto. Dice **cos'è**, **cosa
serve prima**, e **cosa fare esattamente**, in due livelli: il primo si
monta in mezz'ora e non richiede di toccare una riga di codice.

---

## Cos'è n8n, in concreto

Un programma che gira su un server e tiene aperta una pagina web dove
costruisci **catene di operazioni**, trascinando riquadri e collegandoli
con delle linee. Ogni riquadro fa una cosa: «aspetta le 5 del mattino»,
«scarica questo indirizzo», «tieni solo questi campi», «lancia questo
comando».

Una catena si chiama *workflow*. La si accende, e da quel momento parte
da sola agli orari che le hai detto.

**Cosa ci guadagni**, rispetto a un cron che lancia i nostri script:

- vedi a schermo se un giro è andato bene o male, senza leggere registri;
- ricontrolla e riprova da solo quando una fonte non risponde;
- e soprattutto **gestisce le autorizzazioni OAuth**. È la ragione vera:
  senza, per leggere dal canale YouTube i video *non elencati* dovremmo
  scrivere e custodire noi la parte più delicata.

**Cosa non ti dà**, e va detto: n8n non sa che una fonte cambiata non
deve svuotare una sezione, né che ogni dato va marcato con la sua
provenienza. Quelle cautele restano nel codice, dove si rileggono e si
collaudano. n8n comanda; il codice scrive.

---

## Cosa serve prima

n8n deve girare su **una macchina sempre accesa**. Tre strade:

| Dove | Costo | Quando ha senso |
|:--|:--|:--|
| **n8n Cloud** | a canone mensile | non hai un server e non vuoi averne uno |
| **Server tuo**, con Docker | il costo del server | è la scelta già fatta in `riferimento.md` §2.1 |
| **Il tuo computer**, con Docker | zero | solo per provare: quando è spento, non gira niente |

Sul tuo server, l'avvio è una riga:

```
docker run -d --restart unless-stopped --name n8n \
  -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Poi apri `http://indirizzo-del-server:5678` e crei l'utente.

⚠️ Due cose da non saltare: mettici **davanti HTTPS** (n8n gestirà
credenziali OAuth), e **non esporlo a internet aperto** senza password.

---

## Livello 1 — n8n come sveglia (mezz'ora, zero codice)

Il modo più rapido di avere i robot che girano. **Non serve riscrivere
niente**: n8n lancia il giro che esiste già.

Condizione: n8n deve stare **sulla stessa macchina** dove c'è la copia
del progetto, perché il giro finisce con un `git push`.

Il flusso ha due riquadri:

```
[ Schedule Trigger ]  →  [ Execute Command ]
   ogni giorno              cd /percorso/prototipo-erua2 && ./robot/giro.sh
   alle 5:17
```

1. Riquadro **Schedule Trigger**: modalità *Cron*, espressione `17 5 * * *`.
   (Le 5:17 e non le 5:00 di proposito: a orari tondi mezzo mondo
   interroga le stesse fonti.)
2. Riquadro **Execute Command**: nel campo comando metti
   `cd /percorso/prototipo-erua2 && ./robot/giro.sh`
3. Salva e accendi il flusso con l'interruttore in alto a destra.

Fine. Da domattina notizie, puntate e corsi si aggiornano da soli, e
ogni aggiornamento è un commit su GitHub.

**Un secondo flusso, che vale quanto il primo:** la sorveglianza.

```
[ Schedule Trigger ]  →  [ Execute Command ]              →  [ Send Email ]
   ogni giorno              node robot/comune/registro.js 36   solo se fallisce
   alle 9:00
```

`registro.js` esce con errore se un robot non dà segno di vita da oltre
36 ore. Serve perché un robot che va in errore lo scopri subito, ma uno
che **smette di partire** produce solo silenzio — e il silenzio non
arriva a nessuno.

---

## Livello 2 — n8n va a prendere i dati (serve per YouTube)

Qui n8n fa il lavoro di raccolta e passa il risultato al progetto. Serve
in un caso solo, ma importante: **i video non elencati del canale**, che
richiedono l'autorizzazione OAuth del proprietario del canale.

Il flusso:

```
[ Schedule ] → [ YouTube: Get Many Videos ] → [ Code: tieni i campi giusti ] → [ Execute Command ]
                 con credenziale OAuth          id, t, yt, data, n              node robot/ricevi.js ascolta
```

1. Nel riquadro **YouTube**, crea la credenziale OAuth2: n8n ti dà un
   indirizzo di rinvio da incollare in Google Cloud, e da lì in poi
   pensa lui a rinnovare il token.
2. Nel riquadro **Code**, riduci ogni video ai campi che la sezione usa:

   ```js
   return items.map(v => ({ json: {
     id: 'yt-' + v.json.id,
     t:  v.json.snippet.title,
     yt: v.json.id,
     data: (v.json.snippet.publishedAt || '').slice(0, 10),
     n:  (v.json.snippet.description || '').slice(0, 200),
     s:  'ERUA Podcast',
     u:  'ERUA',
   }}));
   ```

3. Nel riquadro **Execute Command**:
   `cd /percorso/prototipo-erua2 && node robot/ricevi.js ascolta --file {{ $json.percorso }}`

   Oppure, più semplice, scrivendo su standard input — dipende da come
   preferisci passare i dati; `ricevi.js` accetta entrambi.

**`robot/ricevi.js` è il pezzo che fa da guardiano.** Qualunque cosa
arrivi da fuori riceve lo stesso trattamento dei dati raccolti in casa:
il vuoto non si pubblica, gli elementi senza i campi necessari vengono
scartati e contati, la scrittura è atomica, la provenienza si scrive, e
l'esito finisce nel registro. Provalo a mano prima di collegarlo:

```
echo '[{"u":"ERUA","t":"prova","l":"https://esempio"}]' \
  | node robot/ricevi.js notizie --prova
```

---

## Da quale cominciare

Dal **livello 1**. Accende i robot oggi, non richiede di cambiare
niente, e ti fa prendere confidenza con n8n su un flusso di due
riquadri. Il livello 2 si aggiunge quando servirà davvero il canale
YouTube.

Se n8n non ce l'hai ancora da nessuna parte, i robot si accendono lo
stesso: `robot/giro.sh` va in qualunque cron, e su GitHub Actions gira
gratis senza avere un server.
