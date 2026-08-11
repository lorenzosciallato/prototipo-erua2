/* ERUA connect — la piazza
   ==================================================================
   Post, risposte, filtri per argomento e per ateneo. Chi scrive non ha
   un nome e cognome ma un soprannome generato e un'identicona: nel
   prototipo non esiste nessun account, e quando esistera' resta vero
   che per mettere in contatto due studenti non serve sapere come si
   chiamano (riferimento.md §3.5).

   Nulla di quello che si scrive qui viene conservato: alla ricarica
   della pagina sparisce. Finche' il momento zero non e' superato deve
   restare cosi' (§7.0).
*/

import { ATENEI, CITTA } from '../configurazione.js';
import { LANG, T, esc, dati, offre, toast, faccia, stemma, filaAtenei, ICONE } from './nucleo.js';

let TAG = [], THREAD = [], COMMENTI = {}, TOGGLE = [], statoToggle = {};
let tagScelto = 'progetti', filtroTag = 'tutti', filtroCitta = null;
let apertoCommenti = null;
const espansi = {}, votiThread = {};

const AGG=["curious","lucid","quiet","kind","quick","bright","calm","patient","honest","serene","lively","steady"];
const SOS=["reader","wanderer","scribe","commuter","cartographer","printer","archivist","navigator","botanist","watchmaker"];
function generaNick(){
  return SOS[Math.floor(Math.random()*SOS.length)]+"_"+AGG[Math.floor(Math.random()*AGG.length)]+"_"+Math.floor(1000+Math.random()*9000);
}
let MIO_NICK=generaNick();

function renderChipsTag(){
  document.getElementById('chips-tag').innerHTML=TAG.map(t=>
    `<button class="chip" data-newtag="${esc(t.id)}" aria-pressed="${tagScelto===t.id}"
       style="--sf:${t.sf};--sc:${t.c}">${esc(t.l[LANG])}</button>`).join('');
  document.getElementById('sc-filtri').innerHTML=
    `<button class="chip" data-filtag="tutti" aria-pressed="${filtroTag==='tutti'}">${T('Tutto','Everything')}</button>`+
    TAG.map(t=>`<button class="chip" data-filtag="${esc(t.id)}" aria-pressed="${filtroTag===t.id}"
       style="--sf:${t.sf};--sc:${t.c}">${esc(t.l[LANG])}</button>`).join('');
  document.getElementById('mio-nick').textContent=MIO_NICK;
  document.getElementById('sc-mia-faccia').innerHTML=faccia(MIO_NICK,30);
}

/* gli atenei in cima, come nella rivista: cerchio col logo e città sotto */
function renderAtenei(){
  document.getElementById('sc-atenei').innerHTML = filaAtenei('data-citta', filtroCitta);
}

function commentiHTML(id){
  const lista=COMMENTI[id]||[];
  return `<div class="sc-risposte">
    ${lista.map(c=>`
      <div class="sc-risp">
        ${faccia(c.nick,22)}
        <div>
          <div class="sc-risp-chi"><b>${esc(c.nick)}</b> · ${esc(CITTA[c.uni]||c.uni)} · ${esc(c.quando)}</div>
          <p>${esc(c.t[LANG])}</p>
        </div>
      </div>`).join('') ||
      `<p class="sc-nessuna">${T('Ancora nessuna risposta. Comincia tu.','No replies yet. Be the first.')}</p>`}
    <div class="sc-scrivi-risp">
      ${faccia(MIO_NICK,22)}
      <input type="text" data-risp="${esc(id)}" placeholder="${T('Scrivi una risposta…','Write a reply…')}" aria-label="Reply">
      <button class="sc-invia" data-invia="${esc(id)}">${T('Invia','Send')}</button>
    </div>
  </div>`;
}

