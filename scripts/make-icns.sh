#!/bin/bash
set -e

ICON_SRC="assets/icon.png"
ICONSET="assets/icon.iconset"
ICNS_OUT="assets/icon.icns"

if [ ! -f "$ICON_SRC" ]; then
  echo "Error: $ICON_SRC not found. Place your 1024x1024 PNG there first."
  exit 1
fi

mkdir -p "$ICONSET"

sips -z 16   16   "$ICON_SRC" --out "$ICONSET/icon_16x16.png"      > /dev/null
sips -z 32   32   "$ICON_SRC" --out "$ICONSET/icon_16x16@2x.png"   > /dev/null
sips -z 32   32   "$ICON_SRC" --out "$ICONSET/icon_32x32.png"      > /dev/null
sips -z 64   64   "$ICON_SRC" --out "$ICONSET/icon_32x32@2x.png"   > /dev/null
sips -z 128  128  "$ICON_SRC" --out "$ICONSET/icon_128x128.png"    > /dev/null
sips -z 256  256  "$ICON_SRC" --out "$ICONSET/icon_128x128@2x.png" > /dev/null
sips -z 256  256  "$ICON_SRC" --out "$ICONSET/icon_256x256.png"    > /dev/null
sips -z 512  512  "$ICON_SRC" --out "$ICONSET/icon_256x256@2x.png" > /dev/null
sips -z 512  512  "$ICON_SRC" --out "$ICONSET/icon_512x512.png"    > /dev/null
cp "$ICON_SRC"                      "$ICONSET/icon_512x512@2x.png"

iconutil -c icns "$ICONSET" -o "$ICNS_OUT"

rm -rf "$ICONSET"

echo "Created $ICNS_OUT"
