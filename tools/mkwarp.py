# Fit pairs: each source's own points (after its affine) -> the ShackMaps-snapped positions of the same collectibles.
import json,numpy as np
from scipy.optimize import linear_sum_assignment
exec(open('build.py').read().split('items=[]')[0])
Mv=np.load('Mv.npy'); VM=json.load(open('rdr2-complete-guide/src/data/mapMarkers.json'))
vpt=lambda m: P(*(np.array([m['x'],m['y'],1])@Mv))
D=json.loads(open('data.js').read().split('RDR.data=',1)[1].rstrip().rstrip(';'))
fin={c:np.array([l for i in D['items'] if i['c']==c for l in i['l']]) for c in ('dino','dream','carving','card','grave')}
src={
 'pat':{c:[tp(x['x'],x['y']) for x in pat if x['category']==k] for c,k in (('dino','dinosaur-bone'),('dream','dreamcatcher'),('carving','rock-carving'),('card','cigarette-card'))},
 'rdo':{c:[tr(l['x'],l['y']) for l in rdo[k]] for c,k in (('dino','sp_dino_bones'),('dream','sp_dreamcatchers'),('carving','sp_rock_carvings'),('grave','sp_graves'))},
 'ign':{c:[P(m['lat'],m['lng']) for m in ign if m['data']['markerType']==k] for c,k in (('dino','Dino Bones'),('dream','Dreamcatcher'),('carving','Rock Carving'),('card','Cigarette Card'))},
 'vic':{c:[vpt(m) for m in VM if m['type']==k] for c,k in (('dino','dinosaur-bone'),('dream','dreamcatcher'),('carving','rock-carving'),('grave','grave'))},
}
out={}
for s,cats in src.items():
  pr=[]
  for c,A in cats.items():
    A=np.array(A); C=np.linalg.norm(A[:,None]-fin[c][None],axis=2); r,cc=linear_sum_assignment(C)
    pr+=[(*A[a],*fin[c][b]) for a,b in zip(r,cc) if C[a,b]<8]
  pr=np.array(pr)
  # drop mismatches: residual far from the local trend
  from scipy.interpolate import RBFInterpolator
  for _ in range(2):
    f=RBFInterpolator(pr[:,:2],pr[:,2:]-pr[:,:2],smoothing=10,kernel='thin_plate_spline')
    e=np.linalg.norm(f(pr[:,:2])-(pr[:,2:]-pr[:,:2]),axis=1); pr=pr[e<1.5]
  raw=np.linalg.norm(pr[:,2:]-pr[:,:2],axis=1)
  print(s,len(pr),'before: median %.2f p90 %.2f max %.2f'%(np.median(raw),np.percentile(raw,90),raw.max()))
  out[s]=pr
np.savez('tools/warp_pairs.npz',**out)
