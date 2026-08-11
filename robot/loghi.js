/* ERUA connect — robot dei loghi degli atenei di destinazione
   ==================================================================
       node robot/loghi.js            cerca i loghi mancanti
       node robot/loghi.js --prova    cerca ma non scarica niente
       node robot/loghi.js --tutti    ricontrolla anche quelli già trovati

   **Da dove vengono, e perché non dai siti degli atenei.**
   Un logo preso dal sito di un'università è un file con licenza sua, che
   non si estende a chi lo ripubblica (riferimento.md §6.2). Qui invece si
   passa da Wikidata e Wikimedia Commons, dove ogni immagine porta scritta
   la licenza e l'autore in forma leggibile dalla macchina. Così si può
   fare la cosa giusta in modo verificabile: **si tiene solo ciò che ha
   una licenza libera, e si scrive sempre chi l'ha fatto.** Quello che non
   ce l'ha non si scarica — e al suo posto resta il segno pastello che il
   sito genera da sé.

   **Il marchio resta comunque loro.** Una licenza sul file è una cosa, il
   marchio un'altra (§6.4). Usare il logo di un ateneo per dire «questo
   ateneo» dentro un elenco di destinazioni è uso descrittivo, ed è quello
   che fa qualunque servizio che elenca istituzioni. Il rischio vero è
   lasciar credere che ci sia un rapporto ufficiale: per questo il piè di
   pagina dichiara che il prototipo non è un servizio di ERUA né degli
   atenei, e che i marchi appartengono ai rispettivi titolari.

   **Come si evita di prendere il logo sbagliato.** Cercare un nome su
   Wikidata restituisce anche facoltà, ospedali universitari, omonimi. Un
   logo sbagliato accanto a una destinazione è peggio di nessun logo:
   sembra un errore di chi legge, non nostro. Quindi si accetta un
   risultato solo se **è un ente di istruzione superiore** e **sta nel
   paese giusto** — il paese lo sappiamo già dalla destinazione. Se una
   delle due cose non torna, si passa oltre e lo si conta.
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { scriviDati, RifiutoDiScrivere } from './comune/scrivi.js';
import { segnala } from './comune/registro.js';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'loghi';
const CARTELLA = path.join(RADICE, 'immagini', 'atenei');
/* Memoria delle ricerche gia' fatte. Cercare 455 atenei su Wikidata
   costa sei minuti: senza questa, ogni ritentativo dopo un intoppo li
   rifarebbe tutti. Non e' un file di dati, e' un appunto di lavoro. */
const MEMORIA = path.join(RADICE, 'robot', '.ricerche-loghi.json');

/* Wikimedia chiede di presentarsi con un nome e un recapito: è nelle
   loro condizioni d'uso, e le richieste anonime vengono limitate. */
const UA = 'ERUA-connect/1.0 (prototipo universitario; https://github.com/lorenzosciallato/prototipo-erua2)';
const PAUSA = 220;      // millisecondi fra una richiesta e l'altra
const attendi = ms => new Promise(r => setTimeout(r, ms));

/* Che cosa conta come ente di istruzione superiore su Wikidata. */
const ENTI = new Set([
  'Q3918',      // università
  'Q875538',    // università pubblica
  'Q902104',    // università privata
  'Q38723',     // ente di istruzione superiore
  'Q189004',    // college
  'Q2385804',   // istituzione educativa
  'Q4671277',   // istituzione accademica
  'Q23002054',  // ente di istruzione superiore privato senza scopo di lucro
  'Q1371037',   // istituto tecnico
  'Q62078547',  // scuola di istruzione superiore
  'Q15936437',  // istituto di ricerca universitario
  'Q3354859',   // scuola politecnica
  'Q1244442',   // scuola d'arte
  'Q184644',    // conservatorio
]);

/* Le licenze che permettono di ripubblicare. Tutto il resto si scarta:
   niente "uso corretto", niente "solo per scopi educativi". */
const LIBERE = [/^pd/i, /^cc0/i, /^cc-zero/i, /^cc-by(-sa)?(-\d)?/i, /^attribution/i];
const eLibera = codice => !!codice && LIBERE.some(r => r.test(String(codice)));

