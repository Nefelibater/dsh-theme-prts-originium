window.__ModuleLoader__.load({
  id: 'dsh-theme-prts-originium',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const SOURCE = 'dsh-theme-prts-originium';
    const BODY_ATTR = 'data-dsh-prts-originium';
    const FOCUS_ATTR = 'data-po-focus';
    const FOCUS_KEY = 'prts-originium:focus:v1';
    const BOOT_KEY = 'prts-originium:boot:v1';
    const TOKENS = __TOKENS__;
    const CSS = __CSS__;
    const ORIGINIUM = __ORIGINIUM__;
    const MEMORIES = __MEMORIES__;
    const SCHEMATIC = __SCHEMATIC__;
    __MODEL_CODE__
    let bootController = null;
    let bootPlayed = false;
    let memoryIndex = 0;
    const MEMORY_KEY = 'prts-originium:memory:v1';
    function getMemory() {
      try { const value=Number(localStorage.getItem(MEMORY_KEY)); if(Number.isInteger(value)&&value>=0&&value<MEMORIES.length)memoryIndex=value; } catch { /* In-memory selection remains available. */ }
      return memoryIndex;
    }

    function getFocus() {
      try { return localStorage.getItem(FOCUS_KEY) === '1'; } catch { return false; }
    }
    function setFocus(value) {
      if (typeof document !== 'undefined' && document.body) document.body.toggleAttribute(FOCUS_ATTR, value);
      try { localStorage.setItem(FOCUS_KEY, value ? '1' : '0'); } catch { /* Storage may be disabled. */ }
    }
    function getBootEnabled() {
      try { return localStorage.getItem(BOOT_KEY) !== '0'; } catch { return true; }
    }
    function reducedMotion() {
      return typeof window.matchMedia === 'function' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(forced-colors: active)').matches);
    }
    function replayBoot() { if (bootController) bootController.play(); }
    function Diagram() {
      return h('div', {className:'po-field','aria-hidden':true,dangerouslySetInnerHTML:{__html:SCHEMATIC}});
    }
    function MaterialInspector({onClose}) {
      const canvas=React.useRef(null),dialog=React.useRef(null);
      React.useEffect(()=>{
        const panel=dialog.current,previous=document.activeElement;
        panel.showModal();
        document.dispatchEvent(new Event('prts:specimen-visibility'));
        const dispose=mountOriginiumViewer(canvas.current);
        return()=>{dispose();panel.close();document.dispatchEvent(new Event('prts:specimen-visibility'));const target=previous?.isConnected&&previous.getClientRects().length?previous:document.querySelector('[data-composer-input]');target?.focus({preventScroll:true});};
      },[]);
      return h('dialog',{className:'po-material-dialog',ref:dialog,'aria-label':'源石结构观察',onCancel:onClose},
        h('div',{className:'po-inspector__header'},h('span',null,'PRTS / STRUCTURAL OBSERVATION'),h('button',{className:'po-inspector__close',type:'button',onClick:onClose,'aria-label':'关闭源石观察'},'关闭 / ESC')),
        h('div',{className:'po-material po-material--inspector','data-model-state':'pending'},
          h('div',{className:'po-material__stage'},h(Diagram),
            h('img',{className:'po-material__fallback',src:ORIGINIUM,alt:'源石晶簇',draggable:false}),
            h('canvas',{className:'po-material__canvas',ref:canvas,tabIndex:0,'aria-label':'放大的源石标本：拖动或方向键旋转，Home 复位，加减号缩放'})),
          h('div',{className:'po-material__caption'},h('div',null,h('strong',null,'ORIGINIUM'),h('span',null,'源石 · 结构标本')),h('div',{className:'po-material__actions'},h('button',{className:'po-material__motion',type:'button','aria-label':'暂停菱形光效'},'Ⅱ'),h('button',{className:'po-material__reset',type:'button','aria-label':'复位放大标本视角'},'↺'))),
          h('span',{className:'po-material__hint'},'拖动旋转 / 方向键微调 / + − 缩放 / Home 复位')));
    }
    function MaterialViewer() {
      const ref=React.useRef(null);
      const [expanded,setExpanded]=React.useState(false);
      React.useEffect(()=>mountOriginiumViewer(ref.current),[]);
      return h('div',{className:'po-material','data-model-state':'pending'},
        h('div',{className:'po-material__stage'},
          h('img',{className:'po-material__fallback',src:ORIGINIUM,alt:'源石晶簇',draggable:false}),
          h('canvas',{className:'po-material__canvas',ref,tabIndex:0,'aria-label':'旋转源石标本：拖动或方向键旋转，Home 复位，加减号缩放'})),
        h('div',{className:'po-material__caption'},
          h('div',null,h('strong',null,'ORIGINIUM'),h('span',null,'源石 · 结构标本')),
          h('div',{className:'po-material__actions'},
            h('button',{className:'po-material__motion',type:'button','aria-label':'暂停菱形光效',title:'暂停菱形光效'},'Ⅱ'),
            h('button',{className:'po-material__expand',type:'button','aria-label':'放大查看源石',title:'打开结构观察',onClick:()=>setExpanded(true)},'⤢'),
            h('button',{className:'po-material__reset',type:'button','aria-label':'复位源石视角',title:'复位视角 / Home'},'↺'))),
        h('span',{className:'po-material__hint'},'拖动旋转 · 方向键微调'),
        expanded&&h(MaterialInspector,{onClose:()=>setExpanded(false)}));
    }
    function Hero() {
      return h('section', {className:'po-hero','aria-label':'PRTS · 源石协议'},
        h('div', {className:'po-hero__eyebrow'}, 'NEURAL INTERFACE / PRTS'),
        h('div', {className:'po-hero__name'}, 'PRT', h('i',null,'S')),
        h('div', {className:'po-hero__subtitle'}, 'PRIMITIVE RHODES ISLAND', h('br'), 'TERMINAL SERVICE'),
        h('div', {className:'po-hero__greeting'}, '欢迎回来，博士。'),
        h(Diagram),
        h(MaterialViewer),
        h('div',{className:'po-hero__rule','aria-hidden':true},'PRTS  /  ORIGINIUM PROTOCOL'));
    }
    function IdentityDock({wide = true} = {}) {
      const [focused, update] = React.useState(getFocus);
      const [bootEnabled, updateBoot] = React.useState(getBootEnabled);
      const [selected, updateMemory] = React.useState(getMemory);
      const memory=MEMORIES[selected],number=String(selected+1).padStart(2,'0');
      function changeMemory(delta) {
        memoryIndex=(selected+delta+MEMORIES.length)%MEMORIES.length;
        try { localStorage.setItem(MEMORY_KEY,String(memoryIndex)); } catch { /* Optional persistence. */ }
        updateMemory(memoryIndex);
      }
      function memoryKeys(event) {
        if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();changeMemory(event.key==='ArrowLeft'?-1:1);}
      }
      function toggle() { const next = !focused; setFocus(next); update(next); }
      function toggleBoot() {
        const next = !bootEnabled;
        try { localStorage.setItem(BOOT_KEY,next ? '1' : '0'); } catch { /* Preferences are optional. */ }
        updateBoot(next);
      }
      return h('div',{className:'po-dock' + (wide ? '' : ' po-dock--compact')},
        wide && h('div',{className:'po-dock__archive'},
          h('div',{className:'po-dock__kicker'},'PRTS / MEMORY INDEX'),
          h('div',{className:'po-dock__barcode','aria-hidden':true}),
          h('details',{className:'po-memory'},
            h('summary',{'aria-label':'查看记忆残片',title:'记忆残片 / P-'+number},h('span',null,'P / '+number),h('span',{'aria-hidden':true},'◇')),
            h('div',{className:'po-memory__reveal',onKeyDown:memoryKeys},
              h('img',{src:memory.src,alt:memory.alt,draggable:false,className:'po-memory__image po-memory__image--'+memory.id}),
              h('div',{className:'po-memory__info'},h('span',null,'MEMORY FRAGMENT'),h('strong',null,'普瑞赛斯 · '+memory.title),h('p',{className:'po-memory__quote'},memory.quote)),
              h('div',{className:'po-memory__navigation'},
                h('button',{type:'button',className:'po-memory__previous','aria-label':'上一张记忆残片',onClick:()=>changeMemory(-1)},'←'),
                h('span',{'aria-live':'polite'},number+' / '+String(MEMORIES.length).padStart(2,'0')),
                h('button',{type:'button',className:'po-memory__next','aria-label':'下一张记忆残片',onClick:()=>changeMemory(1)},'→'))))),
        h('div',{className:'po-dock__controls'},
        h('button',{className:'po-focus',type:'button','aria-pressed':focused,'aria-label':focused ? '退出专注阅读' : '开启专注阅读',title:focused ? '恢复源石装饰' : '收起装饰，保留主题配色',onClick:toggle},
          h('span',{className:'po-focus__mark','aria-hidden':true}),h('span',{className:'po-focus__label'},'专注阅读'),h('span',{className:'po-focus__state','aria-hidden':true}, focused ? 'ON' : 'OFF')),
        h('button',{className:'po-replay',type:'button','aria-label':'重播 PRTS 启动动画',title:reducedMotion() ? '系统已启用减少动态效果' : '重播 PRTS 启动动画',disabled:reducedMotion(),onClick:replayBoot},'↻'),
        wide && h('details',{className:'po-options'},h('summary',{'aria-label':'启动动画设置',title:'启动动画设置'},'⋮'),h('div',{className:'po-options__panel'},h('button',{type:'button',className:'po-boot-toggle','aria-pressed':bootEnabled,onClick:toggleBoot},h('span',null,'启动时播放'),h('b',null,bootEnabled ? 'ON' : 'OFF'))))));
    }
    function mountBootController() {
      let active = null;
      function stop() {
        if (!active) return;
        const {layer,timer,key,previous} = active;
        const focusInside = layer.contains(document.activeElement);
        clearTimeout(timer); document.removeEventListener('keydown',key,true);
        layer.remove(); active = null;
        if (focusInside && previous && previous.isConnected && typeof previous.focus === 'function') previous.focus({preventScroll:true});
      }
      function play() {
        stop();
        if (reducedMotion() || typeof document === 'undefined' || !document.body || !document.body.hasAttribute(BODY_ATTR)) return;
        const previous = document.activeElement;
        const layer = document.createElement('section');
        layer.className = 'po-boot';layer.setAttribute('aria-label','PRTS 启动动画');
        layer.innerHTML = `<div class="po-boot__frame" aria-hidden="true"></div>
          <div class="po-boot__top" aria-hidden="true"><span>PRTS / ORIGINIUM PROTOCOL</span><span>VISUAL INITIALIZATION · 001</span></div>
          <div class="po-boot__diagram" aria-hidden="true">${SCHEMATIC}</div>
          <div class="po-boot__identity" aria-hidden="true"><div class="po-boot__kicker">RHODES ISLAND / TERMINAL</div><div class="po-boot__word">PRT<span>S</span></div><div class="po-boot__subtitle">PRIMITIVE RHODES ISLAND<br>TERMINAL SERVICE</div><div class="po-boot__ready">欢迎回来，博士。</div></div>
          <div class="po-boot__track" aria-hidden="true"></div>
          <div class="po-boot__bottom" aria-hidden="true"><strong>源石协议 / INTERFACE SEQUENCE</strong><span>MEMORY — STRUCTURE — CONNECTION</span></div>
          <button class="po-boot__skip" type="button" aria-label="跳过启动动画">跳过动画 / ESC</button>`;
        const key = () => stop();
        layer.addEventListener('pointerdown',stop);
        layer.querySelector('button').addEventListener('click',stop);
        document.body.appendChild(layer);
        document.addEventListener('keydown',key,true);
        active = {layer,key,previous,timer:setTimeout(stop,3350)};
      }
      bootController = {play,stop};
      if (!bootPlayed) {bootPlayed = true; if (getBootEnabled() && !getFocus()) play();}
      return () => {stop();bootController = null;};
    }
    function Shell() {
      return h('div',{className:'po-shell','aria-hidden':true,'data-po-build':'1.4.2'},
        h('span',{className:'po-shell__tick po-shell__tick--tl'}),h('span',{className:'po-shell__tick po-shell__tick--br'}));
    }
    function mountStyles() {
      if (typeof styles !== 'undefined' && styles && typeof styles.insert === 'function') {
        try { const dispose = styles.insert(CSS); return typeof dispose === 'function' ? dispose : () => {}; }
        catch (error) { console.warn('[prts-originium] Using standalone stylesheet fallback.', error); }
      }
      if (typeof document === 'undefined') return () => {};
      const tag = document.createElement('style');
      tag.setAttribute('data-prts-originium-style','1.4.2'); tag.textContent = CSS; document.head.appendChild(tag);
      return () => tag.remove();
    }
    function apply(ctx) {
      try { localStorage.removeItem('prts-originium:disabled:v1'); } catch {}
      ctx.effect(() => {
        if (typeof document === 'undefined' || !document.body) return () => {};
        const body = document.body;
        const previous = body.getAttribute(BODY_ATTR);
        const previousFocus = body.hasAttribute(FOCUS_ATTR);
        body.setAttribute(BODY_ATTR,'1.4.2');body.toggleAttribute(FOCUS_ATTR,getFocus());
        return () => {
          if (previous === null) body.removeAttribute(BODY_ATTR); else body.setAttribute(BODY_ATTR,previous);
          body.toggleAttribute(FOCUS_ATTR,previousFocus);
        };
      }, 'prts-originium: scope');
      ctx.effect(mountStyles, 'prts-originium: stylesheet');
      const theme = typeof ctx.get === 'function' ? ctx.get('theme') : (ctx.theme || null);
      if (theme && typeof theme.overrideTokens === 'function') ctx.effect(() => theme.overrideTokens(SOURCE,TOKENS), 'prts-originium: palette');
      for (const [name,id,component,order] of [
        ['shell.overlay','prts-originium-frame-v1',Shell,35],
        ['conversation.hero.brand.mark','prts-originium-identity-v1',Hero,10],
        ['sidebar.footer.action','prts-originium-focus-v1',IdentityDock,90],
      ]) ctx.slots.inject(name, () => ctx.slots.register({name,id,order},component));
      ctx.effect(mountBootController, 'prts-originium: startup sequence');
    }
    return {name:SOURCE,inject:['theme','slots'],apply};
  },
});
