/* ERUA connect — la pagina di lettura
   ==================================================================
   Otto accorgimenti sul testo che c'e' gia': nessuna parola inventata,
   nessuna riscrittura. Cambia solo come il testo si presenta — grassetto
   d'attacco, numeri in risalto, respiro fra i capoversi, citazioni
   estratte, indice dei capitoli, sottolineatura, segni fra un capitolo e
   l'altro, capitoli che nascono chiusi sui pezzi lunghi.

   Niente qui viene da un modello linguistico: le frasi in evidenza sono
   scelte fra quelle che l'autore ha scritto. Se un giorno un riassunto
   lo scrivera' una macchina, andra' marcato come tale (P7).
*/

import { CITTA } from '../configurazione.js';
import {
  LANG, T, esc, dati, offre, chiedi, toast, stemma, ICONE, inLettura, lenteAperta,
} from './nucleo.js';

let ARTICOLI = [], artCorrente = null, idCorrente = null;
const letti = new Set();
const overlay = document.getElementById('p-articolo');

/* 1. GRASSETTO D'ATTACCO — un appiglio per l'occhio in ogni paragrafo */
function attacco(t,forte){
  const taglio=t.search(/[.!?]\s/);
  if(taglio>25&&taglio<(forte?200:130))
    return '<b>'+t.slice(0,taglio+1)+'</b>'+t.slice(taglio+1);
  const p=t.split(' ');
  const n=forte?8:5;
  return p.length>(n+6) ? '<b>'+p.slice(0,n).join(' ')+'</b> '+p.slice(n).join(' ') : t;
}

/* 2. NUMERI E DATE IN RISALTO — sono le cose che l'occhio cerca quando
   scorre veloce: quante persone, che giorno, quanti euro. */
function evidenzia(html){
  return html.replace(
    /(?<!\w)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:%|€|km|k)?|\d{1,2}\/\d{1,2}\/\d{4})(?!\w)/g,
    '<span class="cifra">$1</span>');
}

/* 3. RESPIRO — i paragrafi del PDF sono muri da 700 caratteri. Le parole
   non si toccano: si aggiungono solo capoversi ogni due-tre frasi, che e'
   quello che fa un giornale quando impagina lo stesso testo su colonna
   stretta. Un muro diventa tre blocchi che l'occhio accetta. */
