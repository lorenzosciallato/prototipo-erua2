/* ERUA connect — corrispondenza fra codici di paese
   ==================================================================
   Serve a una cosa sola: unire due mondi che nominano i paesi in modo
   diverso. Le destinazioni arrivano dai sistemi degli atenei, che usano
   codici loro; i costi della vita arrivano da Eurostat, che usa i codici
   ISO con due eccezioni sue (Grecia = EL, Regno Unito = UK).

   **Perché questo file esiste invece di una conversione al volo.**
   Nei codici di ULPGC ci sono tre trappole che si prendono senza
   accorgersene:

       ES  = Estonia          (non Spagna)
       LT  = Lettonia         (non Lituania — che lì è LIT)
       CHE = Repubblica Ceca  (non Svizzera — che lì è CH)

   Sono i vecchi codici automobilistici in forma spagnola. Sbagliarne uno
   non fa fallire niente: mette semplicemente una destinazione nel paese
   sbagliato, e mostra allo studente il costo della vita di un altro
   posto. È un errore che nessun collaudo tecnico vede, e che scopre solo
   chi ci va.

   Il codice Erasmus dell'ateneo (`D  AACHEN01`, `I  MACERAT01`) porta a
   sua volta un prefisso di paese, ed è lo stesso schema: dove c'è, si
   usa come controprova.
*/

/* codice usato da ULPGC → { eurostat, iso, it, en } */
export const DA_ULPGC = {
  AL:  { eurostat: 'AL', iso: 'AL', it: 'Albania',            en: 'Albania' },
  D:   { eurostat: 'DE', iso: 'DE', it: 'Germania',           en: 'Germany' },
  RA:  { eurostat: null, iso: 'AR', it: 'Argentina',          en: 'Argentina' },
  A:   { eurostat: 'AT', iso: 'AT', it: 'Austria',            en: 'Austria' },
  B:   { eurostat: 'BE', iso: 'BE', it: 'Belgio',             en: 'Belgium' },
  BR:  { eurostat: null, iso: 'BR', it: 'Brasile',            en: 'Brazil' },
  BG:  { eurostat: 'BG', iso: 'BG', it: 'Bulgaria',           en: 'Bulgaria' },
  RCH: { eurostat: null, iso: 'CL', it: 'Cile',               en: 'Chile' },
  CO:  { eurostat: null, iso: 'CO', it: 'Colombia',           en: 'Colombia' },
  COR: { eurostat: null, iso: 'KR', it: 'Corea del Sud',      en: 'South Korea' },
  CRO: { eurostat: 'HR', iso: 'HR', it: 'Croazia',            en: 'Croatia' },
  DK:  { eurostat: 'DK', iso: 'DK', it: 'Danimarca',          en: 'Denmark' },
  EC:  { eurostat: null, iso: 'EC', it: 'Ecuador',            en: 'Ecuador' },
  USA: { eurostat: 'US', iso: 'US', it: 'Stati Uniti',        en: 'United States' },
  ESQ: { eurostat: 'SK', iso: 'SK', it: 'Slovacchia',         en: 'Slovakia' },
  ESL: { eurostat: 'SI', iso: 'SI', it: 'Slovenia',           en: 'Slovenia' },
  ES:  { eurostat: 'EE', iso: 'EE', it: 'Estonia',            en: 'Estonia' },      // NON Spagna
  SF:  { eurostat: 'FI', iso: 'FI', it: 'Finlandia',          en: 'Finland' },
  F:   { eurostat: 'FR', iso: 'FR', it: 'Francia',            en: 'France' },
  G:   { eurostat: null, iso: 'GE', it: 'Georgia',            en: 'Georgia' },
  GR:  { eurostat: 'EL', iso: 'GR', it: 'Grecia',             en: 'Greece' },       // Eurostat: EL
  NL:  { eurostat: 'NL', iso: 'NL', it: 'Paesi Bassi',        en: 'Netherlands' },
  H:   { eurostat: 'HU', iso: 'HU', it: 'Ungheria',           en: 'Hungary' },
  IND: { eurostat: null, iso: 'IN', it: 'India',              en: 'India' },
  IRL: { eurostat: 'IE', iso: 'IE', it: 'Irlanda',            en: 'Ireland' },
  I:   { eurostat: 'IT', iso: 'IT', it: 'Italia',             en: 'Italy' },
  J:   { eurostat: null, iso: 'JP', it: 'Giappone',           en: 'Japan' },
  KAZ: { eurostat: null, iso: 'KZ', it: 'Kazakistan',         en: 'Kazakhstan' },
  LT:  { eurostat: 'LV', iso: 'LV', it: 'Lettonia',           en: 'Latvia' },       // NON Lituania
  FL:  { eurostat: 'LI', iso: 'LI', it: 'Liechtenstein',      en: 'Liechtenstein' },
  LIT: { eurostat: 'LT', iso: 'LT', it: 'Lituania',           en: 'Lithuania' },
  MEX: { eurostat: null, iso: 'MX', it: 'Messico',            en: 'Mexico' },
  N:   { eurostat: 'NO', iso: 'NO', it: 'Norvegia',           en: 'Norway' },
  NCL: { eurostat: null, iso: 'NC', it: 'Nuova Caledonia',    en: 'New Caledonia' },
  PE:  { eurostat: null, iso: 'PE', it: 'Perù',               en: 'Peru' },
  PL:  { eurostat: 'PL', iso: 'PL', it: 'Polonia',            en: 'Poland' },
  P:   { eurostat: 'PT', iso: 'PT', it: 'Portogallo',         en: 'Portugal' },
  GB:  { eurostat: 'UK', iso: 'GB', it: 'Regno Unito',        en: 'United Kingdom' }, // Eurostat: UK
  CHE: { eurostat: 'CZ', iso: 'CZ', it: 'Repubblica Ceca',    en: 'Czechia' },      // NON Svizzera
  R:   { eurostat: 'RO', iso: 'RO', it: 'Romania',            en: 'Romania' },
  S:   { eurostat: 'SE', iso: 'SE', it: 'Svezia',             en: 'Sweden' },
  CH:  { eurostat: 'CH', iso: 'CH', it: 'Svizzera',           en: 'Switzerland' },
  TR:  { eurostat: 'TR', iso: 'TR', it: 'Turchia',            en: 'Türkiye' },
  U:   { eurostat: null, iso: 'UY', it: 'Uruguay',            en: 'Uruguay' },
};

