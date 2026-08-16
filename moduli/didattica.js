/* ERUA connect — la vetrina dei corsi
   ==================================================================
   Corsi aperti veri (Yale, MIT, Harvard, Stanford), incorporati dal
   dominio di YouTube che non lascia cookie e caricati solo al clic. La
   sezione è una vetrina: mostra come potrebbe funzionare il binario
   didattico dei percorsi congiunti.

   La parte "dagli studenti" è dichiaratamente vuota: nessun contenuto
   studentesco esiste ancora, e non ne verrà inventato uno per fare
   scena.

   I corsi appartengono agli atenei che li hanno pubblicati e portano le
   loro licenze (Open Yale Courses, MIT OpenCourseWare). La licenza va
   scritta accanto al corso: è un obbligo, non una cortesia
   (riferimento.md §6).
*/

import { ATENEI, CITTA, CONFIG } from '../configurazione.js';
import { LANG, T, esc, dati, offre, chiedi, toast, stemma, filaAtenei, dataBreve, foglio } from './nucleo.js';

const VIDEO = CONFIG.serviziEsterni.video;

let ST_GRUPPI = [], ST_CORSI = [], ST_DIVES = [], ST_STUD = [], ST_STUD_PROSSIMI = [];
const ST_COL = {
  psych: ['--cielo', '--cielo-s'], phil: ['--lavanda', '--lavanda-s'],
  storia: ['--menta', '--menta-s'], neuro: ['--rosa', '--rosa-s'],
  dive: ['--pesca', '--pesca-s'], stud: ['--rosa', '--rosa-s'],
};

/* ── anteprime dei video ────────────────────────────────────────────
   YouTube tiene la stessa anteprima in più misure. `hq` pesa il doppio
   di `mq` e serve solo dove l'immagine è grande davvero: nelle
   miniature di elenco il peso in più non si vede, si aspetta soltanto.

   `mq` ha anche la proporzione giusta — sedici a nove pieni, mentre
   `hq` arriva con due bande nere sopra e sotto che il foglio di stile
   deve ritagliare. Nelle miniature quindi non è un ripiego: è meglio. */
const stThumb=(id,grande)=>VIDEO.anteprime+'/vi/'+id+(grande?'/hqdefault.jpg':'/mqdefault.jpg');
const MISURA_MINI='width="320" height="180" decoding="async"';
function stCol(materia){const c=ST_COL[materia]||ST_COL.psych;return '--pf:var('+c[0]+');--ps:var('+c[1]+')';}

/* Le copertine dei primi corsi si vedono appena si entra in Learn:
   `loading="lazy"` le manda in fondo alla coda proprio quando servono.
   Dalla quarta in giù il differimento torna giusto — sono anteprime di
   YouTube, stanno su un altro server e sono parecchie. */
function stCorsoHTML(c, i = 0){
  const quando = i < 3 ? 'decoding="async"' : 'loading="lazy" decoding="async"';
  const dentroCover=c.cover?`<img src="${stThumb(c.cover,true)}" alt="" ${quando}>`:`<b>${esc(c.arte||c.code)}</b>`;
  const visita=stVisitaDi(c.id);
  const meta=visita
    ?T('Visitato il '+stVisitaData(c.id),'Visited on '+stVisitaData(c.id))
    :T('Non ancora visitato','Not visited yet');
  return `<button class="st-card st-nasce" data-corso="${c.id}" style="${stCol(c.materia)}">
    <span class="st-cover${c.cover?'':' arte'}">
      ${dentroCover}
      <span class="st-pill">${c.uniEti}</span>
      <span class="st-durata">${T(c.tot.it,c.tot.en)}</span>
    </span>
    <span class="st-corpo">
      <span class="st-tit">${esc(c.tit)}</span>
      <span class="st-prof"><span class="tondo">${c.profTag}</span>${esc('Prof. '+c.prof)} \u00b7 ${c.code}</span>
      <span class="st-meta">${meta}</span>
      <span class="st-piede">
        <span class="st-btn">${visita?T('Riprendi','Resume'):T('Inizia','Start')} \u2192</span>
        <span class="st-salva" data-salva="${c.id}">\uFF0B ${T('Piano','Plan')}</span>
      </span>
    </span>
  </button>`;
}
function stDiveHTML(v){
  return `<button class="st-dive st-nasce" data-dive="${v.id}">
    <span class="q"><img src="${stThumb(v.yt)}" alt="" loading="lazy" ${MISURA_MINI}><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
    <span class="testi">
      <span class="kick">${v.kick}</span>
      <span class="tit">${esc(v.tit)}</span>
      <span class="sub">${T(v.sub.it,v.sub.en)}</span>
    </span>
    <span class="d">${v.d}</span>
  </button>`;
}
function stHeroHTML(){return '';}
const stSkelCard='<div class="st-skel"><div class="cv"></div><div class="pd"><div class="b t"></div><div class="b m"></div><div class="b c"></div></div></div>';
const stSkelRiga='<div class="st-skel riga"><div class="q"></div><div class="pd"><div class="b t" style="width:62%"></div><div class="b m"></div></div></div>';

