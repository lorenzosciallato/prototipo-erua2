/* ERUA connect — l'aula
   ==================================================================
   Video, trascrizione e foglio degli appunti in una schermata sola. Gli
   scomparti si scambiano di posto e si spengono: l'aula la costruisce
   chi la usa, e la disposizione resta sul dispositivo.

   Quello che si scrive qui non esce dal browser: sta in localStorage,
   sul dispositivo di chi studia, e non passa da nessun server
   (riferimento.md §2.10). Anche per questo la stampa produce un PDF in
   locale invece di mandare il foglio da qualche parte.
*/

import { T, esc, dati, offre, chiedi, toast } from './nucleo.js';
import { CONFIG } from '../configurazione.js';

/* I video: origini dichiarate una volta sola nella configurazione, così
   la CSP e l'informativa hanno un elenco da cui copiare (§3.8, §7.4). */
const VIDEO = CONFIG.serviziEsterni.video;

/* La didattica: l'aula si apre sempre da lì, quindi quando questo
   modulo gira quella è già caricata. Passare dal registro invece di
   importarla evita che i due moduli si importino a vicenda. */
let DID = null;
chiedi('didattica').then(d => { DID = d; });

/* ── trascrizioni ──────────────────────────────────────────────────
   Una lezione trascritta pesa fra i 18 e i 36 KB: tenerle tutte nel
   codice voleva dire farle scaricare anche a chi non apre mai l'aula.
   Adesso c'è un indice leggero, e il testo della singola lezione
   arriva quando quella lezione viene aperta. */
let INDICE_TR = {};
const ST_TRANS = {};

async function caricaTrascrizione(chiave) {
  if (ST_TRANS[chiave] !== undefined) return ST_TRANS[chiave];
  const file = INDICE_TR[chiave];
  if (!file) { ST_TRANS[chiave] = null; return null; }
  try {
    ST_TRANS[chiave] = await dati('trascrizioni/' + file.replace(/\.json$/, ''));
  } catch (err) {
    console.error('trascrizione non caricata:', chiave, err);
    ST_TRANS[chiave] = null;
  }
  return ST_TRANS[chiave];
}

const AULA={corso:null,dive:null,lezIdx:0,board:[],ev:{},chiave:''};
const auEl=id=>document.getElementById(id);
const bdKey=()=>'ec_board::'+AULA.chiave;
const evKey=()=>'ec_ev::'+AULA.chiave;
const auMMSS=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,'0');return h?h+':'+String(m).padStart(2,'0')+':'+x:m+':'+x;};
function auSalva(){try{localStorage.setItem(bdKey(),JSON.stringify(AULA.board));}catch(e){}}
function auSalvaEv(){try{localStorage.setItem(evKey(),JSON.stringify(AULA.ev));}catch(e){}}
function auCarica(){
  AULA.board=[];AULA.ev={};
  try{const b=localStorage.getItem(bdKey());if(b)AULA.board=auMigra(JSON.parse(b)||[]);}catch(e){}
  try{const v=localStorage.getItem(evKey());if(v)AULA.ev=JSON.parse(v)||{};}catch(e){}
}
function auEmbedBase(){
  if(AULA.dive)return VIDEO.incorpora+'/embed/'+AULA.dive.yt+'?autoplay=1&rel=0';
  const c=AULA.corso,l=DID.lezioneDi(c,AULA.lezIdx);
  return l.yt?(VIDEO.incorpora+'/embed/'+l.yt+'?autoplay=1&rel=0')
    :(VIDEO.incorpora+'/embed/videoseries?list='+c.playlist+'&index='+l.idx+'&autoplay=1&rel=0');
}
/* --- player con l'API ufficiale di YouTube (player sul dominio no-cookie).
   Serve per tre cose chieste: salti ±10/±30 s, ripresa da dove eri
   rimasto e karaoke della trascrizione. Lo script dell'API parte solo
   quando si apre l'aula (tutto nasce dal clic, come da decisione sui
   contenuti). Se non arriva — per esempio offline — si torna al
   riquadro semplice e i comandi si nascondono. */
let YT_ATTESA=null;
function ytCarica(){
  if(YT_ATTESA)return YT_ATTESA;
  YT_ATTESA=new Promise(res=>{
    if(window.YT&&window.YT.Player){res(true);return;}
    window.onYouTubeIframeAPIReady=()=>res(true);
    const s=document.createElement('script');
    s.src=VIDEO.api;
    s.addEventListener('error',()=>res(false));
    document.head.appendChild(s);
    setTimeout(()=>res(!!(window.YT&&window.YT.Player)),5000);
  });
  return YT_ATTESA;
}
const riprKey=()=>'ec_riprendi::'+AULA.chiave;
function auPlayerVia(){
  if(AULA.timer){clearInterval(AULA.timer);AULA.timer=null;}
  if(AULA.player){try{AULA.player.destroy&&AULA.player.destroy();}catch(e){}AULA.player=null;}
  AULA.kcap=AULA.kpar=null;
  const cm=auEl('aula-comandi');if(cm)cm.classList.remove('via');
}
function auPlayerSemplice(start){
  const box=auEl('aula-player');if(!box)return;
  box.innerHTML='<iframe src="'+auEmbedBase()+(start?('&start='+Math.floor(start)):'')+'" title="Player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  const cm=auEl('aula-comandi');if(cm)cm.classList.add('via');
}
function auPlayer(start){
  auPlayerVia();
  const box=auEl('aula-player');if(!box)return;
  box.innerHTML='<div id="yt-nido"></div>';
  const chiave=AULA.chiave;
  ytCarica().then(ok=>{
    if(AULA.chiave!==chiave||!document.getElementById('yt-nido'))return;
    if(!ok){auPlayerSemplice(start);return;}
    const vars={autoplay:1,rel:0,playsinline:1};
    let vid;
    if(AULA.dive)vid=AULA.dive.yt;
    else{
      const l=DID.lezioneDi(AULA.corso,AULA.lezIdx);
      if(l.yt)vid=l.yt;
      else{vars.listType='playlist';vars.list=AULA.corso.playlist;vars.index=l.idx-1;}
    }
    if(start)vars.start=Math.floor(start);
    try{
      AULA.player=new YT.Player('yt-nido',{
        host:VIDEO.incorpora,
        width:'100%',height:'100%',
        videoId:vid,playerVars:vars,
        events:{onReady:auOrologio,onStateChange:auOrologio}
      });
    }catch(e){auPlayerSemplice(start);}
  });
}
function auTempo(){
  try{return (AULA.player&&AULA.player.getCurrentTime)?AULA.player.getCurrentTime():null;}
  catch(e){return null;}
}
function auOrologio(){
  if(AULA.timer)return;
  let ultimoSalva=0;
  AULA.timer=setInterval(()=>{
    const t=auTempo();if(t==null)return;
    /* il punto di ripresa non serve salvarlo 4 volte al secondo:
       basta una volta ogni ~3s, cosi' l'intervallo puo' restare
       fitto per il karaoke senza sprecare scritture su disco. */
    const ora=Date.now();
    if(t>15&&ora-ultimoSalva>3000){ultimoSalva=ora;try{localStorage.setItem(riprKey(),String(Math.floor(t)));}catch(e){}}
    auKaraoke(t);
  },250);
}
function auSeek(sec){
  if(AULA.player&&AULA.player.seekTo){
    try{
      AULA.player.seekTo(sec,true);
      try{localStorage.setItem(riprKey(),String(Math.floor(sec)));}catch(e){}
      return;
    }catch(e){}
  }
  auPlayer(sec);
}
/* karaoke: il capitolo e il paragrafo che il video sta attraversando si
   illuminano e la trascrizione scorre da sola (si ferma se scorri tu). */
