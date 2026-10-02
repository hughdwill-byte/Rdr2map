import json,re,numpy as np
ign=json.load(open('red-dead-redemption-2-map/public/markers.default.json'))
pat=json.load(open('rdr2-interactive-map/data/locations.json'))
rdo={c['key']:c['locations'] for c in json.load(open('RDOMap/data/singleplayer.json'))}
Mp=np.load('Mp.npy'); Mr=np.load('Mr.npy')
lab=np.load('labels.npy'); S=4; H,W=lab.shape
meta=json.load(open('regions_meta.json')); rids=list(meta)
def P(lat,lng): return [round(float(lat),3),round(float(lng),3)]
def tp(x,y): return P(*(np.array([x,y,1])@Mp))
def tr(x,y): return P(*(np.array([x,y,1])@Mr))
def region(lat,lng):
  y,x=int(-lat*S),int(lng*S)
  for r in range(0,80,2):
    win=lab[max(0,y-r):y+r+1,max(0,x-r):x+r+1]; v=win[win>=0]
    if len(v): return rids[np.bincount(v).argmax()]
  return None
def I(t): return [m for m in ign if m['data']['markerType']==t]
def sub(m): return (m['data'].get('markerSubType') or m['data'].get('markerCustomSubType') or '').strip()
def desc(m): return (m['data'].get('markerDescription') or '').strip()
clean=lambda s: re.sub(r'\[([^\]]+)\]\([^)]+\)',r'\1',s or '').strip()
patpts={c:[(tp(x['x'],x['y']),x) for x in pat if x['category']==c] for c in ('dinosaur-bone','dreamcatcher','rock-carving','cigarette-card')}
def nearest_pat(c,ll,maxd=4):
  best=min(patpts[c],key=lambda p:(p[0][0]-ll[0])**2+(p[0][1]-ll[1])**2)
  d=((best[0][0]-ll[0])**2+(best[0][1]-ll[1])**2)**.5
  return best[1] if d<maxd else None
items=[]
def add(cat,id,name,locs,d='',grp='',**kw):
  it={'id':f'{cat}-{id}','c':cat,'n':name,'l':locs,'d':d}
  if grp: it['g']=grp
  it.update(kw); items.append(it)

# Dinosaur bones (RDO precise coords, IGN names, patrei descriptions)
ignb=[(P(m['lat'],m['lng']),sub(m)) for m in I('Dino Bones')]
for i,l in enumerate(rdo['sp_dino_bones'],1):
  ll=tr(l['x'],l['y']); nm=min(ignb,key=lambda b:(b[0][0]-ll[0])**2+(b[0][1]-ll[1])**2)
  dist=((nm[0][0]-ll[0])**2+(nm[0][1]-ll[1])**2)**.5
  p=nearest_pat('dinosaur-bone',ll)
  add('dino',f'{i:02d}',f'Dinosaur Bone #{i}',[ll],clean(p.get('description')) if p else '',sub=nm[1] if dist<2 else '')
# Rock carvings
for m in sorted(I('Rock Carving'),key=lambda m:int(re.search(r'\d+',sub(m)).group())):
  n=int(re.search(r'\d+',sub(m)).group()); ll=P(m['lat'],m['lng']); p=nearest_pat('rock-carving',ll)
  add('carving',f'{n:02d}',f'Rock Carving #{n}',[ll],clean(p.get('description')) if p else '')
# Dreamcatchers
for i,m in enumerate(sorted(I('Dreamcatcher'),key=lambda m:sub(m)),1):
  ll=P(m['lat'],m['lng']); p=nearest_pat('dreamcatcher',ll)
  add('dream',f'{i:02d}',sub(m).replace('Dreamcatchers','Dreamcatcher'),[ll],clean(p.get('description')) if p else '')
# Cigarette cards: patrei names/sets, IGN coords where a match is close
ignc=[P(m['lat'],m['lng']) for m in I('Cigarette Card')]; used=set()
for ll0,x in patpts['cigarette-card']:
  st,rest=x['name'].split(' #'); num,nm=rest.split(' — ',1)
  ds=[((c[0]-ll0[0])**2+(c[1]-ll0[1])**2)**.5 if j not in used else 99 for j,c in enumerate(ignc)]
  j=int(np.argmin(ds)); ll=ll0
  if ds[j]<2.5: used.add(j); ll=ignc[j]
  rw=re.findall(r'- (.+)',x['tips']); 
  add('card',re.sub(r'\W+','-',st.lower())+'-'+num,f'{nm}',[ll],clean(x['description']),grp=st,num=int(num),rw=', '.join(rw))
