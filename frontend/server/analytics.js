import { createHmac, timingSafeEqual } from 'node:crypto';
export const retention = 90 * 86400;
export const configured = () => Boolean(process.env.ANALYTICS_ADMIN_PASSWORD && process.env.ANALYTICS_SECRET && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
export function sign(value) { return createHmac('sha256', process.env.ANALYTICS_SECRET).update(value).digest('hex'); }
export function equal(a, b) { const x = Buffer.from(a || ''), y = Buffer.from(b || ''); return x.length === y.length && timingSafeEqual(x,y); }
export async function redis(commands) {
  const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL.replace(/\/$/,'')}/pipeline`, {method:'POST', headers:{Authorization:`Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type':'application/json'}, body:JSON.stringify(commands), signal:AbortSignal.timeout(8000)});
  if (!res.ok) throw new Error('Storage unavailable');
  const rows = await res.json();
  if (rows.some(row => row.error)) throw new Error('Storage command failed');
  return rows.map(row => row.result);
}
export function authorized(req) {
  const token = /(?:^|; )portfolio_admin=([^;]+)/.exec(req.headers.cookie || '')?.[1] || '';
  const [expires, signature] = token.split('.');
  return Number(expires) > Date.now() && equal(signature, sign(`admin:${expires}`));
}
export function sameOrigin(req) {
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
export function cleanPath(value) {
  try { const url = new URL(value, 'https://portfolio.invalid'); return url.pathname.slice(0,250); } catch { return '/'; }
}
export function summarize(events, days, now = Date.now()) {
  const visitors = new Map(), sessions = new Map(), pages = Object.create(null), clicks = Object.create(null), countries = Object.create(null), sources = Object.create(null);
  const daily = Array.from({length:days},(_,i)=>({date:new Date(now-(days-1-i)*86400000).toISOString().slice(0,10),views:0,visitors:new Set(),sessions:new Set()}));
  const byDate = new Map(daily.map(d=>[d.date,d]));
  for (const e of events.sort((a,b)=>a.at-b.at || a.seq-b.seq)) {
    if (!byDate.has(new Date(e.at).toISOString().slice(0,10))) continue;
    let v = visitors.get(e.visitor);
    if (!v) { v = {id:e.visitor, sessions:new Set(),first:e.at,last:e.at}; visitors.set(e.visitor,v); }
    v.sessions.add(e.session); v.last = Math.max(v.last,e.at);
    let s = sessions.get(e.session);
    if (!s) { s={id:e.session,visitor:e.visitor,first:e.at,last:e.at,active:0,views:0,clicks:0,city:e.city,country:e.country,device:e.device,source:e.source,events:[]}; sessions.set(e.session,s); countries[e.country]=(countries[e.country]||0)+1; sources[e.source]=(sources[e.source]||0)+1; }
    s.last=Math.max(s.last,e.at); s.active+=e.active||0;
    if(e.type !== 'heartbeat') s.events.push(e);
    const d=byDate.get(new Date(e.at).toISOString().slice(0,10)); d.visitors.add(e.visitor); d.sessions.add(e.session);
    if(e.type==='pageview'){s.views++;d.views++;pages[e.path]=(pages[e.path]||0)+1;}
    if(e.type==='click'){s.clicks++; const key=e.label || e.target || e.path; clicks[key]=(clicks[key]||0)+1;}
  }
  const all=[...sessions.values()], list=all.sort((a,b)=>b.last-a.last).slice(0,500);
  let journalBudget=5000;
  for(const s of list) {
    s.visits=visitors.get(s.visitor).sessions.size;
    const count=Math.min(50,journalBudget,s.events.length);journalBudget-=count;
    s.eventsTruncated=s.events.length>count;
    s.events=count?s.events.slice(-count).map(({type,path,target,label,at})=>({type,path,target,label,at})):[];
  }
  return {visitors:visitors.size,sessions:all.length,views:all.reduce((n,s)=>n+s.views,0),clicks:all.reduce((n,s)=>n+s.clicks,0),resume:events.filter(e=>e.type==='click'&& /\.pdf$/i.test(e.target||'')&&/resume/i.test(e.target)).length,returning:[...visitors.values()].filter(v=>v.sessions.size>1).length,avgActive:all.length?Math.round(all.reduce((n,s)=>n+s.active,0)/all.length):0,daily:daily.map(d=>({...d,visitors:d.visitors.size,sessions:d.sessions.size})),pages,clickTargets:clicks,countries,sources,recent:list};
}
