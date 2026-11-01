#!/usr/bin/env bash
# Builds the Windows installer and portable app into desktop/dist. Works on Linux or macOS (no Wine needed).
# Usage: cd desktop && npm install && ./build-windows.sh
set -e
cd "$(dirname "$0")"
VER=$(node -p "require('./package.json').version")
node prep.js
npx electron-builder --win dir --x64            # app folder with icon (dist/win-unpacked)
npx electron-builder --win portable --x64 --prepackaged dist/win-unpacked
N=$(ls -d ~/.cache/electron-builder/nsis/nsis-3* | head -1)
OS=$( [ "$(uname)" = Darwin ] && echo mac || echo linux )
chmod +x "$N/$OS/makensis"
NSISDIR="$N" "$N/$OS/makensis" -V2 -DVERSION="$VER" installer.nsi
ls -lh dist/*.exe
