from pathlib import Path
import os
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]

class PostgresStore:
    def connect(self):
        import psycopg
        from psycopg.rows import dict_row
        load_dotenv(ROOT / ".env")
        url = os.getenv("DATABASE_URL")
        if not url:
            raise RuntimeError("Brak DATABASE_URL w pliku .env w katalogu projektu.")
        return psycopg.connect(url, row_factory=dict_row, connect_timeout=5)

    def init(self):
        with self.connect() as conn:
            # Skrypt zawiera własne BEGIN/COMMIT.
            conn.autocommit = True
            conn.execute((ROOT / "db" / "001_schema.sql").read_text(encoding="utf-8"))

    def state(self):
        with self.connect() as conn:
            return conn.execute("""
                SELECT budget, price_weight AS weight,
                    COALESCE((SELECT json_agg(o ORDER BY id) FROM offers o), '[]'::json) AS offers
                FROM preferences WHERE id=1
            """).fetchone()

    def save_offer(self, data, offer_id=None):
        args = (data["name"], data["price"], data["minutes"], data["location"])
        with self.connect() as conn:
            if offer_id is None:
                return conn.execute("INSERT INTO offers(name,price,minutes,location) VALUES(%s,%s,%s,%s) RETURNING id", args).fetchone()
            return conn.execute("UPDATE offers SET name=%s,price=%s,minutes=%s,location=%s WHERE id=%s RETURNING id",
                                (*args, offer_id)).fetchone()

    def delete_offer(self, offer_id):
        with self.connect() as conn:
            return conn.execute("DELETE FROM offers WHERE id=%s", (offer_id,)).rowcount == 1

    def preferences(self, budget, weight):
        with self.connect() as conn:
            conn.execute("UPDATE preferences SET budget=%s,price_weight=%s WHERE id=1", (budget, weight))
