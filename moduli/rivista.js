/* ERUA connect — la rivista
   ==================================================================
   Il feed: schede di cinque taglie diverse che si incastrano nelle
   colonne, i cerchi degli atenei in cima, il selettore dei numeri e le
   schede-citazione che ogni cinque articoli fermano la lettura.

   I dati arrivano da `dati/rivista-NN.json`, prodotto dal PDF della
   rivista. Le fotografie sono file veri in `immagini/rivista/`.
*/

import { CITTA, TINTE } from '../configurazione.js';
import {
  LANG, T, esc, dati, offre, chiedi, toast, mescola,
  stemma, prioritaFoto, riusaFoto, filaAtenei, ICONE,
} from './nucleo.js';

/* Lo stato della sezione. Vive qui e non nel nucleo: nessun'altra
   sezione ha ragione di leggerlo. Cuori e segnalibri stanno in memoria
   e basta: alla ricarica spariscono, ed è giusto così finché non c'è
   un titolare del trattamento (riferimento.md §7.0). */
const cuori = {}, salvati = {};
let filtroUni = null, soloSalvati = false, numeroScelto = null;
let NUMERI = [], ARTICOLI = [], ORDINE = [];

/* Ogni numero della rivista è un file a sé. Aggiungerne uno vuol dire
   aggiungere una riga qui: il pulsante del numero compare da solo. */
const NUMERI_DISPONIBILI = ['rivista-03'];

/* ================= IL FEED =================
   Schede, ma di cinque taglie molto diverse che si incastrano nelle colonne:
   l'asimmetria nasce dai formati, non da inclinazioni finte.
   grande · classica · minima · inchiostro · fluo, piu' le citazioni. */
function editorialeHTML(a){
  return `<article class="post f-editoriale" data-id="${a.id}">
    <span class="ed-eti">${T('Editoriale','Editorial')} \u00b7 №${a.num||''}</span>
    <button class="f-tit ed-tit leggi-art" data-id="${a.id}">${esc(a.titolo)}</button>
    <p class="ed-somm">${esc(a.lancio[LANG])}</p>
    <div class="ed-piede">
      <span class="ed-chi">${esc(a.autore)}</span>
      <button class="ed-leggi leggi-art" data-id="${a.id}">${T('Leggi','Read')} \u2192</button>
    </div>
  </article>`;
}

function postHTML(a, indice){
  const col=TINTE[a.uni]||'var(--menta)';
  const n=String((indice||0)+1).padStart(2,'0');
  const ritmo=['grande','classica','minima','inchiostro','classica','minima',
               'fluo','classica','grande','minima','classica','inchiostro'];
  let f=ritmo[(indice||0)%ritmo.length];
  if(!a.foto && (f==='grande'||f==='classica')) f='minima';

  const capo=`<div class="f-capo">
      <span class="f-num">${n}</span>
      <span class="f-dove">${esc(CITTA[a.uni]||a.uni)}</span>
      <span class="f-min">${a.lettura}\u2032</span>
    </div>`;
  const tit=(cl)=>`<button class="f-tit ${cl||''} leggi-art" data-id="${a.id}">${esc(a.titolo)}</button>`;
  const somm=`<p class="f-somm">${esc(a.lancio[LANG])}</p>`;
  const im0=(a.immagini&&a.immagini[0])||null;
  const prop=(im0&&im0.w&&im0.h)?` style="aspect-ratio:${im0.w}/${im0.h}"`:'';
  const foto=(cl)=>a.foto?`<button class="f-foto ${cl||''} leggi-art" data-id="${a.id}"
      aria-label="${esc(a.titolo)}"><img src="${a.foto}" alt="" ${prioritaFoto(indice||0,2)}${prop}></button>`:'';
  const chi=`<div class="f-chi">${stemma(a.uni,'f-av')}<span>${esc(a.autore)}</span></div>`;
  const azioni=`<div class="f-azioni">
      <button class="f-leggi leggi-art" data-id="${a.id}">${T('Leggi','Read')} <span class="fr">\u2192</span></button>
      <button class="cuore ${cuori[a.id]?'on':''}" data-id="${a.id}" aria-label="${T('Mi piace','Like')}">${ICONE.cuore}</button>
      <span class="f-conta">${(a.voti+(cuori[a.id]?1:0))}</span>
      <button class="storia-btn" data-storia="${a.id}" aria-label="Story">${ICONE.play}</button>
      <button class="salva ${salvati[a.id]?'on':''}" data-id="${a.id}" aria-label="Save">${ICONE.salva}</button>
    </div>`;

  let dentro;
  if(f==='grande'){
    dentro=`${foto('esce')}<div class="f-corpo">${capo}${tit('enorme')}${somm}${chi}</div>${azioni}`;
  } else if(f==='classica'){
    dentro=`<div class="f-corpo alto">${capo}${tit()}</div>${foto()}<div class="f-corpo basso">${somm}${chi}</div>${azioni}`;
  } else if(f==='minima'){
    dentro=`<div class="f-corpo stretta">${capo}${tit('media')}${somm}${chi}</div>${azioni}`;
  } else {
    dentro=`<div class="f-corpo pieno">${capo}${tit('enorme')}${somm}${chi}</div>${azioni}`;
  }
  return `<article class="post f-${f}" style="--ateneo:${col}">${dentro}</article>`;
}

