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
import { mostraTab, TABS, scaldaLeAltre } from './moduli/navigazione.js';

/* I testi scritti direttamente nel markup portano la traduzione in due
   lingue negli attributi `data-it` e `data-en`: la pagina parte in
   quella originale. */
document.querySelectorAll('[data-it]').forEach(el => {
  el.textContent = CONFIG.lingue.originale === 'it' ? el.dataset.it : el.dataset.en;
});

/* Le stringhe dell'interfaccia si chiedono, ma non si aspettano.
   Prima qui c'era `await`, e la prima sezione non compariva finché
   `testi/en.json` non era arrivato: un giro in rete davanti a tutto il
   resto. Per un file che, all'avvio, non cambia niente di visibile —
   `originale` è `en`, e in `testi/en.json` ogni chiave vale sé stessa,
   cioè esattamente il testo già scritto nel markup.

   Vale finché la lingua originale è quella del markup. Se un giorno
   `CONFIG.lingue.originale` diventasse un'altra, qui si vedrebbe un
   istante di inglese prima del cambio: allora l'attesa andrebbe rimessa,
   oppure il markup riscritto nella nuova lingua originale.

   Le sezioni non ne dipendono: `T()` sceglie fra due stringhe scritte
   nel codice, non legge `testi/`. */
const testiPronti = lingua.avvia();

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

/* Adesso sì: la sezione è in scena, e questo non fa più aspettare
   nessuno. Si aspetta comunque, invece di lasciare la promessa per
   aria, perché un guasto qui deve comparire nella console e non
   sparire in silenzio. */
await testiPronti;
