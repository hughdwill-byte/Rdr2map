import json,re,numpy as np
ign=json.load(open('red-dead-redemption-2-map/public/markers.default.json'))
pat=json.load(open('rdr2-interactive-map/data/locations.json'))
rdo=json.load(open('RDOMap/data/singleplayer.json'))
def ignpts(t): return np.array([[m['lat'],m['lng']] for m in ign if m['data']['markerType']==t])
def fit(src,dst):
    A=np.c_[src,np.ones(len(src))]; M,*_=np.linalg.lstsq(A,dst,rcond=None); return M
def icp(src,dst,M):
    for _ in range(20):
        p=np.c_[src,np.ones(len(src))]@M
        idx=[np.argmin(((dst-q)**2).sum(1)) for q in p]
        M=fit(src,dst[idx])
    p=np.c_[src,np.ones(len(src))]@M; d=np.sqrt(((dst[idx]-p)**2).sum(1)); return M,d
# patrei: rock carvings by number
rc_i={int(re.search(r'(\d+)$',m['data']['markerSubType']).group(1)):(m['lat'],m['lng']) for m in ign if m['data']['markerType']=='Rock Carving'}
rc_p={int(x['name'].split('#')[1]):(x['x'],x['y']) for x in pat if x['category']=='rock-carving'}
k=sorted(rc_i); Mp=fit(np.array([rc_p[i] for i in k]),np.array([rc_i[i] for i in k]))
src=np.array([(x['x'],x['y']) for x in pat if x['category'] in('dreamcatcher','dinosaur-bone','rock-carving')])
dst=np.r_[ignpts('Dreamcatcher'),ignpts('Dino Bones'),ignpts('Rock Carving')]
Mp,d=icp(src,dst,Mp); print('patrei resid',np.round(np.percentile(d,[50,90,100]),2))
# rdo: x=lat,y=lng
src=np.array([(l['x'],l['y']) for c in rdo if c['key'] in('sp_dreamcatchers','sp_rock_carvings','sp_dino_bones') for l in c['locations']])
Mr=fit(src[:3],dst[:3]) if False else None
# initial: rough guess via bounding boxes
s0=src; M0=fit(np.array([s0.min(0),s0.max(0),[s0[:,0].min(),s0[:,1].max()]]),np.array([dst.min(0),dst.max(0),[dst[:,0].min(),dst[:,1].max()]]))
Mr,d=icp(src,dst,M0); print('rdo resid',np.round(np.percentile(d,[50,90,100]),2))
np.save('Mp.npy',Mp); np.save('Mr.npy',Mr)
