# Adatbázis struktúra módosítás javaslatok

<!-- ez a fájl egy nem kötelező feladat része -->

1. **`-999` → `NULL`:** a forrás a hiányzó mérést `-999`-cel jelöli (~10 000 sor), ez torzítja a `MIN`/`AVG` eredményeket. Az oszlopok legyenek `NULL`-ozhatók, importnál `NULLIF(@v, -999)`

2. **Hibás városnév:** a 10-es város „Szombathely” helyett **Túrkeve**. A `cities.name` kapjon `UNIQUE` megkötést.

3. **Elsődleges kulcs és index:** `PRIMARY KEY (city_id, date)` és `FOREIGN KEY` a `cities`-re. Gyorsabb lekérdezés és nincs duplikáció újraimportáláskor.

4. **Egy mérési tábla:** a három tábla helyett egy `daily_weather (city_id, date, max_temp, min_temp, precipitation)` tábla, így nem kell JOIN.

5. **Típusok:** `date` legyen `DATE` (`BIGINT` helyett), a mért értékek `DECIMAL(4,1)` (`FLOAT` helyett, pontos összehasonlításhoz).

6. **Régiók:** az `ENUM` helyett külön `regions` tábla, `cities.region_id` idegen kulccsal.
