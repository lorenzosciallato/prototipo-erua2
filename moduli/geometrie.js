/* ERUA connect — copertine geometriche generate
   ==================================================================
   Composizioni astratte disegnate dal codice, da usare come copertina
   dove una fotografia non c'è.

   **Perché geometriche, e perché queste.** Il bando si chiama New
   European Bauhaus. Il vocabolario del Bauhaus è esattamente questo:
   cerchi, semicerchi, quarti d'arco, triangoli, griglie, bande
   diagonali, colori piatti e pochi. Quindi non è un ripiego travestito
   da scelta — è il linguaggio giusto per questa sezione, e lo si
   riconosce anche senza saperne il nome.

   **Sempre uguale per la stessa cosa.** La composizione nasce dal nome
   del progetto: lo stesso nome dà sempre lo stesso disegno, nomi diversi
   danno disegni diversi. Serve a farne un segno riconoscibile, non una
   decorazione che cambia a ogni ricarica.

   **Niente file, niente licenze, niente peso.** È testo: nasce nel
   browser, non si scarica, non ha diritti d'autore di nessuno.
*/

/* Un generatore di numeri prevedibile: dallo stesso seme esce sempre la
   stessa sequenza. È quello che rende il disegno stabile. */
function dado(seme) {
  let h = 2166136261;
  for (const c of String(seme)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h |= 0;
    return ((h >>> 0) % 100000) / 100000;
  };
}

/* Le tavolozze: le tinte del sito, in accostamenti che reggono. Ogni
   tavolozza ha un fondo e tre colori che ci stanno sopra. */
const TAVOLOZZE = [
  { fondo: '#1E7A54', sopra: ['#A8E6C9', '#FFE1A8', '#FFFDFA'] },   // verde
  { fondo: '#5B45B8', sopra: ['#CFC4F7', '#FFC9A8', '#A9D3FF'] },   // viola
  { fondo: '#A85A26', sopra: ['#FFC9A8', '#FFE1A8', '#A8E6C9'] },   // ambra
  { fondo: '#255E9E', sopra: ['#A9D3FF', '#A8E6C9', '#FFFDFA'] },   // blu
  { fondo: '#A33A55', sopra: ['#FFC0CE', '#FFE1A8', '#CFC4F7'] },   // rosso
  { fondo: '#20201D', sopra: ['#A8E6C9', '#CFC4F7', '#FFC9A8'] },   // inchiostro
];

/* Le forme del repertorio. Ognuna riceve la sua cella e un colore, e
   restituisce un pezzo di disegno. Sono poche di proposito: un
   vocabolario ristretto tiene insieme composizioni diverse. */
const FORME = [
  /* cerchio pieno */
  (x, y, l, c) => `<circle cx="${x + l / 2}" cy="${y + l / 2}" r="${l / 2}" fill="${c}"/>`,
  /* semicerchio, in una delle quattro direzioni */
  (x, y, l, c, r) => {
    const g = Math.floor(r() * 4) * 90;
    return `<path d="M${x} ${y + l / 2}a${l / 2} ${l / 2} 0 0 1 ${l} 0z" fill="${c}"
      transform="rotate(${g} ${x + l / 2} ${y + l / 2})"/>`;
  },
  /* quarto di cerchio */
  (x, y, l, c, r) => {
    const g = Math.floor(r() * 4) * 90;
    return `<path d="M${x} ${y + l}V${y}h${l}a${l} ${l} 0 0 1 ${-l} ${l}z" fill="${c}"
      transform="rotate(${g} ${x + l / 2} ${y + l / 2})"/>`;
  },
  /* triangolo */
  (x, y, l, c, r) => {
    const g = Math.floor(r() * 4) * 90;
    return `<path d="M${x} ${y + l}L${x + l / 2} ${y}L${x + l} ${y + l}z" fill="${c}"
      transform="rotate(${g} ${x + l / 2} ${y + l / 2})"/>`;
  },
  /* anello */
  (x, y, l, c) => `<circle cx="${x + l / 2}" cy="${y + l / 2}" r="${l / 2 - l * 0.14}"
      fill="none" stroke="${c}" stroke-width="${l * 0.16}"/>`,
  /* barre parallele */
  (x, y, l, c, r) => {
    const n = 3 + Math.floor(r() * 2);
    const passo = l / (n * 2 - 1);
    let d = '';
    for (let i = 0; i < n; i++) d += `<rect x="${x + i * passo * 2}" y="${y}" width="${passo}" height="${l}" fill="${c}"/>`;
    return r() > 0.5 ? `<g transform="rotate(90 ${x + l / 2} ${y + l / 2})">${d}</g>` : d;
  },
  /* quadrato, a volte ruotato di quarantacinque gradi */
  (x, y, l, c, r) => {
    const p = l * 0.14;
    const g = r() > 0.65 ? 45 : 0;
    const s = g ? 0.72 : 1;
    return `<rect x="${x + p}" y="${y + p}" width="${(l - p * 2) * s}" height="${(l - p * 2) * s}"
      fill="${c}" transform="rotate(${g} ${x + l / 2} ${y + l / 2})"/>`;
  },
];

