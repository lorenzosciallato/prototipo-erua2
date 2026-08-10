#!/usr/bin/env bash
# ERUA connect — regola P4: nessun segreto nel codice pubblicato.
# Controllo deterministico eseguito PRIMA di ogni commit e di ogni push
# (RIFERIMENTO.md §5.2 punto 1; §5.3: la ricerca dei segreti precede l'invio).
#
#   uscita 0 = pulito
#   uscita 1 = trovato qualcosa, oppure il controllo stesso non ha potuto girare
#
# Il secondo caso è deliberato: un cancello di sicurezza che non riesce a
# funzionare deve fermare tutto, non lasciar passare in silenzio.
#
# Si lancia anche a mano:  .claude/hooks/cerca-segreti.sh
set -uo pipefail

REPO="/home/lorenzosciallato/prototipo-erua2"
cd "$REPO" || { echo "P4: non trovo la cartella del progetto."; exit 1; }

# Lo strumento c'è e funziona? Altrimenti si ferma tutto.
if ! echo 'prova' | grep -qP 'pro(va)?' 2>/dev/null; then
  echo "P4: 'grep -P' non disponibile — controllo dei segreti impossibile, mi fermo."
  exit 1
fi

trovati=0

# Valori palesemente fittizi: non sono segreti, non devono bloccare il lavoro.
FINTI='xxx|yyy|zzz|changeme|cambiami|your[-_ ]|placeholder|esempio|example|\.\.\.|TODO|INSERISCI'

cerca() { # $1 = che cos'è  |  $2 = espressione regolare
  local out
  out="$(grep -rPIno --binary-files=without-match \
           --exclude-dir=.git --exclude-dir=hooks --exclude-dir=node_modules \
           -e "$2" . 2>/dev/null \
         | grep -vPi "$FINTI" \
         | cut -c1-200 | head -3)"
  if [ -n "$out" ]; then
    printf '  ▸ %s\n%s\n' "$1" "$out"
    trovati=1
  fi
}

cerca 'chiave privata'                '-----BEGIN [A-Z ]*PRIVATE KEY-----'
cerca 'chiave AWS'                    'AKIA[0-9A-Z]{16}'
cerca 'token GitHub'                  'gh[pousr]_[A-Za-z0-9]{30,}'
cerca 'token Slack'                   'xox[baprs]-[0-9A-Za-z-]{10,}'
cerca 'chiave Google'                 'AIza[0-9A-Za-z_-]{35}'
cerca 'chiave Stripe'                 'sk_live_[0-9a-zA-Z]{20,}'
cerca 'chiave Anthropic/OpenAI'       'sk-(ant-)?[A-Za-z0-9_-]{30,}'
cerca 'token JWT (chiave Supabase?)'  'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
cerca 'chiave di servizio Supabase'   'service_role'
cerca 'credenziale scritta in chiaro' '\b(api[_-]?key|secret|token|password|passwd|pwd)\b\s*[:=]\s*["'"'"'][^"'"'"']{12,}["'"'"']'

# Un file di ambiente non deve mai finire sotto controllo di versione.
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo '  ▸ il file .env risulta tracciato da git'
  trovati=1
fi

if [ "$trovati" -ne 0 ]; then
  echo
  echo "Regola P4 violata. Togli il valore dal codice, mettilo in una variabile"
  echo "d'ambiente, e considera già compromesso il segreto che era scritto nel file:"
  echo "va revocato e rigenerato, non basta cancellarlo."
  exit 1
fi
exit 0
