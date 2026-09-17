#!/usr/bin/env bash

set -Eeuo pipefail
umask 027

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/../.." && pwd)"
cd "$project_root"

node_is_version_22() {
  command -v node >/dev/null 2>&1 && [[ "$(node --version)" == v22.* ]]
}

if ! node_is_version_22; then
  for candidate in /opt/plesk/node/22/bin/node /opt/plesk/node/22.*/bin/node; do
    if [[ -x "$candidate" ]]; then
      export PATH="$(dirname "$candidate"):$PATH"
      break
    fi
  done
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Fehler: Node.js wurde nicht gefunden. In Plesk muss Node.js 22 aktiviert sein." >&2
  exit 1
fi

if ! node_is_version_22; then
  echo "Fehler: Node.js 22 wird benötigt, gefunden wurde $(node --version)." >&2
  exit 1
fi

if command -v corepack >/dev/null 2>&1; then
  package_manager=(corepack pnpm)
elif command -v pnpm >/dev/null 2>&1; then
  package_manager=(pnpm)
else
  echo "Fehler: Weder pnpm noch Corepack wurde gefunden." >&2
  exit 1
fi

export NEXT_TELEMETRY_DISABLED=1
export GITHUB_SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"

echo "FahrSeiten wird aus Git-Revision ${GITHUB_SHA:0:12} gebaut."
"${package_manager[@]}" install --frozen-lockfile --prod=false
"${package_manager[@]}" test:plesk
"${package_manager[@]}" build:plesk
"${package_manager[@]}" verify:plesk

test -s dist/plesk/app.mjs
test -s dist/plesk/server.js

echo "FahrSeiten wurde erfolgreich unter $project_root/dist/plesk bereitgestellt."
echo "Application Root: $project_root/dist/plesk"
echo "Document Root: $project_root/dist/plesk/public"
echo "Startup File: app.mjs"
