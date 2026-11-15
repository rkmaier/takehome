<?php

declare(strict_types=1);

namespace ADS\TakeHome\Tests\Repositories;

use ADS\TakeHome\Framework\MySQL;
use ADS\TakeHome\Repositories\WeatherRepository;
use PDO;
use PDOException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Integrációs teszt: a lekérdezéseket egy külön, eldobható `weather_test`
 * sémán futtatja, ismert tesztadatokkal. Ha az adatbázis nem érhető el
 * (pl. nem a konténerben futtatjuk), a tesztek kihagyásra kerülnek.
 *
 * Kapcsolat felülírható: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD.
 */
class WeatherRepositoryTest extends TestCase
{
    private const SCHEMA = "weather_test";

    private static ?PDO $admin = null;
    private static ?string $skipReason = null;

    private WeatherRepository $repository;

    private static function env(string $name, string $default): string
    {
        $value = getenv($name);
        return $value === false || $value === "" ? $default : $value;
    }

    public static function setUpBeforeClass(): void
    {
        $host = self::env("DB_HOST", "db");
        $port = self::env("DB_PORT", "3306");
        try {
            self::$admin = new PDO(
                "mysql:host={$host};port={$port};charset=utf8mb4",
                self::env("DB_USER", "root"),
                self::env("DB_PASSWORD", "root"),
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 2],
            );
        } catch (PDOException $e) {
            self::$skipReason = "Adatbázis nem érhető el ({$host}:{$port}): {$e->getMessage()}";
            return;
        }