# Treasure hunts
hunts=[('jack','Jack Hall Gang',r'Jack Hall'),('stakes','High Stakes',r'High Stakes'),('poison','The Poisonous Trail',r'Poisonous'),('torn','Torn Treasure',r'Torn'),('morts','Le Trésor des Morts',r'Tresor'),('elemental','The Elemental Trail',r'Elemental'),('landmarks','Landmarks of Riches',r'Landmarks')]
tm=I('Treasure Map')+I('Treasure')
for hid,hname,rx in hunts:
  ms=[m for m in tm if re.search(rx,sub(m))]
  maps=sorted([m for m in ms if m['data']['markerType']=='Treasure Map'],key=lambda m:int(re.search(r'Map (\d)',sub(m)).group(1)))
  fin=[m for m in ms if m['data']['markerType']=='Treasure']
  steps=[]
  for m in maps:
    n=int(re.search(r'Map (\d)',sub(m)).group(1))
    steps.append((f'map{n}',f'Map {n} location',P(m['lat'],m['lng']),desc(m) or ('Where you obtain the first map.' if n==1 else f'Follow map {n-1} to find map {n} here.')))
  # final = treasure marker farthest from all map steps
  if fin:
    f=max(fin,key=lambda m:min(((m['lat']-s[2][0])**2+(m['lng']-s[2][1])**2) for s in steps))
    if min(((f['lat']-s[2][0])**2+(f['lng']-s[2][1])**2)**.5 for s in steps)>1.5:
      steps.append(('gold','Treasure (gold bars)',P(f['lat'],f['lng']),desc(f) or 'Final treasure location.'))
  for sid,nm,ll,d in steps: add('treasure',f'{hid}-{sid}',nm,[ll],d,grp=hname)
# Graves (RDO precise)
gn={'am':'Arthur Morgan','dc':'Davey Callander','ef':'Eagle Flies','hm':'Hosea Matthews','jc':'Jenny Kirk','kd':'Kieran Duffy','ls':'Lenny Summers','sg':'Susan Grimshaw','sm':'Sean MacGuire'}
for l in rdo['sp_graves']:
  k=l['text'][-2:]; add('grave',k,f"{gn[k]}'s Grave",[tr(l['x'],l['y'])],'Visit and pay respects during the Epilogue.')
# Legendary animals
LA={'Alligator':'Legendary Bull Gator','Grizzly Bear':'Legendary Bharati Grizzly Bear','Panther':'Legendary Giaguaro Panther','Ram':'Legendary Big Horn Ram','Pronghorn':'Legendary Pronghorn Ram','White Bison':'Legendary White Bison','Tatanka Bison':'Legendary Tatanka Bison'}
for m in I('Animal'):
  if not sub(m).startswith('Legendary'): continue
  base=sub(m).replace('Legendary ','')
  add('animal',re.sub(r'\W+','-',base.lower()),LA.get(base,sub(m)),[P(m['lat'],m['lng'])],desc(m) or 'Study the Legendary Animal map first. Bring a high-calibre rifle with express or explosive ammo, then sell the pelt to the Trapper for unique items.')
# Legendary fish
for m in I('Fish'):
  if not sub(m).startswith('Legendary'): continue
  add('fish',re.sub(r'\W+','-',sub(m).replace('Legendary ','').lower()),sub(m),[P(m['lat'],m['lng'])],'Requires the Special Lake/River/Swamp lure from the Lakay bait shop. Mail the catch to Jeremy Gill.')
# Hunting requests (no fixed locations)
HR=[['Squirrel','Rabbit'],['Cardinal','Rat','Woodpecker'],['Chipmunk','Oriole','Robin','Opossum'],['Sparrow','Songbird','Toad','Bullfrog','Skunk'],['Waxwing','Bat','Blue Jay','Crow','Beaver']]
for i,lst in enumerate(HR,1):
  for a in lst: add('hunt',f'{i}-{a.lower().replace(" ","-")}',f'Perfect {a} Carcass',[],'Request letters are at post offices / train stations (Valentine, Strawberry, Rhodes, Saint Denis, Van Horn). Mail carcasses to Mrs. Hobbs.' + (' Epilogue only.' if i==5 else ''),grp=f'Hunting Request #{i}')
