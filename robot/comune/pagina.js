/* ERUA connect — lettura di una pagina di notizie senza feed
   ==================================================================
   Due atenei su nove non pubblicano un feed. Per loro non resta che
   leggere l'elenco delle notizie dalla pagina.

   È il modo peggiore e va detto: un feed è un impegno della fonte a
   mantenere una forma, una pagina no. Basta un restauro del sito e
   quello che segue smette di funzionare — non con un errore, ma
   restituendo zero notizie. Per questo `scrivi.js` si rifiuta di
   pubblicare il vuoto: quando succederà, e succederà, resteranno le
   notizie di ieri e il registro dirà che qualcosa non va.

   Le regole di lettura non stanno qui: stanno in `configurazione.js`,
   accanto alla fonte. Così quando un sito cambia si aggiusta una riga
   di configurazione, non un programma.

   Cosa si prende, e basta: titolo, data, collegamento. Le immagini no,
   mai — hanno licenza intestata all'ateneo e non estensibile a chi
   ripubblica (riferimento.md §6.2).
*/

import { scioglie, soloTesto } from './feed.js';

/* Estrae il primo gruppo di un'espressione, oppure stringa vuota. */
function primo(testo, espressione) {
  if (!espressione) return '';
  const m = new RegExp(espressione, 'i').exec(testo);
  return m ? scioglie(m[1]) : '';
}

/**
 * @param {string} html      la pagina
 * @param {string} base      il suo indirizzo, per sciogliere i link relativi
 * @param {object} regole    { blocco, titolo, collegamento, data, dataDalCollegamento }
 * @returns voci { titolo, collegamento, data, sommario, id }
 */
export function leggiPagina(html, base, regole) {
  if (!html || !regole || !regole.blocco) return [];

  const blocchi = html.match(new RegExp(regole.blocco, 'gi')) || [];
  const viste = new Set();
  const voci = [];

  for (const b of blocchi) {
    const titolo = soloTesto(primo(b, regole.titolo), 300);
    const grezzo = primo(b, regole.collegamento);
    if (!titolo || !grezzo) continue;

    let collegamento;
    try { collegamento = new URL(grezzo, base).href; } catch (err) { continue; }
    if (viste.has(collegamento)) continue;     // la stessa notizia compare più volte
    viste.add(collegamento);

    /* La data: se sta nell'indirizzo la prendo da lì, perché è la stessa
       in tutte le lingue e non dipende da come il sito la scrive. */
    let data = '';
    if (regole.dataDalCollegamento) {
      const m = new RegExp(regole.dataDalCollegamento).exec(collegamento);
      if (m) data = `${m[1]}-${m[2]}-${m[3]}`;
    }
    if (!data && regole.data) {
      const g = primo(b, regole.data);
      if (/^\d{4}-\d{2}-\d{2}/.test(g)) data = g.slice(0, 10);
      else if (g) {
        const d = new Date(g);
        if (!Number.isNaN(d.getTime())) data = d.toISOString().slice(0, 10);
      }
    }

    voci.push({
      titolo,
      collegamento,
      data,
      sommario: soloTesto(primo(b, regole.sommario), 200),
      id: collegamento,
    });
  }

  return voci;
}
