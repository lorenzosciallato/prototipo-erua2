/* ERUA connect — lettura dei feed (RSS e Atom)
   ==================================================================
   Scritto in casa, senza librerie. Non è purismo: ogni dipendenza è una
   superficie d'attacco, una licenza da verificare e un pezzo che si può
   rompere da solo (§2.3), e §6.7 impone licenze permissive con verifica.
   Per leggere RSS e Atom — due formati fermi da vent'anni — non vale la
   pena portarsi in casa un albero di pacchetti.

   Cosa NON fa, dichiarato apertamente: non è un lettore XML completo.
   Non gestisce spazi dei nomi arbitrari né entità esotiche. Legge i due
   formati che le fonti dell'alleanza pubblicano davvero. Se una fonte
   passasse a qualcosa di diverso, questo lettore restituirebbe zero
   elementi — e a quel punto `scrivi.js` si rifiuta di pubblicare il
   vuoto e resta l'aggiornamento precedente. Il guasto è previsto, non
   temuto.
*/

/* Le entità che compaiono davvero nei titoli delle notizie. */
const ENTITA = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
  '&#8211;': '–', '&#8212;': '—', '&#8216;': '‘', '&#8217;': '’',
  '&#8220;': '“', '&#8221;': '”', '&#8230;': '…', '&nbsp;': ' ',
};

export function scioglie(t) {
  if (!t) return '';
  return String(t)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, e => (e in ENTITA ? ENTITA[e] : e))
    .trim();
}

/* Toglie i tag e riduce a testo semplice. Le fonti mettono HTML dentro
   le descrizioni; a noi serve una frase, non un documento. */
export function soloTesto(html, quanti = 220) {
  const piatto = scioglie(String(html || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  if (piatto.length <= quanti) return piatto;
  /* taglio all'ultima parola intera, non a metà sillaba */
  const tagliato = piatto.slice(0, quanti);
  const spazio = tagliato.lastIndexOf(' ');
  return (spazio > quanti * 0.6 ? tagliato.slice(0, spazio) : tagliato).replace(/[,;:]$/, '') + '…';
}

function primoValore(pezzo, ...tag) {
  for (const t of tag) {
    const m = new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, 'i').exec(pezzo);
    if (m) return scioglie(m[1]);
  }
  return '';
}

function attributo(pezzo, tag, attr) {
  const m = new RegExp(`<${tag}\\s[^>]*${attr}=["']([^"']+)["']`, 'i').exec(pezzo);
  return m ? scioglie(m[1]) : '';
}

/**
 * Legge RSS o Atom e restituisce voci normalizzate:
 *   { titolo, collegamento, data, sommario, id }
 * `data` è in forma ISO breve (AAAA-MM-GG) o vuota.
 */
export function leggiFeed(xml) {
  if (!xml || typeof xml !== 'string') return [];

  const atom = /<feed[\s>]/i.test(xml);
  const pezzi = xml.match(atom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi) || [];

  return pezzi.map(p => {
    const titolo = primoValore(p, 'title');

    let collegamento = '';
    if (atom) {
      collegamento = attributo(p, 'link', 'href');
    } else {
      collegamento = primoValore(p, 'link') || attributo(p, 'link', 'href');
    }

    const grezza = primoValore(p, 'published', 'pubDate', 'updated', 'dc:date');
    let data = '';
    if (grezza) {
      const d = new Date(grezza);
      if (!Number.isNaN(d.getTime())) data = d.toISOString().slice(0, 10);
    }

    const sommario = soloTesto(
      primoValore(p, 'media:description', 'description', 'summary', 'content'));

    const id = primoValore(p, 'yt:videoId', 'guid', 'id') || collegamento;

    return { titolo, collegamento, data, sommario, id };
  }).filter(v => v.titolo && v.collegamento);
}