function auKaraoke(t){
  if(AULA.amb!=='prof'||!AULA.tr)return;
  const box=auEl('tr-corpo');if(!box)return;
  const cap=AULA.tr.cap;if(!cap||!cap.length)return;
  /* piccolo anticipo: l'evidenziazione e lo scorrimento hanno una loro
     latenza, quindi guardiamo mezzo secondo "avanti" cosi' il capitolo
     si accende puntuale invece che sempre un attimo dopo. */
  const tp=t+0.5;
  let ci=0;
  for(let i=0;i<cap.length;i++){if(tp>=cap[i].s)ci=i;}
  const fine=(ci+1<cap.length)?cap[ci+1].s:(cap[ci].s+300);
  const np=Math.max(1,cap[ci].par.length);
  let pi=Math.floor((tp-cap[ci].s)/Math.max(1,fine-cap[ci].s)*np);
  pi=Math.min(np-1,Math.max(0,pi));
  if(AULA.kcap===ci&&AULA.kpar===pi)return;
  AULA.kcap=ci;AULA.kpar=pi;
  box.querySelectorAll('.ora').forEach(x=>x.classList.remove('ora'));
  const capEl=box.querySelector('.tr-cap[data-ci="'+ci+'"]');
  const parEl=box.querySelector('.tr-p[data-cap="'+ci+'"][data-p="'+pi+'"]');
  if(capEl)capEl.classList.add('ora');
  if(parEl){
    parEl.classList.add('ora');
    if(Date.now()-(AULA.scrolloMano||0)>6000){
      AULA.scrolloAuto=Date.now();
      try{parEl.scrollIntoView({block:'center',behavior:'smooth'});}catch(e){}
    }
  }
}
auEl('aula-comandi').addEventListener('click',e=>{
  const b=e.target.closest('[data-salto]');if(!b)return;
  const t=auTempo();
  if(t==null){toast(T('I comandi si accendono appena il video parte.','Controls come alive once the video starts.'));return;}
  auSeek(Math.max(0,t+(+b.dataset.salto)));
});
auEl('tr-corpo').addEventListener('scroll',()=>{
  if(Date.now()-(AULA.scrolloAuto||0)>900)AULA.scrolloMano=Date.now();
},{passive:true});
function auTransKey(){return AULA.dive?('d:'+AULA.dive.id):(AULA.corso.id+':'+AULA.lezIdx);}
async function auRenderTrans(){
  const box=auEl('tr-corpo');
  const chiave=auTransKey();
  const tr=await caricaTrascrizione(chiave);
  /* nel frattempo può essere cambiata lezione: se è così, questo
     disegno è vecchio e va buttato */
  if(chiave!==auTransKey())return;
  if(!tr){AULA.tr=null;box.innerHTML='';return;}
  AULA.tr=tr;AULA.kcap=AULA.kpar=null;
  auEl('tr-fonte').textContent=tr.fonte;
  box.innerHTML=tr.cap.map((c,ci)=>
    `<button class="tr-cap" data-ci="${ci}" data-sec="${c.s}"><span class="tt">${auMMSS(c.s)}</span><b>${esc(c.t)}</b><i class="tr-onda" aria-hidden="true"></i></button>`+
    c.par.map((p,pi)=>{
      const sv=AULA.ev[ci+':'+pi];
      return `<p class="tr-p" data-cap="${ci}" data-p="${pi}">${sv||esc(p)}</p>`;
    }).join('')
  ).join('');
  box.scrollTop=0;
}
/* --- il foglio: un bloc notes unico, sempre scrivibile.
   Le sottolineature dalla trascrizione atterrano a capo come citazioni,
   con la freccia accanto per l'appunto in linea. Tutto viene salvato e
   ricostruito come TESTO, mai come codice (regola P3). */