async function api(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} su ${url.slice(0, 80)}`);
  return r.json();
}

const WD = 'https://www.wikidata.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';

/* ── paese: dal codice Wikidata a quello ISO, una volta sola ───────── */
const isoDiPaese = new Map();
async function caricaPaesi(qid) {
  if (isoDiPaese.has(qid)) return isoDiPaese.get(qid);
  const j = await api(`${WD}?action=wbgetentities&format=json&props=claims&ids=${qid}`);
  const c = ((j.entities[qid] || {}).claims || {}).P297 || [];
  const iso = c.length && c[0].mainsnak.datavalue ? String(c[0].mainsnak.datavalue.value).toUpperCase() : null;
  isoDiPaese.set(qid, iso);
  return iso;
}

/* I nomi arrivano dai sistemi degli atenei tutti in maiuscolo, spesso con
   una sigla fra parentesi in coda. La ricerca di Wikidata se la cava
   meglio con la forma normale, quindi si prova prima com'è e poi
   ripulita: due tentativi valgono una manciata di riscontri in più. */
function formeDelNome(nome) {
  const forme = [nome];
  const senzaSigla = nome.replace(/\s*\([^)]{2,10}\)\s*$/, '').trim();
  const normale = senzaSigla.toLowerCase()
    .replace(/\b\p{L}/gu, c => c.toUpperCase());
  if (normale && normale !== nome) forme.push(normale);
  return forme;
}

/* ── cerca l'ateneo e verifica che sia quello giusto ───────────────── */
async function trovaAteneo(nome, isoAtteso) {
  const candidati = [];
  for (const forma of formeDelNome(nome)) {
    const j = await api(`${WD}?action=wbsearchentities&format=json&language=en&uselang=en&type=item&limit=5&search=${encodeURIComponent(forma)}`);
    for (const x of (j.search || [])) if (!candidati.includes(x.id)) candidati.push(x.id);
    if (candidati.length) break;          // la prima forma che dà qualcosa basta
    await attendi(PAUSA);
  }
  if (!candidati.length) return { esito: 'non trovato' };

  const e = await api(`${WD}?action=wbgetentities&format=json&props=claims|labels&languages=en&ids=${candidati.slice(0, 8).join('|')}`);

  for (const qid of candidati.slice(0, 8)) {
    const ent = e.entities[qid];
    if (!ent || !ent.claims) continue;
    const valori = (p, f = x => x) => (ent.claims[p] || [])
      .map(x => x.mainsnak.datavalue && f(x.mainsnak.datavalue.value)).filter(Boolean);

    const tipi = valori('P31', v => v.id);
    if (!tipi.some(t => ENTI.has(t))) continue;              // non è un ateneo

    const paesi = valori('P17', v => v.id);
    if (isoAtteso && paesi.length) {
      const iso = await caricaPaesi(paesi[0]);
      await attendi(PAUSA);
      if (iso && iso !== isoAtteso) continue;                // paese sbagliato
    }

    const loghi = valori('P154');
    if (!loghi.length) return { esito: 'senza logo', qid };
    return {
      esito: 'ok', qid, file: loghi[0],
      etichetta: (ent.labels && ent.labels.en && ent.labels.en.value) || null,
    };
  }
  return { esito: 'nessun riscontro sicuro' };
}

/* ── licenza e miniatura da Commons, a gruppi ──────────────────────── */
async function informazioni(files) {
  const fuori = new Map();
  for (let i = 0; i < files.length; i += 40) {
    const gruppo = files.slice(i, i + 40);
    const j = await api(`${COMMONS}?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=240&titles=` +
      gruppo.map(f => encodeURIComponent('File:' + f)).join('|'));
    for (const p of Object.values((j.query || {}).pages || {})) {
      const info = (p.imageinfo || [])[0];
      if (!info) continue;
      const m = info.extmetadata || {};
      const pulisci = k => (m[k] ? String(m[k].value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null);
      fuori.set(String(p.title).replace(/^File:/, ''), {
        licenza: pulisci('LicenseShortName'),
        codiceLicenza: m.License ? m.License.value : null,
        autore: pulisci('Artist'),
        miniatura: info.thumburl || info.url,
        pagina: info.descriptionurl,
      });
    }
    await attendi(PAUSA);
  }
  return fuori;
}

/* ── scarica la miniatura ──────────────────────────────────────────── */
const nomeFile = chiave => chiave.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/* Wikimedia limita chi scarica in fretta, e risponde 429. Non e' un
   guasto: e' un cartello che dice "rallenta". Quindi si rallenta e si
   riprova, aspettando ogni volta di piu'. Insistere alla stessa velocita'
   e' il modo di farsi bloccare davvero. */
async function scaricaLogo(url, base) {
  let r;
  for (let tentativo = 1; tentativo <= 4; tentativo++) {
    r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status !== 429) break;
    await attendi(1500 * tentativo);
  }
  if (!r.ok) throw new Error(`miniatura ${r.status}`);
  const tipo = (r.headers.get('content-type') || '').split(';')[0];
  const est = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp', 'image/gif': 'gif' }[tipo];
  if (!est) throw new Error(`tipo non previsto: ${tipo}`);
  const dati = Buffer.from(await r.arrayBuffer());
  /* Commons non genera sempre la miniatura: quando non ce la fa
     restituisce l'originale, che può pesare due megabyte. Un logo da
     due megabyte in un elenco di settecento schede non si scarica: si
     scarta, e resta la sigla. */
  if (dati.length > 250 * 1024) throw new Error(`troppo pesante: ${Math.round(dati.length / 1024)} KB`);
  fs.mkdirSync(CARTELLA, { recursive: true });
  const rel = `immagini/atenei/${base}.${est}`;
  fs.writeFileSync(path.join(RADICE, rel), dati);
  return { rel, byte: dati.length };
}

/* ── il giro ───────────────────────────────────────────────────────── */
function destinazioni() {
  const j = JSON.parse(fs.readFileSync(path.join(RADICE, 'dati', 'destinazioni.json'), 'utf8'));
  return Array.isArray(j) ? j : (j.elementi || []);
}

function giaTrovati() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(RADICE, 'dati', 'loghi.json'), 'utf8'));
    const e = Array.isArray(j) ? j : (j.elementi || []);
    return new Map(e.map(x => [x.chiave, x]));
  } catch (err) { return new Map(); }
}

async function gira({ prova = false, tutti = false } = {}) {
  const avvio = Date.now();

  /* un ateneo per codice Erasmus, o per nome+paese dove il codice manca */
  const atenei = new Map();
  for (const d of destinazioni()) {
    const chiave = d.codice || `${d.ateneo}|${d.paese}`;
    if (!atenei.has(chiave)) atenei.set(chiave, { chiave, nome: d.ateneo, paese: d.paese });
  }
  console.log(`atenei distinti fra le destinazioni: ${atenei.size}`);

  let memoria = {};
  if (!tutti) { try { memoria = JSON.parse(fs.readFileSync(MEMORIA, 'utf8')); } catch (err) { memoria = {}; } }

  const noti = tutti ? new Map() : giaTrovati();
  const daFare = [...atenei.values()].filter(a => !noti.has(a.chiave));
  console.log(`già noti: ${noti.size} · da cercare adesso: ${daFare.length}`);

  const trovati = [];
  const errori = [];
  const conta = { ok: 0, 'senza logo': 0, 'non trovato': 0, 'nessun riscontro sicuro': 0, 'licenza non libera': 0, errore: 0 };

  for (const [i, a] of daFare.entries()) {
    if (i && i % 25 === 0) console.log(`  … ${i}/${daFare.length}`);
    try {
      const r = memoria[a.chiave] || await trovaAteneo(a.nome, a.paese);
      if (!memoria[a.chiave]) { memoria[a.chiave] = r; await attendi(PAUSA); }
      if (r.esito !== 'ok') { conta[r.esito] = (conta[r.esito] || 0) + 1; continue; }
      trovati.push({ ...a, qid: r.qid, fileCommons: r.file, etichetta: r.etichetta });
    } catch (err) {
      conta.errore++;
      if (errori.length < 6) errori.push(`ricerca ${a.nome}: ${err.message}`);
    }
  }

  try { fs.writeFileSync(MEMORIA, JSON.stringify(memoria)); } catch (err) { /* appunto non salvato: pazienza */ }
  console.log(`\ncon un logo su Wikidata: ${trovati.length}`);
  if (!trovati.length) {
    for (const [k, v] of Object.entries(conta)) if (v) console.log(`  ${k}: ${v}`);
    return { esito: 'fatto', quanti: noti.size, messaggio: 'nessun logo nuovo' };
  }

  const info = await informazioni(trovati.map(t => t.fileCommons));

  const buoni = [];
  for (const t of trovati) {
    const m = info.get(t.fileCommons);
    if (!m) { conta.errore++; continue; }
    if (!eLibera(m.codiceLicenza)) {
      conta['licenza non libera']++;
      continue;
    }
    buoni.push({ ...t, ...m });
  }
  console.log(`con licenza libera: ${buoni.length} su ${trovati.length}`);

  if (prova) {
    console.log('\n--prova: non scarico niente. Primi cinque:');
    for (const b of buoni.slice(0, 5))
      console.log(`  ${b.nome.slice(0, 40).padEnd(42)} ${String(b.licenza).slice(0, 16).padEnd(18)} ${b.fileCommons.slice(0, 34)}`);
    for (const [k, v] of Object.entries(conta)) if (v) console.log(`  ${k}: ${v}`);
    return { esito: 'saltato', quanti: buoni.length, messaggio: 'prova' };
  }

  const elementi = [...noti.values()];
  let scaricati = 0, byteTotali = 0;
  for (const b of buoni) {
    try {
      const { rel, byte } = await scaricaLogo(b.miniatura, nomeFile(b.chiave));
      elementi.push({
        chiave: b.chiave,
        nome: b.nome,
        paese: b.paese,
        file: rel,
        /* L'attribuzione non è un di più: per quasi tutte queste licenze
           è la condizione che le rende utilizzabili. Va mostrata. */
        licenza: b.licenza,
        autore: b.autore,
        fonte: b.pagina,
        wikidata: `https://www.wikidata.org/wiki/${b.qid}`,
        letto: new Date().toISOString().slice(0, 10),
      });
      scaricati++; byteTotali += byte;
      conta.ok++;
      await attendi(700);
    } catch (err) {
      conta.errore++;
      if (errori.length < 6) errori.push(`${b.nome}: ${err.message}`);
    }
  }

  const esito = scriviDati(
    path.join(RADICE, 'dati', 'loghi.json'),
    elementi,
    { fonte: 'Wikidata e Wikimedia Commons',
      note: 'Solo immagini con licenza libera, con autore e licenza accanto. ' +
            'I marchi restano dei rispettivi titolari: uso descrittivo, nessun rapporto ufficiale (§6.4).' },
    { forza: true });

  console.log(`\nscaricati ${scaricati} loghi, ${Math.round(byteTotali / 1024)} KB in tutto`);
  console.log(`schedario: ${esito.quanti} atenei con logo`);
  for (const [k, v] of Object.entries(conta)) if (v) console.log(`  ${k}: ${v}`);
  if (errori.length) { console.log('\nprimi errori:'); for (const e of errori) console.log(`  ${e}`); }

  return {
    esito: 'fatto',
    quanti: esito.quanti,
    messaggio: `nuovi ${scaricati}; senza logo ${conta['senza logo']}; non identificati ${conta['non trovato'] + conta['nessun riscontro sicuro']}; licenza non libera ${conta['licenza non libera']}`,
    durataSecondi: Math.round((Date.now() - avvio) / 1000),
  };
}

const prova = process.argv.includes('--prova');
const tutti = process.argv.includes('--tutti');
try {
  const r = await gira({ prova, tutti });
  if (!prova) segnala(NOME, r);
} catch (err) {
  const grave = !(err instanceof RifiutoDiScrivere);
  console.error(`${NOME}: ${err.message}`);
  if (!prova) segnala(NOME, { esito: grave ? 'errore' : 'saltato', messaggio: err.message });
  process.exit(grave ? 1 : 0);
}
