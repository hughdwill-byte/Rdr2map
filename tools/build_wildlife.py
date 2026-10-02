# Wildlife habitats: areas drawn around every game spawn point (RDOMap game data, public domain),
# time-of-day windows from the same spawn points, habitat text from the Red Dead wiki (via rdr2-complete-guide, MIT).
import json, re, os, shutil, collections, numpy as np
from shapely.geometry import Point, box, mapping
from shapely.ops import unary_union
OUT = '.'
Mr = np.load('Mr.npy')                      # RDOMap coords -> our map coords (affine, fitted on 60 shared collectibles)
scale = np.sqrt(abs(np.linalg.det(Mr[:2])))  # map units per RDOMap unit
L = json.load(open('RDOMap/langs/en.json'))
spawns = json.load(open('RDOMap/data/animal_spawns.json'))
hm = json.load(open('RDOMap/data/hm.json'))
comp = [c for c in json.load(open('rdr2-complete-guide/src/data/compendium.json')) if c['kind'] in ('animal', 'fish')]
IMG = 'RDOMap/assets/images/icons/game/animals/'

def tf(lat, lng): return (np.array([lat, lng, 1]) @ Mr)
def to_leaflet(geom):
  polys = [geom] if geom.geom_type == 'Polygon' else list(geom.geoms)
  out = []
  for p in polys:
    if p.area < 0.05: continue
    rings = [p.exterior] + list(p.interiors)
    out.append([[[round(y, 2), round(x, 2)] for x, y in r.coords] for r in rings])
  return out

def area_from_points(pts, r=0.9):
  g = unary_union([Point(lng, lat).buffer(r, 8) for lat, lng in pts])
  return g.buffer(0.5, 8).buffer(-0.5, 8).simplify(0.15)

def hh(h): return f'{int(h) % 24:02d}:00'
def conditions(points):
  timed = [(p['start'], p['end']) for p in points if p.get('start') is not None]
  n = len(points)
  if not n: return ''
  if not timed: return 'Can appear at any time of day.'
  allday = n - len(timed)
  top = collections.Counter(timed).most_common(2)
  def label(s, e):
    hours = [(s + i) % 24 for i in range(((e - s) % 24) or 24)]
    night = sum(h >= 20 or h < 5 for h in hours) / len(hours)
    return f"{hh(s)}–{hh(e)}" + (' (night)' if night >= 0.6 else ' (daytime)' if night <= 0.25 else '')
  windows = ' or '.join(label(s, e) for (s, e), _ in top)
  if allday / n >= 0.97: return 'Can appear at any time of day.'
  if allday / n >= 0.5:
    return f'Can appear at any time at {round(100*allday/n)}% of spots; the rest only {windows}.'
  return f'Mostly appears {windows} ({round(100*len(timed)/n)}% of spots are timed).'

def habitat_text(name):
  name = name.replace('Bighorn Sheep', 'Bighorn Ram')  # same species; the wiki's "sheep" page is the farm Merino sheep
  key = re.findall(r'[a-z]+', name.lower())[0]
  words = set(re.findall(r'[a-z]+', name.lower())) - {'bear'} | ({'bear'} if 'bear' in name.lower() else set())
  best, score = None, 0
  for c in comp:
    t = set(re.findall(r'[a-z]+', (c['title'] + ' ' + (c.get('familyTitle') or '')).lower()))
    s = len(words & t) / max(1, len(words))
    if s > score and (c.get('generalLocation') or {}).get('summary'): best, score = c, s
  if not best or score < 1 or key not in best['generalLocation']['summary'].lower() and key not in best['title'].lower(): return ''
  s = re.sub(r'\*+', ' · ', best['generalLocation']['summary']).strip(' ·')
  return re.sub(r'\s+', ' ', s)[:420]

os.makedirs(f'{OUT}/wild', exist_ok=True)
species = []
def add(group, key, name, area, spots, cond):
  if area is None or area.is_empty: return
  img = None
  if os.path.exists(IMG + key + '.png'):
    shutil.copy(IMG + key + '.png', f'{OUT}/wild/{key}.png'); img = f'wild/{key}.png'
  species.append({'id': key, 'g': group, 'n': name, 'img': img, 'a': to_leaflet(area), 'spots': spots, 'cond': cond, 'hab': habitat_text(name)})

for col, group in ((hm[0], 'Animals'), (hm[1], 'Birds')):
  for a in col['data']:
    pts = [p for g in a['groups'] for p in spawns.get(g, [])]
    if not pts: continue
    ll = [tf(p['x'], p['y']) for p in pts]
    add(group, a['key'], L.get('menu.cmpndm.' + a['key'], a['key']), area_from_points(ll), len(pts), conditions(pts))
# fish: habitat grid cells
for a in hm[2]['data']:
  cells = []
  for c in a['data']:
    corners = [tf(c['lat'] + dy, c['lng'] + dx) for dy, dx in ((-.33, -.33), (-.33, .33), (.33, .33), (.33, -.33))]
    xs = [p[1] for p in corners]; ys = [p[0] for p in corners]
    cells.append(box(min(xs), min(ys), max(xs), max(ys)))
  g = unary_union(cells).buffer(0.3, 8).buffer(-0.3, 8).simplify(0.15)
  add('Fish', a['key'], L.get('menu.cmpndm.' + a['key'], a['key']), g, 0, 'Fish bite at any time; best around dawn and dusk.')
# wild horses
for k, pts in spawns.items():
  m = re.match(r'ANIMAL_HORSE_WILD_(.+)', k)
  if not m or not pts: continue
  name = m.group(1).replace('_', ' ').title()
  add('Wild horses', k.lower(), name, area_from_points([tf(p['x'], p['y']) for p in pts], 1.4), len(pts), conditions(pts))

species.sort(key=lambda s: (['Animals', 'Birds', 'Fish', 'Wild horses'].index(s['g']), s['n']))
for sp in species:
  json.dump(sp.pop('a'), open(f"{OUT}/wild/{sp['id']}.json", 'w'), separators=(',', ':'))
json.dump(species, open(f'{OUT}/wildlife.json', 'w'), separators=(',', ':'))
print(len(species), collections.Counter(s['g'] for s in species), 'size KB', os.path.getsize(f'{OUT}/wildlife.json') // 1024,
      'no habitat text:', [s['n'] for s in species if not s['hab'] and s['g'] != 'Wild horses'][:40])
