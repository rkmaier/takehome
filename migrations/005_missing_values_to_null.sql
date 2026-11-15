-- A forrás CSV-k a hiányzó mérést -999-cel jelölik, az import
-- 1. Az oszlopok engedjék a NULL-t.
alter table weather.maximum_temperatures
    modify max_temp float null comment "Maximum hőmérséklet, Celsius fokban (NULL = hiányzó mérés)";

alter table weather.minimum_temperatures
    modify min_temp float null comment "Minimum hőmérséklet, Celsius fokban (NULL = hiányzó mérés)";

alter table weather.precipitation
    modify precipitation float null comment "Csapadék, milliméterben (NULL = hiányzó mérés)";

-- 2. -999 -> NULL (a -999 floatként pontosan ábrázolható, az egyenlőség biztos).
update weather.maximum_temperatures set max_temp = null where max_temp = -999;
update weather.minimum_temperatures set min_temp = null where min_temp = -999;
update weather.precipitation set precipitation = null where precipitation = -999;
