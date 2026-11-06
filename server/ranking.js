// Oba kryteria są kosztowe: mniejsza wartość jest korzystniejsza.
function evaluate(offers, budget, priceWeight) {
  if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(priceWeight) || priceWeight < 0 || priceWeight > 1)
    throw new Error("Nieprawidłowy budżet lub waga.");
  for (const o of offers) {
    if (!Number.isFinite(o.price) || o.price <= 0 || !Number.isFinite(o.minutes) || o.minutes < 0)
      throw new Error("Oferta musi mieć dodatnią cenę i nieujemny czas dojazdu.");
  }
  const eligible = offers.filter(o => o.price <= budget);
  const excluded = offers.filter(o => o.price > budget).map(o => ({...o, excess:o.price-budget}));
  if (!eligible.length) return {ranked:[], excluded};
  const normalize = key => {
    const values = eligible.map(o => o[key]);
    const lo = Math.min(...values), hi = Math.max(...values);
    return x => hi === lo ? 1 : (hi-x)/(hi-lo);
  };
  const price = normalize("price"), time = normalize("minutes");
  const ranked = eligible.map(o => {
    const p = price(o.price), t = time(o.minutes);
    return {...o, p, t, score:p*priceWeight + t*(1-priceWeight)};
  }).sort((a,b)=>b.score-a.score);
  ranked.forEach((o,i) => o.place = i && Math.abs(o.score-ranked[i-1].score)<1e-12 ? ranked[i-1].place : i+1);
  return {ranked, excluded};
}
if (typeof module !== "undefined") module.exports = {evaluate};
