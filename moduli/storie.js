/* ERUA connect — le storie a tocco
   ==================================================================
   Cinque-sei schermate per articolo: copertina, le frasi d'apertura di
   ogni capitolo, e l'invito a leggere tutto. Le foto dell'articolo fanno
   da sfondo. Avanza da sola, ma si comanda col dito.
*/

import { CITTA } from '../configurazione.js';
import { esc, chiedi, offre, stemma, inLettura } from './nucleo.js';

const sv = document.getElementById('storie-viewer');
let svArt = null, svIdx = 0, svTimer = null, svSchermate = [];

/* Le frasi delle schermate sono le stesse che la pagina di lettura usa
   per il riassunto: sono parole dell'autore, non un testo prodotto da
   una macchina. La funzione che le sceglie sta lì e la chiediamo a lei
   invece di riscriverla qui. */
let sintesiDi = () => [];
let apriArticolo = () => {};
chiedi('articolo').then(a => { sintesiDi = a.sintesi; apriArticolo = a.apri; });

function costruisciStorie(a){
  const punti=sintesiDi(a);
  const foto=(a.immagini||[]).map(f=>f.file);
  const sch=[{tipo:'cover', testo:a.titolo, sotto:a.lancio[LANG], foto:foto[0]||null}];
  punti.slice(0,5).forEach((t,i)=>
    sch.push({tipo:'frase', testo:t, foto:foto[(i+1)%Math.max(1,foto.length)]||null}));
  sch.push({tipo:'fine', testo:'Read the full story', sotto:a.lettura+' min read', foto:foto[0]||null});
  return sch;
}
function disegnaStoria(){
  const a=svArt, s=svSchermate[svIdx];
  if(!a||!s) return;
  sv.innerHTML=`
    <div class="sv-sfondo">${s.foto?`<img src="${s.foto}" alt="">`:''}</div>
    <div class="sv-barre">${svSchermate.map((_,i)=>
      `<span class="sv-barra"><i style="width:${i<svIdx?100:0}%" ${i===svIdx?'id="sv-attiva"':''}></i></span>`).join('')}</div>
    <div class="sv-testa">
      <span class="anello">${stemma(a.uni,'avatar')}</span>
      <span class="chi">${esc(a.autore)} · ${esc(a.unis.map(u=>CITTA[u]||u).join(' · '))}</span>
      <button class="sv-x" id="sv-chiudi" aria-label="Close">✕</button>
    </div>
    <div class="sv-zona sx" data-sv="-1"></div>
    <div class="sv-zona dx" data-sv="1"></div>
    <div class="sv-testo">
      ${s.tipo==='cover'?'<span class="sv-kick">Catch-Up №'+esc(svArt&&svArt.num||'')+'</span>':''}
      ${s.tipo==='frase'?'<span class="sv-kick">'+svIdx+' / '+(svSchermate.length-2)+'</span>':''}
      <span class="sv-frase ${s.tipo==='frase'?'piccola':''}">${esc(s.testo)}</span>
      ${s.sotto?`<span class="sv-sotto">${esc(s.sotto)}</span>`:''}
    </div>
    ${s.tipo==='fine'?`<div class="sv-cta"><button id="sv-leggi">Open the article →</button></div>`:''}`;
  document.getElementById('sv-chiudi').addEventListener('click',chiudiStorie);
  const leggi=document.getElementById('sv-leggi');
  if(leggi) leggi.addEventListener('click',()=>{ const id=a.id; chiudiStorie(); apriArticolo(id); });
  avviaTimer();
}
function avviaTimer(){
  clearTimeout(svTimer);
  const barra=document.getElementById('sv-attiva');
  if(barra){
    barra.style.transition='none'; barra.style.width='0%';
    requestAnimationFrame?requestAnimationFrame(()=>{
      barra.style.transition='width 6.5s linear'; barra.style.width='100%';
    }):null;
  }
  svTimer=setTimeout(()=>vaiStoria(1),6600);
}
function vaiStoria(d){
  svIdx+=d;
  if(svIdx<0){ svIdx=0; }
  if(svIdx>=svSchermate.length){ chiudiStorie(); return; }
  disegnaStoria();
}
function apriStorie(id){
  svArt=ARTICOLI.find(x=>x.id===id);
  if(!svArt) return;
  svSchermate=costruisciStorie(svArt); svIdx=0;
  sv.classList.add('aperta'); document.body.style.overflow='hidden';
  disegnaStoria();
}
function chiudiStorie(){
  clearTimeout(svTimer);
  sv.classList.remove('aperta'); sv.innerHTML='';
  document.body.style.overflow=overlay.classList.contains('aperto')?'hidden':'';
}
sv.addEventListener('click',e=>{
  const z=e.target.closest('[data-sv]');
  if(z){ vaiStoria(+z.dataset.sv); }
});
