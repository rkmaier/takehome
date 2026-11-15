-- A 10-es város neve a 002_import_city_data.sql-ben hibásan "Szombathely"
-- (a 9-es sor másolata). Az import (003_import_weather_data.py) a 10-es
-- azonosítóhoz a *_o_Turkeve_*.csv fájlokat tölti be, és a régió
-- ("Észak és Alföld") is Túrkevének felel meg.
--
-- Idempotens: csak akkor módosít, ha még a hibás név szerepel.
update weather.cities
set name = "Túrkeve"
where id = 10
  and name = "Szombathely";