# Exotics (Algernon Wasp)
def birds(rx): return [P(m['lat'],m['lng']) for m in I('Bird') if re.search(rx,sub(m))]
def orch(k): return [tr(l['x'],l['y']) for l in rdo[k]]
EX=[[('Little Egret Plumes',5,birds(r'Little|^Egret'),'plume'),('Reddish Egret Plumes',5,birds(r'Re(d)?dish'),'plume'),('Snowy Egret Plumes',5,birds(r'Snowy'),'plume'),('Lady of the Night Orchids',15,orch('sp_orchid_lady_of_the_night'),'sp_orchid_lady_of_the_night')],
    [('Heron Plumes',20,birds(r'Heron'),'plume'),('Lady Slipper Orchids',7,orch('sp_orchid_lady_slipper'),'sp_orchid_lady_slipper'),('Moccasin Flower Orchids',10,orch('sp_orchid_moccasin_flower'),'sp_orchid_moccasin_flower')],
    [('Alligator Eggs',25,orch('sp_alligator_eggs'),'sp_alligator_eggs'),("Acuna's Star Orchids",3,orch('sp_orchid_acunas_star'),'sp_orchid_acunas_star'),('Cigar Orchids',7,orch('sp_orchid_cigar'),'sp_orchid_cigar'),('Ghost Orchids',5,orch('sp_orchid_ghost'),'sp_orchid_ghost')],
    [('Spoonbill Plumes',30,birds(r'Spoonbill'),'plume'),('Rat Tail Orchids',10,orch('sp_orchid_rat_tail'),'sp_orchid_rat_tail'),('Spider Orchids',5,orch('sp_orchid_spider'),'sp_orchid_spider'),('Night Scented Orchids',5,orch('sp_orchid_night_scented'),'sp_orchid_night_scented')],
    [('Clamshell Orchids',5,orch('sp_orchid_clamshell'),'sp_orchid_clamshell'),("Queen's Orchids",5,orch('sp_orchid_queens'),'sp_orchid_queens'),("Sparrow's Egg Orchids",10,orch('sp_orchid_sparrows_egg'),'sp_orchid_sparrows_egg'),("Dragon's Mouth Orchids",5,orch('sp_orchid_dragons_mouth'),'sp_orchid_dragons_mouth')]]
for i,lst in enumerate(EX,1):
  for nm,cnt,locs,ic in lst:
    add('exotic',f'{i}-{re.sub(r"[^a-z]+","-",nm.lower()).strip("-")}',f'{nm} ×{cnt}',locs,'Markers show known spawn spots. Deliver to Algernon Wasp in Saint Denis.',grp=f'Exotics List #{i}',ic=ic)
# Gang member requests
GR=[('Dutch','Pipe','Chapter 2. Taken from a guarded cabin — watch for a grizzly.'),('Hosea','"The Case of the Shrew in the Fog" book','Chapters 2–4.'),('Hosea','American Ginseng','Chapter 3.'),('Pearson','Naval Compass','Chapters 2–4. Braithwaite Manor boathouse.'),('Pearson','Rabbit','Chapters 2–4, mornings behind the stew pot.'),('Lenny','Pocket Watch','Chapters 3–4.'),('Mary-Beth','Fountain Pen','Osman Grove house east of Emerald Ranch.'),('Jack','Penny Dreadful book','Found in several shacks/huts around the map.'),('Kieran','Burdock Root',''),('Javier','Oleander Sage','Reward: poison knives.'),('Charles','Moonshine','Reward: fire arrows.'),('Sean','Kentucky Bourbon','Buy at a general store.'),('Bill','Hair Pomade','Buy at a general store. Reward: repeater ammo.'),('Molly','Pocket Mirror','Chapter 3.'),('Sadie','Harmonica','Chapters 3–4.'),('Tilly','Necklace','Found in safes around the world.'),('Susan','Seasoning herbs','Chapters 3–4.')]
for i,(who,what,d) in enumerate(GR,1): add('gang',f'{i:02d}',f'{who}: {what}',[],d,grp=who)
# Unique weapons & hats
for t,g in (('Weapon','Weapons'),('Hat','Hats')):
  for m in I(t): add('gear',re.sub(r'\W+','-',sub(m).lower()).strip('-'),sub(m),[P(m['lat'],m['lng'])],desc(m),grp=g,ic='weapon' if t=='Weapon' else 'hat')
# regions per item
for it in items:
  it['lr']=[region(*l) for l in it['l']]
  it['r']=sorted(set(it['lr'])-{None})
CATS=[('dino','Dinosaur Bones','main','#e3a33b'),('carving','Rock Carvings','main','#6fb3c9'),('dream','Dreamcatchers','main','#d1584b'),('card','Cigarette Cards','main','#c9a86a'),('treasure','Treasure Maps','main','#e6c23e'),('grave','Graves','main','#9aa6b8'),
      ('animal','Legendary Animals','hunt','#d98a3d'),('fish','Legendary Fish','hunt','#4fa3d9'),('hunt','Hunting Requests','hunt','#8fbf5a'),
      ('exotic','Exotics','side','#b77fd1'),('gang','Gang Member Requests','side','#d9a07a'),('gear','Unique Weapons & Hats','side','#c7c7c7')]
from collections import Counter; print(Counter(i['c'] for i in items)); print('no region:',[i['id'] for i in items if i['l'] and not i['r']])
out={'cats':[dict(id=a,name=b,group=c,color=d) for a,b,c,d in CATS],'regions':[dict(id=k,name=v[0],state=v[1]) for k,v in meta.items()],'geo':json.load(open('regions.geojson')),'items':items}
open('data.js','w').write('// Generated by build.py — see README for sources.\nwindow.RDR={};RDR.data='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