/**
 * Una copertina geometrica.
 * @param {string} seme     il nome del progetto: lo stesso nome, lo stesso disegno
 * @param {object} opzioni  { larghezza, altezza, tavolozza }
 * @returns una stringa SVG da mettere dentro l'HTML
 */
export function copertina(seme, opzioni = {}) {
  const l = opzioni.larghezza || 600;
  const h = opzioni.altezza || 400;
  const r = dado(seme);

  const tav = opzioni.tavolozza != null
    ? TAVOLOZZE[opzioni.tavolozza % TAVOLOZZE.length]
    : TAVOLOZZE[Math.floor(r() * TAVOLOZZE.length)];

  /* Una griglia irregolare: colonne di larghezza diversa danno un ritmo
     che una griglia regolare non dà. Poche celle e grandi — tante celle
     piccole diventano un tappeto, e un tappeto non è una copertina. */
  const colonne = 3 + Math.floor(r() * 2);
  const righe = Math.max(2, Math.round(colonne * h / l));
  const cw = l / colonne, ch = h / righe;
  const cella = Math.min(cw, ch);

  let dentro = '';
  for (let y = 0; y < righe; y++) {
    for (let x = 0; x < colonne; x++) {
      /* non tutte le celle sono piene: il vuoto fa respirare */
      if (r() < 0.26) continue;
      const forma = FORME[Math.floor(r() * FORME.length)];
      const colore = tav.sopra[Math.floor(r() * tav.sopra.length)];
      const dx = x * cw + (cw - cella) / 2;
      const dy = y * ch + (ch - cella) / 2;
      dentro += forma(dx, dy, cella, colore, r);
    }
  }

  /* Un segno grande che attraversa tutto: tiene insieme la composizione
     e le dà un centro. Senza, restano forme sparse. */
  const grande = r();
  if (grande < 0.34) {
    dentro += `<circle cx="${l * (0.2 + r() * 0.6)}" cy="${h * (0.2 + r() * 0.6)}"
      r="${Math.min(l, h) * 0.42}" fill="none" stroke="${tav.sopra[0]}"
      stroke-width="${Math.min(l, h) * 0.035}" opacity=".5"/>`;
  } else if (grande < 0.62) {
    const y0 = h * (0.15 + r() * 0.5);
    dentro += `<path d="M0 ${y0}L${l} ${y0 - h * 0.3}" stroke="${tav.sopra[1]}"
      stroke-width="${Math.min(l, h) * 0.045}" opacity=".45"/>`;
  }

  return `<svg viewBox="0 0 ${l} ${h}" preserveAspectRatio="xMidYMid slice"
    role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <rect width="${l}" height="${h}" fill="${tav.fondo}"/>
    ${dentro}
  </svg>`;
}

/** Il fondo della tavolozza scelta per un seme: serve a intonare la
 *  scheda intorno alla copertina. */
export function tintaDi(seme, indice = null) {
  const r = dado(seme);
  const t = indice != null
    ? TAVOLOZZE[indice % TAVOLOZZE.length]
    : TAVOLOZZE[Math.floor(r() * TAVOLOZZE.length)];
  return t.fondo;
}

export const QUANTE_TAVOLOZZE = TAVOLOZZE.length;
