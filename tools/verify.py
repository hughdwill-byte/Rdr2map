import json,re,numpy as np
V='rdr2-complete-guide/src/data/'
mm=json.load(open(V+'mapMarkers.json'))
exec(open('/home/user/Rdr2map/data.js').read().split('RDR.data=',1)[1].rstrip().rstrip(';').join(['data=','']) ) if False else None
raw=open('/home/user/Rdr2map/data.js').read(); data=json.loads(raw.split('RDR.data=',1)[1].strip().rstrip(';'))
items={i['id']:i for i in data['items']}
# fit using dino bones (same RDO order)
src=[];dst=[]
for m in mm:
  if m['type']=='dinosaur-bone':
    n=int(m['externalKey'].split(':')[1]); src.append([m['x'],m['y'],1]); dst.append(items[f'dino-{n:02d}']['l'][0])
A=np.array(src);B=np.array(dst); M,*_=np.linalg.lstsq(A,B,rcond=None)
res=np.sqrt(((A@M-B)**2).sum(1)); print('fit resid', res.max().round(3))
np.save('Mv.npy',M)
T=lambda m: (np.array([m['x'],m['y'],1])@M).round(3).tolist()
def near(cat,ll):
  best=min((i for i in data['items'] if i['c']==cat),key=lambda i:min((l[0]-ll[0])**2+(l[1]-ll[1])**2 for l in i['l']) if i['l'] else 1e9)
  d=min(((l[0]-ll[0])**2+(l[1]-ll[1])**2)**.5 for l in best['l']); return best,d
for typ,cat in [('dreamcatcher','dream'),('rock-carving','carving'),('grave','grave'),('legendary-fish','fish'),('legendary-animal','animal')]:
  out=[]
  for m in [m for m in mm if m['type']==typ]:
    b,d=near(cat,T(m)); out.append((round(d,2),m['title'],b['n']))
  out.sort(reverse=True); print(typ, 'max dist', out[0][0], 'median', sorted(o[0] for o in out)[len(out)//2]); 
  for o in out:
    if o[0]>0.6: print('   ',o)
