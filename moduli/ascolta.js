/* ERUA connect — le puntate dell'alleanza
   ==================================================================
   In cima l'ultima puntata con l'anteprima grande, sotto l'elenco degli
   episodi come in un'app di musica. Il quadratino del lettore si allarga
   e diventa lo schermo: si misurano le dimensioni prima e dopo e si
   animano quelle vere, cosi' non ci sono scatti a meta' strada.

   Oggi le puntate sono cinque, prese dal canale dell'alleanza. Quando il
   processo automatico leggera' il canale da solo (riferimento.md §2.8),
   `dati/ascolta.json` si riempira' senza che si tocchi questo file.
*/

import { CITTA, TINTE, CONFIG } from '../configurazione.js';
import { T, esc, dati, offre, dataBreve, ICONE } from './nucleo.js';

let PODCAST = [];
let podCorrente = null, podTimer = null, podPerc = 0;

const VIDEO = CONFIG.serviziEsterni.video;
const thumb = id => `${VIDEO.anteprime}/vi/${id}/hqdefault.jpg`;

function renderPodcast(){
  const box=document.getElementById('mag-ascolta');
  if(!box) return;
  const uno=PODCAST[0], resto=PODCAST.slice(1);
  box.innerHTML=`
    <article class="pod-hero">
      <button class="pod-cover video" data-pod="${uno.id}" aria-label="Play">
        <img src="${thumb(uno.yt)}" alt="" loading="lazy">
        <span class="pod-velo" aria-hidden="true"></span>
        <span class="pod-play grande" aria-hidden="true">${ICONE.playPieno}</span>
      </button>
      <div class="pod-testa">
        <span class="pod-eti">${T('Ultima puntata','Latest episode')} \u00b7 ${esc(uno.s)}</span>
        <h3 class="pod-tit">${esc(uno.t)}</h3>
        <p class="pod-nota">${esc(uno.n)}</p>
        <div class="pod-riga">
          <button class="pod-play grande" data-pod="${uno.id}" aria-label="Play">${ICONE.playPieno}</button>
          <span class="pod-data">${dataBreve(uno.data)}</span>
        </div>
      </div>
    </article>
    <div class="pod-lista">
      ${resto.map(e=>`
        <button class="pod-voce" data-pod="${e.id}">
          <span class="pod-mini video"><img src="${thumb(e.yt)}" alt="" loading="lazy"></span>
          <span class="pod-testi">
            <b>${esc(e.t)}</b>
            <i>${esc(e.s)} \u00b7 ${dataBreve(e.data)}</i>
          </span>
          <span class="pod-go">${ICONE.play}</span>
        </button>`).join('')}
    </div>
    <p class="pod-piede">${T('Puntate ufficiali dal canale YouTube dell\'alleanza.',
      'Official episodes from the alliance\'s YouTube channel.')}</p>`;
}

function suonaPod(id, subito){
  const e=PODCAST.find(x=>x.id===id); if(!e) return;
  podCorrente=e; podPerc=0;
  const l=document.getElementById('pod-lettore');
  l.hidden=false;
  l.classList.remove('espansa');
  l.style.height=''; l.style.transition='';
  document.body.classList.add('pod-aperta');
  document.getElementById('pl-video').innerHTML='';
  document.getElementById('pl-tit').textContent=e.t;
  document.getElementById('pl-sub').textContent=e.s+' \u00b7 '+(CITTA[e.u]||e.u);
  document.getElementById('pl-d').textContent=e.d||'';
  document.getElementById('pl-riemp').style.width='0%';
  // il quadratino: anteprima del video se c'e`, copertina colorata se no
  const q=document.getElementById('pl-quad');
  const th=document.getElementById('pl-thumb');
  const onda=document.getElementById('pl-onda');
  q.style.setProperty('--a', TINTE[e.u]||'var(--menta)');
  q.style.width=''; q.style.height=''; q.style.transition='';
  if(e.yt){ th.src=thumb(e.yt); th.style.display='block'; onda.style.display='none'; }
  else { th.removeAttribute('src'); th.style.display='none'; onda.style.display='block'; }
  clearInterval(podTimer); podTimer=null;
  if(e.yt){
    document.getElementById('pl-go').innerHTML=ICONE.playPieno;
    // dalle liste il video parte subito, come in un'app di musica
    if(subito) espandiPod();
    return;
  }
  document.getElementById('pl-go').innerHTML=ICONE.pausa;
  podTimer=setInterval(()=>{
    podPerc=Math.min(100,podPerc+0.7);
    document.getElementById('pl-riemp').style.width=podPerc+'%';
    if(podPerc>=100) clearInterval(podTimer);
  },120);
}
/* Il quadratino si allarga e diventa lo schermo: misuro prima e dopo,
   poi animo le misure vere (FLIP) cosi` niente scatti a meta` strada. */
