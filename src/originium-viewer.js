/* The sigil gently expands and contracts with a 6-second light pulse, capped at 20 fps. */
let originiumMotionPaused=false;
function mountOriginiumViewer(canvas) {
  if(!canvas)return()=>{};
  const host=canvas.closest('.po-material');
  let gl,program,vertexShader,fragmentShader,resizeObserver,intersectionObserver,themeObserver;
  let disposed=false,visible=false,drag=null,renderCount=0;
  let motionTimer=null,motionTime=0,lastMotionAt=0,pulse=.5;
  const motionQuery=typeof window!=='undefined'&&window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  const motionButton=host?.querySelector('.po-material__motion');
  const buffers=[];
  let yaw=-.27,pitch=.08,zoom=1;
  const setState=value=>host?.setAttribute('data-model-state',value);
  function fallback(){setState('fallback');canvas.tabIndex=-1;}
  const vertex=`
    attribute vec3 aPosition;attribute vec3 aNormal;attribute vec3 aColor;attribute vec2 aSurface;
    uniform float uYaw;uniform float uPitch;uniform float uAspect;uniform float uZoom;uniform vec3 uCore;
    uniform float uPulse;uniform vec3 uSigilCenter;uniform vec3 uSigilNormal;
    varying vec3 vPosition;varying vec3 vNormal;varying vec3 vColor;varying vec2 vSurface;varying vec3 vLocal;varying vec3 vCore;
    void main(){
      float cy=cos(uYaw),sy=sin(uYaw),cx=cos(uPitch),sx=sin(uPitch);
      mat3 ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy),rx=mat3(1.,0.,0.,0.,cx,sx,0.,-sx,cx);
      vec3 local=aPosition;
      if(aSurface.y>1.5){
        vec3 offset=aPosition-uSigilCenter;
        vec3 depth=uSigilNormal*dot(offset,uSigilNormal);
        float amplitude=aSurface.y>2.5?.12:.24;
        local=uSigilCenter+(offset-depth)*(1.+(uPulse-.5)*amplitude)+depth;
      }
      vec3 p=rx*ry*local;vPosition=p;vNormal=rx*ry*aNormal;vColor=aColor;vSurface=aSurface;vLocal=local;vCore=rx*ry*uCore;
      float distance=8.9/uZoom;float z=p.z-distance;float f=2.75;
      gl_Position=vec4(p.x*f/uAspect,p.y*f,(30.1/29.9)*(-z)-6.0/29.9,-z);
    }`;
  const fragment=`
    precision highp float;
    varying vec3 vPosition;varying vec3 vNormal;varying vec3 vColor;varying vec2 vSurface;varying vec3 vLocal;varying vec3 vCore;
    uniform float uDark;uniform float uYaw;uniform float uPitch;uniform float uZoom;uniform float uPulse;
    float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
    float grain(vec3 p){
      vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float panel(vec2 p,vec2 size,float feather){vec2 edge=1.-smoothstep(size,size+vec2(feather),abs(p));return edge.x*edge.y;}
    vec3 environment(vec3 r,float rough){
      vec2 q=r.xy/max(r.z,.035);float forward=smoothstep(.02,.15,r.z),soft=.035+rough*.28;
      float broad=panel(q-vec2(.95,.22),vec2(.36,1.25),soft);
      float strip=panel(q-vec2(-.85,.32),vec2(.09,1.5),soft*.7);
      float top=panel(q-vec2(-.1,1.45),vec2(1.45,.12),soft);
      float diffuseSky=.045+.12*max(r.y,0.);
      return vec3(.93,.96,1.)*(diffuseSky+forward*(broad*7.5+strip*5.+top*4.));
    }
    vec3 film(vec3 c){c=max(c,vec3(0));return pow(clamp(c*(2.51*c+.03)/(c*(2.43*c+.59)+.14),0.,1.),vec3(1./2.2));}
    void main(){
      vec3 v=normalize(vec3(0.,0.,8.9/uZoom)-vPosition),n=normalize(vNormal);
      if(vSurface.y>2.5){gl_FragColor=vec4(vColor,vSurface.x*(.65+.7*uPulse)*smoothstep(0.,.28,dot(n,v)));return;}
      if(vSurface.y>1.5){gl_FragColor=vec4(vColor*(.78+.22*uPulse),1.);return;}
      if(!gl_FrontFacing)n=-n;
      vec3 samplePoint=vLocal*vec3(38.,7.,38.);
      float fine=grain(samplePoint),cleavage=grain(vLocal*vec3(11.,2.2,11.));
      vec3 micro=vec3(fine-.5,grain(samplePoint+vec3(7.1,3.6,2.5))-.5,grain(samplePoint+vec3(2.3,8.1,4.7))-.5);
      float cy=cos(uYaw),sy=sin(uYaw),cx=cos(uPitch),sx=sin(uPitch);
      mat3 ry=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy),rx=mat3(1.,0.,0.,0.,cx,sx,0.,-sx,cx);
      n=normalize(n+rx*ry*micro*(.022+.04*smoothstep(.68,.9,cleavage)));
      float rough=clamp(vSurface.x+smoothstep(.58,.86,cleavage)*.09,.065,.34);
      float fresnel=pow(1.-max(dot(n,v),0.),5.);
      vec3 reflected=environment(reflect(-v,n),rough);
      vec3 key=normalize(vec3(-3.,5.,4.)),rim=normalize(vec3(4.,1.,1.8));
      float diffuse=.12+.4*max(dot(n,key),0.)+.16*max(dot(n,rim),0.);
      vec3 col=vColor*diffuse*(.78+.22*cleavage);
      vec3 coreDirection=normalize(vCore);
      float radialDistance=length(cross(vCore-vPosition,coreDirection));
      float darkSeal=(1.-smoothstep(.25,.46,radialDistance))*smoothstep(.2,.7,dot(vPosition,coreDirection));
      col+=reflected*(.10+.70*fresnel)*(1.-rough*.4)*(1.-.94*darkSeal);
      col+=vec3(.10,.115,.13)*pow(1.-max(dot(n,v),0.),3.)*(.35+.5*uDark);
      float distanceToCore=length(vCore-vPosition),facing=max(dot(n,normalize(vCore-vPosition)),0.);
      col+=vec3(.22,.014,.007)*exp(-distanceToCore*3.4)*(.35+facing*1.6)*(.65+.7*uPulse);
      col+=vec3(.04,.003,.001)*vSurface.y;
      gl_FragColor=vec4(film(col),1.);
    }`;
  const attributes={aPosition:['positions',3],aNormal:['normals',3],aColor:['colors',3],aSurface:['surfaces',2]};
  let mesh,sigil,uniforms,bodyVertices=0,frameVertices=0,haloVertices=0;
  function exposed(){
    const dialog=document.querySelector('.po-material-dialog[open]');
    return visible&&document.visibilityState!=='hidden'&&!document.body.hasAttribute('data-po-focus')&&(!dialog||dialog.contains(canvas));
  }
  function stopMotion(){if(motionTimer!==null)clearTimeout(motionTimer);motionTimer=null;lastMotionAt=0;}
  function motionState(){
    if(!exposed())return 'hidden';
    if(motionQuery?.matches)return 'reduced';
    return originiumMotionPaused?'paused':'running';
  }
  function syncMotion(){
    stopMotion();if(disposed)return;
    const state=motionState();canvas.setAttribute('data-motion-state',state);
    if(motionQuery?.matches)pulse=.5;
    if(motionButton){
      motionButton.disabled=!!motionQuery?.matches;
      motionButton.textContent=originiumMotionPaused?'▷':'Ⅱ';
      motionButton.setAttribute('aria-pressed',String(originiumMotionPaused));
      motionButton.setAttribute('aria-label',motionQuery?.matches?'系统已关闭动态效果':originiumMotionPaused?'播放菱形光效':'暂停菱形光效');
      motionButton.title=motionQuery?.matches?'遵循系统的减少动态效果设置':originiumMotionPaused?'播放菱形光效':'暂停菱形光效';
    }
    draw();
    if(state==='running'&&program){lastMotionAt=performance.now();motionTimer=setTimeout(tick,50);}
  }
  function tick(){
    motionTimer=null;
    if(disposed||!program||motionState()!=='running'){syncMotion();return;}
    const now=performance.now();motionTime+=Math.min(now-lastMotionAt,100);lastMotionAt=now;
    pulse=.5+.5*Math.sin(motionTime*Math.PI/3000);
    draw();motionTimer=setTimeout(tick,50);
  }
  function toggleMotion(){originiumMotionPaused=!originiumMotionPaused;document.dispatchEvent(new Event('prts:specimen-visibility'));}
  function compile(type,text){const shader=gl.createShader(type);gl.shaderSource(shader,text);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Shader compilation unavailable');}return shader;}
  function draw(){
    if(disposed||!gl||!exposed()||!program)return;
    const rect=canvas.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
    const ratio=Math.min(window.devicePixelRatio||1,2),width=Math.round(rect.width*ratio),height=Math.round(rect.height*ratio);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);gl.uniform1f(uniforms.uYaw,yaw);gl.uniform1f(uniforms.uPitch,pitch);gl.uniform1f(uniforms.uAspect,width/height);gl.uniform1f(uniforms.uZoom,zoom);
    gl.uniform1f(uniforms.uDark,document.body.hasAttribute('data-ds-dark-theme')?1:0);
    gl.uniform3fv(uniforms.uCore,sigil.light);
    gl.uniform3fv(uniforms.uSigilCenter,sigil.center);gl.uniform3fv(uniforms.uSigilNormal,sigil.normal);
    gl.uniform1f(uniforms.uPulse,pulse);
    gl.depthMask(true);gl.disable(gl.BLEND);gl.drawArrays(gl.TRIANGLES,0,bodyVertices);
    gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLES,bodyVertices+frameVertices,haloVertices);
    gl.depthMask(true);gl.disable(gl.BLEND);gl.drawArrays(gl.TRIANGLES,bodyVertices,frameVertices);
    canvas.setAttribute('data-view-angle',yaw.toFixed(3)+','+pitch.toFixed(3));
    canvas.setAttribute('data-render-count',String(++renderCount));
    canvas.setAttribute('data-core-pulse',pulse.toFixed(3));
    canvas.setAttribute('data-sigil-scale',(1+(pulse-.5)*.24).toFixed(3));
  }
  function init(){
    if(disposed||gl)return;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,powerPreference:'low-power',preserveDrawingBuffer:true});
      if(!gl){fallback();return;}
      vertexShader=compile(gl.VERTEX_SHADER,vertex);fragmentShader=compile(gl.FRAGMENT_SHADER,fragment);
      program=gl.createProgram();gl.attachShader(program,vertexShader);gl.attachShader(program,fragmentShader);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL linking unavailable');
      gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
      mesh=createOriginiumGeometry();sigil=createOriginiumSigil(mesh);
      bodyVertices=mesh.positions.length/3;frameVertices=sigil.frame.positions.length/3;haloVertices=sigil.halo.positions.length/3;
      for(const [name,[key,size]] of Object.entries(attributes)){
        const data=new Float32Array(mesh[key].length+sigil.frame[key].length+sigil.halo[key].length);
        data.set(mesh[key]);data.set(sigil.frame[key],mesh[key].length);data.set(sigil.halo[key],mesh[key].length+sigil.frame[key].length);
        const buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
        const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0);
      }
      uniforms=Object.fromEntries(['uYaw','uPitch','uAspect','uZoom','uDark','uCore','uPulse','uSigilCenter','uSigilNormal'].map(k=>[k,gl.getUniformLocation(program,k)]));
      canvas.setAttribute('data-model-triangles',String((bodyVertices+frameVertices+haloVertices)/3));canvas.setAttribute('data-model-detail','obsidian / ivory sigil / red core');setState('ready');draw();
    }catch(error){console.warn('[prts-originium] 3D specimen unavailable; displaying artwork.',error);fallback();release();}
  }
  function reset(){yaw=-.27;pitch=.08;zoom=1;draw();}
  function down(e){if(e.button!==0||!program)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});canvas.setAttribute('data-dragging','');}
  function move(e){if(!drag||e.pointerId!==drag.id)return;yaw+=(e.clientX-drag.x)*.011;pitch=Math.max(-1.1,Math.min(1.1,pitch+(e.clientY-drag.y)*.008));drag.x=e.clientX;drag.y=e.clientY;draw();}
  function up(){drag=null;canvas.removeAttribute('data-dragging');}
  function key(e){
    const actions={ArrowLeft:()=>yaw-=.16,ArrowRight:()=>yaw+=.16,ArrowUp:()=>pitch=Math.max(-1.1,pitch-.12),ArrowDown:()=>pitch=Math.min(1.1,pitch+.12),Home:reset,'+':()=>zoom=Math.min(1.2,zoom+.05),'-':()=>zoom=Math.max(.8,zoom-.05)};
    if(actions[e.key]&&program){e.preventDefault();actions[e.key]();draw();}
  }
  function contextLost(e){e.preventDefault();up();stopMotion();release();fallback();}
  function contextRestored(){if(disposed)return;canvas.tabIndex=0;if(visible){init();syncMotion();}}
  function release(destroy=false){
    if(!gl)return;
    for(const b of buffers)gl.deleteBuffer(b);buffers.length=0;
    if(program)gl.deleteProgram(program);if(vertexShader)gl.deleteShader(vertexShader);if(fragmentShader)gl.deleteShader(fragmentShader);
    if(destroy&&!canvas.isConnected)gl.getExtension('WEBGL_lose_context')?.loseContext();
    program=null;vertexShader=null;fragmentShader=null;gl=null;
  }
  const resetButton=host?.querySelector('.po-material__reset');
  motionButton?.addEventListener('click',toggleMotion);
  document.addEventListener('visibilitychange',syncMotion);document.addEventListener('prts:specimen-visibility',syncMotion);motionQuery?.addEventListener('change',syncMotion);
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);canvas.addEventListener('keydown',key);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);resetButton?.addEventListener('click',reset);
  if(typeof IntersectionObserver==='function'){
    intersectionObserver=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting||false;if(visible)init();syncMotion();},{threshold:.01});intersectionObserver.observe(canvas);
  }else{visible=true;init();syncMotion();}
  if(typeof ResizeObserver==='function'){resizeObserver=new ResizeObserver(draw);resizeObserver.observe(canvas);}
  if(typeof MutationObserver==='function'){themeObserver=new MutationObserver(syncMotion);themeObserver.observe(document.body,{attributes:true,attributeFilter:['data-ds-dark-theme','data-po-focus']});}
  return()=>{
    disposed=true;stopMotion();intersectionObserver?.disconnect();resizeObserver?.disconnect();themeObserver?.disconnect();release(true);
    document.removeEventListener('visibilitychange',syncMotion);document.removeEventListener('prts:specimen-visibility',syncMotion);motionQuery?.removeEventListener('change',syncMotion);motionButton?.removeEventListener('click',toggleMotion);
    canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',up);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);resetButton?.removeEventListener('click',reset);
  };
}
