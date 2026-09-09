"""Lossless editable pixel-path SVG. Requires Pillow; no invented image detail."""
from pathlib import Path
from collections import defaultdict
import sys
from PIL import Image
root = Path(__file__).resolve().parent
im = Image.open(sys.argv[1]).convert('RGB')
w, h = im.size
parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" shape-rendering="crispEdges" role="img" aria-labelledby="title desc">', '<title id="title">Alchembright — original logo</title>', '<desc id="desc">Original image colors preserved as editable vector pixel paths, grouped into left and right halves. No raster embedding. Source resolution 132 by 132; this conversion does not reconstruct lost detail.</desc>']
for name, start, end in [('original-left', 0, w//2), ('original-right', w//2, w)]:
    colors = defaultdict(list)
    for y in range(h):
        x = start
        while x < end:
            color = im.getpixel((x,y)); right = x+1
            while right < end and im.getpixel((right,y)) == color:
                right += 1
            colors[color].append(f'M{x} {y}h{right-x}v1h-{right-x}z')
            x = right
    parts.append(f'<g id="{name}">')
    for color, paths in colors.items():
        fill = '#%02x%02x%02x' % color
        parts.append(f'<path fill="{fill}" d="{"".join(paths)}"/>')
    parts.append('</g>')
parts.append('</svg>')
(root/'alchembright-original-traced.svg').write_text('\n'.join(parts))
print('Created original-color vector paths')
