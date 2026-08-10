/* ERUA connect — robot dei bandi di mobilità
   ==================================================================
       node robot/bandi.js            aggiorna
       node robot/bandi.js --prova    non scrive

   **Non scarica niente.** Legge `dati/notizie.json`, che il robot delle
   notizie ha già riempito da undici fonti, e ne tira fuori i bandi: le
   occasioni di partire, con la loro scadenza. Un giro di rete in meno,
   e le due sezioni non possono mai raccontare cose diverse.

   Riconoscere un bando fra le notizie si fa con le parole, in nove
   lingue. È rozzo e lo si vede: qualche bando sfugge, e ogni tanto entra
   qualcosa che bando non è. La scelta è deliberata — un filtro largo che
   lascia passare una notizia di troppo è meglio di uno stretto che
   nasconde l'unica occasione buona. Chi guarda la sezione ha davanti il
   titolo vero e il collegamento alla fonte: se una voce non c'entra, se
   ne accorge in un secondo.

   Per lo stesso motivo il filtro non pretende che un bando parli anche
   di mobilità: entrano tutti i bandi, e quelli che riguardano il partire
   portano un segno e stanno davanti. Chiedendo tutte e due le cose
   insieme, di 140 notizie ne passavano due — e le altre otto occasioni
   vere sparivano.

   Resta un limite che nessuna parola chiave risolve: **le notizie sono
   quelle recenti**. Un bando pubblicato a marzo e ancora aperto non
   compare, perché è uscito dal feed. Per averli tutti bisognerebbe
   leggere le pagine dei bandi di ciascun ateneo — che è il censimento
   ancora da fare.

   **La scadenza non si inventa.** Se nel testo non è scritta, il bando
   compare lo stesso, dichiarato «scadenza non indicata». Meglio una
   lacuna visibile che una data sbagliata: qui una data sbagliata fa
   perdere a qualcuno un anno all'estero.
*/

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { trovaScadenza, stato } from './comune/date.js';
import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'bandi';

/* Le parole che dicono «qui si può fare domanda», nelle nove lingue.
   In minuscolo: il confronto si fa su testo abbassato. */
const PAROLE_BANDO = [
  'bando', 'bandi', 'candidatura', 'candidature', 'domanda di ammissione', 'borsa di studio', 'borse',
  'call for applications', 'call for', 'apply now', 'applications open', 'scholarship', 'grant', 'vacancy',
  'convocatoria', 'plazas', 'beca', 'becas', 'solicitud',
  'ausschreibung', 'bewerbung', 'stipendium', 'förderprogramm', 'antrag',
  'appel à candidatures', 'appel', 'bourse', 'candidater',
  'nabór', 'stypendium', 'rekrutacja', 'konkurs',
  'προκήρυξη', 'πρόσκληση', 'υποτροφ',
  'покана', 'стипенди', 'конкурс',
  'kvietimas', 'stipendij', 'atranka',
];

/* Le parole che dicono «riguarda il partire»: servono a distinguere un
   bando di mobilità da un concorso per un posto da tecnico. */
const PAROLE_MOBILITA = [
  'erasmus', 'mobilit', 'mobility', 'exchange', 'scambio', 'intercambio', 'austausch', 'échange',
  'wymiana', 'ανταλλαγ', 'κινητικότητα', 'обмен', 'мобилност', 'mainai', 'studia za granicą',
  'estero', 'abroad', 'extranjero', 'ausland', "l'étranger", 'traineeship', 'tirocinio', 'internship',
  'summer school', 'winter school', 'intensive course', 'staff week', 'bip', 'blended intensive',
];

const contiene = (testo, parole) => parole.some(p => testo.includes(p));

function leggiNotizie() {
  const j = JSON.parse(fs.readFileSync(path.join(RADICE, 'dati', 'notizie.json'), 'utf8'));
  return Array.isArray(j) ? j : (j.elementi || []);
}

