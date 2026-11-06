const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {Pool} = require('pg');
const {evaluate} = require('./ranking');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const integer=(value,min,max)=>Number.isSafeInteger(value)&&value>=min&&value<=max;
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'};
async function body(req) {
  if(req.headers['content-type']?.split(';')[0]!=='application/json') throw fail(415,'Wymagany JSON.');
  let chunks=[],size=0;
  for await (const chunk of req) { if((size+=chunk.length)>8192) throw fail(413,'Za duże żądanie.'); chunks.push(chunk); }
  try {const data=JSON.parse(Buffer.concat(chunks).toString());if(!data || typeof data!=='object'||Array.isArray(data))throw Error();return data;}
  catch {throw fail(400,'Nieprawidłowy JSON.');}
}
function createApp(pool) {
 return http.createServer(async(req,res)=>{
  const send=(code,object)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(object));};
  try {
   const url=req.url.split('?')[0];
   if(req.method==='GET' && Object.hasOwn(files,url)) {
    const name=files[url], data=await fs.readFile(path.join(__dirname,'../public',name));
    res.writeHead(200,{'Content-Type':({'js':'text/javascript','html':'text/html','css':'text/css'})[name.split('.').pop()]+'; charset=utf-8'});return res.end(data);
   }
   if(req.method==='GET'&&url==='/api/state'){
    const {rows:[s]}=await pool.query(`SELECT budget::float8,price_weight AS weight,
      COALESCE((SELECT json_agg(o ORDER BY id) FROM offers o),'[]'::json) AS offers
      FROM preferences WHERE id=1`);
    return send(200,{...s,...evaluate(s.offers,s.budget,s.weight/100)});
   }
   const match=url.match(/^\/api\/offers\/(\d+)$/);
   if((match&&req.method==='PUT')||(url==='/api/offers'&&req.method==='POST')){
     const {name,price,minutes}=await body(req);
     if(typeof name!=='string'||!name.trim()||name.trim().length>80||!integer(price,1,9999999999)||!integer(minutes,0,1440))throw fail(400,'Sprawdź nazwę (1–80 znaków), cenę i czas dojazdu (0–1440 min).');
     const args=[name.trim(),price,minutes];
     const q=match?'UPDATE offers SET name=$1,price=$2,minutes=$3 WHERE id=$4 RETURNING id':'INSERT INTO offers(name,price,minutes) VALUES($1,$2,$3) RETURNING id';
     if(match)args.push(match[1]);const r=await pool.query(q,args);if(!r.rowCount)throw fail(404,'Nie znaleziono oferty.');
     return send(match?200:201,r.rows[0]);
   }
   if(match&&req.method==='DELETE'){
    const r=await pool.query('DELETE FROM offers WHERE id=$1',[match[1]]);
    if(!r.rowCount)throw fail(404,'Nie znaleziono oferty.');return send(200,{deleted:true});
   }
   if(req.method==='PUT'&&url==='/api/preferences'){
    const {budget,weight}=await body(req);
    if(!integer(budget,1,9999999999)||!integer(weight,0,100))throw fail(400,'Nieprawidłowy budżet lub waga ceny.');
    await pool.query('UPDATE preferences SET budget=$1,price_weight=$2 WHERE id=1',[budget,weight]);return send(200,{saved:true});
   }
   throw fail(404,'Nie znaleziono zasobu.');
  }catch(e){if(!e.status)console.error(e.message);send(e.status||500,e.status?{error:e.message}:{error:'Nie udało się wykonać operacji na serwerze.'});}
 });
}
async function init(pool){await pool.query(await fs.readFile(path.join(__dirname,'../db/001_schema.sql'),'utf8'));}
async function start(){
 const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000});
 try{await init(pool);}
 catch(e){await pool.end();throw e;}
 const server=createApp(pool);server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Aplikacja gotowa na porcie '+(process.env.PORT||3000)));
 const stop=()=>server.close(()=>pool.end());process.once('SIGINT',stop);process.once('SIGTERM',stop);
}
if(require.main===module)start().catch(e=>{console.error('Start nieudany:',e.message);process.exitCode=1;});
module.exports={createApp,init};