let stPronta=false,stNato=false;
function renderStudy(){
  if(stPronta)return; stPronta=true;
  const chips=[['all',T('Tutte','All'),'']]
    .concat(ST_GRUPPI.map(gr=>[gr.g,T(gr.it,gr.en),'--sf:var('+ST_COL[gr.g][0]+');--sc:var('+ST_COL[gr.g][1]+')']))
    .concat([['dive',T('Approfondimenti','Deep dives'),'--sf:var(--pesca);--sc:var(--pesca-s)']]);
  document.getElementById('st-chips').innerHTML=`<span class="stc-eti">${T('Materie','Subjects')}</span>`+chips.map(([f,t,st],i)=>
    `<button class="chip" data-f="${f}" aria-pressed="${i===0}" style="${st}">${t}</button>`).join('');
  document.getElementById('st-vie').innerHTML=[['prof','From Professors'],['stud','From Students']]
    .map(([v,x],i)=>`<button class="via" data-via="${v}" aria-pressed="${i===0}">${x}</button>`).join('');
  stAteneiRender();
  const gruppi=ST_GRUPPI.map(gr=>{
    const n=ST_CORSI.filter(c=>c.materia===gr.g).length;
    return `<div data-g="${gr.g}">
      <div class="st-eti" style="--pf:var(${ST_COL[gr.g][1]})"><i></i><b>${T(gr.it,gr.en)}</b><span>\u00b7 ${gr.sub}</span></div>
      <div class="st-griglia" data-slot="${gr.g}">${stSkelCard.repeat(n)}</div>
    </div>`;
  }).join('');
  document.getElementById('st-gruppi').innerHTML=gruppi+`
    <div data-g="dive"><div class="st-eti" style="--pf:var(--pesca-s)"><i></i><b>${T('Approfondimenti','Deep dives')}</b><span>\u00b7 ${T('seminari e lezioni scelte','talks & picked lectures')}</span></div>
      <div data-slot="dive">${stSkelRiga.repeat(ST_DIVES.length)}</div></div>`
    +`<div data-g="stud"><div data-slot="stud">${stSkelRiga.repeat(ST_STUD.length+ST_STUD_PROSSIMI.length)}</div></div>`;
  if(typeof ST_VIA!=='undefined'&&ST_VIA)stFiltra();
}
function stBarre(dentro){
  const raf=(typeof requestAnimationFrame==='function')?requestAnimationFrame:(f=>setTimeout(f,16));
  raf(()=>raf(()=>{
    dentro.querySelectorAll('[data-bar]').forEach(b=>{b.style.width=b.dataset.bar+'%';});
  }));
}
function studyReveal(){
  /* Due condizioni prima di alzare la bandierina: i dati devono essere
     arrivati e le caselle devono esistere. Senza questo controllo, una
     chiamata anticipata bruciava il disegno per tutta la visita. */
  if(stNato)return;
  if(!ST_GRUPPI.length||!document.querySelector('[data-slot="dive"]'))return;
  stNato=true;
  ST_GRUPPI.forEach((gr,i)=>{
    setTimeout(()=>{
      const s=document.querySelector('[data-slot="'+gr.g+'"]');
      if(!s)return;
      s.innerHTML=ST_CORSI.filter(c=>c.materia===gr.g).map(stCorsoHTML).join('');
      stBarre(s);
    /* Lo scaglionamento serve a far entrare i gruppi uno dopo l'altro,
       non a far aspettare. Prima erano 640 ms fermi più 170 per gruppo:
       oltre un secondo di pagina vuota **dopo** che i dati erano già
       arrivati, che sembrava un caricamento mai finito. Adesso il primo
       gruppo compare subito e gli altri lo seguono a ruota. */
    },i*70);
  });
  setTimeout(()=>{
    const d=document.querySelector('[data-slot="dive"]');
    if(d)d.innerHTML=ST_DIVES.map(stDiveHTML).join('');
    const sl=document.querySelector('[data-slot="stud"]');
    if(sl)sl.innerHTML=ST_STUD.map(stStudHTML).join('')+ST_STUD_PROSSIMI.map(stPrestoHTML).join('');
  },ST_GRUPPI.length*70);
}