function auConta(){
  const n=(AULA.board||[]).filter(c=>c.t==='ev').length;
  auEl('bd-conta').textContent=n?(n+' '+T(n===1?'sottolineatura':'sottolineature',n===1?'highlight':'highlights')):'';
}
function auMigra(v){
  if(!Array.isArray(v))return [];
  return v.map(c=>{
    if(c&&(c.t==='ev'||c.t==='txt'))return c;
    if(c&&c.tipo==='ev')return {t:'ev',testo:c.testo||'',sec:(typeof c.sec==='number')?c.sec:null,nota:c.nota||''};
    if(c&&c.tipo==='nota')return {t:'txt',x:c.nota||''};
    return {t:'txt',x:''};
  });
}
function auRigaEv(testo,nota){
  const r=document.createElement('div');r.className='zn-riga';
  const chip=document.createElement('span');chip.className='zn-ev';chip.setAttribute('contenteditable','false');
  const fr=document.createElement('span');fr.className='zn-frase';fr.textContent=testo;chip.appendChild(fr);
  const x=document.createElement('button');x.type='button';x.className='zn-x';
  x.setAttribute('aria-label',T('Togli dal foglio','Remove from the sheet'));x.textContent='✕';
  chip.appendChild(x);
  const frec=document.createElement('span');frec.className='zn-frec';frec.setAttribute('contenteditable','false');frec.textContent='→';
  r.appendChild(chip);r.appendChild(frec);
  r.appendChild(document.createTextNode(nota&&nota.length?nota:' '));
  return r;
}
function auRenderBoard(){
  const f=auEl('bd-foglio');if(!f)return;
  f.innerHTML='';
  (AULA.board||[]).forEach(c=>{
    if(c.t==='ev'){f.appendChild(auRigaEv(c.testo,c.nota));return;}
    String(c.x||'').split('\n').forEach(ln=>{
      const d=document.createElement('div');d.className='zn-txt';
      if(ln)d.textContent=ln;else d.appendChild(document.createElement('br'));
      f.appendChild(d);
    });
  });
  if(!f.childNodes.length){
    const d=document.createElement('div');d.className='zn-txt';
    d.appendChild(document.createElement('br'));f.appendChild(d);
  }
  auConta();
}
function auSerializza(){
  const f=auEl('bd-foglio');if(!f)return;
  const out=[];let buf=null;
  const chiudi=()=>{if(buf!=null){out.push({t:'txt',x:buf.join('\n')});buf=null;}};
  const notaDi=r=>{
    let s='';
    r.childNodes.forEach(k=>{
      if(k.nodeType===3)s+=k.textContent;
      else if(k.nodeType===1&&!k.classList.contains('zn-ev')&&!k.classList.contains('zn-frec'))s+=k.textContent;
    });
    return s.replace(/ /g,' ').replace(/\s+$/,'').replace(/^\s+/,'');
  };
  f.childNodes.forEach(n=>{
    if(n.nodeType===3){if(buf==null)buf=[];buf.push(n.textContent);return;}
    if(n.nodeType!==1)return;
    const eChip=n.classList&&n.classList.contains('zn-ev');
    const chip=eChip?n:(n.querySelector?n.querySelector('.zn-ev'):null);
    if(chip){
      chiudi();
      const fr=chip.querySelector('.zn-frase');
      out.push({t:'ev',
        testo:fr?fr.textContent:'',
        nota:eChip?'':notaDi(n)});
    }else{
      if(buf==null)buf=[];
      buf.push((n.textContent||'').replace(/ /g,' '));
    }
  });
  chiudi();
  AULA.board=out;
  auSalva();auConta();
}
let bdRit=null;
function auSalvaPoi(){clearTimeout(bdRit);bdRit=setTimeout(auSerializza,350);}
function auInserisciEv(testo){
  const f=auEl('bd-foglio');if(!f)return;
  const r=auRigaEv(testo,'');
  f.appendChild(r);
  auSerializza();
  try{
    f.focus();
    const fine=r.lastChild;
    const rng=document.createRange();
    rng.setStart(fine,fine.textContent.length);rng.collapse(true);
    const sel=window.getSelection();sel.removeAllRanges();sel.addRange(rng);
    r.scrollIntoView({block:'nearest'});
  }catch(e){}
}
function apriAula(o){
  AULA.corso=o.corso||null;AULA.dive=o.dive||null;AULA.lezIdx=o.lezIdx||0;
  AULA.chiave=AULA.dive?('d:'+AULA.dive.id):(AULA.corso.id+':'+AULA.lezIdx);
  const testa=auEl('aula-kick'),tit=auEl('aula-tit');
  if(AULA.dive){
    testa.textContent=AULA.dive.kick;tit.textContent=AULA.dive.tit;
    testa.style.cssText=DID.colore('dive');
  }else{
    const c=AULA.corso,l=DID.lezioneDi(c,AULA.lezIdx);
    testa.textContent=c.uniEti+' \u00b7 '+c.code+' \u00b7 L'+(AULA.lezIdx+1);
    tit.textContent=l.t;
    testa.style.cssText=DID.colore(c.materia);
  }
  AULA.amb=(AULA.dive&&AULA.dive.stud)?'stud':'prof';
  if(AULA.corso)DID.visitaSalva(AULA.corso.id,AULA.lezIdx);
  const radice=auEl('st-aula');
  radice.style.cssText=AULA.dive?DID.colore(AULA.dive.stud?'stud':'dive'):DID.colore(AULA.corso.materia);
  radice.classList.toggle('amb-stud',AULA.amb==='stud');
  auCarica();
  let daDove=0;
  try{const r=+(localStorage.getItem('ec_riprendi::'+AULA.chiave)||0);if(r>15)daDove=Math.max(0,r-3);}catch(e){}
  auPlayer(daDove);
  if(daDove)toast(T('Riprendi da ','Resuming from ')+auMMSS(daDove));
  if(AULA.amb==='prof'){if(auHaTrans())auRenderTrans();else{AULA.tr=null;const tb=auEl('tr-corpo');if(tb)tb.innerHTML='';}auRenderBoard();}
  scrCarica();scrApplica(false);
  radice.classList.add('on');
  document.body.classList.add('st-blocco');
  auEl('aula-corpo')&&(auEl('aula-corpo').scrollTop=0);
  tutForse();
}
/* il mini-tutorial parte a ogni apertura di un'aula (lato professori);
   resta comunque richiamabile col "?" e chiudibile con "Got it". */
/* ── Animazione del mini-tutorial (SVG inline; nessuna libreria → P5) ──────
   Una manina afferra un pannello dal suo header e lo posa su un altro; i
   pannelli si riassestano sulla griglia reale "a b / a c". A turno lo scambio
   col riquadro in alto (Transcription) e con quello in basso (Board). Il
   pannello video porta l'icona play. Il movimento e' in SMIL: la regola
   globale prefers-reduced-motion ferma solo le animazioni CSS, quindi sotto
   "riduci animazioni" mettiamo l'SVG in pausa sul primo fotogramma (ripiego
   statico = disposizione reale con la manina posata sul video; §9.12). */
