"""Fail loudly if any icon corner is uneven or the glyph is off centre at any output size."""
from PIL import Image
import sys

repo = sys.argv[1]
problems = []


def corner_profile(px, w, h):
    """How far the transparent (or plate-free) notch reaches along each edge, per corner."""
    def run(coords):
        n = 0
        for x, y in coords:
            if px[x, y][3] < 128:
                n += 1
            else:
                break
        return n
    return {
        'TL': (run([(x, 0) for x in range(w)]), run([(0, y) for y in range(h)])),
        'TR': (run([(x, 0) for x in range(w - 1, -1, -1)]), run([(w - 1, y) for y in range(h)])),
        'BL': (run([(x, h - 1) for x in range(w)]), run([(0, y) for y in range(h - 1, -1, -1)])),
        'BR': (run([(x, h - 1) for x in range(w - 1, -1, -1)]), run([(w - 1, y) for y in range(h - 1, -1, -1)])),
    }


def glyph_box(px, w, h, need_alpha):
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            a = p[3] if need_alpha else 255
            lum = p[0] * 0.299 + p[1] * 0.587 + p[2] * 0.114
            if a > 200 and lum > 200:
                xs.append(x); ys.append(y)
    return min(xs), max(xs), min(ys), max(ys)


def check(label, im, rounded=True):
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    line = f'{label:26s} {w}x{h}'
    if rounded:
        prof = corner_profile(px, w, h)
        reaches = sorted(set(prof.values()))
        line += f'  corners {prof["TL"]} {prof["TR"]} {prof["BL"]} {prof["BR"]}'
        if len(reaches) != 1:
            problems.append(f'{label}: corner insets differ -> {prof}')
        # both legs of each corner must match, i.e. the radius is circular, not elliptical
        for k, (a, b) in prof.items():
            if a != b:
                problems.append(f'{label}: {k} corner is elliptical ({a} across vs {b} down)')
        if prof['TL'][0] == 0:
            problems.append(f'{label}: corners are not rounded at all')
    x0, x1, y0, y1 = glyph_box(px, w, h, rounded)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    cc = (w - 1) / 2
    line += f'  glyph x[{x0},{x1}] y[{y0},{y1}] off-centre ({cx - cc:+.1f}, {cy - cc:+.1f})'
    print(line)
    # one pixel of slack: an even-width glyph on an odd canvas cannot land exactly
    if abs(cx - cc) > 0.5 or abs(cy - cc) > 0.5:
        problems.append(f'{label}: glyph off centre by ({cx - cc:+.2f}, {cy - cc:+.2f})')


check('mark', Image.open(f'{repo}/public/images/edcloud-mark.png'))
for sz in [(16, 16), (32, 32), (48, 48), (64, 64)]:
    im = Image.open(f'{repo}/public/favicon.ico')
    im.size = sz
    check(f'favicon {sz[0]}', im)
check('apple-touch-icon', Image.open(f'{repo}/public/apple-touch-icon.png'), rounded=False)

print()
if problems:
    print('PROBLEMS:')
    for p in problems:
        print(' -', p)
    sys.exit(1)
print('all icon checks passed')
