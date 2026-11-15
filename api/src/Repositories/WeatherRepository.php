<?php

declare(strict_types=1);

namespace ADS\TakeHome\Repositories;

use ADS\TakeHome\Framework\MySQL;

/**
 * Időjárási adatok lekérdezése az adatbázisból.
 */
class WeatherRepository
{
    public function __construct(
        private readonly MySQL $db,
    ) {
    }

    /**
     * Az összes város azonosítóval és régióval, név szerint rendezve.
     *
     * @return list<array<string, mixed>>
     */
    public function getCities(): array
    {
        return $this->db->queryAssoc(
            "SELECT `id`, `name`, `region` FROM `cities` ORDER BY `name`, `id`",
        );
    }

    /**
     * Egy város napi maximum/minimum hőmérséklete és csapadéka a megadott
     * időszakban. A dátumok YYYYMMDD formátumúak (pl. "20230101").
     * A hiányzó mérés NULL, az aggregátumok kihagyják.
     *
     * @return list<array<string, mixed>>
     */
    public function getCityData(int $id, string $startDate, string $endDate): array
    {
        return $this->db->queryAssoc(
            "SELECT `c`.`id`, `c`.`name`,
                    DATE_FORMAT(STR_TO_DATE(`maxT`.`date`, '%Y%m%d'), '%Y-%m-%d') AS `date`,
                    ROUND(`maxT`.`max_temp`, 2) AS `maxTemp`,
                    ROUND(`minT`.`min_temp`, 2) AS `minTemp`,
                    ROUND((`maxT`.`max_temp` + `minT`.`min_temp`) / 2, 2) AS `avgTemp`,
                    ROUND(`p`.`precipitation`, 2) AS `precipitation`
                 FROM `cities` AS `c`
                 JOIN `maximum_temperatures` AS `maxT`
                      ON `maxT`.`city_id` = `c`.`id`
                 LEFT JOIN `minimum_temperatures` AS `minT`
                      ON `minT`.`city_id` = `maxT`.`city_id`
                     AND `minT`.`date` = `maxT`.`date`
                 LEFT JOIN `precipitation` AS `p`
                      ON `p`.`city_id` = `maxT`.`city_id`
                     AND `p`.`date` = `maxT`.`date`
                 WHERE `c`.`id` = :cityId
                   AND `maxT`.`date` BETWEEN :startDate AND :endDate
                 ORDER BY `maxT`.`date`",
            [":cityId" => $id, ":startDate" => $startDate, ":endDate" => $endDate],
        );
    }

    /**
     * A régió napi, a régió városaira átlagolt időjárási adatai a megadott
     * időszakban. A dátumok YYYYMMDD formátumúak (pl. "20230101").
     * A hiányzó mérés NULL, az aggregátumok kihagyják.
     *
     * @return list<array<string, mixed>>
     */
    public function getRegionData(string $region, string $startDate, string $endDate): array
    {
        return $this->db->queryAssoc(
            "SELECT DATE_FORMAT(STR_TO_DATE(`maxT`.`date`, '%Y%m%d'), '%Y-%m-%d') AS `date`,
                    COUNT(*) AS `cityCount`,
                    ROUND(MIN(`minT`.`min_temp`), 2) AS `minTemp`,
                    ROUND(MAX(`maxT`.`max_temp`), 2) AS `maxTemp`,
                    ROUND((AVG(`maxT`.`max_temp`) + AVG(`minT`.`min_temp`)) / 2, 2) AS `avgTemp`,
                    ROUND(AVG(`p`.`precipitation`), 2) AS `avgPrecipitation`
                 FROM `cities` AS `c`
                 JOIN `maximum_temperatures` AS `maxT`
                      ON `maxT`.`city_id` = `c`.`id`
                 LEFT JOIN `minimum_temperatures` AS `minT`
                      ON `minT`.`city_id` = `maxT`.`city_id`
                     AND `minT`.`date` = `maxT`.`date`
                 LEFT JOIN `precipitation` AS `p`
                      ON `p`.`city_id` = `maxT`.`city_id`
                     AND `p`.`date` = `maxT`.`date`
                 WHERE `c`.`region` = :region
                   AND `maxT`.`date` BETWEEN :startDate AND :endDate
                 GROUP BY `maxT`.`date`
                 ORDER BY `maxT`.`date`",
            [":region" => $region, ":startDate" => $startDate, ":endDate" => $endDate],
        );
    }
}
