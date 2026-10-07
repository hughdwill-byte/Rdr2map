# Smooth per-source correction onto the ShackMaps frame (the most accurate one we have).
# Each source's affine fit leaves distortion that grows towards the map edges (up to ~6 units in New Austin);
# a thin-plate spline through matched collectibles removes it. Pairs come from warp_pairs.npz.
import os,numpy as np
from scipy.interpolate import RBFInterpolator
_pr=np.load(os.path.join(os.path.dirname(os.path.abspath(__file__)),'warp_pairs.npz'))
_f={s:RBFInterpolator(_pr[s][:,:2],_pr[s][:,2:]-_pr[s][:,:2],smoothing=10,kernel='thin_plate_spline') for s in _pr.files}
def fix(src,ll):
  a=np.atleast_2d(np.asarray(ll,float)); r=a+_f[src](a)
  return [[round(float(x),3),round(float(y),3)] for x,y in r] if np.ndim(ll)==2 else [round(float(r[0,0]),3),round(float(r[0,1]),3)]
if __name__=='__main__':
  for s in _pr.files:
    p=_pr[s]; e=np.linalg.norm(np.array(fix(s,p[:,:2]))-p[:,2:],axis=1); print(s,'after: median %.2f max %.2f'%(np.median(e),e.max()))
