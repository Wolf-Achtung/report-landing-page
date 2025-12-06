#!/bin/bash
# Image Processing Script for Web Optimization
# Creates Desktop (3200x1370), Tablet (1920x1080), Mobile (1080x1350) WebP versions

SOURCE_DIR="../images"
DESKTOP_DIR="./desktop"
TABLET_DIR="./tablet"
MOBILE_DIR="./mobile"

# Color palette to preserve:
# Navy: #0A1628 - #1A3A5C
# Gold: #C9A227 - #E0C65A
# Off-White: #F8F9FA

echo "=== Image Processing Started ==="
echo ""

for i in 01 02 03 04 05 06 07; do
    SOURCE_FILE="${SOURCE_DIR}/${i}.png"

    if [ ! -f "$SOURCE_FILE" ]; then
        echo "[SKIP] ${i}.png not found in source directory"
        continue
    fi

    echo "[Processing] ${i}.png"

    # Get original dimensions
    ORIG_SIZE=$(identify -format "%wx%h" "$SOURCE_FILE" 2>/dev/null)
    echo "  Original size: $ORIG_SIZE"

    # Desktop: 3200x1370 (21:9) - Maximum quality
    echo "  Creating desktop version (3200x1370)..."
    convert "$SOURCE_FILE" \
        -resize 3200x1370^ \
        -gravity center \
        -extent 3200x1370 \
        -quality 100 \
        -define webp:lossless=false \
        -define webp:method=6 \
        -define webp:alpha-quality=100 \
        "${DESKTOP_DIR}/${i}-desktop.webp"

    # Tablet: 1920x1080 (16:9) - Balanced compression (~80 quality)
    echo "  Creating tablet version (1920x1080)..."
    convert "$SOURCE_FILE" \
        -resize 1920x1080^ \
        -gravity center \
        -extent 1920x1080 \
        -quality 80 \
        -define webp:method=6 \
        "${TABLET_DIR}/${i}-tablet.webp"

    # Mobile: 1080x1350 (4:5) - Vertical smartphone layout
    echo "  Creating mobile version (1080x1350)..."
    convert "$SOURCE_FILE" \
        -resize 1080x1350^ \
        -gravity center \
        -extent 1080x1350 \
        -quality 85 \
        -define webp:method=6 \
        "${MOBILE_DIR}/${i}-mobile.webp"

    echo "  [OK] ${i}.png processed successfully"
    echo ""
done

echo "=== Processing Complete ==="
echo ""
echo "Generated files:"
echo ""
echo "Desktop (3200x1370):"
ls -lh "${DESKTOP_DIR}"/*.webp 2>/dev/null || echo "  No files"
echo ""
echo "Tablet (1920x1080):"
ls -lh "${TABLET_DIR}"/*.webp 2>/dev/null || echo "  No files"
echo ""
echo "Mobile (1080x1350):"
ls -lh "${MOBILE_DIR}"/*.webp 2>/dev/null || echo "  No files"
