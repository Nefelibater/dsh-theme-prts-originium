/* Original geometry inspired by the supplied Originium silhouette. */
export function createOriginiumGeometry(seed=0x50525453) {
  let state=seed>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const positions=[],normals=[],colors=[],surfaces=[];
  let shardCount=0;
  const norm=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function shard(center,axis,length,radius,flat=1,amber=false){
    shardCount++;
    const direction=norm(axis),side=norm(cross(direction,Math.abs(direction[1])>.9?[1,0,0]:[0,1,0])),front=cross(side,direction);
    const spin=random()*Math.PI*2,count=5+Math.floor(random()*2),angles=[];
    for(let i=0;i<count;i++)angles.push(spin+(i+.42*(random()-.5))*Math.PI*2/count);
    const radii=angles.map(()=>.57+random()*.7);
    const point=(x,y,z)=>center.map((v,i)=>v+side[i]*x+direction[i]*y+front[i]*z);
    const ring=(height,scale,dx=0,dz=0)=>angles.map((angle,i)=>point(Math.cos(angle)*radius*radii[i]*scale+dx,height,Math.sin(angle)*radius*radii[i]*scale*flat+dz));
    const bottom=point((random()-.5)*radius,-length*.5,(random()-.5)*radius*flat);
    const low=ring(-length*.29,.62),middle=ring(length*.04,1),high=ring(length*.3,.65,(random()-.5)*radius*.25);
    const tip=point((random()-.5)*radius*.65,length*(.58+random()*.12),(random()-.5)*radius*.3*flat);
    const dark=.025+random()*.065,roughness=.08+random()*.15;
    function face(a,b,c){
      let normal=norm(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i])));
      const mid=a.map((v,i)=>(v+b[i]+c[i])/3-center[i]);
      if(normal.reduce((s,v,i)=>s+v*mid[i],0)<0){[b,c]=[c,b];normal=normal.map(v=>-v);}
      const facet=.72+random()*.65;
      const color=amber?[.10+random()*.06,.022+random()*.015,.014]:[dark*.96*facet,dark*.98*facet,dark*facet];
      const rough=Math.max(.065,roughness+(random()-.5)*.07);
      for(const p of [a,b,c]){positions.push(...p);normals.push(...normal);colors.push(...color);surfaces.push(rough,amber?1:0);}
    }
    for(let i=0;i<count;i++){
      const j=(i+1)%count;
      face(bottom,low[i],low[j]);
      face(low[i],middle[i],middle[j]);face(low[i],middle[j],low[j]);
      face(middle[i],high[i],high[j]);face(middle[i],high[j],middle[j]);
      face(high[i],tip,high[j]);
    }
  }
  /* A skewed backbone; its silhouette is interrupted by many overlapping laths. */
  shard([-.06,.08,-.04],[.08,1,.02],4.55,.53,.82);
  shard([.12,-.65,.05],[-.08,-1,.09],2.95,.43,.8);
  shard([.16,.72,-.1],[-.08,1,.12],2.95,.37,.7);
  shard([-.13,-1.04,.35],[.045,-1,.09],2.7,.42,.68);
  for(let level=0;level<7;level++){
    const y=-1.55+level*.48,band=Math.max(.3,1-Math.abs(y-.1)/2.5);
    for(let i=0;i<9;i++){
      const angle=i/9*Math.PI*2+level*.51+(random()-.5)*.45;
      const radial=(.48+random()*.34)*band;
      const orientation=y<-.3?-1:1;
      shard([Math.cos(angle)*radial,y+(random()-.5)*.23,Math.sin(angle)*radial*.85],
        [Math.cos(angle)*(.25+random()*.38),orientation*(.7+random()*.5),Math.sin(angle)*(.2+random()*.27)],
        (.75+random()*1.25)*band,.17+random()*.21,.46+random()*.5);
    }
  }
  /* Broad cleaved plates between the needle-like edges, with no symmetry copy. */
  for(let i=0;i<24;i++){
    const a=random()*Math.PI*2,y=(random()-.5)*3.15,r=.38+random()*.33;
    shard([Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(a)*.14,y<0?-1:1,Math.sin(a)*.15],.7+random()*.95,.18+random()*.22,.25+random()*.2);
  }
  /* Fine fractures break the clean prism edges into overlapping thin flakes. */
  for(let i=0;i<104;i++){
    const a=random()*Math.PI*2,y=(random()-.5)*3.4,band=Math.max(.3,1-Math.abs(y)/2.35);
    const r=(.68+random()*.39)*band,sign=y<-.15?-1:1;
    shard([Math.cos(a)*r,y,Math.sin(a)*r*.9],
      [Math.cos(a)*(.2+random()*.4),sign*(.7+random()*.5),Math.sin(a)*(.15+random()*.35)],
      .22+random()*.6,.06+random()*.11,.18+random()*.3);
  }
  /* Warm seams stay inside the cluster, rather than becoming a glowing gem. */
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    shard([Math.cos(a)*.23,.12+(random()-.5)*.25,Math.sin(a)*.23],[.12,1,.06],.35+random()*.4,.028+random()*.02,.4,true);
  }
  /* Detached splinters have their own volume and remain visible from the back. */
  for(let i=0;i<23;i++){
    const a=random()*Math.PI*2,y=(random()-.5)*3.6,r=1.26+random()*.38;
    shard([Math.cos(a)*r,y,Math.sin(a)*r*.72],[(random()-.5)*.65,random()<.5?1:-1,(random()-.5)*.6],.10+random()*.25,.025+random()*.055,.4+random()*.5);
  }
  /* Broaden the fractured midsection while preserving the long tapered ends. */
  for(let i=0;i<positions.length;i+=3){positions[i]*=1.26;positions[i+2]*=1.18;const n=norm([normals[i]/1.26,normals[i+1],normals[i+2]/1.18]);normals.splice(i,3,...n);}
  for(let i=0;i<positions.length;i++)positions[i]=Math.fround(positions[i]);
  const bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
  for(let i=0;i<positions.length;i++){
    const axis=i%3;bounds.min[axis]=Math.min(bounds.min[axis],positions[i]);bounds.max[axis]=Math.max(bounds.max[axis],positions[i]);
  }
  return {positions:new Float32Array(positions),normals:new Float32Array(normals),colors:new Float32Array(colors),surfaces:new Float32Array(surfaces),bounds,shardCount,triangleCount:positions.length/9};
}

