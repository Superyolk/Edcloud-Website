"""Rebuild the EdCloud mark from the supplied logo photograph.

The source is a 100x100 JPEG of the mark: a white serif "e" on a grey plate, lit unevenly and
carrying a drop shadow down and to the right. Both of those make the glyph read as off-centre even
though its bounding box is dead centre, and the plate's lighting gradient makes the corners read as
uneven. So we don't mask the photograph -- we lift the glyph silhouette out of it and redraw the
mark: flat plate, crisp glyph, one radius.

Every output size is rendered from the supersampled master and reduced once, so the corner
anti-aliasing is identical on all four corners at 16px and at 256px alike.
"""
from PIL import Image, ImageDraw

SRC = "source.jpg"
SS = 16                 # supersample factor for the master
MASTER = 100 * SS       # 1600x1600
RADIUS_PCT = 0.22       # share of the edge length; clearly rounded at 16px, still a square plate
GLYPH_HEIGHT_PCT = 0.46 # matches the source: glyph is 46/100 of the plate

PLATE = (145, 141, 138)
INK = (255, 255, 255)

# Alpha ramp over the source luminance. The plate sits near 143 and the glyph near 250, so a narrow
# ramp around the midpoint re-sharpens the contour that the upscale softened. The shadow is darker
# than the plate, so it falls below the ramp and disappears -- which is the point.
RAMP_LO, RAMP_HI = 172.0, 190.0


def glyph_alpha():
    """The glyph silhouette, cropped to its own bounding box, as an antialiased L-mode mask."""
    lum = Image.open(SRC).convert('L').resize((MASTER, MASTER), Image.LANCZOS)
    mask = lum.point(lambda v: 0 if v <= RAMP_LO else 255 if v >= RAMP_HI
                     else int(round((v - RAMP_LO) / (RAMP_HI - RAMP_LO) * 255)))
    return mask.crop(mask.getbbox())


def rounded_mask(size, radius):
    m = Image.new('L', (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def master():
    """The mark at MASTER resolution, opaque, no corner mask yet."""
    g = glyph_alpha()
    target_h = int(round(MASTER * GLYPH_HEIGHT_PCT))
    target_w = int(round(g.width * target_h / g.height))
    g = g.resize((target_w, target_h), Image.LANCZOS)

    plate = Image.new('RGB', (MASTER, MASTER), PLATE)
    ink = Image.new('RGB', (MASTER, MASTER), INK)
    # Integer offsets that split the leftover space as evenly as the pixel grid allows.
    ox, oy = (MASTER - target_w) // 2, (MASTER - target_h) // 2
    full = Image.new('L', (MASTER, MASTER), 0)
    full.paste(g, (ox, oy))
    return Image.composite(ink, plate, full)


def render(base, size, *, transparent):
    """One output size: reduce the master once, then apply a radius rendered at that same reduction."""
    rgb = base.resize((size, size), Image.LANCZOS)
    if not transparent:
        return rgb
    r = int(round(size * SS * RADIUS_PCT))
    alpha = rounded_mask(size * SS, r).resize((size, size), Image.LANCZOS)
    out = rgb.convert('RGBA')
    out.putalpha(alpha)
    return out


if __name__ == '__main__':
    import os, sys
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    repo = sys.argv[1]
    base = master()

    render(base, 256, transparent=True).save(f'{repo}/public/images/edcloud-mark.png')

    frames = [render(base, s, transparent=True) for s in (16, 32, 48, 64)]
    frames[-1].save(f'{repo}/public/favicon.ico', format='ICO',
                    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
                    append_images=frames[:-1])

    # Google Search's favicon: a square PNG in a multiple of 48px, linked from the home page.
    render(base, 192, transparent=True).save(f'{repo}/public/icon-192.png')

    # iOS applies its own, larger mask and renders transparency poorly, so this one stays square.
    render(base, 180, transparent=False).save(f'{repo}/public/apple-touch-icon.png')
    print('wrote mark (256), favicon (16/32/48/64), icon-192, apple-touch-icon (180)')
