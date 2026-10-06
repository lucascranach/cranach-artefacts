#!/usr/bin/env bash
# Kopiert die Daten eines Importer-Laufs (importer/docs/YYYYMMDD) nach .cache.
#
# Aufruf:
#   helper/sync-import.sh            # neuester Ordner in importer/docs
#   helper/sync-import.sh 20260928   # bestimmter Ordner
#   helper/sync-import.sh -n         # nur anzeigen, was kopiert würde
#
# Pfad zum Importer über IMPORTER_DIR anpassbar (Default: ../importer).
# Es wird nichts in .cache gelöscht, ein Teilimport (z. B. nur Drawings)
# überschreibt also nur die betroffenen Dateien.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMPORTER_DIR="${IMPORTER_DIR:-$ROOT/../importer}"
TARGET="$ROOT/.cache"

DRY_RUN=""
RUN=""
for arg in "$@"; do
  case "$arg" in
    -n|--dry-run) DRY_RUN="--dry-run" ;;
    *) RUN="$arg" ;;
  esac
done

DOCS="$IMPORTER_DIR/docs"
[ -d "$DOCS" ] || { echo "Importer-Ausgabe nicht gefunden: $DOCS" >&2; exit 1; }

if [ -z "$RUN" ]; then
  RUN="$(ls -1 "$DOCS" | grep -E '^[0-9]{8}$' | sort | tail -n 1 || true)"
fi

SOURCE="$DOCS/$RUN"
[ -n "$RUN" ] && [ -d "$SOURCE" ] || { echo "Kein Import-Ordner gefunden: $SOURCE" >&2; exit 1; }

echo "Quelle: $SOURCE"
echo "Ziel:   $TARGET"
mkdir -p "$TARGET"

rsync -av $DRY_RUN \
  --include='*/' --include='*.json' --include='*.bulk' --exclude='*' \
  "$SOURCE/" "$TARGET/"

if ! ls "$SOURCE"/*.json >/dev/null 2>&1; then
  echo "Hinweis: In $SOURCE liegen keine JSON-Dateien direkt im Ordner." >&2
fi
