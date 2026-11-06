"""SAW: budżet filtruje oferty przed wyznaczeniem skali każdego kryterium."""

def evaluate(offers, budget, weight):
    """weight: ważność ceny w procentach (0–100). Nie modyfikuje ofert."""
    if budget <= 0 or not 0 <= weight <= 100:
        raise ValueError("Nieprawidłowy budżet lub waga.")
    eligible, excluded = [], []
    for offer in offers:
        if offer["price"] <= 0 or offer["minutes"] < 0:
            raise ValueError("Nieprawidłowe dane oferty.")
        if offer["price"] > budget:
            excluded.append({**offer, "excess": offer["price"] - budget})
        else:
            eligible.append(offer)
    if not eligible:
        return {"ranked": [], "excluded": excluded}

    def scale(key):
        values = [o[key] for o in eligible]
        lo, hi = min(values), max(values)
        return lambda x: 1.0 if hi == lo else (hi - x) / (hi - lo)

    price, time = scale("price"), scale("minutes")
    ranked = []
    for offer in eligible:
        p, t = price(offer["price"]), time(offer["minutes"])
        score = (weight * p + (100 - weight) * t) / 100
        ranked.append({**offer, "p": p, "t": t, "score": score})
    ranked.sort(key=lambda o: (-o["score"], o["id"]))
    for i, offer in enumerate(ranked):
        tied = i and abs(offer["score"] - ranked[i - 1]["score"]) < 1e-12
        offer["place"] = ranked[i - 1]["place"] if tied else i + 1
    return {"ranked": ranked, "excluded": excluded}
