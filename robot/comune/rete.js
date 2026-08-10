/* ERUA connect — accesso alla rete dei robot
   ==================================================================
   Un posto solo da cui escono tutte le richieste, per tre motivi:

   - **Educazione verso le fonti.** Ci presentiamo con un nome e un
     recapito, così chi gestisce quei siti sa chi sta leggendo e a chi
     scrivere se diamo fastidio. Fra una richiesta e l'altra aspettiamo:
     nove atenei letti a raffica somigliano a un attacco, letti con
     calma somigliano a un lettore.
   - **Un guasto non ferma il giro.** Un sito lento o giù non deve far
     saltare l'aggiornamento degli altri otto (§2.2).
   - **Nessuna sorpresa sui tempi.** Ogni richiesta ha una scadenza: un
     server che non risponde mai non può tenere appeso il robot per
     sempre.
*/

const NOME = 'ERUA-connect-robot/1.0 (prototipo; +https://github.com/lorenzosciallato/prototipo-erua2)';
const SCADENZA = 20_000;      // millisecondi
const PAUSA = 1_200;          // fra una fonte e l'altra
const TENTATIVI = 2;

const attendi = ms => new Promise(r => setTimeout(r, ms));

/* Scarica un indirizzo e restituisce il testo. Se non ce la fa dopo i
   tentativi previsti, solleva: chi chiama decide se è grave. */
export async function scarica(url) {
  let ultimo;
  for (let tentativo = 1; tentativo <= TENTATIVI; tentativo++) {
    const taglia = new AbortController();
    const orologio = setTimeout(() => taglia.abort(), SCADENZA);
    try {
      const r = await fetch(url, {
        signal: taglia.signal,
        redirect: 'follow',
        headers: { 'User-Agent': NOME, 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
      });
      if (!r.ok) throw new Error(`risposta ${r.status}`);
      return await r.text();
    } catch (err) {
      ultimo = err;
      if (tentativo < TENTATIVI) await attendi(2_000 * tentativo);
    } finally {
      clearTimeout(orologio);
    }
  }
  throw new Error(`${url}: ${ultimo && ultimo.message}`);
}

/* Scorre le fonti una per volta, con una pausa in mezzo. Restituisce
   sempre un risultato per fonte, anche quando è andata male: chi chiama
   deve poter dire "sette su nove", non "è fallito". */
export async function scaricaTutte(fonti, quale = f => f.feed) {
  const esiti = [];
  for (const [i, fonte] of fonti.entries()) {
    const url = quale(fonte);
    if (!url) { esiti.push({ fonte, saltata: 'nessun feed dichiarato' }); continue; }
    if (i) await attendi(PAUSA);
    try {
      esiti.push({ fonte, testo: await scarica(url) });
    } catch (err) {
      esiti.push({ fonte, errore: err.message });
    }
  }
  return esiti;
}