/* I paesi indicizzati per codice ISO, per le fonti che li scrivono già
   così — l'allegato di UniMC, per esempio.

   Non basta rovesciare la tabella di ULPGC: quella contiene solo i paesi
   con cui ULPGC ha accordi, e per forza di cose **non contiene la
   Spagna**, che è casa loro. Leggendo l'allegato di UniMC, quarantuno
   destinazioni spagnole finivano fra le scartate con un "paese
   sconosciuto: ES" che sembrava un errore dei dati e invece era mio. Da
   qui l'aggiunta esplicita di quello che manca. */
const ALTRI_ISO = {
  ES: { eurostat: 'ES', iso: 'ES', it: 'Spagna',       en: 'Spain' },
  CY: { eurostat: 'CY', iso: 'CY', it: 'Cipro',        en: 'Cyprus' },
  IS: { eurostat: 'IS', iso: 'IS', it: 'Islanda',      en: 'Iceland' },
  MT: { eurostat: 'MT', iso: 'MT', it: 'Malta',        en: 'Malta' },
  LU: { eurostat: 'LU', iso: 'LU', it: 'Lussemburgo',  en: 'Luxembourg' },
  RS: { eurostat: 'RS', iso: 'RS', it: 'Serbia',       en: 'Serbia' },
  MK: { eurostat: 'MK', iso: 'MK', it: 'Macedonia del Nord', en: 'North Macedonia' },
  BA: { eurostat: 'BA', iso: 'BA', it: 'Bosnia ed Erzegovina', en: 'Bosnia and Herzegovina' },
  ME: { eurostat: 'ME', iso: 'ME', it: 'Montenegro',   en: 'Montenegro' },
  UA: { eurostat: 'UA', iso: 'UA', it: 'Ucraina',      en: 'Ukraine' },
  MD: { eurostat: 'MD', iso: 'MD', it: 'Moldova',      en: 'Moldova' },
  AM: { eurostat: null, iso: 'AM', it: 'Armenia',      en: 'Armenia' },
  IL: { eurostat: null, iso: 'IL', it: 'Israele',      en: 'Israel' },
  CA: { eurostat: null, iso: 'CA', it: 'Canada',       en: 'Canada' },
  CN: { eurostat: null, iso: 'CN', it: 'Cina',         en: 'China' },
  AU: { eurostat: null, iso: 'AU', it: 'Australia',    en: 'Australia' },
};

