import { configured, sign, equal, authorized, redis, sameOrigin, cleanPath, retention, summarize } from '../server/analytics.js';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!configured()) return res.status(503).json({error:'Analytics is not configured. Add the four environment variables in the setup guide.'});
  const action=req.query?.action || 'collect';
  try {
    if(req.method==='POST' && !sameOrigin(req)) return res.status(403).json({error:'Origin not allowed'});
    const network=sign(String(req.headers['x-real-ip']||req.headers['x-forwarded-for']||'unknown').split(',')[0]).slice(0,24);
    if(req.method==='POST') {
      const key=`analytics:rate:${action}:${network}:${Math.floor(Date.now()/60000)}`;
      const [count]=await redis([['INCR',key],['EXPIRE',key,120]]);
      if(count>(action==='login'?5:180)) return res.status(429).json({error:'Please try again in a minute.'});
    }
    let body=req.body || {};
    if(typeof body==='string') {try{body=JSON.parse(body);}catch{return res.status(400).json({error:'Invalid JSON'});}}
    if(action==='login' && req.method==='POST') {
      if(!equal(typeof body.password==='string'?body.password:'',process.env.ANALYTICS_ADMIN_PASSWORD)) return res.status(401).json({error:'Incorrect password'});
      const expires=Date.now()+12*3600000;
      res.setHeader('Set-Cookie',`portfolio_admin=${expires}.${sign(`admin:${expires}`)}; HttpOnly; Secure; SameSite=Strict; Path=/api/analytics; Max-Age=43200`);
      return res.status(200).json({ok:true});
    }
    if(action==='logout' && req.method==='POST') {res.setHeader('Set-Cookie','portfolio_admin=; HttpOnly; Secure; SameSite=Strict; Path=/api/analytics; Max-Age=0');return res.status(200).json({ok:true});}
    if(action==='report' && req.method==='GET') {
      if(!authorized(req)) return res.status(401).json({error:'Sign in to view analytics'});
      const days=[7,14,30].includes(Number(req.query.days))?Number(req.query.days):7;
      const now=Date.now();
      const rows=await redis(Array.from({length:days},(_,i)=>['LRANGE',`analytics:events:${new Date(now-i*86400000).toISOString().slice(0,10)}`,0,9999]));
      const events=rows.flat().map(row=>JSON.parse(row));
      return res.status(200).json({...summarize(events,days,now),days,truncated:rows.some(r=>r.length===10000),updated:now});
    }
    if(action!=='collect'||req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
    if(req.headers['sec-gpc']==='1'||req.headers.dnt==='1'|| /bot|crawler|spider|headless/i.test(req.headers['user-agent']||'')) return res.status(204).end();
    const id=/^[a-f0-9-]{36}$/i;
    if(!id.test(body.visitor)||!id.test(body.session)||!Array.isArray(body.events)||body.events.length>30) return res.status(400).json({error:'Invalid events'});
    const now=Date.now(), valid=[];
    const decode=value=>{try{return decodeURIComponent(String(value||'Unknown')).slice(0,80);}catch{return 'Unknown';}};
    for(const e of body.events) {
      if(!['pageview','click','heartbeat','scroll'].includes(e.type)||typeof e.path!=='string'||e.path.startsWith('/admin')) continue;
      const at=Math.min(now,Math.max(now-3600000,Number(e.at)||now));
      valid.push({type:e.type,path:cleanPath(e.path),target:cleanPath(e.target||''),label:String(e.label||'').slice(0,100),at,seq:Math.max(0,Number(e.seq)||0),active:Math.min(30,Math.max(0,Number(e.active)||0)),visitor:sign(body.visitor).slice(0,16),session:body.session,city:decode(req.headers['x-vercel-ip-city']),country:decode(req.headers['x-vercel-ip-country']),device:/mobile|android|iphone/i.test(req.headers['user-agent']||'')?'Mobile':'Desktop',source:String(body.source||'Direct').slice(0,100)});
    }
    if(valid.length) {
      const key=`analytics:events:${new Date(now).toISOString().slice(0,10)}`;
      await redis([['LPUSH',key,...valid.map(e=>JSON.stringify(e))],['LTRIM',key,0,9999],['EXPIRE',key,retention]]);
    }
    return res.status(204).end();
  }catch {return res.status(503).json({error:'Analytics storage is unavailable. Check the server configuration.'});}
}
