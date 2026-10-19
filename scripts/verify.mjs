import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createOriginiumGeometry,createOriginiumSigil} from '../src/originium-mesh.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('client.js');
const meta=JSON.parse(read('package.json'));
const css=read('src/theme.css');
const reports=[];
function run({styleService=false,missingTheme=false,storedFocus=false,reduced=false,bootDisabled=false,blockedStorage=false,storedMemory='0'}={}) {
  let module, tokens, paletteActive=false;
  const attrs=new Map();const tags=[];const layers=[];const cleanups=[];const seats=new Map();const timers=new Map();const listeners=new Map();let timerId=0;
  const storage=new Map(storedFocus?[['prts-originium:focus:v1','1']]:[]);if(bootDisabled)storage.set('prts-originium:boot:v1','0');
  storage.set('prts-originium:memory:v1',storedMemory);
  const body={getAttribute:k=>attrs.get(k)??null,hasAttribute:k=>attrs.has(k),setAttribute:(k,v)=>attrs.set(k,String(v)),removeAttribute:k=>attrs.delete(k),toggleAttribute(k,v){v?attrs.set(k,''):attrs.delete(k);},appendChild:layer=>layers.push(layer)};
  function element(){return{handlers:new Map(),setAttribute(){},addEventListener(name,fn){this.handlers.set(name,fn);},querySelector(){return this;},contains(){return false;},remove(){for(const list of [tags,layers]){const i=list.indexOf(this);if(i>=0)list.splice(i,1);}}};}
  const document={body,activeElement:null,head:{appendChild:tag=>tags.push(tag)},createElement:element,addEventListener:(key,fn)=>listeners.set(key,fn),removeEventListener:(key,fn)=>{if(listeners.get(key)===fn)listeners.delete(key);}};
  const react={createElement:(type,props,...children)=>({type,props:props||{},children}),useState:initial=>[typeof initial==='function'?initial():initial,()=>{}]};
  const sandbox={console,document,setTimeout(fn,ms){assert.equal(ms,3350);timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),localStorage:{getItem:k=>{if(blockedStorage)throw Error('storage disabled');return storage.get(k)??null;},setItem:(k,v)=>{if(blockedStorage)throw Error('storage disabled');storage.set(k,v);}},window:{matchMedia:()=>({matches:reduced}),__ModuleLoader__:{load:value=>module=value}}};
  let cssMounted=0;
  if(styleService)sandbox.styles={insert(value){assert.ok(value.includes('data-dsh-prts-originium'));cssMounted++;return()=>cssMounted--;}};
  vm.runInNewContext(source,sandbox);
  assert.equal(module.id,meta.name);
  const plugin=module.factory(id=>{assert.equal(id,'react');return react;});
  const ctx={effect(fn){const clean=fn();if(typeof clean==='function')cleanups.push(clean);},get(){return missingTheme?null:{overrideTokens(id,value){assert.equal(id,'dsh-theme-prts-originium');tokens=value;paletteActive=true;return()=>{paletteActive=false;};}};},slots:{inject(name,fn){cleanups.push(fn());},register(options,component){assert.ok(!seats.has(options.name));seats.set(options.name,component);return()=>seats.delete(options.name);}}};
  plugin.apply(ctx);
  assert.equal(body.getAttribute('data-dsh-prts-originium'),meta.version);
  assert.equal(body.hasAttribute('data-ds-dark-theme'),false,'Does not force dark mode');
  assert.equal(seats.size,3);
  assert.equal(tags.length,styleService?0:1);
  assert.equal(cssMounted,styleService?1:0);
  const expectedBoot=!(reduced||storedFocus||bootDisabled);
  assert.equal(layers.length,expectedBoot?1:0);assert.equal(timers.size,expectedBoot?1:0);
  if(expectedBoot){listeners.get('keydown')({key:'Escape'});assert.equal(layers.length,0);assert.equal(timers.size,0);assert.equal(listeners.size,0);}
  const dock=seats.get('sidebar.footer.action')({wide:true});
  function find(node,className){if(node?.props?.className===className)return node;for(const child of node?.children||[]){const found=find(child,className);if(found)return found;}}
  find(dock,'po-memory__previous').props.onClick();
  let changedDock=seats.get('sidebar.footer.action')({wide:true});
  assert.equal(find(changedDock,'po-memory__navigation').children[1].children[0],'03 / 03','Previous from first image wraps, including blocked or invalid storage');
  find(changedDock,'po-memory__next').props.onClick();
  changedDock=seats.get('sidebar.footer.action')({wide:true});
  assert.equal(find(changedDock,'po-memory__navigation').children[1].children[0],'01 / 03');
  const gallery=find(changedDock,'po-memory__reveal');let prevented=false;
  gallery.props.onKeyDown({key:'ArrowRight',preventDefault(){prevented=true;}});assert.ok(prevented);
  assert.equal(find(seats.get('sidebar.footer.action')({wide:true}),'po-memory__navigation').children[1].children[0],'02 / 03');
  const button=find(dock,'po-focus');
  assert.equal(button.props['aria-pressed'],storedFocus);
  button.props.onClick();
  assert.equal(body.hasAttribute('data-po-focus'),!storedFocus);
  if(!blockedStorage)assert.equal(storage.get('prts-originium:focus:v1'),storedFocus?'0':'1');
  const replay=find(dock,'po-replay');
  assert.equal(replay.props.disabled,reduced);
  replay.props.onClick();replay.props.onClick();
  assert.equal(layers.length,reduced?0:1,'Replays must not stack');assert.equal(timers.size,reduced?0:1);
  if(!reduced){const end=[...timers.values()][0];end();assert.equal(layers.length,0);assert.equal(listeners.size,0);assert.equal(timers.size,0);replay.props.onClick();layers[0].handlers.get('pointerdown')();assert.equal(layers.length,0);replay.props.onClick();}
  const bootToggle=find(dock,'po-boot-toggle');assert.equal(bootToggle.props['aria-pressed'],!bootDisabled);bootToggle.props.onClick();
  if(!blockedStorage)assert.equal(storage.get('prts-originium:boot:v1'),bootDisabled?'1':'0');
  const hero=seats.get('conversation.hero.brand.mark')();
  assert.equal(hero.props['aria-label'],'PRTS · 源石协议');
  const shell=seats.get('shell.overlay')();
  assert.equal(shell.props['aria-hidden'],true);
  const compact=seats.get('sidebar.footer.action')({wide:false});
  assert.ok(compact.props.className.includes('po-dock--compact'));
  cleanups.reverse().forEach(fn=>fn());
  assert.equal(attrs.size,0);assert.equal(seats.size,0);assert.equal(tags.length,0);assert.equal(cssMounted,0);assert.equal(paletteActive,false);
  assert.equal(layers.length,0);assert.equal(timers.size,0);assert.equal(listeners.size,0);
  return tokens;
}
let tokens;
for(const options of [{},{styleService:true},{missingTheme:true},{storedFocus:true},{reduced:true},{bootDisabled:true},{blockedStorage:true},{storedMemory:'99'},{storedMemory:'-1'},{storedMemory:'NaN'}]){
  const result=run(options);if(result)tokens=result;
}
reports.push('PASS: plugin registration, both stylesheet paths, missing theme fallback, stored focus, compact sidebar and full disposal.');
reports.push('PASS: startup timeout, keyboard/pointer skip, repeated replay, reduced motion, animation preference, disabled storage, timer and listener disposal.');
reports.push('PASS: three-image gallery, previous/next wrap, arrow keys, invalid stored index and disabled storage.');
assert.equal(meta.dsh.bundle.patch,'./cordis.patch.yml');
assert.ok(read('cordis.patch.yml').includes(meta.name));
assert.equal(meta.dsh.client.immediately,true);
assert.match(read('index.js'),/export function apply\(\) \{\}/);
assert.ok(!source.includes('__TOKENS__')&&!source.includes('__CSS__')&&!source.includes('__ORIGINIUM__'));
assert.ok(!source.includes('setTheme('));
assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|https?:\/\//.test(source.replaceAll('http://www.w3.org/2000/svg','')),'Client must be offline');
assert.ok(!/backdrop-filter|blur\(|setInterval|requestAnimationFrame/.test(source),'No blur or unbounded interval/RAF loop');
for(const [name,pair] of Object.entries(tokens)){
  assert.ok(name.startsWith('--dsw-alias-')||name==='--dsw-specific-sidebar-fill');
  assert.equal(typeof pair.light,'string');assert.equal(typeof pair.dark,'string');
}
for(const asset of ['originiums.png','Bender-Regular.woff2','Bender-Bold.woff2','priestess-memory.jpg','priestess-hand.jpg','priestess-gaze.png']){
  assert.ok(source.includes(fs.readFileSync(path.join(root,'assets',asset)).toString('base64')),'Embedded bytes match '+asset);
}
assert.ok(css.includes('body[data-dsh-prts-originium] .po-shell *{pointer-events:none!important}'));
assert.ok(css.includes('clip-path:none!important;overflow:visible'));
reports.push(`PASS: ${Object.keys(tokens).length} paired tokens, self-contained assets, no appearance override, network calls or blur.`);
function luminance(hex){return hex.replace('#','').match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const contrastReport=[];
for(const mode of ['light','dark']){
  for(const foreground of ['label-primary','label-secondary','label-tertiary','link','state-error-primary','state-success-primary','state-warn-primary']){
    for(const background of ['bg-base','bg-layer-1','bg-layer-2','sidebar-fill']){
      const bgName=background==='sidebar-fill'?'--dsw-specific-sidebar-fill':'--dsw-alias-'+background;
      const ratio=contrast(tokens['--dsw-alias-'+foreground][mode],tokens[bgName][mode]);
      assert.ok(ratio>=4.5,`${mode} ${foreground} on ${background}: ${ratio}`);
      contrastReport.push({mode,foreground,background,ratio:Number(ratio.toFixed(2))});
    }
  }
}
reports.push(`PASS: ${contrastReport.length} text/surface combinations >= 4.5:1. Minimum ${Math.min(...contrastReport.map(r=>r.ratio)).toFixed(2)}:1.`);
const mesh=createOriginiumGeometry();
const sigil=createOriginiumSigil(mesh);
assert.ok(mesh.triangleCount>5000&&mesh.triangleCount<30000);
assert.equal(mesh.positions.length,mesh.normals.length);assert.equal(mesh.positions.length,mesh.colors.length);
assert.equal(mesh.surfaces.length,mesh.positions.length/3*2);
for(const array of [mesh.positions,mesh.normals,mesh.colors,mesh.surfaces])assert.ok(array.every(Number.isFinite));
for(let i=0;i<mesh.normals.length;i+=3)assert.ok(Math.abs(Math.hypot(mesh.normals[i],mesh.normals[i+1],mesh.normals[i+2])-1)<1e-5);
assert.ok(mesh.bounds.max[2]-mesh.bounds.min[2]>1.5,'True depth, not a flat image');
assert.deepEqual(mesh.positions,createOriginiumGeometry().positions,'Export and preview geometry must be deterministic');
for(const part of [sigil.frame,sigil.halo]){
  for(const array of [part.positions,part.normals,part.colors,part.surfaces])assert.ok(array.every(Number.isFinite));
  for(let i=0;i<part.normals.length;i+=3)assert.ok(Math.abs(Math.hypot(part.normals[i],part.normals[i+1],part.normals[i+2])-1)<1e-5);
}
assert.ok(sigil.frame.triangleCount>0&&sigil.halo.triangleCount>0);
assert.deepEqual(sigil.frame.positions,createOriginiumSigil(mesh).frame.positions);
const glb=fs.readFileSync(path.join(root,'model/originium-crystal.glb'));
assert.equal(glb.readUInt32LE(0),0x46546c67);assert.equal(glb.readUInt32LE(4),2);assert.equal(glb.readUInt32LE(8),glb.length);
const jsonLength=glb.readUInt32LE(12),gltf=JSON.parse(glb.subarray(20,20+jsonLength).toString());
assert.equal(gltf.accessors[0].count,mesh.positions.length/3);
const start=28+jsonLength;
assert.equal(glb.readUInt32LE(20+jsonLength),gltf.buffers[0].byteLength);
for(const view of gltf.bufferViews)assert.ok(start+view.byteOffset+view.byteLength<=glb.length);
assert.equal(gltf.meshes[0].primitives.length,3,'Crystal, hollow frame and transparent halo must be exported');
for(const primitive of gltf.meshes[0].primitives){
  const positions=gltf.accessors[primitive.attributes.POSITION];
  for(const accessor of Object.values(primitive.attributes))assert.equal(gltf.accessors[accessor].count,positions.count);
}
assert.equal(gltf.materials[2].alphaMode,'BLEND');
assert.ok(gltf.materials[0].extensions.KHR_materials_clearcoat.clearcoatFactor>0);
assert.equal(gltf.extensions.KHR_lights_punctual.lights[0].type,'point');
assert.ok(glb.subarray(start,start+mesh.positions.byteLength).equals(Buffer.from(mesh.positions.buffer)),'GLB positions equal the theme geometry');
reports.push(`PASS: ${mesh.shardCount} volumetric crystals / ${mesh.triangleCount} triangles, finite data, normalized normals, deterministic geometry and GLB binary/accessor bounds.`);
reports.push(`PASS: attached hollow diamond (${sigil.frame.triangleCount} triangles), alpha halo (${sigil.halo.triangleCount} triangles), clearcoat material and red point-light export.`);
// Exercise the real viewer's non-WebGL path and disposal without a GPU mock.
const events=new Map(),resetEvents=new Map(),attrs=new Map(),fallbackDocumentEvents=new Map();let disconnected=0;
const reset={addEventListener:(n,f)=>resetEvents.set(n,f),removeEventListener:n=>resetEvents.delete(n)};
const host={setAttribute:(k,v)=>attrs.set(k,v),querySelector:selector=>selector==='.po-material__reset'?reset:null};
const canvas={tabIndex:0,closest:()=>host,getContext:()=>null,setAttribute:(k,v)=>attrs.set(k,v),addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
const observer=class{observe(){}disconnect(){disconnected++;}};
const viewer=vm.runInNewContext(read('src/originium-viewer.js')+'\nmountOriginiumViewer',{console,document:{body:{hasAttribute:()=>false},querySelector:()=>null,addEventListener:(n,f)=>fallbackDocumentEvents.set(n,f),removeEventListener:n=>fallbackDocumentEvents.delete(n)},ResizeObserver:observer,MutationObserver:observer});
const disposeViewer=viewer(canvas);assert.equal(attrs.get('data-model-state'),'fallback');assert.equal(canvas.tabIndex,-1);
disposeViewer();assert.equal(events.size,0);assert.equal(resetEvents.size,0);assert.equal(fallbackDocumentEvents.size,0);assert.equal(disconnected,2);
reports.push('PASS: WebGL-unavailable fallback preserves artwork and releases viewer event handlers and observers.');
// Exercise animation scheduling and cleanup; real shader output is checked in the browser.
{
  const scheduled=new Map(),documentEvents=new Map(),canvasEvents=new Map(),buttonEvents=new Map(),data=new Map();
  let nextTimer=0,now=0,intersection,mediaChange,activeDialog=null;
  const media={matches:false,addEventListener:(n,fn)=>{mediaChange=fn;},removeEventListener:()=>{mediaChange=null;}};
  const button={setAttribute(){},addEventListener:(n,fn)=>buttonEvents.set(n,fn),removeEventListener:n=>buttonEvents.delete(n)};
  const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:(_,name)=>name,getExtension:()=>null},{get:(obj,key)=>key in obj?obj[key]:(/^[A-Z_]+$/.test(key)?1:()=>({}))});
  const motionHost={setAttribute(){},querySelector:selector=>selector==='.po-material__motion'?button:null};
  const motionCanvas={width:0,height:0,isConnected:true,closest:()=>motionHost,getContext:()=>gl,getBoundingClientRect:()=>({width:240,height:320}),setAttribute:(k,v)=>data.set(k,v),removeAttribute:k=>data.delete(k),addEventListener:(n,fn)=>canvasEvents.set(n,fn),removeEventListener:n=>canvasEvents.delete(n)};
  const motionDocument={visibilityState:'visible',body:{hasAttribute:()=>false},querySelector:()=>activeDialog,addEventListener:(n,fn)=>documentEvents.set(n,fn),removeEventListener:n=>documentEvents.delete(n),dispatchEvent:event=>documentEvents.get(event.type)?.()};
  const mount=vm.runInNewContext(read('src/originium-viewer.js')+'\nmountOriginiumViewer',{console,createOriginiumGeometry,createOriginiumSigil,document:motionDocument,window:{devicePixelRatio:1,matchMedia:()=>media},performance:{now:()=>now},Event:class{constructor(type){this.type=type;}},IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}disconnect(){}},setTimeout(fn,ms){assert.equal(ms,50,'Animation is capped at 20 fps');scheduled.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>scheduled.delete(id)});
  const dispose=mount(motionCanvas);assert.equal(scheduled.size,0,'Offscreen model does not animate');
  intersection([{isIntersecting:true}]);assert.equal(scheduled.size,1);
  const values=[];
  for(let i=0;i<120;i++){const [id,fn]=[...scheduled.entries()][0];scheduled.delete(id);now+=50;fn();values.push(Number(data.get('data-core-pulse')));assert.equal(scheduled.size,1);}
  assert.ok(Math.min(...values)<.01&&Math.max(...values)>.99,'Full gentle six-second pulse');
  buttonEvents.get('click')();assert.equal(scheduled.size,0);assert.equal(data.get('data-motion-state'),'paused');
  buttonEvents.get('click')();assert.equal(scheduled.size,1);
  motionDocument.visibilityState='hidden';documentEvents.get('visibilitychange')();assert.equal(scheduled.size,0);
  motionDocument.visibilityState='visible';documentEvents.get('visibilitychange')();assert.equal(scheduled.size,1);
  activeDialog={contains:()=>false};documentEvents.get('prts:specimen-visibility')();assert.equal(scheduled.size,0,'Covered home specimen stops while inspector is open');
  activeDialog=null;documentEvents.get('prts:specimen-visibility')();assert.equal(scheduled.size,1);
  media.matches=true;mediaChange();assert.equal(scheduled.size,0);assert.equal(data.get('data-motion-state'),'reduced');assert.equal(data.get('data-core-pulse'),'0.500');
  media.matches=false;mediaChange();assert.equal(scheduled.size,1);
  intersection([{isIntersecting:false}]);assert.equal(scheduled.size,0);
  intersection([{isIntersecting:true}]);assert.equal(scheduled.size,1);
  dispose();assert.equal(scheduled.size,0);assert.equal(canvasEvents.size,0);assert.equal(buttonEvents.size,0);assert.equal(documentEvents.size,0);assert.equal(mediaChange,null);
}
reports.push('PASS: six-second pulse, 20 fps cap, pause/resume, hidden tab/offscreen/covered specimen suspension, reduced motion and full animation disposal.');
const result={date:'2026-10-19',reports,contrast:contrastReport,model:{shards:mesh.shardCount,crystalTriangles:mesh.triangleCount,triangles:mesh.triangleCount+sigil.frame.triangleCount+sigil.halo.triangleCount},scope:'Contract, geometry, export and palette checks. Offline visual fixture is separate from live Harness verification.'};
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(reports.join('\n'));
