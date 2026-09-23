#!/usr/bin/env bash
set -euo pipefail

requested="${IOS_SIMULATOR:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILECLI="${ROOT_DIR}/node_modules/@mobilenext/mobilecli-darwin-arm64/mobilecli-darwin-arm64"

ensure_agent() {
  local udid="$1"
  if [[ -x "${MOBILECLI}" ]]; then
    echo "↻ Ensuring mobilecli agent on ${udid}"
    "${MOBILECLI}" agent install --device "${udid}" >/dev/null
    echo "✓ mobilecli agent ready"
  else
    echo "⚠ mobilecli binary not found — run npm install, then: npx mobilewright doctor"
  fi
}

if [[ -z "${requested}" ]] && xcrun simctl list devices booted | grep -qE '^\s+iPhone'; then
  echo "✓ iPhone simulator already booted:"
  xcrun simctl list devices booted | grep -E '^\s+iPhone'
  already_udid="$(xcrun simctl list devices booted | awk -F '[()]' '/iPhone/ {print $2; exit}')"
  ensure_agent "${already_udid}"
  exit 0
fi

udid="$(xcrun simctl list devices available --json | node -e '
  const requested = process.argv[1];
  const { devices } = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const version = (runtime) => (runtime.match(/iOS-([\d-]+)$/)?.[1] ?? "0").split("-").map(Number);
  const newestFirst = (a, b) => {
    const [va, vb] = [version(a), version(b)];
    for (let i = 0; i < Math.max(va.length, vb.length); i++) {
      if ((vb[i] ?? 0) !== (va[i] ?? 0)) return (vb[i] ?? 0) - (va[i] ?? 0);
    }
    return 0;
  };
  for (const runtime of Object.keys(devices).filter((r) => r.includes("SimRuntime.iOS")).sort(newestFirst)) {
    const match = devices[runtime].find((d) => (requested ? d.name === requested : d.name.startsWith("iPhone")));
    if (match) {
      console.log(match.udid);
      process.exit(0);
    }
  }
  process.exit(1);
' "${requested}")" || {
  echo "✗ No available simulator matches '${requested:-iPhone*}'. Install an iOS runtime in Xcode > Settings > Components." >&2
  exit 1
}

echo "↻ Booting simulator ${udid}"
xcrun simctl bootstatus "${udid}" -b
xcrun simctl list devices booted | grep "${udid}"
ensure_agent "${udid}"
