from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from .ranking import evaluate
from .store import PostgresStore

class Offer(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid", strict=True)
    name: str = Field(min_length=1, max_length=80)
    price: int = Field(ge=1, le=9_999_999_999)
    location: str = Field(default="", max_length=120)
    minutes: int = Field(ge=0, le=1440)

class Preferences(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    budget: int = Field(ge=1, le=9_999_999_999)
    weight: int = Field(ge=0, le=100)

def create_app(store):
    @asynccontextmanager
    async def lifespan(app):
        store.init()
        yield

    app = FastAPI(title="Wybór mieszkania", lifespan=lifespan)

    @app.get("/api/state")
    def state():
        s = store.state()
        return {**s, **evaluate(s["offers"], s["budget"], s["weight"])}

    @app.post("/api/offers", status_code=201)
    def add(offer: Offer):
        return store.save_offer(offer.model_dump())

    @app.put("/api/offers/{offer_id}")
    def update(offer_id: int, offer: Offer):
        row = store.save_offer(offer.model_dump(), offer_id)
        if row is None:
            raise HTTPException(404, "Nie znaleziono mieszkania.")
        return row

    @app.delete("/api/offers/{offer_id}")
    def delete(offer_id: int):
        if not store.delete_offer(offer_id):
            raise HTTPException(404, "Nie znaleziono mieszkania.")
        return {"deleted": True}

    @app.put("/api/preferences")
    def prefs(data: Preferences):
        store.preferences(data.budget, data.weight)
        return {"saved": True}
    return app

app = create_app(PostgresStore())
