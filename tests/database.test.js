// Uruchom jawnie przez npm run test:db. Tworzy i usuwa własny schemat testowy.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto'),{once}=require('node:events'),{Pool}=require('pg');
const {init,createApp}=require('../server');
test('PostgreSQL i API: CRUD, zapis preferencji, ranking i ponowna inicjalizacja',async()=>{
 assert.ok(process.env.DATABASE_URL,'Skonfiguruj DATABASE_URL w .env');
 const cfg={connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000};
 const schema='test_'+randomUUID().replaceAll('-','');
 const admin=new Pool(cfg);let pool,server;
 try{
  await admin.query('CREATE SCHEMA '+schema);
  pool=new Pool({...cfg,options:'-c search_path='+schema});await init(pool);
  server=createApp(pool);server.listen(0,'127.0.0.1');await once(server,'listening');
  const root='http://127.0.0.1:'+server.address().port+'/api/';
  const call=async(p,method='GET',body)=>{const r=await fetch(root+p,{method,headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)});return [r.status,await r.json()];};
  const [,first]=await call('state');assert.equal(first.offers.length,3);assert.equal(first.ranked[0].score,.7);
  assert.equal((await call('preferences','PUT',{budget:500000,weight:30}))[0],200);
  assert.equal((await call('state'))[1].ranked[0].minutes,15);
  let [code,added]=await call('offers','POST',{name:'Nowa',price:400000,minutes:5});assert.equal(code,201);
  assert.equal((await call('offers/'+added.id,'PUT',{name:'Nowa',price:600000,minutes:5}))[0],200);
  assert.ok((await call('state'))[1].excluded.some(o=>o.id===added.id));
  assert.equal((await call('offers','POST',{name:'X',price:0,minutes:5}))[0],400);
  for(const o of (await call('state'))[1].offers)assert.equal((await call('offers/'+o.id,'DELETE'))[0],200);
  await init(pool);const [,after]=await call('state');assert.equal(after.offers.length,0);assert.equal(after.weight,30);
 }finally{if(server)await new Promise(r=>server.close(r));if(pool)await pool.end();try{await admin.query('DROP SCHEMA IF EXISTS '+schema+' CASCADE');}finally{await admin.end();}}
});
