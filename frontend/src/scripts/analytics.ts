export function startAnalytics() {
  if (location.pathname.startsWith('/admin') || navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl) return;
  try {
    if(localStorage.getItem('portfolio:analytics:off')==='1') return;
    const idKey='portfolio:visitor',sessionKey='portfolio:session';
    const visitor=localStorage.getItem(idKey)||crypto.randomUUID();localStorage.setItem(idKey,visitor);
    let stored=JSON.parse(sessionStorage.getItem(sessionKey)||'null');
    if(!stored || Date.now()-stored.last>30*60*1000) stored={id:crypto.randomUUID(),last:Date.now()};
    let source='Direct';try{const ref=new URL(document.referrer);if(ref.host!==location.host)source=ref.hostname;}catch{}
    let queue:Record<string,unknown>[]=[],seq=0,active=0,lastTick=Date.now(),lastInput=Date.now();
    const touch=()=>{lastInput=Date.now();};
    ['pointerdown','keydown','scroll','mousemove'].forEach(type=>addEventListener(type,touch,{passive:true}));
    function add(type:string,extra:Record<string,unknown>={}) {
      if(localStorage.getItem('portfolio:analytics:off')==='1') {queue=[];return;}
      if(Date.now()-stored.last>30*60*1000)stored={id:crypto.randomUUID(),last:Date.now()};
      stored.last=Date.now();sessionStorage.setItem(sessionKey,JSON.stringify(stored));
      queue.push({type,path:location.pathname,at:Date.now(),seq:seq++,...extra});
      if(queue.length>=20)flush();
    }
    function flush(){
      if(localStorage.getItem('portfolio:analytics:off')==='1'){queue=[];return;}
      if(!queue.length)return;
      const payload=JSON.stringify({visitor,session:stored.id,source,events:queue.splice(0,30)});
      if(!navigator.sendBeacon('/api/analytics',new Blob([payload],{type:'application/json'}))) fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
    }
    add('pageview');flush();
    document.addEventListener('click',event=>{
      const el=(event.target as Element)?.closest?.('a,button,summary,[data-track]');
      if(!el || el.closest('[data-no-track]'))return;
      const href=el.getAttribute('href')||'';
      let target=href;
      try{const u=new URL(href,location.href);target=u.protocol==='mailto:'?'mailto':u.protocol==='tel:'?'phone':u.pathname;}catch{}
      add('click',{target,label:(el.getAttribute('aria-label')||el.getAttribute('data-track')||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100)});flush();
    });
    const seen=new Set<number>();
    addEventListener('scroll',()=>{
      const extent=document.documentElement.scrollHeight-innerHeight;
      if(extent<=0)return;
      const depth=Math.floor(scrollY/extent*100);
      for(const milestone of [25,50,75,100])if(depth>=milestone-1&&!seen.has(milestone)){seen.add(milestone);add('scroll',{label:`${milestone}% scroll`});}
    },{passive:true});
    function tick(){const now=Date.now();if(document.visibilityState==='visible'&&now-lastInput<60000)active+=Math.min(5,(now-lastTick)/1000);lastTick=now;}
    setInterval(tick,5000);
    function heartbeat(){tick();if(active>0){add('heartbeat',{active:Math.round(active)});active=0;}flush();}
    setInterval(heartbeat,15000);
    document.addEventListener('visibilitychange',()=>{heartbeat();if(document.visibilityState==='visible')lastInput=Date.now();});
    addEventListener('pagehide',heartbeat);
  } catch { /* Browsers with storage disabled can still use the portfolio. */ }
}
