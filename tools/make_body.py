import gzip,json,struct,numpy as np,base64,sys
m=json.load(open('manifest.json'));sh=m['shapes'];N=m['vertexCount']
by=np.frombuffer(gzip.decompress(open('shapes.bin.gz','rb').read()),dtype=np.uint8)
def unplane16(at,n,signed):
    lo=by[at:at+n].astype(np.uint32);hi=by[at+n:at+2*n].astype(np.uint32)
    v=np.cumsum(lo|(hi<<8))&0xffff
    return v.astype(np.int64)-(v>32767)*65536 if signed else v
def unplane8(at,n):
    v=np.cumsum(by[at:at+n].astype(np.int64))&0xff;return v-(v>127)*256
base=np.zeros((N,3))
for k in range(3):base[:,k]=sh['baseMin'][k]+unplane16(sh['baseOffset']+k*N*2,N,False)*sh['baseScale'][k]
M={}
for mo in sh['morphs']:
    if not mo['name'].startswith('macro/'):continue
    idx=unplane16(mo['offset'],mo['count'],False);d=np.zeros((mo['count'],3));at=mo['offset']+mo['count']*2
    for k in range(3):
        v=unplane8(at,mo['count']) if mo['bits']==8 else unplane16(at,mo['count'],True);at+=mo['count']*(1 if mo['bits']==8 else 2);d[:,k]=v
    M[mo['name']]=(idx,d*mo['scale'])
def shape(g,muscle,weight,cup=.5,height=.5,prop=.6,age=.12):
    w={};w['macro/sexF']=max(0,1-2*g);w['macro/sexM']=max(0,2*g-1)
    def split(v,up,down):
        k,a=(up,2*v-1) if v>=.5 else (down,1-2*v)
        w['macro/'+k+'F']=w.get('macro/'+k+'F',0)+a*(1-g);w['macro/'+k+'M']=w.get('macro/'+k+'M',0)+a*g
    split(muscle,'muscleUp','muscleDown');split(weight,'weightUp','weightDown');split(.5+(height-.5)*.36,'heightUp','heightDown')
    split(prop,'proportionsUp','proportionsDown');split(cup,'cupUp','cupDown');split(.6,'firmUp','firmDown')
    years=18+72*age;t=(25-years)/7 if years<25 else (years-25)/65
    key='ageYoung' if years<25 else 'ageOld';w['macro/'+key+'F']=t*(1-g);w['macro/'+key+'M']=t*g
    for r in['african','asian','caucasian']:w['macro/'+r+'F']=(1-g)/3;w['macro/'+r+'M']=g/3
    out=base.copy()
    for k,v in w.items():
        if k in M and abs(v)>1e-4:idx,d=M[k];np.add.at(out,idx,d*v)
    return out
b=gzip.decompress(open('body.glb.gz','rb').read());L=struct.unpack('<I',b[12:16])[0];j=json.loads(b[20:20+L]);bin0=20+L+8
def acc(i,dt):
    a=j['accessors'][i];bv=j['bufferViews'][a['bufferView']];o=bin0+bv.get('byteOffset',0)+a.get('byteOffset',0)
    c={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];it=np.dtype(dt).itemsize;st=bv.get('byteStride',c*it)
    raw=np.frombuffer(b[o:o+st*a['count']],dtype=np.uint8).reshape(a['count'],st)[:,:c*it].copy()
    return raw.view(dt).reshape(-1)
prim=j['meshes'][0]['primitives'][0];MH=acc(prim['attributes']['_MH'],np.uint16);IDX=acc(prim['indices'],np.uint16)
tri=MH[IDX].reshape(-1,3)
used=np.unique(tri);remap=-np.ones(N,dtype=np.int64);remap[used]=np.arange(len(used))
T=remap[tri].astype(np.uint16)
res={}
for name,args in [('m',dict(g=1,muscle=.78,weight=.45,prop=.7)),('f',dict(g=0,muscle=.58,weight=.45,cup=.48,prop=.65))]:
    P=shape(**args)[used];P[:,1]-=P[:,1].min()
    res[name]=P
    print(name,len(P),P.min(0).round(3),P.max(0).round(3))
np.save('T.npy',T);np.save('Pm.npy',res['m']);np.save('Pf.npy',res['f'])
print('tris',len(T))
