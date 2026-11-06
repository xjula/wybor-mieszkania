const {test}=require("node:test"),assert=require("node:assert/strict"),{evaluate}=require("../server/ranking.js");
const sample=[{name:"A",price:450000,minutes:35},{name:"B",price:490000,minutes:15},{name:"C",price:520000,minutes:10}];
test("Budżet wyklucza C przed normalizacją; zmiana wag odwraca kolejność",()=>{
 const a=evaluate(sample,500000,.7);assert.deepEqual(a.ranked.map(x=>x.name),["A","B"]);assert.equal(a.ranked[0].score,.7);assert.equal(a.excluded[0].excess,20000);assert.equal(evaluate(sample,500000,.3).ranked[0].name,"B");
});
test("Cena równa limitowi przechodzi, pojedyncza oferta otrzymuje ocenę bez NaN",()=>assert.equal(evaluate(sample,450000,.7).ranked[0].score,1));
test("Remis i brak zakwalifikowanych ofert",()=>{assert.deepEqual(evaluate(sample,500000,.5).ranked.map(x=>x.place),[1,1]);assert.equal(evaluate(sample,1,.7).ranked.length,0);});
test("Brak czasu dojazdu to błąd, a zero minut jest poprawne",()=>{assert.throws(()=>evaluate([{price:1}],5,1));assert.equal(evaluate([{price:1,minutes:0}],5,0).ranked.length,1);});