/* A thin, hollow diamond attached to the front fracture, plus a soft local halo.
   Both parts have object-space geometry, so turning the crystal turns the seal. */
export function createOriginiumSigil(body) {
  const yaw=-.27,pitch=.08,cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
  const right=[cy,0,sy],up=[sy*sx,cx,-cy*sx],normal=[-sy*cx,sx,cy*cx];
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),height=.52;
  let depth=1.25;
  // Find the forward crystal surface beneath the seal, not a screen overlay.
  for(let i=0;i<body.positions.length;i+=9){
    const p=[0,3,6].map(k=>Array.from(body.positions.slice(i+k,i+k+3)));
    const uv=p.map(v=>[dot(v,right),dot(v,up)]),z=p.map(v=>dot(v,normal));
    const den=(uv[1][1]-uv[2][1])*(uv[0][0]-uv[2][0])+(uv[2][0]-uv[1][0])*(uv[0][1]-uv[2][1]);
    if(Math.abs(den)<1e-8)continue;
    for(const [x,y] of [[0,height],[.22,height],[-.22,height],[0,height+.22],[0,height-.22]]){
      const a=((uv[1][1]-uv[2][1])*(x-uv[2][0])+(uv[2][0]-uv[1][0])*(y-uv[2][1]))/den;
      const b=((uv[2][1]-uv[0][1])*(x-uv[2][0])+(uv[0][0]-uv[2][0])*(y-uv[2][1]))/den,c=1-a-b;
      if(a>=0&&b>=0&&c>=0)depth=Math.max(depth,a*z[0]+b*z[1]+c*z[2]+.075);
    }
  }
  const center=normal.map((v,i)=>v*depth+up[i]*height);
  const point=(x,y,z=0)=>center.map((v,i)=>v+right[i]*x+up[i]*y+normal[i]*z);
  const make=()=>({positions:[],normals:[],colors:[],surfaces:[]}),frame=make(),halo=make();
  function triangle(part,a,b,c,color,alpha,kind){
    const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]);
    let n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
    const length=Math.hypot(...n)||1;n=n.map(v=>v/length);
    for(let k=0;k<3;k++){part.positions.push(...[a,b,c][k]);part.normals.push(...n);part.colors.push(...color);part.surfaces.push(Array.isArray(alpha)?alpha[k]:alpha,kind);}
  }
  const corners=radius=>[[0,radius],[-radius,0],[0,-radius],[radius,0]];
  const outer=corners(.275),inner=corners(.232),ivory=[.96,.94,.89];
  for(let i=0;i<4;i++){
    const j=(i+1)%4,a=point(...outer[i],.012),b=point(...outer[j],.012),c=point(...inner[j],.012),d=point(...inner[i],.012);
    triangle(frame,a,b,c,ivory,.08,2);triangle(frame,a,c,d,ivory,.08,2);
    const backA=point(...outer[i],-.018),backB=point(...outer[j],-.018),backC=point(...inner[j],-.018),backD=point(...inner[i],-.018);
    for(const [v0,v1,v2,v3] of [[a,backA,backB,b],[d,c,backC,backD],[backA,backD,backC,backB]]){
      triangle(frame,v0,v1,v2,[.78,.73,.67],.1,2);triangle(frame,v0,v2,v3,[.78,.73,.67],.1,2);
    }
  }
  const radii=[0,.10,.22,.34,.48,.65,.82],alpha=[.23,.23,.20,.13,.055,.014,0],segments=64;
  const sample=(radius,angle)=>point(Math.cos(angle)*radius,Math.sin(angle)*radius,-.004);
  for(let ring=1;ring<radii.length;ring++)for(let i=0;i<segments;i++){
    const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
    const p=sample(radii[ring-1],a),q=sample(radii[ring],a),r=sample(radii[ring],b),s=sample(radii[ring-1],b);
    triangle(halo,p,q,r,[.48,.075,.042],[alpha[ring-1],alpha[ring],alpha[ring]],3);
    if(ring>1)triangle(halo,p,r,s,[.48,.075,.042],[alpha[ring-1],alpha[ring],alpha[ring-1]],3);
  }
  function finish(part){
    for(const key of Object.keys(part))part[key]=new Float32Array(part[key]);
    part.bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
    for(let i=0;i<part.positions.length;i++){const k=i%3;part.bounds.min[k]=Math.min(part.bounds.min[k],part.positions[i]);part.bounds.max[k]=Math.max(part.bounds.max[k],part.positions[i]);}
    part.triangleCount=part.positions.length/9;return part;
  }
  return {frame:finish(frame),halo:finish(halo),center,normal,light:point(0,0,.22)};
}
