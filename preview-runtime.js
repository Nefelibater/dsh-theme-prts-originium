/* Isolated offline fixture: minimal element renderer, not a replacement for host React. */
(() => {
  const doc = document;
  const slots = new Map();
  let registration;
  let disposers = [];
  const hooks=new Map();
  let currentSlot=null,hookCursor=0,pendingEffects=[];
  function h(type, props, ...children) {
    if (typeof type === 'function') return type(props || {});
    const svg = ['svg','path','ellipse','circle','line','rect','g','polygon'].includes(type);
    const node = svg ? doc.createElementNS('http://www.w3.org/2000/svg',type) : doc.createElement(type);
    for (const [key,value] of Object.entries(props || {})) {
      if (value === null || value === undefined || key === 'key') continue;
      if (key === 'className') node.setAttribute('class',value);
      else if (key === 'ref') value.current=node;
      else if (key === 'style') Object.assign(node.style,value);
      else if (key === 'dangerouslySetInnerHTML') node.innerHTML=value.__html;
      else if (['disabled','checked','hidden'].includes(key)) node.toggleAttribute(key,!!value);
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(),value);
      else if (key === 'strokeWidth') node.setAttribute('stroke-width',value);
      else if (key === 'strokeDasharray') node.setAttribute('stroke-dasharray',value);
      else node.setAttribute(key,String(value));
    }
    for (const child of children.flat(Infinity)) if (child !== false && child != null) node.append(child instanceof Node ? child : doc.createTextNode(String(child)));
    return node;
  }
  const react = {
    createElement:h,
    useState(init){
      const slot=currentSlot,index=hookCursor++,record=hooks.get(slot);
      if(!(index in record.values))record.values[index]=typeof init==='function'?init():init;
      return [record.values[index],value=>{record.values[index]=typeof value==='function'?value(record.values[index]):value;queueMicrotask(()=>renderSlots(slot));}];
    },
    useRef(value){return {current:value};},
    useEffect(effect){pendingEffects.push(effect);}
  };
  window.__ModuleLoader__ = {load(value){registration=value;}};
  function renderSlots(only){
    const active=doc.activeElement;
    const activeClass=active?.closest('.po-material-dialog')?'po-material__expand':['po-focus','po-replay','po-boot-toggle','po-memory__next','po-memory__previous','po-material__expand'].find(name=>active?.classList?.contains(name));
    const openDetails=Array.from(doc.querySelectorAll('.po-dock details[open]')).map(el=>el.className);
    for (const [name,entry] of slots) {
      if(only&&name!==only)continue;
      const id = {'shell.overlay':'shell-seat','conversation.hero.brand.mark':'hero-seat','sidebar.footer.action':'identity-seat'}[name];
      const seat=doc.getElementById(id);
      if(seat){
        if(!hooks.has(name))hooks.set(name,{values:[],cleanups:[]});
        const record=hooks.get(name);record.cleanups.forEach(off=>off());record.cleanups=[];
        currentSlot=name;hookCursor=0;pendingEffects=[];
        seat.replaceChildren(entry.component({wide:doc.querySelector('.BynINW_frame').dataset.sidebarCollapsed!=='true'}));
        record.cleanups=pendingEffects.map(fn=>fn()).filter(fn=>typeof fn==='function');
      }
    }
    currentSlot=null;
    for(const name of openDetails){const details=doc.querySelector('.'+name);if(details)details.open=true;}
    if(activeClass)doc.querySelector('.'+activeClass)?.focus({preventScroll:true});
  }
  window.previewStart=()=>{
    const plugin=registration.factory(name=>{if(name!=='react')throw Error(name);return react;});
    plugin.apply({
      effect(fn){const off=fn();if(typeof off==='function')disposers.push(off);},
      get(name){return name==='theme'?{overrideTokens(source,tokens){
        const style=doc.createElement('style');
        style.dataset.previewPalette=source;
        style.textContent=['light','dark'].map(mode=>`body${mode==='dark'?'[data-ds-dark-theme]':':not([data-ds-dark-theme])'}{${Object.entries(tokens).map(([k,v])=>k+':'+v[mode]).join(';')}}`).join('\n');
        doc.head.append(style);return()=>style.remove();
      }}:null;},
      slots:{inject(name,fn){const off=fn();if(typeof off==='function')disposers.push(off);},register(options,component){slots.set(options.name,{options,component});return()=>slots.delete(options.name);}}
    });
    renderSlots();
    function mode(dark){doc.body.toggleAttribute('data-ds-dark-theme',dark);doc.documentElement.style.colorScheme=dark?'dark':'light';doc.getElementById('mode-dark').setAttribute('aria-pressed',dark);doc.getElementById('mode-light').setAttribute('aria-pressed',!dark);}
    function view(home){doc.getElementById('home-content').hidden=!home;doc.getElementById('chat-content').hidden=home;doc.querySelector('[data-conversation-region]').dataset.phase=home?'hero':'active';doc.getElementById('view-chat').setAttribute('aria-pressed',!home);doc.getElementById('view-home').setAttribute('aria-pressed',home);doc.querySelector('[data-conversation-scroll]').scrollTop=0;doc.getElementById('attachment-popover').hidden=true;}
    doc.getElementById('mode-dark').onclick=()=>mode(true);doc.getElementById('mode-light').onclick=()=>mode(false);
    doc.getElementById('preview-boot').onclick=()=>doc.querySelector('.po-replay')?.click();
    doc.getElementById('preview-still').onclick=()=>{
      const button=doc.getElementById('preview-still');
      if(doc.querySelector('.preview-boot-still')){doc.querySelector('.preview-boot-still').remove();button.setAttribute('aria-pressed','false');return;}
      doc.querySelector('.po-replay')?.click();
      const live=doc.querySelector('.po-boot');
      if(!live)return;
      const still=live.cloneNode(true);still.classList.add('preview-boot-still');
      live.querySelector('.po-boot__skip').click();
      still.querySelector('.po-boot__skip').textContent='关闭分镜 / ESC';
      const close=()=>{still.remove();button.setAttribute('aria-pressed','false');doc.removeEventListener('keydown',close);};
      still.querySelector('.po-boot__skip').onclick=close;doc.addEventListener('keydown',close);
      doc.body.append(still);button.setAttribute('aria-pressed','true');
    };
    doc.getElementById('view-chat').onclick=()=>view(false);doc.getElementById('view-home').onclick=()=>view(true);doc.getElementById('new-session').onclick=()=>view(true);
    doc.getElementById('collapse-sidebar').onclick=()=>{const frame=doc.querySelector('.BynINW_frame');frame.dataset.sidebarCollapsed=frame.dataset.sidebarCollapsed==='true'?'false':'true';renderSlots();};
    doc.getElementById('preview-menu').onclick=()=>doc.getElementById('sample-dialog').showModal();
    for(const id of ['close-dialog','done-dialog'])doc.getElementById(id).onclick=()=>doc.getElementById('sample-dialog').close();
    doc.getElementById('attachment-menu').onclick=()=>{const menu=doc.getElementById('attachment-popover');menu.hidden=!menu.hidden;};
    doc.addEventListener('keydown',e=>{if(e.key==='Escape')doc.getElementById('attachment-popover').hidden=true;});
    doc.getElementById('composer').oninput=e=>{doc.getElementById('send-preview').disabled=!e.target.value.trim();};
    doc.getElementById('send-preview').onclick=()=>{const input=doc.getElementById('composer');if(!input.value.trim())return;view(false);const row=h('div',{'data-chat-flow-kind':'user','data-submission-echo':''},h('div',{className:'cJsG2q_bubble'},input.value));doc.getElementById('chat-content').append(row);input.value='';doc.getElementById('send-preview').disabled=true;row.scrollIntoView({block:'center'});};
    const params=new URLSearchParams(location.search);mode(params.get('mode')!=='light');view(params.get('view')==='home');
    window.previewDispose=()=>{for(const record of hooks.values())record.cleanups.forEach(off=>off());hooks.clear();disposers.reverse().forEach(fn=>fn());disposers=[];slots.clear();for(const id of ['identity-seat','hero-seat','shell-seat'])doc.getElementById(id).replaceChildren();};
    doc.body.dataset.previewReady='true';
  };
})();