let tutSVG=null;
const tutReduce=()=>(typeof matchMedia==='function')&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function tutCostruisci(){
  const box=document.getElementById('aula-tut-anim');
  if(!box||tutSVG)return;
  const S={a:[8,8,180,224],b:[196,8,116,121],c:[196,137,116,95]};       // slot reali
  const CEN={a:[98,120],b:[254,68.5],c:[254,184.5]};                    // centro di ogni slot
  const HDR={a:[98,15],b:[254,15],c:[254,144]};                         // centro dell'header
  const seq={video:['a','a','a','b','b','a','a','c','c','a','a'],
             tr:   ['b','b','b','a','a','b','b','b','b','b','b'],
             board:['c','c','c','c','c','c','c','a','a','c','c']};
  const DUR=8.4, kt='0;0.119;0.190;0.310;0.405;0.476;0.548;0.667;0.762;0.833;1';
  const KS=new Array(10).fill('.2 .7 .2 1').join(';');
  const A=(attr,vals)=>`<animate attributeName="${attr}" dur="${DUR}s" repeatCount="indefinite" calcMode="spline" keyTimes="${kt}" keySplines="${KS}" values="${vals}"/>`;
  const AT=(type,vals)=>`<animateTransform attributeName="transform" type="${type}" dur="${DUR}s" repeatCount="indefinite" calcMode="spline" keyTimes="${kt}" keySplines="${KS}" values="${vals}"/>`;
  const map=(id,f)=>seq[id].map(f).join(';');
  const DEFS=`<defs>`
    +`<linearGradient id="gRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8E6C9"/><stop offset="0.55" stop-color="#CFC4F7"/><stop offset="1" stop-color="#FFC9A8"/></linearGradient>`
    +`<linearGradient id="gSheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`
    +`<radialGradient id="gPlay" cx="0.42" cy="0.38" r="0.75"><stop offset="0" stop-color="#3f83c6"/><stop offset="1" stop-color="#1c4f86"/></radialGradient>`
    +`<filter id="ombraP" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#20140a" flood-opacity="0.22"/></filter>`
    +`<filter id="ombraM" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.6" flood-color="#000" flood-opacity="0.3"/></filter>`
    +`</defs>`;
  // sfondo del pannello (angoli nitidi + ombra) — anima x/y/w/h
  const fondo=(id)=>{const s0=S[seq[id][0]];
    return `<rect class="tut-pann" rx="16" filter="url(#ombraP)" x="${s0[0]}" y="${s0[1]}" width="${s0[2]}" height="${s0[3]}">`
      +A('x',map(id,s=>S[s][0]))+A('y',map(id,s=>S[s][1]))+A('width',map(id,s=>S[s][2]))+A('height',map(id,s=>S[s][3]))+`</rect>`;};
  // header colorato + velo di luce
  const testa=(id,cls)=>{const s0=S[seq[id][0]];
    return `<rect class="tut-testa ${cls}" rx="8" height="16" x="${s0[0]}" y="${s0[1]}" width="${s0[2]}">`
      +A('x',map(id,s=>S[s][0]))+A('y',map(id,s=>S[s][1]))+A('width',map(id,s=>S[s][2]))+`</rect>`
      +`<rect fill="url(#gSheen)" pointer-events="none" rx="8" height="16" x="${s0[0]}" y="${s0[1]}" width="${s0[2]}">`
      +A('x',map(id,s=>S[s][0]))+A('y',map(id,s=>S[s][1]))+A('width',map(id,s=>S[s][2]))+`</rect>`;};
  // pallino + presa (⋮⋮) + titolo nell'header, ancorati in alto a sinistra (solo traslati)
  const clusterHdr=(id)=>{const s0=S[seq[id][0]];
    const g='<circle r="2.8" cx="0" cy="0" fill="#fff"/>'
      +'<g fill="#fff" opacity="0.85"><circle cx="9" cy="-3" r="1"/><circle cx="9" cy="0" r="1"/><circle cx="9" cy="3" r="1"/><circle cx="12" cy="-3" r="1"/><circle cx="12" cy="0" r="1"/><circle cx="12" cy="3" r="1"/></g>'
      +'<rect x="18" y="-1.4" width="26" height="2.8" rx="1.4" fill="#fff" opacity="0.8"/>';
    return `<g transform="translate(${s0[0]+11} ${s0[1]+8})">`+AT('translate',map(id,s=>`${S[s][0]+11} ${S[s][1]+8}`))+g+`</g>`;};
  // contenuto centrale del pannello (traslato + scala uniforme → resta nitido)
  const overlay=(id,glifo)=>{const c0=CEN[seq[id][0]],sc0=seq[id][0]==='a'?1.25:0.6;
    return `<g transform="translate(${c0[0]} ${c0[1]})">`+AT('translate',map(id,s=>CEN[s].join(' ')))
      +`<g transform="scale(${sc0})">`+AT('scale',map(id,s=>s==='a'?'1.25':'0.6'))+glifo+`</g></g>`;};
  const playGlifo='<circle r="19" fill="none" stroke="#255E9E" stroke-opacity="0.28" stroke-width="3"/>'
    +'<circle r="15.5" fill="url(#gPlay)"/><circle r="15.5" fill="none" stroke="#fff" stroke-opacity="0.25" stroke-width="1"/>'
    +'<path d="M-4.6,-7.4 L8.4,0 L-4.6,7.4 Z" fill="#fff"/>'
    +'<rect x="-16" y="23" width="32" height="3" rx="1.5" fill="#255E9E" opacity="0.22"/>'
    +'<rect x="-16" y="23" width="12" height="3" rx="1.5" fill="#255E9E" opacity="0.6"/>';
  const trGlifo='<g class="ln t">'
    +'<rect x="-16" y="-13" width="32" height="2.8" rx="1.4"/><rect x="-16" y="-6.5" width="27" height="2.8" rx="1.4"/>'
    +'<rect x="-16" y="0" width="30" height="2.8" rx="1.4"/><rect x="-16" y="6.5" width="20" height="2.8" rx="1.4"/>'
    +'<rect x="-16" y="13" width="25" height="2.8" rx="1.4"/></g>'
    +'<rect x="17" y="-14" width="2.4" height="30" rx="1.2" style="fill:var(--lavanda-s);opacity:.18"/>'
    +'<rect x="17" y="-14" width="2.4" height="12" rx="1.2" style="fill:var(--lavanda-s);opacity:.5"/>';
  const boardGlifo='<rect x="-17" y="-11" width="30" height="7" rx="3.5" style="fill:var(--menta-s);opacity:.18"/>'
    +'<rect x="-15" y="-8.5" width="26" height="2.6" rx="1.3" style="fill:var(--menta-s);opacity:.7"/>'
    +'<path d="M-13,-1 q-3,7 6,8" fill="none" style="stroke:var(--menta-s)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<path d="M-9,7 l4,-4 M-9,7 l4,4" fill="none" style="stroke:var(--menta-s)" stroke-width="2.2" stroke-linecap="round"/>'
    +'<rect x="-1" y="5" width="20" height="2.6" rx="1.3" style="fill:var(--testo2);opacity:.55"/>'
    +'<rect x="-1" y="10.5" width="14" height="2.6" rx="1.3" style="fill:var(--testo2);opacity:.4"/>';
  const grV=`<g>${fondo('video')}${testa('video','v')}${clusterHdr('video')}`
    +`<animate attributeName="opacity" dur="${DUR}s" repeatCount="indefinite" calcMode="spline" keyTimes="${kt}" keySplines="${KS}" values="1;1;1;.8;1;1;1;.8;1;1;1"/></g>`;
  const ring=`<rect class="tut-anello" rx="16" x="196" y="8" width="116" height="121" opacity="0">`
    +A('y','8;8;8;8;8;8;137;137;137;137;137')
    +A('height','121;121;121;121;121;121;95;95;95;95;95')
    +A('opacity','0;0;.85;.85;0;0;.85;.85;0;0;0')+`</rect>`;
  const svg=`<svg viewBox="0 0 320 240" role="img" aria-label="Panels swap places when you drag them" focusable="false" xmlns="http://www.w3.org/2000/svg">`
    +DEFS
    +fondo('board')+testa('board','b')+clusterHdr('board')
    +fondo('tr')+testa('tr','t')+clusterHdr('tr')
    +grV
    +overlay('board',boardGlifo)+overlay('tr',trGlifo)+overlay('video',playGlifo)
    +ring+`</svg>`;
  box.innerHTML=svg;
  tutSVG=box.querySelector('svg');
}
function tutMotore(apri){
  if(!tutSVG||typeof tutSVG.pauseAnimations!=='function')return;
  try{
    if(apri&&!tutReduce()){tutSVG.unpauseAnimations();}
    else{tutSVG.pauseAnimations();tutSVG.setCurrentTime(0);}
  }catch(e){}
}
function tutApri(){const t=auEl('aula-tut');if(t){t.hidden=false;tutMotore(true);}}
function tutChiudi(){const t=auEl('aula-tut');if(t){t.hidden=true;tutMotore(false);}}
tutCostruisci();tutMotore(false);
if(typeof matchMedia==='function'){
  const mq=matchMedia('(prefers-reduced-motion: reduce)');
  const onmq=()=>{const t=auEl('aula-tut');tutMotore(t&&!t.hidden);};
  if(mq.addEventListener)mq.addEventListener('change',onmq);else if(mq.addListener)mq.addListener(onmq);
}
function tutForse(){
  if(AULA.amb!=='prof')return;
  /* su mobile il mini-tutorial non parte da solo: resta richiamabile col "?" */
  if(window.matchMedia('(max-width:760px)').matches)return;
  tutApri();
}
auEl('aula-aiuto').addEventListener('click',tutApri);
auEl('aula-tut-ok').addEventListener('click',tutChiudi);
auEl('aula-tut').addEventListener('click',e=>{
  if(e.target===auEl('aula-tut'))tutChiudi();
});
function chiudiAula(){
  auEl('st-aula').classList.remove('on');
  auPlayerVia();
  auEl('aula-player').innerHTML='';
  auEl('ev-float').classList.remove('on');
  tutChiudi();
  if(AULA.corso){
    const card=document.querySelector('#st-gruppi [data-corso="'+AULA.corso.id+'"]');
    if(card)card.outerHTML=DID.schedaCorso(AULA.corso);
  }
  if(!DID.foglioAperto())document.body.classList.remove('st-blocco');
}
auEl('aula-x').addEventListener('click',()=>{chiudiAula();if(DID.foglioAperto())return;});
auEl('aula-indietro').addEventListener('click',()=>{
  chiudiAula();
  if(!DID.foglioAperto()){
    if(AULA.dive)DID.apriApprofondimento(AULA.dive.id);
    else DID.apriCorso(AULA.corso.id,AULA.lezIdx);
  }
});
/* (v2) la trascrizione non si comprime più con un clic: è un pannello
   della scrivania, si sposta dal bordo alto e si ridimensiona dall'angolo. */
