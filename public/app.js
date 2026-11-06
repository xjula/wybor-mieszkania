'use strict';
const $=id=>document.getElementById(id), zl=x=>x.toLocaleString('pl-PL')+' zł', n=x=>x.toLocaleString('pl-PL',{maximumFractionDigits:3});
const node=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;};
let editing=null;
async function api(url,method='GET',payload){
 const response=await fetch('/api/'+url,{method,headers:payload?{'Content-Type':'application/json'}:{},body:payload?JSON.stringify(payload):undefined});
 const data=await response.json();if(!response.ok)throw Error(data.error||'Błąd połączenia.');return data;
}
async function action(fn){try{await fn();}catch(e){$('message').textContent='Błąd: '+e.message;}}
function reset(){editing=null;$('offerForm').reset();$('cancel').hidden=true;$('formTitle').textContent='Dodaj mieszkanie';}
function weights(){$('weights').textContent='Cena: '+$('weight').value+'% · Dojazd: '+(100-$('weight').value)+'%';}
async function refresh(){
 const s=await api('state'); $('budget').value=s.budget;$('weight').value=s.weight;weights();
 $('offers').replaceChildren();$('result').replaceChildren();$('excluded').replaceChildren();
 for(const o of s.offers){
  const row=node('div','','row');row.append(node('strong',o.name),node('div',zl(o.price)+' · '+o.minutes+' min','meta'));
  const edit=node('button','Edytuj','link'),del=node('button','Usuń','link');
  edit.onclick=()=>{editing=o.id;$('formTitle').textContent='Edytuj mieszkanie';$('name').value=o.name;$('price').value=o.price;$('minutes').value=o.minutes;$('cancel').hidden=false;$('name').focus();};
  del.onclick=()=>action(async()=>{if(!confirm('Usunąć '+o.name+'?'))return;await api('offers/'+o.id,'DELETE');if(editing===o.id)reset();await refresh();$('message').textContent='Usunięto ofertę.';});
  row.append(edit,del);$('offers').append(row);
 }
 for(const o of s.ranked){
  const row=node('div','','row'),details=node('details','');
  details.append(node('summary','Jak obliczono wynik?'),node('p','Cena: '+zl(o.price)+' → '+n(o.p)+' × '+s.weight+'%. Dojazd: '+o.minutes+' min → '+n(o.t)+' × '+(100-s.weight)+'%.'));
  row.append(node('strong',o.place+'. '+o.name+' · '+n(o.score)+' pkt'),details);$('result').append(row);
 }
 if(!s.ranked.length)$('result').textContent=s.offers.length?'Brak ofert w budżecie.':'Dodaj pierwsze mieszkanie.';
 $('excluded').textContent=s.excluded.length?'':'Brak.';
 for(const o of s.excluded)$('excluded').append(node('div',o.name+' — ponad budżet o '+zl(o.excess)+'.','row'));
 $('storage').textContent='Oferty i preferencje są przechowywane w PostgreSQL.';
}
$('cancel').onclick=reset;$('weight').oninput=weights;
$('offerForm').onsubmit=e=>{e.preventDefault();action(async()=>{
 const name=$('name').value.trim();if(!name)throw Error('Podaj nazwę mieszkania.');
 await api(editing===null?'offers':'offers/'+editing,editing===null?'POST':'PUT',{name,price:Number($('price').value),minutes:Number($('minutes').value)});
 reset();await refresh();$('message').textContent='Zapisano ofertę.';
});};
$('prefs').onsubmit=e=>{e.preventDefault();action(async()=>{await api('preferences','PUT',{budget:Number($('budget').value),weight:Number($('weight').value)});await refresh();$('message').textContent='Zapisano preferencje i przeliczono ranking.';});};
action(refresh);