function renderThread(){
  let lista=THREAD;
  if(filtroTag!=='tutti') lista=lista.filter(t=>t.tag===filtroTag);
  if(filtroCitta) lista=lista.filter(t=>t.uni===filtroCitta);
  document.getElementById('thread-lista').innerHTML=lista.map(t=>{
    const v=votiThread[t.id]||0;
    const et=TAG.find(x=>x.id===t.tag)||TAG[0];
    const nRisp=(COMMENTI[t.id]||[]).length;
    const aperto=String(apertoCommenti)===String(t.id);
    /* P3: nick, titolo e testo li scrive una persona. Passano tutti da
       esc() prima di entrare nell'HTML — anche quelli che oggi sono
       segnaposto, perché il campo "nuovo post" qui sotto scrive nello
       stesso elenco. */
    return `<article class="sc-post" style="--tinta:${et.sf}">
      <div class="sc-meta">
        ${faccia(t.nick,26)}
        <span class="nick">${esc(t.nick)}</span>
        <span class="dove">${esc(CITTA[t.uni]||t.uni)} · ${esc(t.quando)}</span>
        <span class="sc-etich" style="--tinta2:${et.c};--tinta3:${et.sf}">${esc(et.l[LANG])}</span>
      </div>
      ${t.tit?`<h3>${esc(t.tit[LANG])}</h3>`:''}
      ${(() => {
        const txt=t.testo[LANG], lungo=txt.length>300, aperto2=espansi[t.id];
        return `<p class="sc-testo ${lungo&&!aperto2?'corto':''}">${esc(txt)}</p>`+
          (lungo?`<button class="sc-altro" data-espandi="${esc(t.id)}">${aperto2?T('Mostra meno','Show less'):T('Leggi tutto','Read more')}</button>`:'');
      })()}
      <div class="sc-azioni">
        <button class="sc-az ${v===1?'on':''}" data-voto="${esc(t.id)}" data-dir="1">
          ${ICONE.su}<b>${t.voti+v}</b> ${T('utile','useful')}</button>
        <button class="sc-az ${aperto?'on':''}" data-risposte="${esc(t.id)}">
          ${ICONE.chat}<b>${nRisp}</b> ${T('risposte','replies')}</button>
        <button class="sc-az principale dm" data-nick="${esc(t.nick)}">${T('scrivigli','message')}</button>
      </div>
      ${aperto?commentiHTML(t.id):''}
    </article>`;}).join('') ||
    `<div class="vuoto-feed">${T('Nessun post con questi filtri.','Nothing here with these filters.')}</div>`;
}

function renderToggle(){
  document.getElementById('toggle-lista').innerHTML=TOGGLE.map(t=>`
    <button class="toggle" data-toggle="${esc(t.id)}" aria-pressed="${!!statoToggle[t.id]}">
      <span class="ico">${t.ico}</span>
      <span class="t"><b>${esc(t.t[LANG])}</b><span>${esc(t.d[LANG])}</span></span>
      <span class="sw" aria-hidden="true"></span>
    </button>`).join('');
  document.getElementById('amb-griglia').innerHTML=ATENEI.map(u=>
    `<div class="amb"><span class="anello">${stemma(u,'avatar')}</span>${esc(CITTA[u]||u)}</div>`).join('');
}

function apriFoglio(v){
  const f=document.getElementById('sc-foglio');
  f.hidden=!v;
  document.body.style.overflow=v?'hidden':'';
  if(v) document.getElementById('board-testo').focus();
}

function ridisegna(){ renderChipsTag(); renderAtenei(); renderThread(); renderToggle(); }

