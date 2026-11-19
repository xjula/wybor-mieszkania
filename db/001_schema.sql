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
ALTER TABLE offers ADD COLUMN IF NOT EXISTS area_m2 numeric(7,2) CHECK(area_m2 IS NULL OR area_m2 > 0);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS floor smallint CHECK(floor IS NULL OR floor BETWEEN -2 AND 200);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS rooms smallint CHECK(rooms IS NULL OR rooms BETWEEN 1 AND 20);
