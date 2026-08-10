/* ERUA connect — avvio
   ==================================================================
   L'unico file che index.html carica. Mette in piedi le cose che
   servono sempre — lingua, tema, navigazione — e poi lascia che sia la
   sezione in cui si entra a tirarsi dietro il proprio modulo e i propri
   dati.

   Prima, aprire la pagina voleva dire scaricare tutto: rivista,
   notizie, piazza, didattica e le trascrizioni delle lezioni, in un
   file solo da 813 KB. Adesso si scarica quello che si guarda.
*/

import { CONFIG } from './configurazione.js';
import * as lingua from './moduli/lingua.js';
import { mostraTab, TABS } from './moduli/navigazione.js';

/* I testi scritti direttamente nel markup portano la traduzione in due
   lingue negli attributi `data-it` e `data-en`: la pagina parte in
   quella originale. */
document.querySelectorAll('[data-it]').forEach(el => {
  el.textContent = CONFIG.lingue.originale === 'it' ? el.dataset.it : el.dataset.en;
});

await lingua.avvia();

/* Dove eravamo rimasti: l'indirizzo dice sia la sezione sia, se il caso,
   l'articolo aperto. Serve perché un collegamento a un pezzo preciso
   debba poter essere mandato a qualcuno. */
let iniziale = 'social';
try { if (location.hash) iniziale = decodeURIComponent(location.hash.slice(1)); } catch (err) { /* indirizzo illeggibile */ }

if (iniziale.startsWith('leggi/')) {
  mostraTab('magazine', false);
  const modulo = await import('./moduli/articolo.js');
  modulo.apri(iniziale.slice(6));
} else {
  mostraTab(TABS.includes(iniziale) ? iniziale : 'social', false);
}
