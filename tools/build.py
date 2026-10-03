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
# Treasure hunts: step text from the wiki-checked rdr2-complete-guide data, pins from IGN (each checked against the named place)
def tm(name):
  for m in I('Treasure Map')+I('Treasure'):
    if sub(m)==name or sub(m)+' | '+desc(m)==name: return P(m['lat'],m['lng'])
  raise SystemExit('no treasure marker '+name)
TH=[('jack','Jack Hall Gang','',[
      ('map1',"Map 1: Máximo, near Flatneck Station",tm('Jack Hall Treasure Map 1'),"Buy or take Map 1 from Máximo on the ridge northwest of Flatneck Station (decline once and the price drops to $5)."),
      ('map2',"Map 2: Caliban's Seat",tm('Jack Hall Gang Treasure Map 2'),"Follow Map 1 to Caliban's Seat to find Map 2."),
      ('map3',"Map 3: Cotorra Springs",tm('Jack Hall Gang Treasure Map 3'),"Follow Map 2 to Cotorra Springs to find Map 3."),
      ('gold',"Gold bars: O'Creagh's Run",tm('Jack Hall Gang Treasure 3'),"Follow Map 3 to O'Creagh's Run and collect the gold bars.")]),
    ('stakes','High Stakes','',[
      ('map1',"Map 1: the treasure hunter",tm('High Stakes Treasure Map 1'),"Take Map 1 from the treasure hunter between Diablo Ridge and Riggs Station (the \"All That Glitters\" encounter)."),
      ('map2',"Map 2: behind Cumberland Falls",tm('High Stakes Treasure Map 2'),"Find Map 2 behind Cumberland Falls."),
      ('map3',"Map 3: Barrow Lagoon",tm('High Stakes Treasure Map 3'),"Find Map 3 at Barrow Lagoon."),
      ('gold',"Gold bars: near Fort Wallace",tm('High Stakes Treasure'),"Collect the treasure near Fort Wallace.")]),
    ('poison','The Poisonous Trail','',[
      ('map1',"Map 1: Cairn Lodge",tm('The Poisonous Trail Map 1'),"Find Map 1 in the lockbox under the bed at Cairn Lodge (Cairn Lake). It can't be bought, so don't miss it."),
      ('map2',"Map 2: hollow tree at Face Rock",tm('Poisonous Trail Treasure Map 2'),"Find Map 2 in the hollow tree near Face Rock."),
      ('map3',"Map 3: Serpent Mound",tm('Poisonous Trail Treasure Map 3'),"Find Map 3 at Serpent Mound."),
      ('gold',"Gold bars: Elysian Pool cave",tm('Poisonous Trail Final Treasure'),"Collect 4 gold bars in the cave at Elysian Pool.")]),
    ('morts','Le Trésor des Morts',' Pre-order bonus (PlayStation/Xbox digital pre-orders only).',[
      ('map1',"Map 1: Limpany jail cell",tm('Les Tresor Des Morts Map 1 (Pre-Order Bonus Treasure Map)'),"Find Map 1 in the unburnt jail cell at Limpany."),
      ('map2',"Riddle note: Saint Denis dock tunnels",tm('Les Tresor Des Morts Map 2 (Pre-Order Treasure Map)'),"Find the riddle note in the tunnels under the Saint Denis docks."),
      ('gold',"Gold bars: Saint Denis cemetery",[-107.57,205.91],"Collect 6 gold bars in the mausoleum in the Saint Denis cemetery.")]),
    ('torn','Torn Treasure Map (Mended Map)','',[
      ('map2',"Map half: Hermit Woman's cabin",tm('Torn Treasure Map 2'),"Take the first map half from a drawer in the Hermit Woman's cabin near the source of Little Creek River."),
      ('map1',"Map half: Manito Glade",tm('Torn Treasure Map 1'),"Take the second map half from the hermit's cottage at Manito Glade, north of Annesburg."),
      ('gold',"Otis Miller's Revolver: west of Twin Rocks",tm('Torn Treasure'),"Collect Otis Miller's Revolver west of Twin Rocks. Only possible after Epilogue Part 1.")]),
    ('landmarks','Landmarks of Riches',' Epilogue only.',[
      ('map1',"Map 1: the Obelisk",tm('Landmarks of Riches Map 1 | Behind Obelisk'),"Inspect the obelisk on the hill northwest of Owanjila and take Map 1 from the plaque."),
      ('map2',"Map 2: Tiny Church roof",tm('Landmarks of Riches Map 2 | Bell on top of church'),"Find Map 2 by the bell on the Tiny Church roof."),
      ('map3',"Map 3: Mysterious Hill Home",tm('Landmarks of Riches Map 3 | On house, in window'),"Find Map 3 in a window of the Mysterious Hill Home."),
      ('map4',"Map 4: tree at Bolger Glade",tm('Landmarks of Riches Map 4 | In bottom of tree on mound'),"Find Map 4 at the bottom of the tree on the mound at Bolger Glade."),
      ('gold',"Gold bars: Mount Shann",tm('Landmarks of Riches | Under rock on sundial'),"Collect 6 gold bars under the rock on the sundial on Mount Shann.")]),
    ('elemental','The Elemental Trail',' Epilogue Part 2 only.',[
      ('map1',"Map 1: hanging corpse, Sea of Coronado",tm('Elemental Trail Map 1'),"Shoot the rope of the hanging corpse on the shore of the Sea of Coronado, southwest of Tumbleweed, and loot Map 1."),
      ('map2',"Map 2: Greenhollow chimney",tm('Elemental Trail Map 2'),"Find Map 2 in the chimney at Greenhollow."),
      ('map3',"Map 3: gutter near Benedict Point",tm('Elemental Trail Map 3'),"Find Map 3 on the gutter near Benedict Point."),
      ('gold',"Treasure: Coot's Chapel",tm('Elemental Trail | Grave with wooden cross under tree'),"Collect the treasure at the grave with a wooden cross under the tree by Coot's Chapel.")])]
