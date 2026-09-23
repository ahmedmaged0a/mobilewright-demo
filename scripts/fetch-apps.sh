#!/usr/bin/env bash
set -euo pipefail

ANDROID_VERSION="2.2.0"
ANDROID_BUILD="25"
IOS_VERSION="2.2.2"

ANDROID_URL="https://github.com/saucelabs/my-demo-app-android/releases/download/${ANDROID_VERSION}/mda-${ANDROID_VERSION}-${ANDROID_BUILD}.apk"
IOS_SIMULATOR_URL="https://github.com/saucelabs/my-demo-app-ios/releases/download/${IOS_VERSION}/SauceLabs-Demo-App.Simulator.zip"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_APP="${ROOT_DIR}/apps/android/my-demo-app.apk"
IOS_APP="${ROOT_DIR}/apps/ios/my-demo-app-simulator.zip"

download() {
  curl --fail --silent --show-error --location --retry 3 --output "$2" "$1"
}

needs_download() {
  if [[ -f "$1" && -z "${FORCE:-}" ]]; then
    echo "✓ $(basename "$1") already present (FORCE=1 to re-download)"
    return 1
  fi
}

fetch_android() {
  needs_download "${ANDROID_APP}" || return 0
  mkdir -p "$(dirname "${ANDROID_APP}")"
  echo "↓ My Demo App Android ${ANDROID_VERSION}"
  download "${ANDROID_URL}" "${ANDROID_APP}"
  echo "✓ ${ANDROID_APP}"
}

fetch_ios() {
  needs_download "${IOS_APP}" || return 0
  local work_dir
  work_dir="$(mktemp -d)"
  trap 'rm -rf "${work_dir}"' RETURN

  echo "↓ My Demo App iOS ${IOS_VERSION} (simulator build)"
  download "${IOS_SIMULATOR_URL}" "${work_dir}/release.zip"
  unzip -q "${work_dir}/release.zip" -d "${work_dir}/release"

  local app_bundle
  app_bundle="$(find "${work_dir}/release" -maxdepth 2 -type d -name '*.app' -print -quit)"
  if [[ -z "${app_bundle}" ]]; then
    echo "✗ no .app bundle found in ${IOS_SIMULATOR_URL}" >&2
    return 1
  fi

  mkdir -p "$(dirname "${IOS_APP}")"
  rm -f "${IOS_APP}"
  (cd "$(dirname "${app_bundle}")" && zip -q -r -y "${IOS_APP}" "$(basename "${app_bundle}")")
  echo "✓ ${IOS_APP}"
}

platforms=("$@")
if [[ ${#platforms[@]} -eq 0 ]]; then
  platforms=(android ios)
fi

for platform in "${platforms[@]}"; do
  case "${platform}" in
    android) fetch_android ;;
    ios) fetch_ios ;;
    *)
      echo "Unknown platform '${platform}', expected 'android' or 'ios'" >&2
      exit 2
      ;;
  esac
done
