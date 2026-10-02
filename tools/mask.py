from PIL import Image, ImageFilter; import numpy as np
from collections import deque
S=4  # px per unit
im=Image.open('z4.png').convert('RGB').crop((0,0,4096,3040))
small=im.resize((256*S,190*S),Image.LANCZOS)
a=np.asarray(small).astype(int)
lum=a.mean(2)
dark=Image.fromarray(((lum<150)*255).astype('uint8')).filter(ImageFilter.MaxFilter(5))
dark=np.asarray(dark)>0
sat=a.max(2)-a.min(2)
water=(sat<38)&(lum<175)
water=np.asarray(Image.fromarray((water*255).astype('uint8')).filter(ImageFilter.MedianFilter(5)))>0
H,W=dark.shape; out=np.zeros_like(dark); q=deque([(0,0)]); out[0,0]=1
while q:
  y,x=q.popleft()
  for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
    ny,nx=y+dy,x+dx
    if 0<=ny<H and 0<=nx<W and not out[ny,nx] and not dark[ny,nx]:
      out[ny,nx]=1; q.append((ny,nx))
inside=~out
land=inside&~water
np.save('land.npy',land); np.save('water.npy',water)
vis=np.asarray(small).copy(); vis[out]=vis[out]//3; vis[water&inside]=[40,80,200]
Image.fromarray(vis.astype('uint8')).resize((1024,760)).save('mask_vis.jpg')
print(land.mean(), (inside).mean())