auEl('tr-corpo').addEventListener('click',e=>{
  const cap=e.target.closest('.tr-cap');
  if(cap){auSeek(+cap.dataset.sec);return;}
});
/* board: bottoni e note */
const bdFoglio=document.getElementById('bd-foglio');
bdFoglio.addEventListener('input',auSalvaPoi);
bdFoglio.addEventListener('blur',auSerializza);
bdFoglio.addEventListener('paste',e=>{
  /* si incolla solo testo: qualunque cosa arrivi resta testo (P3) */
  e.preventDefault();
  const s=(e.clipboardData||window.clipboardData);
  const testo=s?String(s.getData('text')||''):'';
  if(!testo)return;
  try{document.execCommand('insertText',false,testo);}
  catch(err){
    try{
      const sel=window.getSelection();
      if(sel.rangeCount){const rg=sel.getRangeAt(0);rg.deleteContents();rg.insertNode(document.createTextNode(testo));}
    }catch(e2){}
  }
  auSalvaPoi();
});
bdFoglio.addEventListener('click',e=>{
  const x=e.target.closest('.zn-x');
  if(x){
    const riga=x.closest('.zn-riga'),chip=x.closest('.zn-ev');
    if(chip){
      const frec=riga?riga.querySelector('.zn-frec'):null;
      chip.remove();if(frec)frec.remove();
      if(riga&&!riga.textContent.trim())riga.remove();
      auSerializza();
    }
    return;
  }
});
/* evidenziatore sulla trascrizione */
const evFloat=auEl('ev-float');
let evSelInfo=null;
function evPosiziona(){
  const sel=window.getSelection();
  const txt=sel&&sel.toString().trim();
  if(!txt||!sel.rangeCount){evFloat.classList.remove('on');evSelInfo=null;return;}
  const rg=sel.getRangeAt(0);
  const sEl=(rg.startContainer.nodeType===3?rg.startContainer.parentElement:rg.startContainer);
  const eEl=(rg.endContainer.nodeType===3?rg.endContainer.parentElement:rg.endContainer);
  const hostA=sEl.closest?sEl.closest('.tr-p'):null;
  const hostB=eEl.closest?eEl.closest('.tr-p'):null;
  if(!hostA||hostA!==hostB){evFloat.classList.remove('on');evSelInfo=null;return;}
  const r=rg.getBoundingClientRect();
  evFloat.style.top=Math.max(8,(r.top-46))+'px';
  evFloat.style.left=Math.max(8,(r.left+r.width/2-70))+'px';
  evFloat.classList.toggle('puo-rim',!!(sEl.closest&&sEl.closest('mark.ev')));
  evFloat.classList.add('on');
  evSelInfo={host:hostA,txt:txt};
}
document.addEventListener('mouseup',e=>{
  if(evFloat.contains(e.target))return;
  if(!auEl('st-aula').classList.contains('on'))return;
  setTimeout(evPosiziona,10);
});
document.addEventListener('touchend',e=>{
  if(evFloat.contains(e.target))return;
  if(!auEl('st-aula').classList.contains('on'))return;
  setTimeout(evPosiziona,120);
},{passive:true});
evFloat.addEventListener('mousedown',e=>e.preventDefault());
function evPersisti(host){
  AULA.ev[host.dataset.cap+':'+host.dataset.p]=host.innerHTML;
  auSalvaEv();
}
auEl('ev-add').addEventListener('click',()=>{
  const sel=window.getSelection();
  if(!sel.rangeCount||!evSelInfo){evFloat.classList.remove('on');return;}
  const rg=sel.getRangeAt(0),host=evSelInfo.host;
  const mark=document.createElement('mark');mark.className='ev';
  try{rg.surroundContents(mark);}
  catch(err){toast(T('Seleziona un passaggio continuo, senza attraversare altre evidenziazioni.','Select a continuous passage, without crossing other highlights.'));return;}
  sel.removeAllRanges();evFloat.classList.remove('on');
  evPersisti(host);
  mark.classList.add('pulsa');
  auInserisciEv(evSelInfo.txt);
  toast(T('Sul foglio: scrivi dopo la freccia.','On the sheet: write after the arrow.'));
});
auEl('ev-del').addEventListener('click',()=>{
  const sel=window.getSelection();
  if(!sel.rangeCount){evFloat.classList.remove('on');return;}
  const n=sel.anchorNode,el=(n&&n.nodeType===3)?n.parentElement:n;
  const mark=el&&el.closest?el.closest('mark.ev'):null;
  if(mark){
    const host=mark.closest('.tr-p'),par=mark.parentNode;
    while(mark.firstChild)par.insertBefore(mark.firstChild,mark);
    par.removeChild(mark);par.normalize();
    if(host)evPersisti(host);
  }
  sel.removeAllRanges();evFloat.classList.remove('on');
});

