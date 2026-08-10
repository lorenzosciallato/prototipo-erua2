/* ERUA connect — robot dei contributi studenteschi
   ==================================================================
       node robot/studenti.js
       node robot/studenti.js --prova

   **Questo robot oggi non produce niente, ed è il suo comportamento
   corretto.** Non esiste ancora nessun contributo studentesco: nessuna
   lezione tenuta da studenti, nessun materiale caricato. Riempire la
   sezione "From Students" con esempi verosimili sarebbe la cosa più
   facile del mondo e la più dannosa: chi guarda il prototipo crederebbe
   che quella parte esista già, e la prima domanda in sede istituzionale
   sarebbe su qualcosa che non c'è.

   Perché allora scriverlo adesso? Perché il contratto valga da subito.
   Il giorno in cui arriverà il primo contributo vero, il posto dove
   metterlo è già deciso, la forma è già dichiarata, la sezione lo legge
   già. Non c'è una riscrittura in mezzo.

   **Cosa manca perché serva a qualcosa**, in ordine:
   1. Un luogo dove i contributi vengono depositati e da cui si possono
      leggere (oggi non esiste: senza base di dati non c'è deposito).
   2. Una decisione su chi modera prima della pubblicazione — §7.5
      chiede una procedura, non una buona intenzione.
   3. Il consenso di chi contribuisce alla pubblicazione del proprio
      nome, che è un dato personale: non prima del momento zero (§7.0).
*/

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'studenti';

/* La forma di un contributo, dichiarata anche se non ce n'è ancora uno.
   È il contratto con la sezione: chi scriverà la raccolta vera sa a che
   cosa deve arrivare.

   {
     id:      identificativo stabile
     tit:     titolo
     autore:  come chi ha contribuito vuole essere nominato
     uni:     sigla dell'ateneo
     materia: una delle materie della vetrina
     yt:      identificativo del video, se ce n'è uno
     d:       durata leggibile ("42 min")
     sub:     { it, en } una riga di presentazione
     origine: { fonte, url, letto, generato }
              `generato` va valorizzato se una macchina ha scritto una
              qualunque di queste righe — obbligo di trasparenza in
              vigore dal 2 agosto 2026 (§6.5)
   }
*/

async function gira({ prova = false } = {}) {
  const contributi = [];   // finché non c'è una fonte, resta vuoto

  console.log('nessuna fonte di contributi studenteschi configurata.');
  console.log('Il robot esiste per tenere il posto e la forma, non per riempirla.');

  if (prova) return { esito: 'saltato', quanti: 0, messaggio: 'prova' };

  /* `forza` perché il rifiuto di scrivere il vuoto qui non si applica:
     il vuoto è il risultato giusto, non il sintomo di una fonte rotta. */
  const esito = scriviDati(
    path.join(RADICE, 'dati', 'studenti.json'),
    contributi,
    { fonte: null,
      note: 'Nessun contributo studentesco esiste ancora. Elenco vuoto per scelta, non per guasto.' },
    { forza: true });

  console.log(`scritto: ${esito.quanti} contributi`);
  return { esito: 'fatto', quanti: 0, messaggio: 'nessuna fonte: elenco vuoto per scelta' };
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