for hid,hname,note,steps in TH:
  for sid,nm,ll,d in steps: add('treasure',f'{hid}-{sid}',nm,[ll],d+note,grp=hname)
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
  add('fish',re.sub(r'\W+','-',sub(m).replace('Legendary ','').lower()),sub(m),[P(m['lat'],m['lng'])],'Requires the Special Lake/River/Swamp lure from the Lagras bait shop. Mail the catch to Jeremy Gill.')
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
# Gang member requests (wiki-checked list from rdr2-complete-guide, MIT)
CHN={'chapter-2':'Chapter 2','chapter-3':'Chapter 3','chapter-4':'Chapter 4','epilogue-2':'Epilogue Part 2'}
for i,r in enumerate(json.load(open('rdr2-complete-guide/src/data/itemRequests.json')),1):
  av=r['availability']; chs=av['availableChapterIds']
  when=CHN[chs[0]]+('–'+CHN[chs[-1]].split()[-1] if len(chs)>1 else '')
  win=next((q['window'] for q in av.get('requirements',[]) if q.get('kind')=='time-of-day'),'')
  title=re.sub(r' for [A-Z][\w-]*( \(\d\))?$','',r['title'])
  add('gang',f'{i:02d}',f"{r['requester']}: {title}",[],f"{when}{', '+win if win else ''}. {r['description']}",grp=r['requester'],q=[{'chapter-2':'ch2','chapter-3':'ch3','chapter-4':'ch4','epilogue-2':'ch8'}[chs[0]]])
# Unique weapons & hats
for t,g in (('Weapon','Weapons'),('Hat','Hats')):
  for m in I(t): add('gear',re.sub(r'\W+','-',sub(m).lower()).strip('-'),sub(m),[P(m['lat'],m['lng'])],desc(m),grp=g,ic='weapon' if t=='Weapon' else 'hat')

