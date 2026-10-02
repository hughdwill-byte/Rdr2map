import numpy as np, json
from collections import deque
from shapely.geometry import box, mapping
from shapely.ops import unary_union
S=4
land=np.load('land.npy'); H,W=land.shape
R={ # id: (name, state, seeds[(lat,lng)])
 'grizzlies_west':("Grizzlies West","Ambarino",[(-61.6,119),(-45,115),(-50,128),(-38,125),(-56.7,138.7),(-64.1,129.6),(-55,100),(-65.5,137.3),(-42,138),(-35,117),(-71.5,111.2),(-68,114)]),
 'grizzlies_east':("Grizzlies East","Ambarino",[(-53,176),(-43,165),(-42.9,182.4),(-55.2,177.4),(-45.2,188.3),(-38,152),(-48,155.3),(-60,178),(-58,170),(-36,160)]),
 'cumberland':("Cumberland Forest","New Hanover",[(-61,154.5),(-51.6,158.4),(-61.4,146.3),(-60,162),(-56,150)]),
 'heartlands':("The Heartlands","New Hanover",[(-85,155),(-72,151.5),(-70.4,184.5),(-74.5,175.5),(-80.9,148.5),(-79.9,138.1),(-91.2,138.3),(-90.4,168.3),(-88.9,158.4),(-94.6,155),(-67.7,136.5),(-83.1,129.2),(-68.7,183.2),(-73.9,137.8),(-85,164),(-68,165),(-86.6,186.6),(-84,186)]),
 'roanoke':("Roanoke Ridge","New Hanover",[(-55,205),(-62.5,198),(-49.9,192.3),(-47,207.3),(-70.3,207.6),(-51.5,202.1),(-61,202.6),(-58.4,204.3),(-67.7,197.7),(-75,205),(-74,213),(-42,200)]),
 'scarlett':("Scarlett Meadows","Lemoyne",[(-97,168.4),(-94.5,167.1),(-85.2,183),(-90.2,181.5),(-105,172),(-112,177),(-110,170),(-100,162),(-115,165)]),
 'bluewater':("Bluewater Marsh","Lemoyne",[(-92,198),(-89.8,190.4),(-88,200),(-95,204)]),
 'bayou':("Bayou Nwa","Lemoyne",[(-103,195),(-108,186),(-112,192),(-110,205),(-106,210),(-115,198)]),
 'big_valley':("Big Valley","West Elizabeth",[(-81.7,104.8),(-85.8,101),(-69.9,117.7),(-78.7,99.4),(-95,107),(-75,110),(-90,95),(-72,92)]),
 'tall_trees':("Tall Trees","West Elizabeth",[(-117,104),(-105,98),(-125,108),(-110,92),(-128,112)]),
 'great_plains':("Great Plains","West Elizabeth",[(-117,123),(-112,130),(-125,125),(-106,127),(-130,128)]),
 'hennigans':("Hennigan's Stead","New Austin",[(-136,92),(-133.1,85.9),(-152,93.1),(-140,105),(-145,112),(-130,85)]),
 'cholla':("Cholla Springs","New Austin",[(-137,57),(-131.7,56.8),(-145.6,61.6),(-138,80),(-135,70)]),
 'gaptooth':("Gaptooth Ridge","New Austin",[(-147,30),(-141.6,39.3),(-149,36.9),(-155,20),(-138,40)]),
 'rio_bravo':("Rio Bravo","New Austin",[(-160.6,57),(-160.7,74.9),(-161.9,56.9),(-157,40),(-163,49)]),
}
ids=list(R)
lab=np.full((H,W),-1,int); q=deque()
for i,k in enumerate(ids):
  for lat,lng in R[k][2]:
    y,x=int(-lat*S),int(lng*S)
    if not land[y,x]:
      # snap to nearest land
      ys,xs=np.nonzero(land[max(0,y-20):y+20,max(0,x-20):x+20]); j=np.argmin((ys-20)**2+(xs-20)**2); y,x=max(0,y-20)+ys[j],max(0,x-20)+xs[j]
    lab[y,x]=i; q.append((y,x))
while q:
  y,x=q.popleft()
  for dy,dx in((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
    ny,nx=y+dy,x+dx
    if 0<=ny<H and 0<=nx<W and land[ny,nx] and lab[ny,nx]<0:
      lab[ny,nx]=lab[y,x]; q.append((ny,nx))
# land pieces unreachable (islands): nearest seed euclid
seeds=np.array([(-lat*S,lng*S,i) for i,k in enumerate(ids) for lat,lng in R[k][2]])
ys,xs=np.nonzero(land&(lab<0))
for y,x in zip(ys,xs): lab[y,x]=int(seeds[np.argmin((seeds[:,0]-y)**2+(seeds[:,1]-x)**2),2])
np.save('labels.npy',lab)
feats=[]
for i,k in enumerate(ids):
  boxes=[]
  for y in range(H):
    row=lab[y]==i
    if not row.any(): continue
    d=np.diff(np.r_[0,row.astype(int),0]); st=np.nonzero(d==1)[0]; en=np.nonzero(d==-1)[0]
    for a,b in zip(st,en): boxes.append(box(a/S,-(y+1)/S,b/S,-y/S))
  g=unary_union(boxes).buffer(0.6).buffer(-0.6).simplify(0.25)
  if g.geom_type=='MultiPolygon':  # drop specks
    from shapely.geometry import MultiPolygon
    g=MultiPolygon([p for p in g.geoms if p.area>4])
  feats.append({'type':'Feature','properties':{'id':k,'name':R[k][0],'state':R[k][1]},'geometry':mapping(g)})
  print(k, round(g.area), len(json.dumps(mapping(g))))
json.dump({'type':'FeatureCollection','features':feats},open('regions.geojson','w'),separators=(',',':'))
json.dump({k:[R[k][0],R[k][1]] for k in ids},open('regions_meta.json','w'))
# visualize
from PIL import Image
pal=np.random.RandomState(3).randint(60,255,(len(ids),3))
vis=np.zeros((H,W,3),'uint8'); vis[lab>=0]=pal[lab[lab>=0]]
base=np.asarray(Image.open('z4.png').convert('RGB').crop((0,0,4096,3040)).resize((W,H)))
Image.fromarray((base*0.5+vis*0.5).astype('uint8')).save('regions_vis.jpg')
