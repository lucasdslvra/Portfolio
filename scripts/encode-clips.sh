#!/usr/bin/env bash
# Encode les clips embarqués pour le web : muets, 1280 px, 30 i/s, moins de 4 Mo.
# Produit pour chaque source <nom>.mp4 : <nom>.mp4 (H.264), <nom>.webm (VP9) et <nom>.jpg (poster).
#
# Usage : npm run clips:encode            (clips-source/ → public/clips/)
#         scripts/encode-clips.sh <dossier-source> <dossier-sortie>
set -euo pipefail

SRC="${1:-clips-source}"
OUT="${2:-public/clips}"
mkdir -p "$OUT"

VF="fps=30,scale=1280:-2:flags=lanczos"

# libx264 si disponible (meilleure qualité), sinon OpenH264 (ffmpeg de Fedora).
if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q " libx264 "; then
  H264=(-c:v libx264 -preset slow -crf 26 -maxrate 2200k -bufsize 4400k)
else
  H264=(-c:v libopenh264 -profile:v high -b:v 1900k -maxrate 2200k)
fi

shopt -s nullglob
files=("$SRC"/*.mp4)
if [ ${#files[@]} -eq 0 ]; then
  echo "Aucun .mp4 dans $SRC/"
  exit 1
fi

for input in "${files[@]}"; do
  name="$(basename "$input" .mp4)"
  echo "→ $name"
  ffmpeg -v error -y -i "$input" -an -vf "$VF" "${H264[@]}" -g 60 -pix_fmt yuv420p -movflags +faststart "$OUT/$name.mp4"
  ffmpeg -v error -y -i "$input" -an -vf "$VF" -c:v libvpx-vp9 -b:v 1400k -maxrate 1800k -crf 34 \
    -row-mt 1 -deadline good -cpu-used 2 -g 60 -pix_fmt yuv420p "$OUT/$name.webm"
  ffmpeg -v error -y -i "$OUT/$name.mp4" -frames:v 1 -q:v 4 "$OUT/$name.jpg"
  for ext in mp4 webm jpg; do
    size=$(stat -c %s "$OUT/$name.$ext")
    awk -v e="$ext" -v s="$size" 'BEGIN { printf "   %-5s %6.2f Mo%s\n", e, s / 1048576, (s > 4194304 ? "  ⚠ plus de 4 Mo" : "") }'
  done
done