        $schema = self::SCHEMA;
        self::$admin->exec(<<<SQL
            DROP DATABASE IF EXISTS `{$schema}`;
            CREATE DATABASE `{$schema}` CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
            USE `{$schema}`;

            CREATE TABLE cities (
                id int primary key,
                name varchar(255) not null,
                region enum("Dunántúl", "Közép-Magyarország", "Észak és Alföld") not null
            );
            CREATE TABLE maximum_temperatures (city_id int not null, date bigint not null, max_temp float null);
            CREATE TABLE minimum_temperatures (city_id int not null, date bigint not null, min_temp float null);
            CREATE TABLE precipitation (city_id int not null, date bigint not null, precipitation float null);

            INSERT INTO cities VALUES
                (1, 'Sopron', 'Dunántúl'),
                (2, 'Pécs', 'Dunántúl'),
                (3, 'Budapest', 'Közép-Magyarország'),
                (4, 'Ásotthalom', 'Dunántúl');

            -- Sopron: 3 nap, a 0102-n nincs min. hőm., a 0103-on nincs csapadék
            INSERT INTO maximum_temperatures VALUES
                (1, 20230101, 10.5), (1, 20230102, 8), (1, 20230103, 6.25),
                (2, 20230101, 12.5), (2, 20230102, 4),
                (3, 20230101, 30),
                (1, 20221231, 99), (1, 20230104, 99),
                -- NULL = hiányzó mérés
                (1, 20230105, NULL), (2, 20230105, 5);
            INSERT INTO minimum_temperatures VALUES
                (1, 20230101, 2.5), (1, 20230103, -1.75),
                (2, 20230101, -0.5), (2, 20230102, 1),
                (3, 20230101, 20),
                (1, 20230105, 1), (2, 20230105, NULL);
            INSERT INTO precipitation VALUES
                (1, 20230101, 1.5), (1, 20230102, 0),
                (2, 20230101, 2.5), (2, 20230102, 3),
                (3, 20230101, 50),
                (1, 20230105, NULL), (2, 20230105, 2);
            SQL);
    }

    public static function tearDownAfterClass(): void
    {
        self::$admin?->exec("DROP DATABASE IF EXISTS `" . self::SCHEMA . "`");
        self::$admin = null;
    }

    protected function setUp(): void
    {
        if (self::$skipReason !== null) {
            $this->markTestSkipped(self::$skipReason);
        }
        $this->repository = new WeatherRepository(new MySQL(
            self::env("DB_HOST", "db"),
            self::SCHEMA,
            self::env("DB_USER", "root"),
            self::env("DB_PASSWORD", "root"),
            (int) self::env("DB_PORT", "3306"),
        ));
    }

    /**
     * A MySQL a számokat (driver/típus függően) stringként vagy számként adja
     * vissza; összehasonlításhoz egységesítjük.
     *
     * @param list<array<string, mixed>> $rows
     * @return list<array<string, mixed>>
     */
    private static function normalize(array $rows): array
    {
        return array_map(
            fn (array $row) => array_map(
                fn (mixed $v) => is_numeric($v) ? round((float) $v, 2) : $v,
                $row,
            ),
            $rows,
        );
    }

    #[Test]
    public function getCitiesReturnsAllCitiesOrderedByName(): void
    {
        $cities = $this->repository->getCities();

        $this->assertSame(["Ásotthalom", "Budapest", "Pécs", "Sopron"], array_column($cities, "name"));
        $this->assertSame(["id", "name", "region"], array_keys($cities[0]));
        $this->assertSame("Dunántúl", $cities[0]["region"]);
    }

    #[Test]
    public function getCityDataReturnsDailyRowsInRange(): void
    {
        $rows = $this->repository->getCityData(1, "20230101", "20230103");

        $this->assertSame([
            ["id" => 1.0, "name" => "Sopron", "date" => "2023-01-01", "maxTemp" => 10.5, "minTemp" => 2.5, "avgTemp" => 6.5, "precipitation" => 1.5],
            ["id" => 1.0, "name" => "Sopron", "date" => "2023-01-02", "maxTemp" => 8.0, "minTemp" => null, "avgTemp" => null, "precipitation" => 0.0],
            ["id" => 1.0, "name" => "Sopron", "date" => "2023-01-03", "maxTemp" => 6.25, "minTemp" => -1.75, "avgTemp" => 2.25, "precipitation" => null],
        ], self::normalize($rows));
    }

    #[Test]
    public function getCityDataRangeIsInclusiveAndExcludesOutside(): void
    {
        $rows = $this->repository->getCityData(1, "20230102", "20230102");

        $this->assertSame(["2023-01-02"], array_column($rows, "date"));
    }

    #[Test]
    public function getCityDataReturnsEmptyForUnknownCityOrEmptyRange(): void
    {
        $this->assertSame([], $this->repository->getCityData(999, "20230101", "20230131"));
        $this->assertSame([], $this->repository->getCityData(1, "20230201", "20230228"));
        $this->assertSame([], $this->repository->getCityData(1, "20230103", "20230101"));
    }

    #[Test]
    public function getRegionDataAggregatesCitiesPerDay(): void
    {
        $rows = $this->repository->getRegionData("Dunántúl", "20230101", "20230103");

        $this->assertSame([
            // Sopron + Pécs: min(2.5, -0.5), max(10.5, 12.5), (avg(10.5,12.5) + avg(2.5,-0.5)) / 2, avg(1.5, 2.5)
            ["date" => "2023-01-01", "cityCount" => 2.0, "minTemp" => -0.5, "maxTemp" => 12.5, "avgTemp" => 6.25, "avgPrecipitation" => 2.0],
            // Sopron min. hőm. hiányzik -> csak Pécs-é számít a min-be / átlagba
            ["date" => "2023-01-02", "cityCount" => 2.0, "minTemp" => 1.0, "maxTemp" => 8.0, "avgTemp" => 3.5, "avgPrecipitation" => 1.5],
            // csak Sopron, csapadék nincs
            ["date" => "2023-01-03", "cityCount" => 1.0, "minTemp" => -1.75, "maxTemp" => 6.25, "avgTemp" => 2.25, "avgPrecipitation" => null],
        ], self::normalize($rows));
    }

    #[Test]
    public function getCityDataReturnsMissingMeasurementAsNull(): void
    {
        $rows = $this->repository->getCityData(1, "20230105", "20230105");

        $this->assertSame([
            ["id" => 1.0, "name" => "Sopron", "date" => "2023-01-05", "maxTemp" => null, "minTemp" => 1.0, "avgTemp" => null, "precipitation" => null],
        ], self::normalize($rows));
    }

    #[Test]
    public function getRegionDataIgnoresMissingMeasurements(): void
    {
        $rows = $this->repository->getRegionData("Dunántúl", "20230105", "20230105");

        // Sopron max/csapadék és Pécs min = NULL -> kimarad, nem rontja el a min/átlagot
        $this->assertSame([
            ["date" => "2023-01-05", "cityCount" => 2.0, "minTemp" => 1.0, "maxTemp" => 5.0, "avgTemp" => 3.0, "avgPrecipitation" => 2.0],
        ], self::normalize($rows));
    }

    #[Test]
    public function getRegionDataDoesNotMixOtherRegions(): void
    {
        $rows = $this->repository->getRegionData("Közép-Magyarország", "20230101", "20230131");

        $this->assertSame([
            ["date" => "2023-01-01", "cityCount" => 1.0, "minTemp" => 20.0, "maxTemp" => 30.0, "avgTemp" => 25.0, "avgPrecipitation" => 50.0],
        ], self::normalize($rows));
    }

    #[Test]
    public function getRegionDataReturnsEmptyForUnknownRegion(): void
    {
        $this->assertSame([], $this->repository->getRegionData("Nincs ilyen", "20230101", "20230131"));
    }

    #[Test]
    public function getRegionDataTreatsInjectionAttemptAsPlainValue(): void
    {
        $this->assertSame([], $this->repository->getRegionData("x' OR '1'='1", "20230101", "20230131"));
    }
}
