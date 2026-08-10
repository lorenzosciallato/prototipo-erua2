#!/usr/bin/env bash
# ERUA connect — il giro dei robot
# ===================================================================
# Da lanciare dal cron sul server dedicato. Fa una cosa sola: aggiorna i
# file di dati e li pubblica passando dal controllo di versione, come
# chiede riferimento.md §2.11 — mai interventi diretti sull'ambiente
# pubblicato, perché senza cronologia non c'è ripristino.
#
#   crontab -e
#   17 5 * * *  /percorso/prototipo-erua2/robot/giro.sh >> /var/log/erua-robot.log 2>&1
#   0  9 * * *  cd /percorso/prototipo-erua2 && node robot/comune/registro.js 36
#
# La seconda riga è quella che vale davvero: controlla che i robot
# abbiano dato segno di vita nelle ultime 36 ore e, se non l'hanno fatto,
# esce con errore — cioè fa mandare a cron la mail. Un robot che va in
# errore lo si scopre subito; uno che smette di partire produce silenzio,
# e il silenzio non arriva a nessuno (§2.8).
#
# Ogni robot è indipendente: se le notizie non si aggiornano, le puntate
# si aggiornano lo stesso (§2.2).

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO" || exit 1

echo "── giro dei robot, $(date '+%d/%m/%Y %H:%M') ──"

# ─── 1. Partire da quello che c'è pubblicato ────────────────────────
# Se qualcuno ha modificato i dati da un'altra parte, non li calpestiamo.
if ! git pull --rebase --quiet 2>/dev/null; then
  echo "ATTENZIONE: non sono riuscito ad allinearmi al remoto. Proseguo sul locale."
fi

# ─── 2. I robot, uno per volta ──────────────────────────────────────
for robot in notizie ascolta didattica studenti; do
  echo
  echo "· $robot"
  if node "robot/$robot.js"; then
    echo "  ok"
  else
    # L'esito è già registrato in robot/stato.json dal robot stesso.
    echo "  non riuscito — gli altri proseguono"
  fi
done

# ─── 3. P4 prima di pubblicare ──────────────────────────────────────
# I robot scrivono dati, non credenziali, ma il controllo costa nulla e
# la regola è che nessun segreto esce da qui (§5.2).
if [ -x .claude/hooks/cerca-segreti.sh ]; then
  if ! ESITO="$(.claude/hooks/cerca-segreti.sh 2>&1)"; then
    echo
    echo "BLOCCO P4 — possibile segreto nei file. Non pubblico niente."
    echo "$ESITO"
    exit 2
  fi
fi

# ─── 4. Pubblicazione ───────────────────────────────────────────────
echo
if git diff --quiet -- dati/ robot/stato.json; then
  echo "niente di nuovo da pubblicare."
  exit 0
fi

git add -- dati/ robot/stato.json
git commit -q -m "Aggiornamento automatico dei dati — $(date '+%d/%m/%Y %H:%M')

Prodotto da robot/giro.sh. Il dettaglio di ogni robot, con esito e
quantità, è in robot/stato.json."

if timeout 120 git push --quiet origin HEAD; then
  echo "pubblicato: $(git rev-parse --short HEAD)"
else
  echo "commit $(git rev-parse --short HEAD) registrato in locale, ma il push è fallito."
  echo "Il prossimo giro riproverà: il commit resta e non si perde niente."
  exit 1
fi
