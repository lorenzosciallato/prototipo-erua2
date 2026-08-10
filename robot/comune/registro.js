/* ERUA connect — registro dei processi automatici
   ==================================================================
   §2.8 dice una cosa precisa: «il malfunzionamento si rileva
   dall'assenza della segnalazione, non dalle lamentele degli utenti».

   Un robot che va in errore lo si scopre subito. Un robot che smette di
   partire — cron disattivato, macchina riavviata, disco pieno — non
   produce nessun errore: produce silenzio. E il silenzio non arriva a
   nessuno finché qualcuno non nota che le notizie sono ferme da tre
   settimane.

   Per questo ogni robot scrive qui dentro, a ogni giro, com'è andata.
   `robot/stato.json` è un file solo, piccolo, leggibile a colpo
   d'occhio, che risponde a: quando ha girato ciascuno, con che esito,
   quanto ha prodotto. Se la data è vecchia, il robot è morto in
   silenzio.
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILE = path.join(RADICE, 'robot', 'stato.json');

function leggi() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch (err) { return { robot: {} }; }
}

export function segnala(nome, esito) {
  const stato = leggi();
  stato.robot[nome] = {
    quando: new Date().toISOString(),
    esito: esito.esito,                 // 'fatto' | 'saltato' | 'errore'
    quanti: esito.quanti ?? null,
    messaggio: esito.messaggio || null,
    durataSecondi: esito.durataSecondi ?? null,
  };
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(stato, null, 1) + '\n');
}

/* Da lanciare dal cron, dopo i robot: dice quali non danno più segno di
   vita. Esce con codice 1 se qualcuno tace da troppo, così il cron può
   mandare una mail senza che serva un sistema di sorveglianza.

       node robot/comune/registro.js 36     (ore di silenzio tollerate)
*/
export function silenziosi(oreTollerate = 36) {
  const stato = leggi();
  const limite = Date.now() - oreTollerate * 3600 * 1000;
  return Object.entries(stato.robot)
    .filter(([, r]) => new Date(r.quando).getTime() < limite || r.esito === 'errore')
    .map(([nome, r]) => ({ nome, ...r }));
}

/* eseguito direttamente da riga di comando */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ore = Number(process.argv[2]) || 36;
  const muti = silenziosi(ore);
  const stato = leggi();
  const quanti = Object.keys(stato.robot).length;
  if (!quanti) {
    console.log('nessun robot ha mai girato');
    process.exit(1);
  }
  for (const [nome, r] of Object.entries(stato.robot)) {
    console.log(`  ${nome.padEnd(12)} ${r.esito.padEnd(8)} ${r.quando}  ${r.quanti ?? '—'} elementi`);
  }
  if (muti.length) {
    console.log(`\nda guardare (silenzio da oltre ${ore} h, oppure in errore):`);
    for (const m of muti) console.log(`  ${m.nome}: ${m.esito} — ${m.messaggio || 'nessun messaggio'}`);
    process.exit(1);
  }
  console.log('\ntutti i robot hanno dato segno di vita');
}
