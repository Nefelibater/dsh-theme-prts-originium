import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createOriginiumGeometry,createOriginiumSigil} from '../src/originium-mesh.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mesh=createOriginiumGeometry(),sigil=createOriginiumSigil(mesh),parts=[],views=[],accessors=[];
let offset=0;
function attribute(values,type,bounds){
  const bytes=Buffer.from(values.buffer,values.byteOffset,values.byteLength);
  const view=views.length;views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target:34962});
  const count=values.length/({VEC3:3,VEC4:4}[type]||1);
  accessors.push({bufferView:view,componentType:5126,count,type,...bounds});
  parts.push(bytes);offset+=bytes.length;return accessors.length-1;
}
const attributes={POSITION:attribute(mesh.positions,'VEC3',{min:mesh.bounds.min,max:mesh.bounds.max}),NORMAL:attribute(mesh.normals,'VEC3'),COLOR_0:attribute(mesh.colors,'VEC3')};
const linear=value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
const frameAttributes={POSITION:attribute(sigil.frame.positions,'VEC3',sigil.frame.bounds),NORMAL:attribute(sigil.frame.normals,'VEC3'),COLOR_0:attribute(sigil.frame.colors.map(linear),'VEC3')};
const glowColor=new Float32Array(sigil.halo.positions.length/3*4);
for(let i=0;i<sigil.halo.positions.length/3;i++){
  glowColor.set([linear(sigil.halo.colors[i*3]),linear(sigil.halo.colors[i*3+1]),linear(sigil.halo.colors[i*3+2]),sigil.halo.surfaces[i*2]],i*4);
}
const haloAttributes={POSITION:attribute(sigil.halo.positions,'VEC3',sigil.halo.bounds),NORMAL:attribute(sigil.halo.normals,'VEC3'),COLOR_0:attribute(glowColor,'VEC4')};
const gltf={asset:{version:'2.0',generator:'PRTS Originium — original reconstructed crystal geometry',copyright:'Original model created for this personal theme; inspired by Hypergryph Originium artwork.'},
  scene:0,scenes:[{nodes:[0,1]}],nodes:[{name:'Originium crystal cluster and core sigil',mesh:0},{name:'Muted red core light',translation:sigil.light,extensions:{KHR_lights_punctual:{light:0}}}],
  meshes:[{name:'Obsidian cluster / hollow ivory sigil / red halo',primitives:[{attributes,material:0,mode:4},{attributes:frameAttributes,material:1,mode:4},{attributes:haloAttributes,material:2,mode:4}]}],
  materials:[
    {name:'Glossy fractured obsidian',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:.25,roughnessFactor:.18},extensions:{KHR_materials_clearcoat:{clearcoatFactor:.9,clearcoatRoughnessFactor:.10}}},
    {name:'Ivory hollow diamond',doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:1},extensions:{KHR_materials_unlit:{}}},
    {name:'Soft dark-red core halo',doubleSided:false,alphaMode:'BLEND',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:1},extensions:{KHR_materials_unlit:{}}},
  ],
  extensionsUsed:['KHR_materials_clearcoat','KHR_materials_unlit','KHR_lights_punctual'],
  extensions:{KHR_lights_punctual:{lights:[{name:'Core red reflection',type:'point',color:[1,.064,.032],intensity:3.5,range:2.2}]}},
  buffers:[{byteLength:offset}],bufferViews:views,accessors,
  extras:{shards:mesh.shardCount,triangles:mesh.triangleCount+sigil.frame.triangleCount+sigil.halo.triangleCount,note:'Reconstruction from a 2D silhouette, not an extracted official 3D asset. The theme uses procedural microfractures and custom reflected studio panels; GLB uses standard clearcoat, a real hollow sigil, vertex-alpha halo and a point light. Appearance depends on viewer lighting and extension support.'}};
let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
const binary=Buffer.concat(parts),header=Buffer.alloc(12),jsonHeader=Buffer.alloc(8),binHeader=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+binary.length,8);
jsonHeader.writeUInt32LE(json.length,0);jsonHeader.writeUInt32LE(0x4e4f534a,4);
binHeader.writeUInt32LE(binary.length,0);binHeader.writeUInt32LE(0x004e4942,4);
fs.mkdirSync(path.join(root,'model'),{recursive:true});
fs.writeFileSync(path.join(root,'model','originium-crystal.glb'),Buffer.concat([header,jsonHeader,json,binHeader,binary]));
console.log(`Exported ${mesh.shardCount} shards / ${gltf.extras.triangles} triangles including hollow sigil and halo as originium-crystal.glb`);