# Snap to game-data positions where available (RDOMap game data via rdr2-complete-guide, MIT)
Mv=np.load('Mv.npy'); VM=json.load(open('rdr2-complete-guide/src/data/mapMarkers.json'))
def vpt(m): return P(*(np.array([m['x'],m['y'],1])@Mv))
def norm(t): return re.sub(r'[^a-z]','',t.lower().replace('legendary',''))
ALIAS={'bullgator':'bullgator','pronghornram':'pronghorn','bighornram':'bighornram','gar':'longnosegar','sturgeon':'lakesturgeon','giaguaropanther':'giaguaropanther','bharatigrizzlybear':'bharatigrizzlybear'}
for typ,cat in (('legendary-animal','animal'),('legendary-fish','fish')):
  vm={norm(m['title']):m for m in VM if m['type']==typ}
  for it in items:
    if it['c']!=cat: continue
    k=norm(it['n']); k=ALIAS.get(k,k)
    if k in vm: it['l']=[vpt(vm[k])]
    else: print('no game match',it['n'],k)
for typ,cat in (('dreamcatcher','dream'),('rock-carving','carving')):
  for m in [m for m in VM if m['type']==typ]:
    ll=vpt(m); it=min((i for i in items if i['c']==cat),key=lambda i:(i['l'][0][0]-ll[0])**2+(i['l'][0][1]-ll[1])**2); it['l']=[ll]

# Valuable stashes: gold bars, homestead stashes and other sellable valuables
AP=' (Pin is approximate; look around the spot.)'
GB=[('limpany','Limpany Sheriff\'s Office',(-88.635,142.488),'1 gold bar ($500 at a fence). In a lockbox under the desk in the burnt-out Sheriff\'s office, northwest end of Limpany. From Chapter 2.'),
    ('train-wreck','Train wreck below Cotorra Springs',(-49.6,149.2),'2 gold bars ($1,000), plus aged pirate rum. In the wrecked train at the bottom of the ravine east of Granite Pass, southwest of Cotorra Springs.'+AP),
    ('strange-statues','Strange Statues cave',(-45.27,167.13),'3 gold bars ($1,500). Study the cave painting at Window Rock first, then press the statues showing 2, 3, 5 and 7 fingers in this hidden cave.'),
    ('braithwaite','Braithwaite Manor ruins',(-122.17,170.5),'1 gold bar. After Chapter 4, enter the burnt main house, go into the room past the body and check the lockbox by the west wall.'),
    ('shady-belle','Shady Belle',(-125.65,188.91),'1 gold bar. Missable: during the Chapter 3 mission that clears Shady Belle, search the dresser opposite the bed in the upstairs bedroom before going downstairs.')]
for k,n,ll,d in GB: add('loot',f'gold-{k}',n,[P(*ll)],d,grp='Gold Bars',ic='goldbar')
HS=[('chez-porter','Chez Porter',(-48.39,140.59),'In Ambarino, north of Valentine across the Dakota River. Climb the ladder to the upper floor of the barn: the stash box by the haystacks holds cash and a jewelry bag.'),
    ('aberdeen','Aberdeen Pig Farm',(-85.78,185.87),'Southeast of Emerald Ranch. Stash is behind the portrait opposite the front door; a shotgun is in the cellar. Don\'t drink anything you\'re offered.'),
    ('catfish','Catfish Jackson\'s',(-132.17,176.25),'South of Braithwaite Manor. The stash is in the chimney under the hanging double-barrel shotgun.'),
    ('lonnie','Lonnie\'s Shack',(-91.56,182.82),'South of Emerald Station (visited with Sean in Chapter 3). Moonshine shack with a stash inside.'),
    ('van-horn','Van Horn Mansion',(-80.25,210.45),'Just south of Van Horn. The stash is on the centre table down the stairs.'),
    ('watson','Watson\'s Cabin',(-71.3,112.76),'Northwest of Wallace Station, up the road along Little Creek River. Semi-auto shotgun in the cellar; return later for a lockbox on the kitchen table.'),
    ('willard','Willard\'s Rest',(-39.39,210.29),'Far northeast Roanoke Ridge. Chapter 6+ only: help the widow Charlotte and she leaves you a box of money.')]