async function gira({ prova = false } = {}) {
  const avvio = Date.now();
  const notizie = leggiNotizie();
  console.log(`notizie da cui pescare: ${notizie.length}`);

  const oggi = new Date().toISOString().slice(0, 10);
  const bandi = [];

  for (const n of notizie) {
    const testo = `${n.t || ''} ${n.s || ''}`.toLowerCase();
    if (!contiene(testo, PAROLE_BANDO)) continue;

    /* l'indirizzo dice spesso più del titolo: `/erasmus/`, `/mobility/` */
    const dove = String(n.l || '').toLowerCase();
    const mobilita = contiene(testo, PAROLE_MOBILITA) || contiene(dove, PAROLE_MOBILITA);

    const trovata = trovaScadenza(`${n.t || ''}. ${n.s || ''}`);
    let scadenza = trovata ? trovata.data : null;

    /* Coerenza: una scadenza non può cadere prima che il bando sia
       uscito. Se succede, la data pescata è di qualcos'altro — e vale
       meno di nessuna data. */
    if (scadenza && n.d && scadenza < n.d) scadenza = null;

    bandi.push({
      u: n.u,
      t: n.t,
      s: n.s,
      l: n.l,
      /* la data di pubblicazione della notizia, che non è la scadenza */
      pubblicato: n.d || null,
      scadenza,
      stato: stato(scadenza, oggi),
      /* riguarda il partire: la sezione MOVE mette questi davanti */
      mobilita,
      origine: {
        ...(n.origine || {}),
        /* la scadenza è ricavata da noi leggendo il testo, non
           dichiarata dalla fonte: chi legge deve poterlo sapere */
        scadenzaRicavata: scadenza ? `dal testo, vicino a "${trovata.parola}"` : null,
      },
    });
  }

  /* aperti prima, per scadenza più vicina; poi quelli senza data; in
     fondo i chiusi, dal più recente */
  const peso = { aperto: 0, 'senza-data': 1, chiuso: 2 };
  bandi.sort((a, b) =>
    (b.mobilita === true) - (a.mobilita === true) ||
    peso[a.stato] - peso[b.stato] ||
    (a.stato === 'chiuso'
      ? String(b.scadenza || '').localeCompare(String(a.scadenza || ''))
      : String(a.scadenza || '9999').localeCompare(String(b.scadenza || '9999'))));

  const conta = { aperto: 0, chiuso: 0, 'senza-data': 0 };
  for (const b of bandi) conta[b.stato]++;
  const diMobilita = bandi.filter(b => b.mobilita).length;
  console.log(`bandi riconosciuti: ${bandi.length} (di mobilità: ${diMobilita}) — aperti ${conta.aperto}, chiusi ${conta.chiuso}, senza scadenza ${conta['senza-data']}`);

  if (prova) {
    console.log('\n--prova: non scrivo niente. I primi:');
    for (const b of bandi.slice(0, 10))
      console.log(`  ${(b.scadenza || '   —      ').padEnd(11)} ${b.stato.padEnd(11)} ${b.mobilita ? 'mobilità' : '        '} ${b.u.padEnd(8)} ${b.t.slice(0, 52)}`);
    return { esito: 'saltato', quanti: bandi.length, messaggio: 'prova' };
  }

  const esito = scriviDati(
    path.join(RADICE, 'dati', 'bandi.json'),
    bandi,
    { fonte: 'ricavati dalle notizie degli atenei',
      note: 'La scadenza è letta dal testo della notizia, non dichiarata dalla fonte. ' +
            'Dove non è scritta, il bando compare senza data invece che con una data indovinata.' },
    /* il numero di bandi aperti oscilla molto e legittimamente: un calo
       non è il sintomo di una fonte rotta, è agosto */
    { forza: true });

  console.log(`scritto: ${esito.quanti} bandi, ${Math.round(esito.byte / 1024)} KB`);
  return {
    esito: 'fatto',
    quanti: esito.quanti,
    messaggio: `aperti ${conta.aperto}, chiusi ${conta.chiuso}, senza scadenza ${conta['senza-data']}`,
    durataSecondi: Math.round((Date.now() - avvio) / 1000),
  };
}

const prova = process.argv.includes('--prova');
try {
  const r = await gira({ prova });
  if (!prova) segnala(NOME, r);
} catch (err) {
  const grave = !(err instanceof RifiutoDiScrivere);
  console.error(`${NOME}: ${err.message}`);
  if (!prova) segnala(NOME, { esito: grave ? 'errore' : 'saltato', messaggio: err.message });
  process.exit(grave ? 1 : 0);
}