function renderStorie(){
  document.getElementById('storie').innerHTML=filaAtenei('data-uni', filtroUni);
}

function filtrati(){
  let lista=ARTICOLI;
  if(numeroScelto!==null && NUMERI.length>1) lista=lista.filter(a=>a.num===numeroScelto);
  if(soloSalvati) lista=lista.filter(a=>salvati[a.id]);
  if(filtroUni) lista=lista.filter(a=>a.unis.includes(filtroUni));
  return lista;
}
function renderNumeri(){
  const n=document.getElementById('numeri');
  if(!n) return;
  // con un numero solo il selettore non serve: sparisce
  if(NUMERI.length<2){ n.innerHTML=''; n.style.display='none'; return; }
  n.style.display='';
  n.innerHTML = `<span class="num-eti">${T('Numero','Issue')}</span>` + NUMERI.map(x=>
    `<button class="num" data-num="${x.numero}" aria-pressed="${numeroScelto===x.numero}">
       <b>№${x.numero}</b>${x.data?`<i>${esc(x.data)}</i>`:''}
     </button>`).join('');
}
function renderBarraFeed(){
  const n=Object.values(salvati).filter(Boolean).length;
  document.getElementById('n-salvati').textContent=n?('· '+n):'';
  document.getElementById('chip-tutti').setAttribute('aria-pressed',!soloSalvati);
  document.getElementById('chip-salvati').setAttribute('aria-pressed',soloSalvati);
}
/* SCHEDA-CITAZIONE — ogni cinque o sei articoli il feed si ferma e mostra
   una frase sola, grande, su fondo pastello. Nessuna foto. E` quello che fa
   una rivista quando gira pagina: dà respiro e cambia il ritmo dell'occhio.
   La frase e` dell'autore, scelta col criterio delle citazioni del lettore. */