for k,n,ll,d in HS: add('loot',f'home-{k}',n,[P(*ll)],d,grp='Homestead Stashes',ic='stash')
for t in ('Rare Item','Treasure'):
  for m in I(t):
    n,dd=sub(m),desc(m)
    if t=='Treasure' and n not in ('Lockbox','Misc.'): continue
    if n=='Misc.': n='Chimney stash'
    add('loot',re.sub(r'\W+','-',(n+'-'+str(round(m['lng']))).lower()),n,[P(m['lat'],m['lng'])],dd or 'Valuable item; sell it to a fence.',grp='Other Valuables',ic='stash')
# Legendary conditions (Red Dead wiki / guides): per-animal unlocks and per-fish special lures
LEG_A={'alligator':'Only after "That\'s Murfree Country" (Chapter 6); you first meet it in "Country Pursuits" (Chapter 4).',
       'grizzly-bear':'Unlocked by "Exit Pursued by a Bruised Ego" (Chapter 2), where Hosea first runs into it.',
       'panther':'Only appears once you reach rank 9 of the Master Hunter challenges.',
       'cougar':'New Austin: Epilogue only.','pronghorn':'New Austin: Epilogue only.','tatanka-bison':'New Austin: Epilogue only.'}
LURE={'bluegill':'Lake','bullhead-catfish':'River','chain-pickerel':'River','gar':'Swamp','largemouth-bass':'River','muskie':'River',
      'perch':'Lake','redfin-pickerel':'Lake','rock-bass':'Lake','smallmouth-bass':'Lake','sockeye-salmon':'Lake','steelhead-trout':'River','sturgeon':'River'}
for it in items:
  k=it['id'].split('-',1)[1]
  if it['c']=='animal':
    it['d']=LEG_A.get(k,'Available from Chapter 2.')+' Inside the circle, use Eagle Eye to follow 3 clues to the animal. Use a high-calibre rifle with express or explosive ammo, then sell the pelt to the Trapper.'
  if it['c']=='fish':
    it['d']=f"Use the Special {LURE[k]} Lure (Lagras bait shop). Mail the catch to Jeremy Gill." + (' Bites best in the rain.' if k=='largemouth-bass' else '') + (' New Austin: Epilogue only.' if 'hennigans' in str(it.get('lr')) or k in ('largemouth-bass','redfin-pickerel') else '')