const SCR_PANNS={prof:['video','tr','board'],stud:['video']};
/* --- gli scomparti disponibili dipendono anche dalla lezione: se non
   esiste una trascrizione vera per la lezione aperta, lo scomparto "tr"
   non c'e' proprio (niente scheda, niente occhio nel dock). --- */
function auHaTrans(){
  if(AULA.dive)return false;
  /* si guarda l'indice, non il testo: sapere *se* la trascrizione
     esiste non deve costare il suo scaricamento */
  return !!INDICE_TR[auTransKey()];
}
function pannList(){
  const base=SCR_PANNS[AULA.amb]||['video'];
  if(AULA.amb==='prof'&&!auHaTrans())return base.filter(x=>x!=='tr');
  return base.slice();
}
const SCR_NOMI={video:{it:'Lezione',en:'Lesson'},tr:{it:'Trascrizione',en:'Transcription'},board:{it:'Board',en:'Board'}};
const SLOT_AREE={3:['a','b','c'],2:['a','b'],1:['a']};
const scrKey=()=>'ec_aula_scomparti::'+AULA.amb;
let SCR={ordine:[],via:[]};
const scrStretto=()=>(typeof matchMedia==='function')&&matchMedia('(max-width:980px)').matches;
function scrCarica(){
  SCR={ordine:pannList().slice(),via:[]};
  try{const s=localStorage.getItem(scrKey());
    if(s){const j=JSON.parse(s);
      if(j&&Array.isArray(j.ordine)){
        const val=pannList();
        const ord=j.ordine.filter(x=>val.includes(x));
        val.forEach(x=>{if(!ord.includes(x))ord.push(x);});
        SCR.ordine=ord;
        SCR.via=(Array.isArray(j.via)?j.via:[]).filter(x=>val.includes(x));
        if(SCR.via.length>=SCR.ordine.length)SCR.via=[];
      }}}catch(e){}
}
function scrSalva(){try{localStorage.setItem(scrKey(),JSON.stringify(SCR));}catch(e){}}
function scrFoto(){
  const f={};
  document.querySelectorAll('#aula-scrivania .pann:not(.via)').forEach(p=>{
    f[p.dataset.pann]=p.getBoundingClientRect();});
  return f;
}
function scrFlip(prima){
  const anim=[];
  document.querySelectorAll('#aula-scrivania .pann:not(.via)').forEach(p=>{
    if(typeof p.animate!=='function')return;
    const a=prima[p.dataset.pann];if(!a)return;
    const b=p.getBoundingClientRect();if(!b.width||!a.width)return;
    const dx=a.left-b.left,dy=a.top-b.top,sx=a.width/b.width,sy=a.height/b.height;
    if(Math.abs(dx)<1&&Math.abs(dy)<1&&Math.abs(sx-1)<.01&&Math.abs(sy-1)<.01)return;
    p.style.transformOrigin='top left';
    const an=p.animate([{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transform:'none'}],
      {duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});
    anim.push(an);
  });
  return anim;
}
function scrApplica(anima){
  const scr=document.getElementById('aula-scrivania');if(!scr)return;
  const vis=SCR.ordine.filter(id=>!SCR.via.includes(id));
  const prima=anima?scrFoto():null;
  scr.dataset.slots=String(vis.length||1);
  document.querySelectorAll('#aula-scrivania .pann').forEach(p=>{
    const id=p.dataset.pann;
    const att=pannList().includes(id)&&!SCR.via.includes(id);
    p.classList.toggle('via',!att);
    p.style.gridArea=att?SLOT_AREE[vis.length][vis.indexOf(id)]:'';
  });
  scrDock();
  const animazioni=prima?scrFlip(prima):[];
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>auAdatta());
  /* il video puo' aver preso le misure a meta' dell'animazione dello
     scambio (il transform conta per getBoundingClientRect ma non fa
     scattare il ResizeObserver): appena l'animazione finisce davvero,
     lo ricalcoliamo un'altra volta per essere sicuri che sia giusto. */
  if(animazioni.length){
    Promise.all(animazioni.map(a=>a.finished||Promise.resolve()))
      .catch(()=>{}).then(()=>auAdatta());
  }
}
const OCCHIO_ON='<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3.2"/></svg>';
const OCCHIO_OFF='<svg viewBox="0 0 24 24"><path d="M4 4l16 16"/><path d="M9.9 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6 8.3A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1 0 2-.2 2.9-.5"/></svg>';
function scrDock(){
  const d=auEl('aula-dock');if(!d)return;
  d.innerHTML='';
  if(AULA.amb!=='prof')return;
  SCR.ordine.forEach(id=>{
    const via=SCR.via.includes(id);
    const b=document.createElement('button');
    b.className='dk'+(via?' via':'');
    b.dataset.dk=id;
    b.setAttribute('aria-pressed',String(!via));
    b.title=via?T('Mostra','Show'):T('Nascondi','Hide');
    b.innerHTML=via?OCCHIO_OFF:OCCHIO_ON;
    const s=document.createElement('span');
    s.textContent=T(SCR_NOMI[id].it,SCR_NOMI[id].en);
    b.appendChild(s);
    d.appendChild(b);
  });
}
auEl('aula-dock').addEventListener('click',e=>{
  const b=e.target.closest('[data-dk]');if(!b)return;
  const id=b.dataset.dk,i=SCR.via.indexOf(id);
  if(i>=0)SCR.via.splice(i,1);
  else{
    const vis=SCR.ordine.filter(x=>!SCR.via.includes(x));
    if(vis.length<=1){toast(T('Almeno uno scomparto resta acceso.','At least one compartment stays on.'));return;}
    SCR.via.push(id);
  }
  scrSalva();scrApplica(true);
});
auEl('aula-reset').addEventListener('click',()=>{
  try{localStorage.removeItem(scrKey());}catch(e){}
  scrCarica();scrApplica(true);
  toast(T('Scomparti riordinati.','Compartments tidied up.'));
});
/* trascina uno scomparto sopra un altro: si scambiano di posto */
let scrGhost=null,scrDest=null;
const scrEl=document.getElementById('aula-scrivania');
scrEl.addEventListener('pointerdown',e=>{
  if(scrStretto()||AULA.amb!=='prof')return;
  const hd=e.target.closest('.pann-testa');if(!hd)return;
  if(e.target.closest('button'))return;
  const p=e.target.closest('.pann');if(!p||p.classList.contains('via'))return;
  scrDest=null;
  p.classList.add('presa');
  scrEl.classList.add('trascina');
  scrGhost=document.createElement('div');
  scrGhost.className='scr-ghost';
  scrGhost.textContent=T(SCR_NOMI[p.dataset.pann].it,SCR_NOMI[p.dataset.pann].en);
  document.body.appendChild(scrGhost);
  const mv=ev=>{
    scrGhost.style.left=ev.clientX+'px';
    scrGhost.style.top=ev.clientY+'px';
    scrGhost.style.opacity='1';
    const sotto=document.elementFromPoint(ev.clientX,ev.clientY);
    const dest=sotto?sotto.closest('#aula-scrivania .pann:not(.via)'):null;
    if(scrDest&&scrDest!==dest)scrDest.classList.remove('meta');
    scrDest=(dest&&dest!==p)?dest:null;
    if(scrDest)scrDest.classList.add('meta');
  };
  const su=()=>{
    removeEventListener('pointermove',mv);
    scrEl.classList.remove('trascina');
    p.classList.remove('presa');
    if(scrGhost){scrGhost.remove();scrGhost=null;}
    if(scrDest){
      scrDest.classList.remove('meta');
      const a=SCR.ordine.indexOf(p.dataset.pann),b=SCR.ordine.indexOf(scrDest.dataset.pann);
      if(a>=0&&b>=0){
        const x=SCR.ordine[a];SCR.ordine[a]=SCR.ordine[b];SCR.ordine[b]=x;
        scrSalva();scrApplica(true);
      }
      scrDest=null;
    }
  };
  addEventListener('pointermove',mv);
  addEventListener('pointerup',su,{once:true});
  e.preventDefault();
});
/* il video tiene sempre le proporzioni 16:9: si adagia nello scomparto */
function auAdatta(){
  const corpo=document.querySelector('[data-pann="video"] .corpo-video');
  const pl=document.getElementById('aula-player');
  if(!corpo||!pl)return;
  if(scrStretto()){pl.style.width='';pl.style.height='';return;}
  const r=corpo.getBoundingClientRect();
  if(!r.width||!r.height){pl.style.width='';pl.style.height='';return;}
  const largh=r.width-2,alt=r.height-2;
  let w=largh,h=w*9/16;
  if(h>alt){h=alt;w=h*16/9;}
  pl.style.width=Math.round(w)+'px';
  pl.style.height=Math.round(h)+'px';
}
if(typeof ResizeObserver!=='undefined'){
  const cv=document.querySelector('[data-pann="video"] .corpo-video');
  if(cv)new ResizeObserver(()=>auAdatta()).observe(cv);
}
addEventListener('resize',()=>auAdatta());

