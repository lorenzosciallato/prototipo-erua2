/* ERUA connect — lingua e tema
   ==================================================================
   L'applicazione nasce nella lingua in cui i contenuti sono scritti.
   Le altre lingue arrivano da Google Translate: la pagina resta una
   sola e il traduttore la riscrive al volo.

   Le stringhe dell'interfaccia fissa (le voci della navigazione, i
   pulsanti) non passano dal traduttore: sono tradotte a mano e stanno in
   `testi/<lingua>.json`. Sono le parole che devono essere giuste sempre,
   anche quando il traduttore non risponde.

   P7 — Ogni contenuto generato dall'IA è marcato come tale.
   La traduzione automatica lo è: quando la lingua scelta non è quella
   originale compare un avviso che dice chi l'ha tradotta, che non è
   verificata e qual è la lingua di partenza. L'avviso resta finché
   resta la traduzione: non è un messaggio che si chiude e si dimentica.
*/

import { CONFIG } from '../configurazione.js';
import { toast } from './nucleo.js';

const ORIGINALE = CONFIG.lingue.originale;
let UILANG = ORIGINALE;
let TESTI = {};

/* ── testi dell'interfaccia ────────────────────────────────────────── */
async function caricaTesti(l) {
  try {
    const r = await fetch(`testi/${l}.json`);
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch (err) {
    /* Se manca il file di una lingua l'interfaccia resta in quella
       originale invece di mostrare le chiavi grezze. */
    console.error(`testi/${l}.json non caricati:`, err);
    return null;
  }
}

function applicaTesti() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    el.textContent = TESTI[k] || k;
  });
}

/* ── P7: l'avviso di traduzione automatica ─────────────────────────── */
function nomeLingua(codice) {
  try {
    return new Intl.DisplayNames([codice], { type: 'language' }).of(ORIGINALE);
  } catch (err) {
    return ORIGINALE.toUpperCase();
  }
}

function avvisoTraduzione(l) {
  const box = document.getElementById('avviso-traduzione');
  if (!box) return;
  if (l === ORIGINALE) { box.hidden = true; box.textContent = ''; return; }
  const modello = CONFIG.traduzione.avviso[l] || CONFIG.traduzione.avviso.en;
  box.textContent = modello
    .replace('{servizio}', CONFIG.traduzione.servizio)
    .replace('{originale}', nomeLingua(l));
  box.hidden = false;
}

/* ── il traduttore ─────────────────────────────────────────────────── */
export function googleTranslateElementInit() {
  try {
    new google.translate.TranslateElement(
      { pageLanguage: ORIGINALE, autoDisplay: false }, 'google_translate_element');
  } catch (err) { /* il traduttore non è arrivato: la pagina resta in originale */ }
}
/* Lo script del traduttore chiama questo nome sull'oggetto globale: è
   l'unico punto in cui un modulo deve esporsi fuori. */
window.googleTranslateElementInit = googleTranslateElementInit;

/* Il cookie che il traduttore legge per sapere in che lingua stare.
   È un cookie di terzi e va dichiarato nell'informativa (§7.4). */
function scriviCookieLingua(l) {
  const v = (l === ORIGINALE) ? `/${ORIGINALE}/${ORIGINALE}` : `/${ORIGINALE}/${l}`;
  try {
    document.cookie = `${CONFIG.traduzione.cookie}=${v};path=/`;
    document.cookie = `${CONFIG.traduzione.cookie}=${v};path=/;domain=${location.hostname}`;
  } catch (err) { /* cookie non scrivibili: la traduzione varrà solo per questa visita */ }
}

function applicaLingua(l, tentativi) {
  const sel = document.querySelector('select.goog-te-combo');
  if (sel) {
    sel.value = l;
    sel.dispatchEvent(new Event('change'));
    return true;
  }
  /* il traduttore ci mette qualche istante a comparire: lo aspetto */
  if ((tentativi || 0) < 40) {
    setTimeout(() => applicaLingua(l, (tentativi || 0) + 1), 250);
    return false;
  }
  toast('Translation needs the page to be online');
  return false;
}

export async function traduci(l) {
  const testi = await caricaTesti(l);
  if (testi) { UILANG = l; TESTI = testi; applicaTesti(); }

  document.getElementById('lang-label').textContent = (l === 'zh-CN' ? 'ZH' : l.toUpperCase());
  document.querySelectorAll('#lang-menu button').forEach(b =>
    b.setAttribute('aria-pressed', b.dataset.lang === l));

  avvisoTraduzione(l);
  scriviCookieLingua(l);
  applicaLingua(l, 0);
}

/* ── comandi ───────────────────────────────────────────────────────── */
document.getElementById('btn-tema').addEventListener('click', function () {
  const scuro = document.documentElement.dataset.tema === 'scuro';
  document.documentElement.dataset.tema = scuro ? '' : 'scuro';
  this.textContent = scuro ? '☾' : '☀';
});

document.getElementById('lang-btn').addEventListener('click', e => {
  e.stopPropagation();
  const m = document.getElementById('lang-menu');
  m.hidden = !m.hidden;
  document.getElementById('lang-btn').setAttribute('aria-expanded', String(!m.hidden));
});

document.getElementById('lang-menu').addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (!b) return;
  traduci(b.dataset.lang);
  document.getElementById('lang-menu').hidden = true;
});

document.addEventListener('click', e => {
  if (!e.target.closest('#lang-box')) document.getElementById('lang-menu').hidden = true;
});

/* ── avvio ─────────────────────────────────────────────────────────── */
export async function avvia() {
  TESTI = (await caricaTesti(ORIGINALE)) || {};
  applicaTesti();
  avvisoTraduzione(ORIGINALE);
}