const PASTELLI=[
  {sf:"var(--menta)",   tx:"var(--menta-s)"},
  {sf:"var(--lavanda)", tx:"var(--lavanda-s)"},
  {sf:"var(--pesca)",   tx:"var(--pesca-s)"},
  {sf:"var(--cielo)",   tx:"var(--cielo-s)"},
  {sf:"var(--rosa)",    tx:"var(--rosa-s)"}
];
function frasePerVetrina(a){
  const pezzi=a.pezzi||[];
  const cand=[];
  pezzi.forEach(p=>{
    if(p.t==='citazione'){ if(p.x.length>60&&p.x.length<190) cand.push({peso:200+p.x.length,x:p.x}); return; }
    if(p.t!=='testo') return;
    p.x.split(/(?<=[.!?])\s+/).forEach(fr=>{
      const n=fr.trim().length;
      if(n<70||n>170) return;
      const peso=n
        + (/[\u201c"]/.test(fr)?90:0)
        + (/\b(is|are|means|must|should|can|becomes|never|only|because)\b/i.test(fr)?30:0);
      cand.push({peso,x:fr.trim()});
    });
  });
  if(!cand.length) return null;
  cand.sort((a,b)=>b.peso-a.peso);
  return cand[0].x;
}
function vetrinaHTML(a, n){
  const frase=frasePerVetrina(a);
  if(!frase) return '';
  const c=PASTELLI[n%PASTELLI.length];
  return `<article class="post vetrina" style="--sf:${c.sf};--tx:${c.tx}">
    <span class="vg vg-su">&ldquo;</span>
    <p class="v-frase">${esc(frase)}</p>
    <span class="vg vg-giu">&rdquo;</span>
    <div class="v-piede">
      <span class="v-tit">${esc(a.titolo)}</span>
      <span class="v-chi">${esc(a.autore)} \u00b7 ${esc(CITTA[a.unis[0]]||a.unis[0])}</span>
      <button class="v-btn leggi-art" data-id="${a.id}">${T('Leggi','Read more')} <span class="fr">\u2192</span></button>
    </div>
  </article>`;
}

function renderFeed(){
  renderNumeri();
  renderBarraFeed();
  const lista=filtrati();
  let ord=ORDINE.map(id=>lista.find(a=>a.id===id)).filter(Boolean);
  const edit = ord.find(a=>/editorial/i.test(a.id) || /^editorial/i.test(a.titolo));
  if(edit) ord = ord.filter(a=>a!==edit);
  let pezzi = edit ? editorialeHTML(edit) : '', nVetrine=0;
  ord.forEach((a,i)=>{
    pezzi+=postHTML(a,i);
    // ogni cinque schede, una citazione: prende la frase dall'articolo dopo
    if((i+1)%5===0 && ord[i+1]){
      const v=vetrinaHTML(ord[i+1], nVetrine);
      if(v){ pezzi+=v; nVetrine++; }
    }
  });
  document.getElementById('feed-griglia').innerHTML=
    pezzi||`<div class="vuoto-feed">${soloSalvati
      ? T('Non hai ancora salvato niente. Tocca il segnalibro su un articolo per tenerlo da parte.',
          'Nothing saved yet. Tap the bookmark on any story to keep it for later.')
      : T('Nessun articolo di questo ateneo in questo numero.',
          'No articles from this university in this issue.')}</div>`;
  /* Le fotografie che c'erano già tornano al loro posto come elementi,
     non come richieste nuove: vedi `riusaFoto` in `nucleo.js`. */
  riusaFoto('feed-griglia');
}

/* ── ritocchi che non meritano un ridisegno ────────────────────────
   Cuore e segnalibro cambiano un pulsante e un numero. Rifare tutto il
   feed per quello voleva dire buttare via e ricreare ogni `<img>` della
   pagina: le fotografie sparivano e tornavano a ogni clic. Qui si tocca
   soltanto quello che cambia davvero. */
function pulsantiPerArticolo(classe, id) {
  const box = document.getElementById('feed-griglia');
  if (!box || typeof box.querySelectorAll !== 'function') return [];
  return Array.from(box.querySelectorAll('.' + classe))
    .filter(b => b.dataset && b.dataset.id === id);
}

function aggiornaCuore(id) {
  const a = ARTICOLI.find(x => x.id === id);
  for (const b of pulsantiPerArticolo('cuore', id)) {
    b.classList.toggle('on', !!cuori[id]);
    const conta = b.parentElement && b.parentElement.querySelector('.f-conta');
    if (conta && a) conta.textContent = a.voti + (cuori[id] ? 1 : 0);
  }
}

/* Il segnalibro si accende anche dalla pagina di lettura, quindi questa
   la offriamo fuori. Un caso solo obbliga al ridisegno: se stiamo
   guardando i salvati e ne togliamo uno, quella scheda deve sparire —
   e con lei il ritmo delle citazioni, che si conta sulle schede rimaste. */
function aggiornaSalvato(id) {
  if (!avviata) return;
  if (soloSalvati && !salvati[id]) { renderFeed(); return; }
  for (const b of pulsantiPerArticolo('salva', id)) {
    b.classList.toggle('on', !!salvati[id]);
  }
  renderBarraFeed();
}

/* ── dai file dei numeri alla forma che il feed usa ────────────────
   Ogni numero è un file a sé. Qui si appiattiscono in un elenco solo,
   dal più recente al più vecchio. I conteggi dei "mi piace" sono finti
   e dichiarati tali: nessuno li ha mai messi. */
const VOTI_FINTI = [128, 96, 87, 64, 73, 59, 142, 81, 103, 77, 91, 68, 115, 54, 88, 132, 71, 99, 60];

function componiArticoli() {
  let k = 0;
  return NUMERI.flatMap(n => (n.articoli || []).map((a, i) => ({
    id: a.id,
    num: n.numero,
    uni: a.uni[0],
    unis: a.uni,
    autore: a.autore,
    luogo: 'pp. ' + a.pagine,
    pagg: a.pagine,
    titolo: a.titolo,
    nuovo: i === 0 && n.numero === (NUMERI[0] && NUMERI[0].numero),
    foto: (a.immagini && a.immagini.length) ? a.immagini[0].file : null,
    immagini: a.immagini || [],
    pezzi: a.pezzi || [],
    lettura: a.lettura,
    lancio: { it: a.occhiello, en: a.occhiello },
    voti: VOTI_FINTI[(k++) % VOTI_FINTI.length],
    tempo: { it: 'Numero ' + n.numero + ' · ' + (n.data || ''),
             en: 'Issue ' + n.numero + ' · ' + (n.data || '') },
  })));
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.addEventListener('click', async e => {
  /* le due voci in cima: leggere oppure ascoltare. Il comando sta qui e
     non in `ascolta.js`, perché è proprio questo clic a far scaricare
     quel modulo. */
  const m = e.target.closest('#modi-mag .modo-mag');
  if (m) {
    const quale = m.dataset.mag;
    document.querySelectorAll('#modi-mag .modo-mag').forEach(b => {
      const on = b === m;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    document.getElementById('mag-leggi').hidden = quale !== 'leggi';
    document.getElementById('mag-ascolta').hidden = quale !== 'ascolta';
    if (quale === 'ascolta') (await chiedi('ascolta')).avvia();
    return;
  }

  const leggi = e.target.closest('.leggi-art');
  if (leggi) { (await chiedi('articolo')).apri(leggi.dataset.id); return; }

  const st = e.target.closest('[data-storia]');
  if (st) { (await chiedi('storie')).apri(st.dataset.storia); return; }

  const cuore = e.target.closest('.cuore');
  if (cuore) { const id = cuore.dataset.id; cuori[id] = !cuori[id]; renderFeed(); return; }

  const salva = e.target.closest('.salva');
  if (salva) { const id = salva.dataset.id; salvati[id] = !salvati[id]; renderFeed(); return; }

  const share = e.target.closest('.share');
  if (share) {
    const a = ARTICOLI.find(x => x.id === share.dataset.id);
    if (navigator.share) navigator.share({ title: 'Catch-Up · ' + a.titolo }).catch(() => {});
    else toast(T('Condivisione non disponibile qui', 'Sharing not available here'));
    return;
  }

  const bNum = e.target.closest('#numeri .num');
  if (bNum) {
    numeroScelto = parseInt(bNum.dataset.num, 10);
    renderNumeri(); renderFeed();
    document.getElementById('p-magazine').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (e.target.closest('#chip-tutti'))   { soloSalvati = false; renderFeed(); return; }
  if (e.target.closest('#chip-salvati')) { soloSalvati = true;  renderFeed(); return; }

  const storia = e.target.closest('.storia[data-uni]');
  if (storia) {
    const u = storia.dataset.uni || null;
    filtroUni = (filtroUni === u) ? null : u;
    renderStorie(); renderFeed();
  }
});

/* ── avvio della sezione ───────────────────────────────────────────── */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;
  NUMERI = (await Promise.all(NUMERI_DISPONIBILI.map(n => dati(n))))
    .sort((a, b) => (b.numero || 0) - (a.numero || 0));
  ARTICOLI = componiArticoli();
  ORDINE = mescola(ARTICOLI.map(a => a.id));
  numeroScelto = NUMERI.length ? NUMERI[0].numero : null;
  renderStorie();
  renderFeed();
}

/* Quello che le altre sezioni possono chiedere alla rivista: l'elenco
   degli articoli (serve alla pagina di lettura e alle storie) e il
   ridisegno del feed quando cambia qualcosa che si vede anche lì. */
offre('rivista', {
  avvia,
  articoli: () => ARTICOLI,
  ordine: () => ORDINE,
  filtrati,
  salvati,
  ridisegna: () => { if (avviata) renderFeed(); },
});
