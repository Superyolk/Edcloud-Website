"""Trim every client logo to its visible artwork, so the wall can size logos by shape.

The files came off the old site with wildly different built-in margins (BookNook's artwork was
15% of its canvas), which made some logos render at a fraction of their neighbours' size no
matter how the tiles were laid out. This crops each file to the pixels that actually show on a
white tile (plus a 2px margin), caps the long edge at 440px (twice the largest box it renders
in), and re-saves at WebP quality 90. Safe to re-run: an
already-trimmed file comes back unchanged. Prints the new sizes for content.js.

    python3 scripts/logos/trim-logos.py
"""
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'images', 'logos')
MARGIN, MAX_EDGE = 2, 440

for path in sorted(glob.glob(os.path.join(ROOT, '*.webp'))):
    im = Image.open(path).convert('RGBA')
    flat = Image.alpha_composite(Image.new('RGBA', im.size, (255, 255, 255, 255)), im).convert('L')
    # visible = darker than the white tile it sits on
    bbox = flat.point(lambda v: 255 if v < 248 else 0).getbbox()
    x0, y0, x1, y1 = bbox
    x0, y0 = max(0, x0 - MARGIN), max(0, y0 - MARGIN)
    x1, y1 = min(im.width, x1 + MARGIN), min(im.height, y1 + MARGIN)
    out = im.crop((x0, y0, x1, y1))
    if max(out.size) > MAX_EDGE:
        s = MAX_EDGE / max(out.size)
        out = out.resize((round(out.width * s), round(out.height * s)), Image.LANCZOS)
    if out.size != im.size:
        out.save(path, 'WEBP', quality=90, method=6)
    print(f"{os.path.basename(path):34s} {im.width}x{im.height} -> {out.width}x{out.height}")
