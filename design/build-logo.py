"""Build editable lettering and portable outlined SVG from original seal glyphs."""
from pathlib import Path
from math import sin, cos, radians, hypot
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import string
HERE=Path(__file__).resolve().parent
WORDS=['ALCHEMBRIGHT','SEMANTICS','SEMIOSYS','ALCHEMY','BRIGHT']
# Original geometric alphabet: each letter maps to its own branch pattern.
def segments(i):
 s=[(240,100,240,800),(240,800,420,680)]
 for bit in range(5):
  y=190+bit*110
  if i & (1<<bit):s.append((240,y,440,y+80))
  else:s.append((240,y,70,y+70))
 return s

def polygons(i):
 out=[]
 for x,y,X,Y in segments(i):
  dx,dy=X-x,Y-y;n=hypot(dx,dy);a,b=-dy/n*21,dx/n*21
  out.append([(x+a,y+b),(X+a,Y+b),(X-a,Y-b),(x-a,y-b)])
 return out

def svgpath(i):
 return ' '.join('M'+' L'.join(f'{x:.2f},{900-y:.2f}' for x,y in poly)+'Z' for poly in polygons(i))

order=['.notdef','space']+list(string.ascii_uppercase)
fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order)
glyphs={}
for name in order:
 pen=TTGlyphPen(None)
 if name not in ['.notdef','space']:
  for poly in polygons(ord(name)-64):
   pen.moveTo(poly[0])
   for pt in poly[1:]:pen.lineTo(pt)
   pen.closePath()
 glyphs[name]=pen.glyph()
fb.setupCharacterMap({**{ord(c):c for c in string.ascii_uppercase},**{ord(c):c.upper() for c in string.ascii_lowercase},32:'space'})
fb.setupGlyf(glyphs);fb.setupHorizontalMetrics({n:(600,0) for n in order});fb.setupHorizontalHeader(ascent=900,descent=-100)
fb.setupNameTable({'familyName':'Alchembright Seal','styleName':'Regular','uniqueFontIdentifier':'AlchembrightSeal-20260909','fullName':'Alchembright Seal Regular','psName':'AlchembrightSeal-Regular','version':'Version 1.0','copyright':'Original glyph design for Alchembright, 2026. See FONT-LICENSE.txt.'})
fb.setupOS2(sTypoAscender=900,sTypoDescender=-100,usWinAscent=900,usWinDescent=100);fb.setupPost();fb.save(HERE/'AlchembrightSeal-Regular.ttf')

points=lambda ids,r:' '.join(f'{256+r*cos(radians(-90+i*60)):.2f},{256+r*sin(radians(-90+i*60)):.2f}' for i in ids)
base='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title desc"><title id="title">Alchembright seal</title><desc id="desc">Original magical seal lettering encodes Alchembright, Semantics, Semiosys, Alchemy and Bright.</desc><defs><linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="12" y1="256" x2="500" y2="256"><stop stop-color="#bb397f"/><stop offset="1" stop-color="#bd9a2d"/></linearGradient></defs>'''
geometry=f'''<g id="rings" fill="none" stroke="url(#ink)" stroke-width="1.8"><circle cx="256" cy="256" r="245"/><circle cx="256" cy="256" r="239"/><circle cx="256" cy="256" r="195"/><circle cx="256" cy="256" r="190"/><circle cx="256" cy="256" r="118"/><circle cx="256" cy="256" r="112"/></g>
<g id="star" fill="none" stroke="url(#ink)" stroke-width="1.6"><polygon points="{points([0,2,4],184)}"/><polygon points="{points([1,3,5],184)}"/><path d="M256 72V440M96 164 416 348M96 348 416 164"/><circle cx="256" cy="256" r="51"/><circle cx="256" cy="256" r="45"/></g>
<g id="moon" fill="#bd9a2d"><path d="M342 157a25 25 0 1 0 28 36 23 23 0 0 1 -28 -36Z"/></g>
<g id="sun" transform="translate(158 326)" stroke="#bb397f" fill="none" stroke-width="1.6"><circle r="15"/><circle r="6"/>{''.join(f'<path d="M0 -20V-27" transform="rotate({i*30})"/>' for i in range(12))}</g>'''
letters=' · '.join(WORDS)+' · '
outlined=[];editable=[]
for n,c in enumerate(letters):
 angle=n*360/len(letters)
 if c in string.ascii_uppercase:
  transform=f'translate(256 256) rotate({angle}) translate(-5 -227)'
  outlined.append(f'<g data-letter="{c}" transform="{transform}"><path d="{svgpath(ord(c)-64)}" transform="scale(.019)"/></g>')
  editable.append(f'<text transform="{transform}" y="17" font-family="Alchembright Seal" font-size="19">{c}</text>')
 elif c=='·':outlined.append(f'<circle cx="256" cy="40" r="1.7" transform="rotate({angle} 256 256)"/>');editable.append(outlined[-1] if outlined else '')
# A central rune for ALCHEMBRIGHT, rather than ordinary readable lettering.
center=f'<g id="central-rune" fill="#246b4b" transform="translate(239 226) scale(.07)"><path d="{svgpath(1)}"/></g>'
for kind,letters_markup in [('outlined',outlined),('editable',editable)]:
 (HERE/f'alchembright-logo-{kind}.svg').write_text(base+geometry+'<g id="lettering" fill="#a96852">'+''.join(letters_markup)+'</g>'+center+'</svg>')
# Small-size mark keeps the ring, star and central rune, omitting tiny lettering.
favicon=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>Alchembright</title><defs><linearGradient id="ink"><stop stop-color="#bb397f"/><stop offset="1" stop-color="#bd9a2d"/></linearGradient></defs><circle cx="32" cy="32" r="31" fill="white"/><g fill="none" stroke="url(#ink)" stroke-width="2.5"><circle cx="32" cy="32" r="28"/><path d="M32 8 53 44H11ZM32 56 11 20H53Z"/></g><circle cx="32" cy="32" r="12" fill="white"/><g fill="#246b4b" transform="translate(26 21) scale(.026)"><path d="{svgpath(1)}"/></g></svg>'''
(HERE/'unused-favicon-concept.svg').write_text(favicon)
