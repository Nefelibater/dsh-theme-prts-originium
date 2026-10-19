import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=process.argv[2]?path.resolve(process.argv[2]):path.resolve(root,'../originium-material');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const mesh=read('src/originium-mesh.mjs'),viewer=read('src/originium-viewer.js');
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORIGINIUM · 独立源石素材</title>
<style>
:root{color-scheme:light;--paper:#e9eeeb;--ink:#1b292d;--muted:#50676a;--line:#aebfbd;--accent:#795f26;--panel:#f5f7f3}
body[data-ds-dark-theme]{color-scheme:dark;--paper:#0e171a;--ink:#e0e8e4;--muted:#a3b6b8;--line:#334b50;--accent:#dfc782;--panel:#182327}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.6 system-ui,sans-serif}
main{width:min(1120px,100%);margin:0 auto;padding:28px 32px 20px}header{display:flex;justify-content:space-between;align-items:end;border-bottom:1px solid var(--line);padding:0 0 18px;gap:20px}
.eyebrow{font:11px/1.4 ui-monospace,monospace;letter-spacing:.18em;color:var(--muted)}h1{font:500 26px/1.15 ui-monospace,monospace;letter-spacing:.16em;margin:7px 0 0}.subtitle{font-size:12px;color:var(--muted);letter-spacing:.08em;margin:6px 0 0}
.top-controls{display:flex;flex-wrap:wrap;gap:8px}button{font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);padding:7px 13px;cursor:pointer;min-height:36px}button:hover{border-color:var(--accent);color:var(--accent)}button:focus-visible,canvas:focus-visible{outline:2px solid var(--accent);outline-offset:4px}button:disabled{opacity:.5;cursor:default}
.po-material__stage{height:min(72vh,740px);min-height:350px;position:relative;margin-top:10px}.po-material__canvas{display:block;width:100%;height:100%;touch-action:none;cursor:grab;position:relative;z-index:1}.po-material__canvas[data-dragging]{cursor:grabbing}
.guides{position:absolute;width:100%;height:100%;color:var(--line);pointer-events:none;opacity:.65}.po-material__fallback{display:none;position:absolute;inset:42% 15%;text-align:center;color:var(--muted)}[data-model-state="fallback"] .po-material__fallback{display:block}[data-model-state="fallback"] canvas{visibility:hidden}
.caption{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:15px 0;gap:20px}.status{font:11px/1.8 ui-monospace,monospace;letter-spacing:.12em;color:var(--muted)}.status strong{font-weight:500;color:var(--accent)}.actions{display:flex;gap:8px}.po-material__motion{width:38px;padding:5px;font-size:18px}
footer{font-size:12px;color:var(--muted);display:flex;justify-content:space-between;gap:12px}.note{margin-top:14px;font-size:11px;color:var(--muted)}
@media(max-width:600px){main{padding:20px 16px}header{align-items:start;flex-direction:column;gap:14px}.po-material__stage{height:57vh;min-height:320px}.caption{align-items:start}.status{font-size:10px}footer{font-size:11px;flex-direction:column;gap:3px}.top-controls button{font-size:12px}}
</style></head><body><main>
<header><div><div class="eyebrow">PRTS / MATERIAL ARCHIVE</div><h1>ORIGINIUM</h1><p class="subtitle">源石 · 晶体与核心光印</p></div><div class="top-controls"><button id="theme-toggle" type="button" aria-label="切换深色背景">深色背景</button><button id="save-png" type="button">导出透明 PNG</button></div></header>
<section class="po-material" data-model-state="pending" aria-label="独立源石模型">
<div class="po-material__stage"><svg class="guides" viewBox="0 0 1000 700" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M40 350H960M500 20V680" opacity=".4"/><path d="M500 50L800 350 500 650 200 350Z" opacity=".65"/><ellipse cx="500" cy="350" rx="285" ry="195" transform="rotate(-30 500 350)"/><circle cx="500" cy="350" r="315" stroke-dasharray="2 12"/><path d="M70 95V70H95M905 70H930V95M70 605V630H95M905 630H930V605"/></g></svg><div class="po-material__fallback">此浏览器无法显示 3D 模型，请用支持 WebGL 的浏览器打开。素材包也提供 GLB 与 PNG。</div><canvas class="po-material__canvas" tabindex="0" aria-label="源石模型：拖动或方向键旋转，Home 复位，加减号缩放"></canvas></div>
<div class="caption"><div class="status"><strong>CORE / RESONANCE</strong><br>OBSIDIAN · IVORY SIGIL · RED LIGHT</div><div class="actions"><button class="po-material__motion" type="button" aria-label="暂停菱形光效">Ⅱ</button><button class="po-material__reset" type="button" aria-label="复位源石视角">↺ 复位</button></div></div>
</section><footer><span>拖动旋转 · 方向键微调 · + / − 缩放 · Home 复位</span><span>菱形缩放与红光同步呼吸 · 可暂停</span></footer><p class="note">独立离线素材。透明 PNG 导出当前视角，不包含背景、标尺或文字。</p></main>
<script>${mesh.replaceAll('export function','function')}
${viewer}
const canvas=document.querySelector('canvas');
const dispose=mountOriginiumViewer(canvas);
document.querySelector('#theme-toggle').addEventListener('click',event=>{const dark=document.body.toggleAttribute('data-ds-dark-theme');event.currentTarget.textContent=dark?'浅色背景':'深色背景';event.currentTarget.setAttribute('aria-label',dark?'切换浅色背景':'切换深色背景');});
document.querySelector('#save-png').addEventListener('click',()=>{
  if(canvas.closest('.po-material').getAttribute('data-model-state')!=='ready')return;
  canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='originium-transparent.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
});
window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
</script></body></html>`;
fs.mkdirSync(path.join(target,'source'),{recursive:true});
fs.writeFileSync(path.join(target,'index.html'),html);
fs.copyFileSync(path.join(root,'model/originium-crystal.glb'),path.join(target,'originium-crystal.glb'));
fs.writeFileSync(path.join(target,'source/originium-mesh.mjs'),mesh);
fs.writeFileSync(path.join(target,'source/originium-viewer.mjs'),"import {createOriginiumGeometry,createOriginiumSigil} from './originium-mesh.mjs';\n"+viewer+'\nexport {mountOriginiumViewer};\n');
fs.writeFileSync(path.join(target,'README.md'),`# 源石 · 独立素材包

- **index.html**：双击用浏览器打开。完整离线动态预览，保留主题内的晶面反光、细纹、空心菱形和红光。菱形约每 6 秒围绕自身中心放大、缩小（88%–112%），与亮度同步呼吸，晶体主体尺寸不变。可旋转、暂停、切换明暗背景、导出当前视角的透明 PNG。
- **originium-crystal.glb**：标准 3D 模型，可导入 Blender 等工具。包含 224 块晶体与碎片、空心菱形、柔和光晕及红色点光，共 8,134 个三角面。
- **originium-transparent.png**：当前正面视角的透明底 PNG；不包含界面和几何底图。
- **source/**：模型生成器与 WebGL 查看器源码，便于继续调整或接入其他页面。

## 使用与范围

拖动旋转；方向键微调；Home 复位；加减号缩放。右下角按钮暂停或播放光效。减少动态效果、页面隐藏或模型不可见时停止循环绘制；动画上限为每秒 20 帧。

GLB 保存静态几何、清漆材质、空心光印、透明光晕和点光。呼吸动画、程序化细纹与灯箱反射属于 HTML 的专用着色器，**并非 GLB 内置动画**；其他 3D 软件的外观取决于灯光和材质扩展支持。需要一致的动态效果时请使用 index.html 或 source 中的查看器。

此模型依据用户提供的明日方舟源石二维视觉重新构建，背面和厚度为本次设计补全，不是提取的官方模型。明日方舟与源石设定相关权益属于原权利方。此包供个人主题使用，不附带对官方知识产权的商业授权。
`);
console.log('Exported standalone offline model asset to '+target);