function spezza(t){
  if(t.length < 480) return [t];
  const frasi = t.match(/[^.!?]+[.!?]+(?:["\u201d\u2019)]+)?\s*/g) || [t];
  const blocchi=[]; let cur='';
  for(const fr of frasi){
    cur += fr;
    if(cur.length > 300){ blocchi.push(cur.trim()); cur=''; }
  }
  if(cur.trim()) {
    if(blocchi.length && cur.trim().length < 90) blocchi[blocchi.length-1] += ' ' + cur.trim();
    else blocchi.push(cur.trim());
  }
  return blocchi.length ? blocchi : [t];
}

/* 4. CITAZIONI ESTRATTE — non piu' una sola: negli articoli lunghi ne
   servono diverse, distanziate, altrimenti in mezzo alle 4.000 parole del
   summit ci si perde. Priorita' alle frasi che contengono una voce vera
   ("...") o un giudizio. */
function frasiForti(pezzi, quante){
  const dentro=[];
  pezzi.forEach((p,i)=>{ if(p.t==='testo') dentro.push([i,p.x]); });
  if(dentro.length<6) return new Map();
  const cand=[];
  dentro.forEach(([idx,testo],k)=>{
    if(k < 2 || k > dentro.length-2) return;
    testo.split(/(?<=[.!?])\s+/).forEach(fr=>{
      const n=fr.trim().length;
      if(n<70||n>170) return;
      const peso = n
        + (/[\u201c"]/.test(fr)?90:0)
        + (/\b(is|are|means|must|should|can|becomes|never|only)\b/i.test(fr)?25:0);
      cand.push({peso, testo:fr.trim(), dopo:idx, k});
    });
  });
  if(!cand.length) return new Map();
  cand.sort((a,b)=>b.peso-a.peso);
  const scelte=[], minDist=Math.max(3, Math.floor(dentro.length/(quante+1)));
  for(const c of cand){
    if(scelte.length>=quante) break;
    if(scelte.every(s=>Math.abs(s.k-c.k)>=minDist)) scelte.push(c);
  }
  // La frase si mostra PRIMA del paragrafo che la contiene: fa da richiamo,
  // e quando ci si arriva leggendo sembra di riconoscerla, non di rileggerla.
  const m=new Map();
  scelte.forEach(c=>{
    const k=dentro.findIndex(([i])=>i===c.dopo);
    const ancora = dentro[Math.max(0, k-3)][0];
    if(!m.has(ancora)) m.set(ancora, c.testo);
  });
  return m;
}


/* SINTESI — la prima frase di ogni capitolo: sono parole dell'autore,
   non un riassunto scritto dalla macchina. */
function sintesiDi(a){
  const pz=a.pezzi||[];
  const punti=[];
  let attesa=false;
  pz.forEach(p=>{
    if(p.t==='sottotitolo'){ attesa=true; return; }
    if(p.t!=='testo') return;
    if(attesa || punti.length===0){
      const fr=(p.x.split(/(?<=[.!?])\s+/)[0]||'').trim();
      if(fr.length>35) punti.push(fr);
      attesa=false;
    }
  });
  if(punti.length<3){
    pz.filter(p=>p.t==='testo').slice(0,6).forEach(p=>{
      const fr=(p.x.split(/(?<=[.!?])\s+/)[0]||'').trim();
      if(fr.length>35 && !punti.includes(fr)) punti.push(fr);
    });
  }
  return punti.slice(0,6);
}

function puntiHTML(a){
  const punti=sintesiDi(a);
  if(!punti.length) return '<p>No summary available for this piece.</p>';
  return `<ol class="punti">${punti.map((t,i)=>
    `<li><span class="pn">${String(i+1).padStart(2,'0')}</span><span class="pt">${evidenzia(esc(t))}</span></li>`
  ).join('')}</ol>
  <p class="punti-nota">These are the opening lines of each section, in the author's own words.
     Switch to <b>Full story</b> for the whole piece.</p>`;
}

/* INDICE DEI CAPITOLI — si vede subito di cosa parla e si salta dove si vuole */
function indiceHTML(a,pezzi){
  const cap=[];
  pezzi.forEach((p,i)=>{ if(p.t==='sottotitolo') cap.push([i,p.x]); });
  if(cap.length<2) return '';
  return `<nav class="indice" aria-label="In this article">
    <span class="ind-tit">In this article</span>
    <div class="ind-chips">${cap.slice(0,8).map(([i,t])=>
      `<button class="ind-chip" data-vai="cap-${a.id}-${i}">${esc(t)}</button>`).join('')}</div>
  </nav>`;
}

/* 6. SOTTOLINEATURA — in ogni capitolo una frase viene evidenziata come
   farebbe uno studente con l'evidenziatore: quella che dice la cosa, non
   quella che racconta la cronaca. Serve a chi scorre: l'occhio si ferma
   sul giallo anche quando la testa non sta leggendo. */
function frasePerCapitolo(testi){
  let best=null;
  testi.forEach(t=>{
    (t.split(/(?<=[.!?])\s+/)||[]).forEach(fr=>{
      const n=fr.trim().length;
      if(n<60||n>190) return;
      const peso = 30
        + (/\b(is|are|means|must|should|can|becomes|shows|proves|because)\b/i.test(fr)?40:0)
        + (/\d/.test(fr)?20:0)
        + (/[\u201c"]/.test(fr)?15:0)
        - Math.abs(n-115)/4;
      if(!best||peso>best.peso) best={peso, fr:fr.trim()};
    });
  });
  return best ? best.fr : null;
}
function sottolineaMorbido(html, frase){
  if(!frase) return html;
  const nudo = t => t.replace(/[\u201c\u201d\u2018\u2019"']/g,'').replace(/\s+/g,' ').trim();
  const cercata = nudo(frase);
  if(cercata.length<35) return html;
  const piatto = nudo(html.replace(/<[^>]+>/g,''));
  if(!piatto.includes(cercata.slice(0,60))) return html;
  // trovo la stessa frase nell'html tenendo conto dei tag gia` presenti
  const parole = cercata.split(' ');
  const prima = parole.slice(0,4).join(' '), ultima = parole.slice(-4).join(' ');
  const a = html.indexOf(esc(prima));
  if(a<0) return html;
  const b = html.indexOf(esc(ultima), a);
  if(b<0) return html;
  const fine = b + esc(ultima).length;
  return html.slice(0,a)+'<mark class="forte">'+html.slice(a,fine)+'</mark>'+html.slice(fine);
}

function sottolinea(html, frase){
  if(!frase) return html;
  const cercata=esc(frase);
  const dove=html.indexOf(cercata);
  if(dove<0) return html;
  return html.slice(0,dove)+'<mark>'+cercata+'</mark>'+html.slice(dove+cercata.length);
}

/* 7. SEGNI GEOMETRICI — non decorazione a caso: sono i separatori fra un
   capitolo e l'altro, sempre diversi, che danno il senso dell'avanzare.
   Nascono dall'indice del capitolo, quindi lo stesso articolo li ha
   sempre uguali. */
function segno(n){
  const c='currentColor';
  const forme=[
    `<circle cx="30" cy="12" r="7" fill="none" stroke="${c}" stroke-width="2"/><path d="M46 12h30" stroke="${c}" stroke-width="2"/>`,
    `<path d="M8 20 L20 4 L32 20Z" fill="none" stroke="${c}" stroke-width="2"/><path d="M42 12h34" stroke="${c}" stroke-width="2" stroke-dasharray="2 6"/>`,
    `<rect x="8" y="5" width="14" height="14" fill="none" stroke="${c}" stroke-width="2"/><rect x="28" y="9" width="6" height="6" fill="${c}"/><path d="M44 12h32" stroke="${c}" stroke-width="2"/>`,
    `<path d="M8 12q10-10 20 0t20 0" fill="none" stroke="${c}" stroke-width="2"/><circle cx="62" cy="12" r="3" fill="${c}"/>`,
    `<path d="M8 12h18M34 4v16M46 12h30" stroke="${c}" stroke-width="2"/>`,
    `<circle cx="12" cy="12" r="4" fill="${c}"/><circle cx="30" cy="12" r="4" fill="none" stroke="${c}" stroke-width="2"/><circle cx="48" cy="12" r="4" fill="none" stroke="${c}" stroke-width="2"/><path d="M60 12h16" stroke="${c}" stroke-width="2"/>`
  ];
  return `<div class="segno"><svg viewBox="0 0 84 24" aria-hidden="true">${forme[n%forme.length]}</svg></div>`;
}

/* 8. IL CORPO DELL'ARTICOLO — sui pezzi lunghi i capitoli nascono chiusi:
   si vede il titolo, la prima parte, e si apre solo quello che interessa.
   Un articolo da 4.000 parole smette di essere un rotolo infinito e
   diventa sei pezzi corti fra cui scegliere. */
/* Se l'articolo finisce in mosaico, la foto grande di apertura non serve:
   sarebbe la stessa immagine due volte, e per giunta ingrandita male. */
/* Il mosaico resta solo dove ha senso: l'editoriale e la Student Board.
   In tutti gli altri articoli le foto vanno dentro il testo, a spezzare la lettura. */
const ART_MOSAICO=new Set(['editoriale','student-board']);
function haMosaico(a){ return ART_MOSAICO.has(a.id); }

function propor(f){ return (f&&f.w&&f.h)?` style="aspect-ratio:${f.w}/${f.h}"`:''; }

/* Se un articolo porta tante foto piccole e simili (i ritratti della Student
   Board, le istantanee dell'editoriale) non hanno senso una a una in mezzo al
   testo: diventano una griglia sola, come nella rivista. */
function sonoRitratti(imgs){
  if(imgs.length < 3) return false;
  const piccole = imgs.filter(f=>f.w && f.h && f.w < 1000).length;
  return piccole >= imgs.length * 0.6;
}
/* Le colonne del mosaico non sono fisse: si scelgono in modo che le righe
   siano piene. 16 foto -> 4x4, 9 -> 3x3, 6 -> 3x2, 4 -> 2x2. */
function colonneMosaico(n){
  if(n <= 4) return 2;
  if(n < 8) return 3;
  for(const c of [4,3,5]) if(n % c === 0) return c;   // righe piene se si puo`
  return 4;
}

function corpoArticolo(a){
  const pezzi=a.pezzi||[];
  let extra=(a.immagini||[]).slice(1);
  const tutte=(a.immagini||[]);
  const galleria = haMosaico(a) ? tutte : null;   // nel mosaico ci vanno tutte
  if(galleria) extra=[];
  const testi=[];
  pezzi.forEach((p,i)=>{ if(p.t==='testo') testi.push(i); });
  const ultimoUtile = testi.length>3 ? testi[testi.length-2] : -1;
  const parole = pezzi.filter(p=>p.t==='testo').reduce((n,p)=>n+p.x.split(' ').length,0);
  const aCapitoli = parole > 1100 && pezzi.filter(p=>p.t==='sottotitolo').length >= 3;

  // Se la rivista ha gia` le sue frasi in evidenza (pezzi 'citazione'),
  // uso quelle e non ne invento altre: cosi` non si legge due volte la stessa riga.
  const citazioniVere = pezzi.some(p=>p.t==='citazione');
  // Una frase in evidenza che ripete parola per parola un pezzo del testo e`
  // un doppione: invece del riquadro, la evidenzio dentro il paragrafo.
  const corpoTutto = pezzi.filter(p=>p.t==='testo').map(p=>p.x).join(' ');
  const norm = t => t.replace(/[\u201c\u201d\u2018\u2019"']/g,'').replace(/\s+/g,' ').trim();
  const corpoNorm = norm(corpoTutto);
  const ridondanti = new Set();
  const daMarcare = [];
  pezzi.forEach((p,i)=>{
    if(p.t!=='citazione') return;
    const n=norm(p.x);
    if(n.length>35 && corpoNorm.includes(n.slice(0,Math.min(70,n.length)))){
      ridondanti.add(i);
      daMarcare.push(p.x);
    }
  });
  const quanteCit = Math.min(4, Math.max(1, Math.round(testi.length/9)));
  // Se la rivista non ha frasi in evidenza proprie, non me ne invento in
  // riquadro: evidenzio la frase dentro il testo, dove l'autore l'ha scritta.
  const forti = new Map();
  if(!citazioniVere){
    frasiForti(pezzi, quanteCit).forEach(fr=>daMarcare.push(fr));
  }

  const disponibili = testi.filter((idx,k)=> k>0 && idx<=ultimoUtile);
  const dentro = new Map();
  let restanti = extra.slice();
  if(disponibili.length && restanti.length){
    const quante = Math.min(restanti.length, Math.max(1, Math.floor(disponibili.length/2)));
    const passo = disponibili.length/quante;
    for(let k=0;k<quante;k++){
      const idx = disponibili[Math.min(disponibili.length-1, Math.round(k*passo))];
      if(!dentro.has(idx)) dentro.set(idx, restanti.shift());
    }
  }

  // divido in capitoli: {titolo, indice, pezzi[]}
  const capitoli=[]; let corr={tit:null, idx:-1, pz:[]};
  pezzi.forEach((p,i)=>{
    if(p.t==='sottotitolo'){ if(corr.pz.length||corr.tit) capitoli.push(corr); corr={tit:p.x, idx:i, pz:[]}; }
    else corr.pz.push([i,p]);
  });
  if(corr.pz.length||corr.tit) capitoli.push(corr);

  let primoAssoluto=true, nCap=0, nFoto=0;
  const tonda = a.id==='editoriale';
  const mosaicoHTML = galleria ? `<div class="mosaico${tonda?' tonda':''}" style="--cols:${
      tonda ? Math.min(4,galleria.length) : colonneMosaico(galleria.length)}">`+
      galleria.map(f=>`<img class="scatto-art" src="${f.file}" alt="" loading="lazy">`).join('')+`</div>` : '';
  let out = mosaicoHTML + indiceHTML(a,pezzi);

  capitoli.forEach((cap,ci)=>{
    if(cap.tit){
      nCap++;
      const par=cap.pz.filter(([i,p])=>p.t==='testo').reduce((n,[i,p])=>n+p.x.split(' ').length,0);
      const m=Math.max(1,Math.round(par/200));
      if(nCap>1) out+='<hr class="stacco">';
      out+=`<h3 class="capitolo" id="cap-${a.id}-${cap.idx}" data-cap="${esc(cap.tit)}">
              <span class="num">${String(nCap).padStart(2,'0')}</span>
              <span class="tt">${esc(cap.tit)}</span>
              <span class="min">${m} min</span></h3>`;
    }
    const daSott = frasePerCapitolo(cap.pz.filter(([i,p])=>p.t==='testo').map(([i,p])=>p.x));
    let sottFatta=false, ultimoEraCit=false, dopoTitolo=true, corpoCap='';
    let contaPar=0;

    cap.pz.forEach(([i,p])=>{
      // la frase in evidenza precede il paragrafo da cui e` tratta: fa da richiamo
      if(forti.has(i)) corpoCap+=`<aside class="estratta ${aCapitoli?'oltre':''}">${esc(forti.get(i))}</aside>`;
      if(p.t==='citazione'){
        if(ridondanti.has(i)) return;               // gia` nel testo: niente doppione
        corpoCap+=`<blockquote>${esc(p.x)}</blockquote>`; ultimoEraCit=true; return; }
      if(ultimoEraCit && /^[-\u2010-\u2015\u2212]\s/.test(p.x.trim())){
        corpoCap+=`<p class="firma-cit">${esc(p.x.replace(/^[-\u2010-\u2015\u2212]\s*/,''))}</p>`;
        ultimoEraCit=false; return;
      }
      ultimoEraCit=false;
      const blocchi=spezza(p.x);
      blocchi.forEach((b,bi)=>{
        contaPar++;
        let testo = evidenzia(bi===0 ? attacco(esc(b), primoAssoluto||dopoTitolo) : esc(b));
        daMarcare.forEach(fr=>{ testo = sottolineaMorbido(testo, fr); });
        if(!sottFatta && daSott && !(primoAssoluto||dopoTitolo)){
          const prima=testo;
          testo=sottolinea(testo,daSott);
          if(testo!==prima) sottFatta=true;
        }
        corpoCap+= primoAssoluto ? `<p class="attacco">${testo}</p>`
                 : `<p class="${(aCapitoli&&contaPar>1)?'oltre':''}">${testo}</p>`;
        primoAssoluto=false;
      });
      dopoTitolo=false;
      if(dentro.has(i)){
        nFoto++;
        // si alternano: una flottante a lato (destra, poi sinistra) e una a tutta larghezza
        const flottante = nFoto % 2 === 1;
        const lato = (Math.ceil(nFoto/2) % 2 === 1) ? '' : ' sinistra';
        const larga = flottante ? (' flotta'+lato) : ' larga';
        corpoCap+=`<figure class="scatto-box${larga} ${aCapitoli?'oltre':''}">
          <img class="scatto-art" src="${dentro.get(i).file}" alt="" loading="lazy"${propor(dentro.get(i))}></figure>`;
      }
    });

    if(aCapitoli && cap.tit && contaPar>2){
      out+=`<section class="sezione">${corpoCap}
        <button class="apri-sez" data-sez="${ci}">Continue this section ↓</button></section>`;
    } else {
      out+=corpoCap;
    }
  });

  if(restanti.length){
    out+='<div class="galleria">'+restanti.map(f=>
      `<img class="scatto-art" src="${f.file}" alt="" loading="lazy"${propor(f)}>`).join('')+'</div>';
  }
  return out;
}

async function apriArticolo(id){
  const rivista=await chiedi('rivista');
  ARTICOLI=rivista.articoli();
  const a=ARTICOLI.find(x=>x.id===id);
  if(!a) return;
  const salvati=rivista.salvati;
  artCorrente=a;
  document.getElementById('art').innerHTML=`
    <div class="art-testa">
      <h2 class="display">${esc(a.titolo)}</h2>
      <p class="meta">${esc(a.autore)} · ${esc(a.unis.map(u=>CITTA[u]||u).join(' · '))} · ${a.lettura} min read</p>
      <div class="art-azioni">
        <button class="modo on" data-modo="pieno">Full story</button>
        <button class="modo" data-modo="punti">TL;DR</button>
        <button class="modo salva-art ${salvati[a.id]?'on':''}" data-salva="${esc(a.id)}">🔖 ${salvati[a.id]?'Saved':'Save'}</button>
      </div>
      <div class="tacche" id="tacche"><div class="tacche-fill" id="tacche-fill"></div></div>
    </div>
    ${(a.foto && !haMosaico(a))?`<img class="scatto-apertura scatto-art" src="${esc(a.foto)}" alt="">`:''}
    <div class="art-contenuto">
      <p class="occhiello-art">${esc(a.lancio[LANG])}</p>
      <div class="cap-corrente" id="cap-corrente"><span class="pallo"></span><span id="cap-nome"></span></div>
      <div id="vista-pieno">${corpoArticolo(a)}</div>
      <div id="vista-punti" hidden>${puntiHTML(a)}</div>
    </div>`;
  // la pagina prende il posto delle altre: non è una finestra sovrapposta
  document.querySelectorAll('.pannello').forEach(x=>x.classList.remove('attivo'));
  overlay.classList.add('attivo','aperto');
  document.body.classList.add('in-lettura');
  document.body.style.overflow='';
  letti.add(id);
  scriviHash('leggi/'+id);
  window.scrollTo(0,0);
  aggiornaProssimo(id);
  document.getElementById('btn-indietro').focus();
  disegnaTacche();
}
function chiudiArticolo(){
  overlay.classList.remove('aperto','attivo');
  document.body.classList.remove('in-lettura');
  document.body.style.overflow='';
  mostraTab('magazine');
}

/* PROSSIMO ARTICOLO — il primo che non hai ancora aperto, nell'ordine del feed.
   Se salti al quinto senza aver letto gli altri, il prossimo è il primo. */
function prossimoArticolo(id){
  const rivista=offerta;
  if(!rivista) return null;
  const l=rivista.filtrati();
  const ord=rivista.ordine().map(x=>l.find(a=>a.id===x)).filter(Boolean);
  if(!ord.length) return null;
  const mai=ord.find(a=>a.id!==id && !letti.has(a.id));
  if(mai) return mai;
  const i=ord.findIndex(a=>a.id===id);
  return ord[(i+1)%ord.length];
}
function aggiornaProssimo(id){
  idCorrente=id;
  const p=prossimoArticolo(id);
  const eti=p ? (T('Prossimo','Next')+': '+p.titolo) : T('Torna al Magazine','Back to Magazine');
  const b1=document.getElementById('btn-avanti'), b2=document.getElementById('btn-avanti2');
  if(b1) b1.innerHTML = p ? (T('Prossimo','Next')+' →') : '✕';
  if(b2) b2.innerHTML = p ? (esc(eti)+' <span class="fr">→</span>') : T('Torna al Magazine','Back to Magazine');
}
function vaiProssimo(){
  const p=prossimoArticolo(idCorrente);
  if(p) apriArticolo(p.id); else chiudiArticolo();
}

/* ---------------- avanzamento coi capitoli ---------------- */
function disegnaTacche(){
  const barra=document.getElementById('tacche');
  if(!barra) return;
  barra.querySelectorAll('.tacca').forEach(t=>t.remove());
  const corpo=document.getElementById('vista-pieno');
  if(!corpo || corpo.hidden) return;
  const tot=document.body.scrollHeight-innerHeight;
  if(tot<=0) return;
  corpo.querySelectorAll('h3.capitolo').forEach(h=>{
    const q=Math.min(100,Math.max(0,(h.offsetTop/document.body.scrollHeight)*100));
    const t=document.createElement('div');
    t.className='tacca'; t.style.left=q+'%';
    barra.appendChild(t);
  });
}
addEventListener('scroll',()=>{
  const rf=document.getElementById('art-avanz-riemp');
  if(rf){
    const m=document.body.scrollHeight-innerHeight;
    const perc = m>0?Math.min(100,(scrollY/m)*100):0;
    rf.style.width=perc+'%';
    const r=document.getElementById('art-resta');
    if(r && artCorrente){
      const q=Math.max(0,Math.round((artCorrente.lettura||0)*(1-perc/100)));
      r.textContent = perc>4 ? (q>0 ? q+' min' : T('fine','end')) : '';
    }
  }
  const f=document.getElementById('tacche-fill');
  if(f){
    const max=document.body.scrollHeight-innerHeight;
    f.style.width=(max>0?(scrollY/max)*100:0)+'%';
  }
  // quale capitolo sto leggendo adesso
  const barra=document.getElementById('cap-corrente');
  const corpo=document.getElementById('vista-pieno');
  if(!barra||!corpo||corpo.hidden) return;
  const capitoli=[...corpo.querySelectorAll('h3.capitolo')];
  if(!capitoli.length) return;
  let attuale=null;
  for(const h of capitoli){ if(h.offsetTop-90 <= overlay.scrollTop) attuale=h; }
  if(attuale){
    barra.classList.add('on');
    document.getElementById('cap-nome').textContent=attuale.dataset.cap||'';
  } else barra.classList.remove('on');
},{passive:true});