/* ── copertine che non arrivano ────────────────────────────────────
   Le anteprime vengono da YouTube: ogni tanto una non risponde, o il
   video e' stato ritirato. Senza ripiego resta un riquadro vuoto, e
   sembra che la sezione non abbia caricato — che e' esattamente quello
   che si vedeva.

   Il foglio del corso questo ripiego ce l'aveva gia'; la vetrina no.
   Qui si ascolta in fase di cattura perche' l'errore di un'immagine non
   risale da solo fino al contenitore. */
document.getElementById('st-gruppi').addEventListener('error', e => {
  const img = e.target;
  if (!img || img.tagName !== 'IMG') return;
  const cover = img.closest('.st-cover, .q');
  if (!cover) return;
  const scheda = img.closest('[data-corso]');
  const corso = scheda && ST_CORSI.find(c => c.id === scheda.dataset.corso);
  cover.classList.add('arte');
  cover.innerHTML = `<b>${esc((corso && (corso.arte || corso.code)) || 'ERUA')}</b>`;
}, true);

/* --- foglio corso --- */
const stVelo=document.getElementById('st-velo'),stSheet=document.getElementById('st-sheet');
let stStato=null;
function stEmbedSrc(c,l){
  return l.yt ? VIDEO.incorpora+'/embed/'+l.yt+'?autoplay=1&rel=0'
    : VIDEO.incorpora+'/embed/videoseries?list='+c.playlist+'&index='+l.idx+'&autoplay=1&rel=0';
}
function stFacciata(){
  const p=document.getElementById('stsh-player'); if(!p||!stStato)return;
  const {corso,dive,lezIdx}=stStato;
  const l=corso?stLezDi(corso,lezIdx):null;
  const idThumb=dive?dive.yt:((l&&l.yt)||corso.cover);
  const cap=dive?dive.tit:('L'+(lezIdx+1)+' — '+l.t);
  const arte=`<span class="arte-p"><b>${esc(dive?'ERUA':(corso.arte||corso.code))}</b></span>`;
  const sfondo=idThumb?`<img src="${stThumb(idThumb,true)}" alt="" decoding="async">`:arte;
  p.innerHTML=`${sfondo}
    <button class="stsh-play" id="stsh-go" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></button>
    <div class="velo-t">${esc(cap)}</div>`;
  const img=p.querySelector('img');
  if(img)img.addEventListener('error',()=>{try{img.outerHTML=arte;}catch(e){}},{once:true});
  stStato.playing=false;
}
function stSuona(){
  const p=document.getElementById('stsh-player'); if(!p||!stStato)return;
  const {corso,dive,lezIdx}=stStato;
  const src=dive?(VIDEO.incorpora+'/embed/'+dive.yt+'?autoplay=1&rel=0'):stEmbedSrc(corso,stLezDi(corso,lezIdx));
  p.innerHTML=`<iframe src="${src}" title="Player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  stStato.playing=true;
}
/* --- elenco completo delle lezioni: le 6 nominate + le altre generate
       dalla playlist (si aprono col numero d'ordine, titolo generico) --- */
function stLezTotN(c){
  const m=String(c.tot.it).match(/\d+/);
  const dichiarate=m?+m[0]:c.lez.length;
  const massimo=Math.max.apply(null,c.lez.map((l,i)=>l.idx||i+1));
  return Math.max(dichiarate,massimo);
}
function stLezFull(c){
  if(c._full)return c._full;
  const mappa={};
  c.lez.forEach((l,i)=>{mappa[l.idx||i+1]=l;});
  const out=[];
  const tot=stLezTotN(c);
  for(let n=1;n<=tot;n++){
    const l=mappa[n];
    out.push(l?{t:l.t,d:l.d,yt:l.yt,idx:l.idx||n}
              :{t:T('Lezione','Lecture')+' '+n,d:'',idx:n,gen:true});
  }
  c._full=out;
  return out;
}
function stLezDi(c,i){
  const f=stLezFull(c);
  return f[Math.min(Math.max(i||0,0),f.length-1)];
}
function stResumeIdx(c){
  const v=stVisitaDi(c.id);
  if(v)return Math.max(0,Math.min(v.lezIdx,stLezFull(c).length-1));
  const l=c.lez[c.resume];
  return ((l&&l.idx)||c.resume+1)-1;
}
/* --- visite vere ai corsi: sostituiscono il campo statico c.resume.
       Ogni apertura di una lezione registra corso+indice+data, solo
       sul dispositivo (nessun invio a un server). --- */
const visitaKey=id=>'ec_visita::'+id;
function stVisitaSalva(corsoId,lezIdx){
  try{localStorage.setItem(visitaKey(corsoId),JSON.stringify({lezIdx:lezIdx,quando:Date.now()}));}catch(e){}
}
function stVisitaDi(corsoId){
  try{
    const v=JSON.parse(localStorage.getItem(visitaKey(corsoId))||'null');
    if(v&&typeof v.lezIdx==='number'&&typeof v.quando==='number')return v;
  }catch(e){}
  return null;
}
function stVisitaData(corsoId){
  const v=stVisitaDi(corsoId);if(!v)return null;
  const d=new Date(v.quando);
  const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  return dataBreve(iso);
}
function stSegnaRighe(){
  stSheet.querySelectorAll('.stsh-r').forEach(r=>r.classList.toggle('on',+r.dataset.lez===stStato.lezIdx));
}
const ST_PAG=7;
function stRenderLez(){
  const c=stStato.corso,full=stLezFull(c);
  const pagine=Math.max(1,Math.ceil(full.length/ST_PAG));
  stStato.pag=Math.min(Math.max(stStato.pag||0,0),pagine-1);
  const da=stStato.pag*ST_PAG;
  const el=document.getElementById('stsh-lez');if(!el)return;
  el.innerHTML=full.slice(da,da+ST_PAG).map((l,k)=>{
    const i=da+k;
    return `<button class="stsh-r${l.gen?' gen':''}" data-lez="${i}" style="${stCol(c.materia)}">
      <span class="n">L${i+1}</span><span class="t">${esc(l.t)}</span>
      <span class="d">${l.d||''}</span><svg viewBox="0 0 24 24"><path d="M10 8.5l6 3.5-6 3.5z"/><circle cx="12" cy="12" r="9"/></svg>
    </button>`;
  }).join('');
  const pg=document.getElementById('stsh-pag');
  if(pg){
    pg.style.display=pagine>1?'':'none';
    pg.querySelector('.pg-n').textContent=(stStato.pag+1)+' / '+pagine;
    pg.querySelector('[data-pg="-1"]').disabled=(stStato.pag===0);
    pg.querySelector('[data-pg="1"]').disabled=(stStato.pag>=pagine-1);
  }
  stSegnaRighe();
}
function stApriCorso(id,lezIdx){
  const c=ST_CORSI.find(x=>x.id===id); if(!c)return;
  const via=(typeof lezIdx==='number')?lezIdx:stResumeIdx(c);
  stStato={corso:c,lezIdx:via,pag:Math.floor(via/ST_PAG),playing:false};
  stSheet.innerHTML=`<div class="presa"></div>
    <div class="stsh-testa" style="${stCol(c.materia)}">
      <div style="min-width:0">
        <div class="kick">${c.uniEti} · ${c.code}</div>
        <div class="tit">${esc(c.tit)}</div>
        <div class="sub">${esc('Prof. '+c.prof)} · ${T(c.tot.it,c.tot.en)}</div>
      </div>
      <button class="stsh-x" data-chiudi aria-label="${T('Chiudi','Close')}">✕</button>
    </div>
    <div class="stsh-corpo">
      <aside class="stsh-sx" style="${stCol(c.materia)}">
        <div class="stsh-eti">${T('Lezioni','Lessons')} · <b>${stLezFull(c).length}</b></div>
        <div class="stsh-lez" id="stsh-lez"></div>
        <div class="stsh-pag" id="stsh-pag">
          <button class="pg-fr" data-pg="-1" aria-label="${T('Precedenti','Previous')}">‹</button>
          <span class="pg-n"></span>
          <button class="pg-fr" data-pg="1" aria-label="${T('Successive','Next')}">›</button>
        </div>
      </aside>
      <div class="stsh-dx">
        <div class="stsh-player" id="stsh-player"></div>
        <p class="stsh-desc">${T(c.desc.it,c.desc.en)}</p>
      </div>
    </div>`;
  stRenderLez();
  stMostra();
}
function stApriDive(id){
  const v=ST_DIVES.find(x=>x.id===id); if(!v)return;
  stStato={dive:v,playing:false};
  stSheet.innerHTML=`<div class="presa"></div>
    <div class="stsh-testa" style="${stCol('dive')}">
      <div style="min-width:0">
        <div class="kick">${v.kick}</div>
        <div class="tit">${esc(v.tit)}</div>
        <div class="sub">${T(v.sub.it,v.sub.en)} \u00b7 ${v.d}</div>
      </div>
      <button class="stsh-x" data-chiudi aria-label="${T('Chiudi','Close')}">\u2715</button>
    </div>
    <div class="stsh-player" id="stsh-player"></div>
    <p class="stsh-desc">${T(v.desc.it,v.desc.en)}</p>`;
  stMostra();
}
function stMostra(){
  stFacciata(); if(stStato.corso)stSegnaRighe();
  stVelo.classList.add('on');stSheet.classList.add('on');
  stSheet.scrollTop=0;document.body.classList.add('st-blocco');
}
function stChiudi(){
  stVelo.classList.remove('on');stSheet.classList.remove('on');
  document.body.classList.remove('st-blocco');
  setTimeout(()=>{stSheet.innerHTML='';stStato=null;},380);
}
document.getElementById('p-study').addEventListener('click',e=>{
  const salva=e.target.closest('[data-salva]');
  if(salva){e.stopPropagation();toast(T('Salvato nel tuo piano di studio','Saved to your study plan'));return;}
  const card=e.target.closest('[data-corso]');
  if(card){stApriCorso(card.dataset.corso);return;}
  const dv=e.target.closest('[data-dive]');
  if(dv){stApriDive(dv.dataset.dive);return;}
  const sx=e.target.closest('[data-stud]');
  if(sx){const v=ST_STUD.find(x=>x.id===sx.dataset.stud);if(v)apriAula({dive:v});return;}
  const ch=e.target.closest('.chip[data-f]');
  if(ch){ST_MAT=ch.dataset.f;stFiltra();return;}
  const vb=e.target.closest('#st-vie .via');
  if(vb){ST_VIA=vb.dataset.via;ST_MAT='all';stFiltra();return;}
});
stSheet.addEventListener('click',e=>{
  if(e.target.closest('[data-chiudi]')){stChiudi();return;}
  if(e.target.closest('#stsh-go')){
    if(!stStato)return;
    if(stStato.dive)apriAula({dive:stStato.dive});
    else apriAula({corso:stStato.corso,lezIdx:stStato.lezIdx});
    return;
  }
  const pg=e.target.closest('[data-pg]');
  if(pg&&stStato&&stStato.corso){
    stStato.pag=(stStato.pag||0)+(+pg.dataset.pg);
    stRenderLez();
    return;
  }
  const r=e.target.closest('[data-lez]');
  if(r&&stStato&&stStato.corso){
    stStato.lezIdx=+r.dataset.lez;stSegnaRighe();
    apriAula({corso:stStato.corso,lezIdx:stStato.lezIdx});
  }
});
stVelo.addEventListener('click',stChiudi);
addEventListener('keydown',e=>{if(e.key!=='Escape')return;const au=document.getElementById('st-aula');if(au&&au.classList.contains('on')){chiudiAula();return;}if(stSheet.classList.contains('on'))stChiudi();});

/* Il disegno della vetrina non parte più da qui.
   Nel file unico i dati erano già in memoria, quindi bastava un timer:
   si entrava in Learn, dopo 150 ms si disegnava. Adesso i dati vanno
   chiesti, e quel timer partiva prima che arrivassero — le caselle non
   esistevano ancora, il disegno andava in errore, ma la bandierina
   "già fatto" restava alzata. Risultato: schede vuote e nessun video.
   Ci pensa `avvia`, che disegna quando i dati ci sono. */



function stStudHTML(v){
  return `<button class="st-dive st-nasce" data-stud="${v.id}">
    <span class="q"><img src="${stThumb(v.yt)}" alt="" loading="lazy" ${MISURA_MINI}><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
    <span class="testi">
      <span class="kick" style="color:var(--rosa-s)">${v.kick} <i class="st-segna">${T('segnaposto','placeholder')}</i></span>
      <span class="tit">${esc(v.tit)}</span>
      <span class="sub">${T(v.sub.it,v.sub.en)}</span>
    </span>
    <span class="d">${v.d}</span>
  </button>`;
}
function stPrestoHTML(p){
  return `<div class="st-presto st-nasce"><span class="ico">${p.ico}</span>
    <span class="testi"><b>${T(p.t.it,p.t.en)}</b><span>${T(p.d.it,p.d.en)}</span></span>
    <span class="presto-pill">${T('In arrivo','Coming soon')}</span></div>`;
}

/* --- filtro della vetrina: via (chi parla) separata dalla materia --- */
var ST_VIA='prof',ST_MAT='all';
function stFiltra(){
  document.querySelectorAll('#st-vie .via').forEach(b=>{
    b.setAttribute('aria-pressed',String(b.dataset.via===ST_VIA));});
  const chips=document.getElementById('st-chips');
  if(chips)chips.style.display=(ST_VIA==='stud')?'none':'';
  const atenei=document.getElementById('st-atenei');
  if(atenei)atenei.style.display='';
  document.querySelectorAll('#st-chips .chip').forEach(b=>{
    b.setAttribute('aria-pressed',String(b.dataset.f===ST_MAT));});
  document.querySelectorAll('#st-gruppi [data-g]').forEach(g=>{
    const id=g.dataset.g;let vis;
    if(id==='stud')vis=(ST_VIA==='stud');
    else vis=(ST_VIA==='prof')&&(ST_MAT==='all'||id===ST_MAT);
    g.style.display=vis?'':'none';});
}
/* la prima applicazione dei filtri la fa `renderStudy`, dopo che i dati
   sono arrivati: chiamarla qui girerebbe a vuoto */
/* riga loghi ateneo in Learn: stessa vetrina di Social/Magazine, ma qui e'
   un segnaposto senza effetto — cliccabile, non filtra ancora nulla, in
   attesa dei corsi veri degli 8 atenei ERUA. */
function stAteneiRender(){
  const el=document.getElementById('st-atenei');if(!el)return;
  el.innerHTML=ATENEI.map(u=>
    `<button class="storia" data-uni="${u}" aria-pressed="false" title="${u}">
       <span class="anello">${stemma(u,'avatar')}</span>
       <span class="citta">${CITTA[u]||u}</span>
     </button>`).join('');
}
document.getElementById('st-atenei').addEventListener('click',e=>{
  const b=e.target.closest('.storia[data-uni]');if(!b)return;
  b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));
});

/* ── l'aula ────────────────────────────────────────────────────────
   È il pezzo più pesante di tutto il sito: video, trascrizioni, foglio
   degli appunti. Si scarica quando qualcuno apre davvero una lezione,
   non prima. */
async function apriAula(o) {
  /* Anche il suo foglio di stile: 31 KB che prima stavano in
     `index.html` e bloccavano il primo disegno di ogni visita, comprese
     quelle di chi in un'aula non entra mai. Era già l'ultimo dei dieci,
     quindi chiederlo qui non ne cambia la posizione nella cascata. */
  const [modulo] = await Promise.all([import('./aula.js'), foglio('aula')]);
  await modulo.apri(o);
}

async function chiudiAula() {
  const a = await chiedi('aula');
  a.chiudi();
}

/* ── avvio della sezione ───────────────────────────────────────────── */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;
  const d = await dati('didattica');
  ST_GRUPPI = d.gruppi;
  ST_CORSI = d.corsi;
  ST_DIVES = d.approfondimenti;
  ST_STUD = d.studenti;
  ST_STUD_PROSSIMI = d.inArrivo;
  renderStudy();
  studyReveal();
}

/* Quello che l'aula chiede alla didattica: sapere qual è la lezione
   aperta, segnare la visita, sapere se il foglio del corso è ancora
   sotto, e tornarci. */
offre('didattica', {
  avvia,
  lezioneDi: (c, i) => stLezDi(c, i),
  visitaSalva: (corsoId, lezIdx) => stVisitaSalva(corsoId, lezIdx),
  apriCorso: (id, lezIdx) => stApriCorso(id, lezIdx),
  foglioAperto: () => stSheet.classList.contains(on),
  colore: (materia) => stCol(materia),
  schedaCorso: (c) => stCorsoHTML(c),
  apriApprofondimento: (id) => stApriDive(id),
});

