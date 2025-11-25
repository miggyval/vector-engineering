#!/usr/bin/env bash
set -euo pipefail

# Go to the directory this script lives in (circuits/)
cd "$(dirname "$0")"

OUT_DIR=../docs/media/circuits
mkdir -p "$OUT_DIR"

# Loop over all .tex files in this directory
for TEX in *.tex; do
  # Skip if no .tex files
  [ -e "$TEX" ] || continue

  BASENAME="${TEX%.tex}"
  PDF="${BASENAME}.pdf"
  PDF_CROP="${BASENAME}-crop.pdf"
  SVG="${BASENAME}.svg"

  echo "=== Building $TEX → $SVG ==="

  echo "Compiling $TEX → $PDF..."
  lualatex -interaction=nonstopmode "$TEX" >/dev/null

  echo "Cropping $PDF → $PDF_CROP..."
  pdfcrop "$PDF" "$PDF_CROP" >/dev/null

  echo "Converting $PDF_CROP → $SVG..."
  pdf2svg "$PDF_CROP" "$SVG"

  echo "Copying $SVG → $OUT_DIR/$SVG"
  cp "$SVG" "$OUT_DIR/$SVG"

  echo "Cleaning up intermediates for $BASENAME..."
  rm -f \
    "$PDF" \
    "$PDF_CROP" \
    "$SVG" \
    "${BASENAME}.aux" \
    "${BASENAME}.log" \
    "${BASENAME}.out" \
    "${BASENAME}.toc" \
    "${BASENAME}.fls" \
    "${BASENAME}.fdb_latexmk"

  echo "Done with $TEX."
  echo
done

echo "All .tex files processed."
