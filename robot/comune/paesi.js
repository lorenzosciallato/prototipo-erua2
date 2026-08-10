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

/* Prefisso del codice Erasmus dell'ateneo → paese ISO. Usato come
   controprova: se il codice dice Germania e la tabella dice Austria,
   qualcosa non torna e la destinazione va guardata. */
const DA_ERASMUS = {
  A: 'AT', B: 'BE', BG: 'BG', CH: 'CH', CY: 'CY', CZ: 'CZ', D: 'DE', DK: 'DK',
  E: 'ES', EE: 'EE', F: 'FR', G: 'EL', HR: 'HR', HU: 'HU', I: 'IT', IRL: 'IE',
  IS: 'IS', LT: 'LT', LV: 'LV', LUX: 'LU', MT: 'MT', N: 'NO', NL: 'NL', P: 'PT',
  PL: 'PL', RO: 'RO', S: 'SE', SF: 'FI', SI: 'SI', SK: 'SK', TR: 'TR', UK: 'GB',
};

/* `D  AACHEN01 - RWTH AACHEN` → { codice, prefisso, paeseIso, ateneo } */
export function leggiCodiceErasmus(riga) {
  const m = /^\s*([A-Z]{1,3})\s+([A-Z0-9\-]+)\s*-\s*(.+)$/.exec(String(riga).trim());
  if (!m) return { codice: null, prefisso: null, paeseIso: null, ateneo: String(riga).trim() };
  return {
    codice: `${m[1]} ${m[2]}`,
    prefisso: m[1],
    paeseIso: DA_ERASMUS[m[1]] || null,
    ateneo: m[3].trim(),
  };
}