# Item art: in-game compendium sketches from RDOMap (public domain). Only exact species matches; no art = no image.
import shutil, os
GA='RDOMap/assets/images/icons/game/'
ART={
  'animal': {'bull gator':'animals/animal_alligator_medium.png','grizzly':'animals/animal_bear.png','beaver':'animals/animal_beaver.png','boar':'animals/animal_boar.png',
             'buck':'animals/animal_buck.png','cougar':'animals/animal_cougar.png','coyote':'animals/animal_coyote.png','elk':'animals/animal_elk_rocky.png',
             'fox':'animals/animal_fox_red.png','moose':'animals/animal_moose.png','panther':'animals/animal_panther.png','pronghorn':'animals/animal_pronghorn_american_m.png',
             'big horn':'animals/animal_bighornram_rocky.png','bison':'animals/legendaries/mp_animal_bison_legendary_01.svg','wolf':'animals/animal_wolf_gray.png'},
  'fish': {'bluegill':'fish_bluegill','bullhead':'fish_bullheadcat_brown','chain pickerel':'fish_chainpickerel','gar':'fish_longnosegar','largemouth':'fish_largemouthbass',
           'muskie':'fish_muskie_spotted','perch':'fish_perch','redfin':'fish_redfinpickerel','rock bass':'fish_rockbass','smallmouth':'fish_smallmouthbass',
           'sockeye':'fish_salmon_sockeye','steelhead':'fish_steelheadtrout','sturgeon':'fish_lake_sturgeon'},
  'hunt': {'squirrel':'animal_squirrel_grey','rabbit':'animal_rabbit','cardinal':'animal_cardinal','rat':'animal_rat_brown','woodpecker':'animal_woodpecker_pileated',
           'chipmunk':'animal_chipmunk','oriole':'animal_oriole_baltimore','robin':'animal_robin','opossum':'animal_possum','sparrow':'animal_sparrow_american',
           'songbird':'animal_songbird_scarlet','toad':'animal_toad','bullfrog':'animal_frogbull','skunk':'animal_skunk','waxwing':'animal_cedarwaxwing',
           'bat':'animal_bat','blue jay':'animal_bluejay','crow':'animal_crow','beaver':'animal_beaver'},
  'exotic': {'little egret':'animal_egret_little','reddish egret':'animal_egret_reddish','snowy egret':'animal_egret_snowy','heron':'animal_heron_greatblue','spoonbill':'animal_roseatespoonbill'},
  'gang': {'oleander':'oleander_sage.png','ginseng':'american_ginseng.png','burdock':'burdock_root.png','seasoning':'oregano.png','rabbit':'animals/animal_rabbit.png','eagle':'animals/animal_eagle_golden.png'},
}
os.makedirs('items',exist_ok=True)
for it in items:
  table=ART.get(it['c'])
  if not table: continue
  name=it['n'].lower().replace('legendary ','')
  for k,f in sorted(table.items(),key=lambda kv:-len(kv[0])):   # longest key first: "rock bass" before "bass"
    if re.search(r'\b'+k+r'\b',name):
      if it['c'] in ('fish','hunt','exotic'): f='animals/'+f+'.png'
      src=GA+f; dst=os.path.basename(f)
      if not os.path.exists(src): raise SystemExit('missing art '+src)
      shutil.copy(src,'items/'+dst); it['img']='items/'+dst
      break
print('item images:',sum('img' in i for i in items),{c:sum(1 for i in items if i['c']==c and 'img' in i) for c in ART})

# regions per item
for it in items:
  it['lr']=[region(*l) for l in it['l']]
  it['r']=sorted(set(it['lr'])-{None})
CATS=[('dino','Dinosaur Bones','main','#e3a33b'),('carving','Rock Carvings','main','#6fb3c9'),('dream','Dreamcatchers','main','#d1584b'),('card','Cigarette Cards','main','#c9a86a'),('treasure','Treasure Maps','main','#e6c23e'),('grave','Graves','main','#9aa6b8'),
      ('animal','Legendary Animals','hunt','#d98a3d'),('fish','Legendary Fish','hunt','#4fa3d9'),('hunt','Hunting Requests','hunt','#8fbf5a'),
      ('exotic','Exotics','side','#b77fd1'),('gang','Gang Member Requests','side','#d9a07a'),('gear','Unique Weapons & Hats','side','#c7c7c7'),
      ('loot','Valuable Stashes','money','#e8b923')]
from collections import Counter; print(Counter(i['c'] for i in items)); print('no region:',[i['id'] for i in items if i['l'] and not i['r']])
out={'cats':[dict(id=a,name=b,group=c,color=d) for a,b,c,d in CATS],'regions':[dict(id=k,name=v[0],state=v[1]) for k,v in meta.items()],'geo':json.load(open('regions.geojson')),'items':items}
open('data.js','w').write('// Generated by build.py — see README for sources.\nwindow.RDR={};RDR.data='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
