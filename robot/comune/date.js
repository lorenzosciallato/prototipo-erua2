/* ERUA connect — riconoscere le date dentro un testo
   ==================================================================
   Serve a una cosa sola: capire entro quando si può fare domanda a un
   bando, leggendolo da un titolo o da un riassunto scritto in una delle
   nove lingue dell'alleanza.

   **Perché non basta cercare un numero.** In una notizia le date sono
   spesso più d'una: quella di pubblicazione, quella dell'evento, quella
   della scadenza. Prendere la prima che capita significa dire allo
   studente che il bando chiude quando invece comincia. Quindi qui si
   fanno due cose distinte: si trovano tutte le date, e poi si sceglie
   quella che ha vicino una parola che significa «entro».

   **Quello che questo file NON fa.** Non indovina. Se nel testo non
   c'è una scadenza scritta, restituisce niente — e il bando finisce
   fra quelli senza data, che il sito mostra dicendo apertamente «la
   scadenza non è indicata: guarda il bando». Meglio una lacuna
   dichiarata che una data inventata: qui una data sbagliata fa perdere
   a qualcuno un anno all'estero.
*/

/* I nomi dei mesi nelle nove lingue. Per polacco, greco, bulgaro e
   lituano si usano le forme che compaiono davvero nelle date — che sono
   declinate, non quelle del calendario. */
const MESI = {
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  itBreve: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  enBreve: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  de: ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  pl: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
  el: ['ιανουαρίου', 'φεβρουαρίου', 'μαρτίου', 'απριλίου', 'μαΐου', 'ιουνίου', 'ιουλίου', 'αυγούστου', 'σεπτεμβρίου', 'οκτωβρίου', 'νοεμβρίου', 'δεκεμβρίου'],
  bg: ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'],
  lt: ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'],
};

/* nome del mese → numero, in una tabella sola */
const NUMERO_MESE = new Map();
for (const elenco of Object.values(MESI)) {
  elenco.forEach((nome, i) => { if (!NUMERO_MESE.has(nome)) NUMERO_MESE.set(nome, i + 1); });
}

/* Le parole che annunciano una scadenza. Quando una data ne ha una
   vicino, è quella giusta. */
const PAROLE_SCADENZA = [
  // italiano
  'entro', 'scadenza', 'scade', 'termine', 'domande entro', 'candidatura entro',
  // inglese
  'deadline', 'by', 'closes', 'closing', 'apply by', 'no later than', 'until',
  // spagnolo
  'plazo', 'hasta el', 'fecha límite', 'antes del',
  // tedesco
  'frist', 'bis zum', 'antragsfrist', 'bewerbungsfrist', 'einsendeschluss',
  // francese
  'date limite', "jusqu'au", 'avant le', 'clôture',
  // polacco
  'termin', 'do dnia', 'nabór do',
  // greco
  'προθεσμία', 'έως',
  // bulgaro
  'краен срок', 'до',
  // lituano
  'terminas', 'iki',
];

const dueCifre = n => String(n).padStart(2, '0');

function valida(anno, mese, giorno) {
  if (!(mese >= 1 && mese <= 12 && giorno >= 1 && giorno <= 31)) return null;
  if (!(anno >= 2000 && anno <= 2100)) return null;
  const d = new Date(`${anno}-${dueCifre(mese)}-${dueCifre(giorno)}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.getUTCDate() !== giorno) return null;   // 31 febbraio e simili
  return `${anno}-${dueCifre(mese)}-${dueCifre(giorno)}`;
}

/**
 * Tutte le date trovate nel testo, con la posizione in cui compaiono.
 * @returns [{ data: 'AAAA-MM-GG', a: posizione }]
 */
export function trovaDate(testo) {
  const t = String(testo || '');
  const basso = t.toLowerCase();
  const trovate = [];

  /* 1. giorno + nome del mese + anno — la forma più comune nei bandi */
  const nomi = [...NUMERO_MESE.keys()].sort((a, b) => b.length - a.length)
    .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const conNome = new RegExp(`(\\d{1,2})\\s*[.°ºa]?\\s*(?:de\\s+|di\\s+|d['’])?(${nomi})\\.?(?:\\s+(?:de[l]?\\s+)?(\\d{4}))?`, 'gi');
  for (const m of basso.matchAll(conNome)) {
    const anno = m[3] ? Number(m[3]) : new Date().getUTCFullYear();
    const d = valida(anno, NUMERO_MESE.get(m[2].toLowerCase()), Number(m[1]));
    if (d) trovate.push({ data: d, a: m.index });
  }

  /* 2. forme numeriche: 15/09/2026, 15.09.2026, 15-09-2026 */
  for (const m of basso.matchAll(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/g)) {
    const d = valida(Number(m[3]), Number(m[2]), Number(m[1]));
    if (d) trovate.push({ data: d, a: m.index });
  }

  /* 3. forma internazionale: 2026-09-15 */
  for (const m of basso.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) {
    const d = valida(Number(m[1]), Number(m[2]), Number(m[3]));
    if (d) trovate.push({ data: d, a: m.index });
  }

  /* stessa data trovata da due espressioni: una sola volta */
  const viste = new Set();
  return trovate.filter(x => (viste.has(x.data) ? false : viste.add(x.data)));
}

/**
 * La scadenza: fra le date trovate, quella che ha vicino una parola che
 * significa «entro». Se nessuna ce l'ha, non si sceglie a caso — si
 * restituisce nulla.
 * @returns { data, parola } oppure null
 */
export function trovaScadenza(testo) {
  const t = String(testo || '');
  const basso = t.toLowerCase();
  const date = trovaDate(t);
  if (!date.length) return null;

  let migliore = null;
  for (const d of date) {
    for (const parola of PAROLE_SCADENZA) {
      /* la parola deve stare poco prima della data: oltre una sessantina
         di caratteri non è più la stessa frase */
      const zona = basso.slice(Math.max(0, d.a - 60), d.a);
      const dove = zona.lastIndexOf(parola);
      if (dove < 0) continue;
      const distanza = zona.length - dove;
      if (!migliore || distanza < migliore.distanza) migliore = { data: d.data, parola, distanza };
    }
  }
  return migliore ? { data: migliore.data, parola: migliore.parola } : null;
}

/** aperto, chiuso, oppure senza data — rispetto a oggi */
export function stato(scadenza, oggi = new Date().toISOString().slice(0, 10)) {
  if (!scadenza) return 'senza-data';
  return scadenza >= oggi ? 'aperto' : 'chiuso';
}