/* ── comandi ───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  if (e.target.closest('#btn-apri-scrivi')) { apriFoglio(true); return; }
  if (e.target.closest('#btn-chiudi-scrivi') || e.target.id === 'sc-foglio') { apriFoglio(false); return; }

  const cerchio = e.target.closest('[data-citta]');
  if (cerchio) {
    const u = cerchio.dataset.citta || null;
    filtroCitta = (filtroCitta === u) ? null : u;
    renderAtenei(); renderThread();
    return;
  }
  const nt = e.target.closest('[data-newtag]');
  if (nt) { tagScelto = nt.dataset.newtag; renderChipsTag(); return; }

  const ft = e.target.closest('[data-filtag]');
  if (ft) {
    filtroTag = ft.dataset.filtag;
    if (filtroTag === 'tutti') filtroCitta = null;
    renderChipsTag(); renderAtenei(); renderThread();
    return;
  }
  const voto = e.target.closest('[data-voto]');
  if (voto) {
    const id = voto.dataset.voto, dir = +voto.dataset.dir;
    votiThread[id] = (votiThread[id] === dir) ? 0 : dir;
    renderThread();
    return;
  }
  const esp = e.target.closest('[data-espandi]');
  if (esp) { const id = esp.dataset.espandi; espansi[id] = !espansi[id]; renderThread(); return; }

  const rs = e.target.closest('[data-risposte]');
  if (rs) {
    apertoCommenti = (String(apertoCommenti) === rs.dataset.risposte) ? null : rs.dataset.risposte;
    renderThread();
    return;
  }
  const inv = e.target.closest('[data-invia]');
  if (inv) {
    const id = inv.dataset.invia;
    const campo = document.querySelector(`[data-risp="${CSS.escape(id)}"]`);
    const testo = (campo && campo.value || '').trim();
    if (!testo) { toast(T('Scrivi qualcosa', 'Write something first')); if (campo) campo.focus(); return; }
    if (!COMMENTI[id]) COMMENTI[id] = [];
    COMMENTI[id].push({ nick: MIO_NICK, uni: 'UNIMC', quando: T('adesso', 'now'), t: { it: testo, en: testo } });
    apertoCommenti = id;
    renderThread();
    return;
  }
  const dm = e.target.closest('.dm');
  if (dm) { toast(T('Messaggio a ', 'Message to ') + dm.dataset.nick); return; }

  const tg = e.target.closest('[data-toggle]');
  if (tg) { const id = tg.dataset.toggle; statoToggle[id] = !statoToggle[id]; renderToggle(); return; }

  if (e.target.closest('#btn-rigenera')) {
    MIO_NICK = generaNick();
    document.getElementById('mio-nick').textContent = MIO_NICK;
    const p = document.getElementById('profilo-nick');
    if (p) p.textContent = MIO_NICK;
    renderChipsTag();
    return;
  }
  if (e.target.closest('#btn-pubblica')) {
    const ta = document.getElementById('board-testo');
    const testo = ta.value.trim();
    if (!testo) { toast(T('Scrivi qualcosa prima di pubblicare', 'Write something first')); ta.focus(); return; }
    THREAD.unshift({
      id: 'mio-' + THREAD.length, nick: MIO_NICK, uni: 'UNIMC', tag: tagScelto,
      voti: 1, commenti: 0, quando: T('adesso', 'just now'),
      tit: null, testo: { it: testo, en: testo },
    });
    ta.value = '';
    filtroTag = 'tutti'; filtroCitta = null;
    apriFoglio(false);
    renderChipsTag(); renderAtenei(); renderThread();
  }
});

/* invio con Enter dentro il campo di risposta */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const campo = e.target.closest('[data-risp]');
  if (!campo) return;
  e.preventDefault();
  const b = document.querySelector(`[data-invia="${CSS.escape(campo.dataset.risp)}"]`);
  if (b) b.click();
});

addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const f = document.getElementById('sc-foglio');
  if (f && !f.hidden) apriFoglio(false);
});

/* ── il pulsante si toglie di mezzo in fondo alla pagina ────────────
   Sta fisso sopra tutto, quindi arrivati in fondo finiva addosso alla
   dicitura sui marchi. Quando il piè di pagina entra nello schermo il
   pulsante sparisce: chi sta leggendo lì non sta scrivendo un post.

   Si guarda il piè di pagina invece di misurare lo scorrimento perché
   funziona da solo su qualunque schermo e con qualunque lunghezza di
   pagina — e non costa niente, il browser avvisa solo quando serve. */
{
  const piede = document.querySelector('footer');
  const piu = document.getElementById('btn-apri-scrivi');
  if (piede && piu && typeof IntersectionObserver === 'function') {
    new IntersectionObserver(
      ([voce]) => piu.classList.toggle('in-fondo', voce.isIntersecting),
      { rootMargin: '0px 0px -12px 0px' },
    ).observe(piede);
  }
}

/* ── avvio della sezione ───────────────────────────────────────────── */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;
  const d = await dati('sociale');
  TAG = d.argomenti;
  THREAD = d.discussioni;
  COMMENTI = d.risposte;
  TOGGLE = d.disponibilita;
  /* Le disponibilità che il profilo mostra accese all'inizio. Sono
     un esempio, non una scelta di nessuno: non esiste ancora un
     profilo da cui leggerle. */
  statoToggle = { divano: false, lingua: true, progetti: true, tutor: false, passaggi: false, appunti: true };
  ridisegna();
}

offre('sociale', { avvia, ridisegna: () => { if (avviata) ridisegna(); }, nick: () => MIO_NICK });
