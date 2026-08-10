#!/usr/bin/env bash
# ERUA connect — salvataggio automatico del codice di presentazione.
#
# Scatta dopo ogni Write/Edit su un file .html, .css o .js del progetto e:
#   1. cerca segreti (P4) — se ne trova uno, non salva e non pubblica nulla;
#   2. aggiorna il timbro in fondo a STATO.md;
#   3. registra un commit;
#   4. lo manda su GitHub.
#
# RIFERIMENTO.md §2.11 (ogni modifica passa dal controllo di versione),
# §5.2 (la ricerca dei segreti precede l'invio a sistemi esterni).
set -uo pipefail

REPO="/home/lorenzosciallato/prototipo-erua2"
cd "$REPO" 2>/dev/null || exit 0

# ─── 1. Quale file è stato toccato? ────────────────────────────────────────
FILE="$(python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti = d.get("tool_input") or {}
tr = d.get("tool_response") or {}
print(tr.get("filePath") or ti.get("file_path") or "")
' 2>/dev/null)"

[ -n "$FILE" ] || exit 0

# Solo file dentro il progetto, e non la cartella degli automatismi.
case "$FILE" in
  "$REPO"/.claude/*) exit 0 ;;
  "$REPO"/*.html|"$REPO"/*.css|"$REPO"/*.js) ;;
  "$REPO"/*/*.html|"$REPO"/*/*.css|"$REPO"/*/*.js) ;;
  *) exit 0 ;;
esac

REL="${FILE#"$REPO"/}"

# ─── 2. P4: nessun segreto esce da qui ─────────────────────────────────────
if ! ESITO="$("$REPO/.claude/hooks/cerca-segreti.sh" 2>&1)"; then
  {
    echo "BLOCCO P4 — possibile segreto nel codice."
    echo "Non ho salvato né pubblicato niente."
    echo
    echo "$ESITO"
  } >&2
  exit 2
fi

# ─── 3. Timbro in fondo a STATO.md ─────────────────────────────────────────
MARCA='<!-- TIMBRO AUTOMATICO'
[ -f STATO.md ] || printf '# Stato del lavoro\n\n' > STATO.md
sed -i "/$MARCA/,\$d" STATO.md
{
  printf '%s — aggiornato dal salvataggio automatico, non modificare a mano -->\n\n' "$MARCA"
  printf '## Registro automatico\n\n'
  printf 'Ultimo salvataggio: **%s** — file toccato: `%s`\n\n' "$(date '+%d/%m/%Y alle %H:%M')" "$REL"
  printf '| File | Righe | Peso |\n|:--|--:|--:|\n'
  git ls-files -- '*.html' '*.css' '*.js' | sort | while read -r f; do
    [ -f "$f" ] || continue
    printf '| `%s` | %s | %s |\n' "$f" "$(wc -l < "$f" | tr -d ' ')" "$(du -h "$f" | cut -f1)"
  done
  printf '\n<!-- fine timbro automatico -->\n'
} >> STATO.md

# ─── 4. Commit ─────────────────────────────────────────────────────────────
git add -- "$REL" STATO.md 2>/dev/null
if git diff --cached --quiet 2>/dev/null; then
  exit 0   # niente di nuovo da salvare
fi
git commit -q -m "$REL — salvataggio automatico $(date '+%d/%m/%Y %H:%M')" || exit 0
BREVE="$(git rev-parse --short HEAD)"

# ─── 5. Pubblicazione su GitHub ────────────────────────────────────────────
if timeout 60 git push -q origin HEAD 2>/dev/null; then
  printf '{"systemMessage":"Salvato e pubblicato: %s (commit %s)","suppressOutput":true}\n' "$REL" "$BREVE"
else
  printf '{"systemMessage":"Commit %s registrato in locale, ma il push è fallito. Da terminale: git push origin main","suppressOutput":true}\n' "$BREVE"
fi
exit 0
