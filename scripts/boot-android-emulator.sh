#!/usr/bin/env bash
set -euo pipefail

: "${ANDROID_HOME:?ANDROID_HOME must point at the Android SDK}"
adb="${ANDROID_HOME}/platform-tools/adb"
emulator="${ANDROID_HOME}/emulator/emulator"
boot_timeout_seconds="${EMULATOR_BOOT_TIMEOUT:-300}"

if "${adb}" devices | grep -qE '^emulator-[0-9]+[[:space:]]+device$'; then
  echo "✓ Android emulator already running:"
  "${adb}" devices | grep -E '^emulator-'
  exit 0
fi

avd="${ANDROID_AVD:-$("${emulator}" -list-avds | head -n 1)}"
if [[ -z "${avd}" ]]; then
  echo "✗ No AVD found. Create one in Android Studio (Device Manager) or with avdmanager." >&2
  exit 1
fi

args=(-avd "${avd}" -no-snapshot-save -no-boot-anim -no-audio)
if [[ -n "${EMULATOR_HEADLESS:-}" ]]; then
  args+=(-no-window)
fi

log_file="${TMPDIR:-/tmp}/emulator-${avd}.log"
echo "↻ Starting AVD ${avd} (log: ${log_file})"
nohup "${emulator}" "${args[@]}" >"${log_file}" 2>&1 &

"${adb}" wait-for-device
for ((waited = 0; waited < boot_timeout_seconds; waited += 2)); do
  if [[ "$("${adb}" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == "1" ]]; then
    echo "✓ ${avd} booted"
    exit 0
  fi
  sleep 2
done

echo "✗ ${avd} did not finish booting within ${boot_timeout_seconds}s, see ${log_file}" >&2
exit 1