/* stampa in identita` ERUA: un aiuto condiviso e due pulsanti */
function auStampa(titolo,dentroHTML){
  const tit=auEl('aula-tit').textContent,kick=auEl('aula-kick').textContent;
  const data=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  /* marchio ERUA connect: lo stesso simbolo dell'header, in SVG, cosi'
     il PDF porta il logo del sito e non solo il testo. */
  const marchio='<svg viewBox="0 0 1020 932" width="26" height="24" style="display:block" aria-hidden="true">'
    +'<path d="M404 0 L440 6 L483 20 L508 32 L524 42 L553 64 L581 92 L603 122 L624 162 L634 190 L643 238 L644 272 L641 308 L627 360 L604 406 L575 444 L550 468 L520 490 L495 504 L471 514 L445 522 L408 530 L408 532 L644 932 L0 932 L0 696 L308 532 L31 530 L31 0 Z" fill="#1E7A54"/>'
    +'<g fill="none" stroke="#1E7A54" stroke-width="62" stroke-linecap="round"><path d="M714 176a230 230 0 0 1 0 380"/><path d="M846 76a385 385 0 0 1 0 580"/></g></svg>';
  const testata='<div style="display:flex;align-items:center;gap:9px;margin-bottom:14px">'+marchio
    +'<span style="line-height:1"><b style="display:block;font-family:Inter,Arial,sans-serif;font-weight:800;font-size:15px;letter-spacing:.02em;color:#20201D">ERUA</b>'
    +'<i style="font-family:\'JetBrains Mono\',monospace;font-style:normal;font-size:9px;letter-spacing:.25em;color:#1E7A54">connect</i></span></div>';
  let h='<div style="font-family:Inter,Arial,sans-serif;color:#20201D;max-width:740px;margin:0 auto;padding:30px 24px;-webkit-print-color-adjust:exact;print-color-adjust:exact">';
  h+=testata;
  h+='<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#1E7A54;margin-bottom:10px">Learn · '+esc(titolo)+'</div>';
  h+='<h1 style="font-family:Fraunces,Georgia,serif;font-size:26px;font-weight:600;letter-spacing:-.02em;margin:0 0 4px">'+esc(tit)+'</h1>';
  h+='<div style="font-size:11px;color:#7A776F;margin-bottom:14px">'+esc(kick)+' · '+data+'</div>';
  h+='<div style="border-top:3px double #20201D;margin-bottom:22px"></div>';
  h+=dentroHTML;
  h+='<div style="margin-top:28px;border-top:3px double #20201D;padding-top:14px;display:flex;align-items:center;justify-content:center;gap:8px">'+marchio
    +'<span style="font-family:Fraunces,Georgia,serif;font-style:italic;font-size:13px;color:#1E7A54">ERUA connect</span></div></div>';
  const fr=document.createElement('iframe');
  fr.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr);
  const d=fr.contentWindow.document;d.open();
  d.write('<html><head><title>'+esc(titolo)+' — ERUA connect</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&family=Source+Serif+4:ital@0;1&display=swap" rel="stylesheet"></head><body style="margin:0;background:#fff">'+h+'<scr'+'ipt>onload=()=>setTimeout(()=>print(),450)</scr'+'ipt></body></html>');
  d.close();setTimeout(()=>{try{document.body.removeChild(fr);}catch(e){}},15000);
}
auEl('bd-stampa').addEventListener('click',()=>{
  auSerializza();
  const pieno=(AULA.board||[]).some(c=>c.t==='ev'||(c.x&&c.x.trim()));
  if(!pieno){toast(T('Il foglio è vuoto: niente da stampare.','The sheet is empty — nothing to print yet.'));return;}
  let h='';
  AULA.board.forEach(c=>{
    if(c.t==='ev'){
      h+='<div style="display:flex;gap:14px;margin:14px 0;page-break-inside:avoid;break-inside:avoid">';
      h+='<div style="font-family:\'JetBrains Mono\',monospace;font-size:12px;color:#1E7A54;min-width:46px;text-align:right;padding-top:2px">“</div>';
      h+='<div style="flex:1;border-left:3px solid #A8E6C9;padding:0 0 10px 14px;border-bottom:1px solid #E7E0D5">';
      h+='<p style="font-family:\'Source Serif 4\',Georgia,serif;font-size:14px;margin:0 0 6px;line-height:1.55">“'+esc(c.testo)+'”</p>';
      if(c.nota&&c.nota.trim())h+='<p style="font-size:12.5px;margin:0;line-height:1.6;color:#20201D">→ '+esc(c.nota)+'</p>';
      h+='</div></div>';
    }else if(c.x&&c.x.trim()){
      h+='<p style="font-size:13px;line-height:1.75;margin:10px 0;white-space:pre-wrap">'+esc(c.x)+'</p>';
    }
  });
  auStampa(T('Board','Board'),h);
});
auEl('tr-stampa').addEventListener('click',()=>{
  if(!AULA.tr){toast(T('Nessuna trascrizione da stampare.','No transcription to print.'));return;}
  let h='';
  AULA.tr.cap.forEach(c=>{
    h+='<h2 style="font-family:Fraunces,Georgia,serif;font-size:16px;margin:22px 0 6px;page-break-after:avoid;break-after:avoid"><span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#1E7A54;margin-right:8px">'+auMMSS(c.s)+'</span>'+esc(c.t)+'</h2>';
    c.par.forEach(p=>{h+='<p style="font-family:\'Source Serif 4\',Georgia,serif;font-size:13.5px;line-height:1.7;margin:0 0 10px;text-align:justify">'+esc(p)+'</p>';});
  });
  auStampa(T('Trascrizione','Transcription'),h);
});

/* ── avvio e apertura ──────────────────────────────────────────────
   L'aula non ha un pannello proprio: si apre da dentro la didattica.
   `avvia` scarica soltanto l'indice delle trascrizioni, che è minuscolo;
   il testo di una lezione arriva quando quella lezione si apre. */
let avviata = false;
export async function avvia() {
  if (avviata) return;
  avviata = true;
  try {
    INDICE_TR = await dati('trascrizioni/indice');
  } catch (err) {
    /* senza indice l'aula funziona lo stesso: resta senza trascrizioni,
       e lo scomparto non compare (riferimento.md §2.2). */
    console.error('indice delle trascrizioni non caricato:', err);
    INDICE_TR = {};
  }
}

export async function apri(o) {
  /* la didattica va aspettata davvero: `apriAula` la usa subito, alla
     prima riga, per sapere qual è la lezione */
  DID = await chiedi('didattica');
  await avvia();
  apriAula(o);
}

offre('aula', { avvia, apri, chiudi: chiudiAula });