function espandiPod(){
  const e=podCorrente; if(!e||!e.yt) return;
  const l=document.getElementById('pod-lettore');
  if(l.classList.contains('espansa')) return;
  const q=document.getElementById('pl-quad');
  const h0=l.offsetHeight, w0=q.offsetWidth;
  /* Dominio senza cookie: prima era `youtube.com`, che deposita subito i
     suoi. Il video è lo stesso, la traccia sull'utente no (§3.7). */
  document.getElementById('pl-video').innerHTML=
    '<iframe src="'+VIDEO.incorpora+'/embed/'+encodeURIComponent(e.yt)+'?autoplay=1&rel=0" '+
    'title="'+esc(e.t)+'" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" '+
    'allowfullscreen></iframe>';
  l.classList.add('espansa','misura');
  const h1=l.offsetHeight, w1=q.offsetWidth, hq1=q.offsetHeight;
  l.classList.remove('misura');
  l.style.height=h0+'px';
  q.style.width=w0+'px'; q.style.height=w0+'px';
  void l.offsetHeight;
  l.style.transition='height .55s cubic-bezier(.6,0,.15,1)';
  q.style.transition='width .55s cubic-bezier(.6,0,.15,1),height .55s cubic-bezier(.6,0,.15,1)';
  l.style.height=h1+'px';
  q.style.width=w1+'px'; q.style.height=hq1+'px';
  setTimeout(()=>{ l.style.height=''; l.style.transition='';
                   q.style.width=''; q.style.height=''; q.style.transition=''; },600);
}
function podPausa(){
  if(!podCorrente || podCorrente.yt) return;
  const g=document.getElementById('pl-go');
  if(podTimer){ clearInterval(podTimer); podTimer=null; g.innerHTML=ICONE.playPieno; }
  else { g.innerHTML=ICONE.pausa; podTimer=setInterval(()=>{
    podPerc=Math.min(100,podPerc+0.7);
    document.getElementById('pl-riemp').style.width=podPerc+'%';
  },120); }
}
function chiudiPod(){
  clearInterval(podTimer); podTimer=null; podCorrente=null;
  const l=document.getElementById('pod-lettore');
  document.getElementById('pl-video').innerHTML='';   // ferma il video
  l.classList.remove('espansa');
  l.style.height=''; l.style.transition='';
  document.body.classList.remove('pod-aperta');
  l.hidden=true;
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  /* le due voci in cima alla rivista: leggere oppure ascoltare */
  const m = e.target.closest('#modi-mag .modo-mag');
  if (m) {
    const quale = m.dataset.mag;
    document.querySelectorAll('#modi-mag .modo-mag').forEach(b => {
      const on = b === m;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    document.getElementById('mag-leggi').hidden = quale !== 'leggi';
    document.getElementById('mag-ascolta').hidden = quale !== 'ascolta';
    if (quale === 'ascolta') avvia();
    return;
  }
  if (e.target.closest('#pl-x')) { e.preventDefault(); e.stopPropagation(); chiudiPod(); return; }
  if (e.target.closest('#pl-quad')) {
    if (podCorrente && podCorrente.yt) espandiPod(); else podPausa();
    return;
  }
  const v = e.target.closest('[data-pod]');
  if (v) suonaPod(v.dataset.pod, true);
});

addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const l = document.getElementById('pod-lettore');
  if (l && !l.hidden) chiudiPod();
});

/* ── avvio della sezione ───────────────────────────────────────────── */
let avviata = false;
export async function avvia() {
  if (avviata) { renderPodcast(); return; }
  avviata = true;
  PODCAST = await dati('ascolta');
  renderPodcast();
}

offre('ascolta', { avvia, chiudi: chiudiPod });
