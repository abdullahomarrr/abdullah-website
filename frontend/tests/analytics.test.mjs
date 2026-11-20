import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, cleanPath, authorized, sign } from '../server/analytics.js';
import handler from '../api/analytics.js';

process.env.ANALYTICS_SECRET='test-secret-not-for-production';
process.env.ANALYTICS_ADMIN_PASSWORD='test-password';
process.env.UPSTASH_REDIS_REST_URL='https://redis.invalid';
process.env.UPSTASH_REDIS_REST_TOKEN='test-token';
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(body){this.body=body;return this;},end(){return this;}};}
test('report counts repeat browsers, resume clicks, engagement and chronological journeys',()=>{
 const now=Date.now(),base={visitor:'visitor',session:'one',path:'/',country:'CA',city:'Toronto',source:'Direct',device:'Desktop',seq:0};
 const events=[{...base,type:'click',target:'/Abdullah-Omar-Resume-SWE.pdf',at:now-1000},{...base,type:'pageview',at:now-4000},{...base,type:'heartbeat',active:15,at:now-500},{...base,type:'pageview',session:'two',at:now}];
 const r=summarize(events,7,now);
 assert.equal(r.visitors,1);assert.equal(r.sessions,2);assert.equal(r.returning,1);assert.equal(r.views,2);assert.equal(r.resume,1);assert.equal(r.avgActive,8);assert.equal(r.recent[1].events[0].type,'pageview');assert.equal(r.recent[0].visits,2);
 assert.equal(r.daily.reduce((n,d)=>n+d.views,0),2);
});
test('paths drop query strings and hashes',()=>{assert.equal(cleanPath('https://example.com/case?email=private#secret'),'/case');});
test('session signatures reject tampering and expiry',()=>{
 const expires=Date.now()+60000;assert.equal(authorized({headers:{cookie:`portfolio_admin=${expires}.${sign(`admin:${expires}`)}`}}),true);
 assert.equal(authorized({headers:{cookie:`portfolio_admin=${expires}.fake`}}),false);
 const old=Date.now()-1000;assert.equal(authorized({headers:{cookie:`portfolio_admin=${old}.${sign(`admin:${old}`)}`}}),false);
});
test('reports require authentication and login requires same origin',async()=>{
 let res=response();await handler({method:'GET',headers:{},query:{action:'report'}},res);assert.equal(res.code,401);
 res=response();await handler({method:'POST',headers:{host:'portfolio.test',origin:'https://evil.test'},query:{action:'login'},body:{password:'test-password'}},res);assert.equal(res.code,403);
});
test('login issues private cookie; collection strips sensitive URL data and enriches location',async()=>{
 const original=global.fetch,commands=[];global.fetch=async(url,options)=>{const batch=JSON.parse(options.body);commands.push(...batch);return {ok:true,json:async()=>batch.map(c=>({result:c[0]==='INCR'?1:'OK'}))};};
 try{
 const headers={host:'portfolio.test',origin:'https://portfolio.test','x-vercel-ip-city':'New%20York','x-vercel-ip-country':'US','user-agent':'Mobile browser','x-real-ip':'192.0.2.3'};
 let res=response();await handler({method:'POST',headers,query:{action:'login'},body:{password:'wrong'}},res);assert.equal(res.code,401);
 res=response();await handler({method:'POST',headers,query:{action:'login'},body:{password:'test-password'}},res);assert.equal(res.code,200);assert.match(res.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict/);
 res=response();await handler({method:'POST',headers,query:{},body:{visitor:'11111111-1111-4111-8111-111111111111',session:'22222222-2222-4222-8222-222222222222',events:[{type:'pageview',path:'/?secret=abc',at:Date.now()}]}},res);assert.equal(res.code,204);
 const event=JSON.parse(commands.find(c=>c[0]==='LPUSH')[2]);assert.equal(event.path,'/');assert.equal(event.city,'New York');assert.equal(event.device,'Mobile');assert.equal(JSON.stringify(event).includes('192.0.2.3'),false);
 }finally{global.fetch=original;}
});