export const PAESI_ISO = {
  ...Object.fromEntries(Object.values(DA_ULPGC).map(p => [p.iso, p])),
  ...ALTRI_ISO,
};

/* Prefisso del codice Erasmus dell'ateneo → paese, in ISO.
   Attenzione: qui la Grecia è GR, perché il confronto si fa con l'ISO.
   La forma EL è una particolarità di Eurostat e sta nell'altra tabella:
   confonderle faceva scartare come sospetti sette atenei greci giusti. */
const DA_ERASMUS = {
  A: 'AT', B: 'BE', BG: 'BG', CH: 'CH', CY: 'CY', CZ: 'CZ', D: 'DE', DK: 'DK',
  E: 'ES', EE: 'EE', F: 'FR', G: 'GR', HR: 'HR', HU: 'HU', I: 'IT', IRL: 'IE',
  IS: 'IS', LT: 'LT', LV: 'LV', LUX: 'LU', MT: 'MT', N: 'NO', NL: 'NL', P: 'PT',
  PL: 'PL', RO: 'RO', S: 'SE', SF: 'FI', SI: 'SI', SK: 'SK', TR: 'TR', UK: 'GB',
};

/* I paesi in cui la convenzione del prefisso vale davvero: sono quelli
   del programma. Fuori da qui un codice che comincia per "A" non
   significa Austria — significa niente. */
export const PAESI_CON_PREFISSO = new Set(Object.values(DA_ERASMUS));

/* Da `D  AACHEN01 - RWTH AACHEN` a { codice, prefisso, paeseIso, ateneo }.

   Le forme sono più varie di quanto sembri, e conviene averle sotto gli
   occhi invece di dedurle da un'espressione:

       D  AACHEN01 - RWTH AACHEN            prefisso di paese europeo
       AL TIRANA UCB - KOLEGJI …            codice con uno spazio dentro
       A FBARCELÓ - FUNDACIÓN BARCELÓ …     lettere accentate nel codice
       ARG_UPC01 - UNIVERSIDAD …            fuori Europa: nessun prefisso
       MENDOZA01 - UNIVERSIDAD DE MENDOZA   nemmeno il codice, solo il nome

   Quindi non si pretende una forma: si taglia al primo " - ", e il
   prefisso di paese si riconosce solo quando c'è davvero. Dove non c'è,
   `paeseIso` resta nullo e la controprova semplicemente non si fa —
   invece di scartare una destinazione buona. */
export function leggiCodiceErasmus(riga) {
  const testo = String(riga).replace(/\s+/g, ' ').trim();
  const taglio = testo.indexOf(' - ');
  if (taglio < 0) return { codice: null, prefisso: null, paeseIso: null, ateneo: testo };

  const codice = testo.slice(0, taglio).trim();
  const ateneo = testo.slice(taglio + 3).trim();

  /* il prefisso c'è solo se il codice ha più di un pezzo e il primo è
     una sigla di paese conosciuta */
  const pezzi = codice.split(' ');
  const prefisso = (pezzi.length > 1 && DA_ERASMUS[pezzi[0]]) ? pezzi[0] : null;

  return {
    codice: codice || null,
    prefisso,
    paeseIso: prefisso ? DA_ERASMUS[prefisso] : null,
    ateneo: ateneo || testo,
  };
}
