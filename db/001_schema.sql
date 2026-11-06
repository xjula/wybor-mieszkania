BEGIN;
CREATE TABLE IF NOT EXISTS preferences (
  id integer PRIMARY KEY CHECK(id=1),
  budget bigint NOT NULL CHECK(budget BETWEEN 1 AND 9999999999),
  price_weight integer NOT NULL CHECK(price_weight BETWEEN 0 AND 100)
);
CREATE TABLE IF NOT EXISTS offers (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(80) NOT NULL CHECK(length(trim(name))>0),
  price bigint NOT NULL CHECK(price BETWEEN 1 AND 9999999999),
  minutes integer NOT NULL CHECK(minutes BETWEEN 0 AND 1440)
);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS location varchar(120) NOT NULL DEFAULT '';
-- Dane przykładowe tylko przy pierwszym utworzeniu profilu, nie po usunięciu ofert.
WITH first_run AS (
 INSERT INTO preferences VALUES (1,500000,70) ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO offers(name,price,minutes,location)
SELECT v.* FROM first_run CROSS JOIN (VALUES
 ('A · Słoneczna',450000,35,'Kielce, KSM'),('B · Parkowa',490000,15,'Kielce, Barwinek'),('C · Centrum',520000,10,'Kielce, Centrum')
) v(name,price,minutes,location);
COMMIT;
