<?php

declare(strict_types=1);

namespace ADS\TakeHome\Tests\Controllers;

use ADS\TakeHome\Controllers\WeatherApiController;
use ADS\TakeHome\Framework\HttpRequest;
use ADS\TakeHome\Framework\HttpResponseInterface;
use ADS\TakeHome\Repositories\WeatherRepository;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class WeatherApiControllerTest extends TestCase
{
    private WeatherRepository&MockObject $repository;
    private WeatherApiController $controller;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(WeatherRepository::class);
        $this->controller = new WeatherApiController($this->repository);
    }

    /**
     * @return mixed
     */
    private static function decode(HttpResponseInterface $response): mixed
    {
        return json_decode((string) $response->getBody(), true, flags: JSON_THROW_ON_ERROR);
    }

    // ---- /cities -----------------------------------------------------------

    #[Test]
    public function getCitiesReturnsRepositoryResult(): void
    {
        $cities = [
            ["id" => 1, "name" => "Budapest", "region" => "Közép-Magyarország"],
            ["id" => 2, "name" => "Szeged", "region" => "Észak és Alföld"],
        ];
        $this->repository->expects($this->once())->method("getCities")->willReturn($cities);

        $response = $this->controller->getCities();

        $this->assertSame(200, $response->getStatus());
        $this->assertSame($cities, self::decode($response));
    }

    // ---- /city -------------------------------------------------------------

    #[Test]
    public function getCityDataPassesParametersToRepository(): void
    {
        $rows = [["id" => 7, "name" => "Pécs", "date" => "2023-01-01", "maxTemp" => 5.5]];
        $this->repository->expects($this->once())
            ->method("getCityData")
            ->with(7, "20230101", "20230131")
            ->willReturn($rows);

        $response = $this->controller->getCityData(new HttpRequest([
            "id" => "7",
            "startDate" => "20230101",
            "endDate" => "20230131",
        ]));

        $this->assertSame(200, $response->getStatus());
        $this->assertSame($rows, self::decode($response));
    }

    #[Test]
    public function getCityDataReturnsEmptyListWhenNoData(): void
    {
        $this->repository->method("getCityData")->willReturn([]);

        $response = $this->controller->getCityData(new HttpRequest([
            "id" => "1",
            "startDate" => "20230101",
            "endDate" => "20230101",
        ]));

        $this->assertSame(200, $response->getStatus());
        $this->assertSame([], self::decode($response));
    }

    /**
     * @return array<string, array{array<string, string|list<string>>, string}>
     */
    public static function invalidCityQueries(): array
    {
        $dates = ["startDate" => "20230101", "endDate" => "20230131"];
        return [
            "missing id" => [$dates, "'id'"],
            "non-numeric id" => [["id" => "abc"] + $dates, "'id'"],
            "decimal id" => [["id" => "1.5"] + $dates, "'id'"],
            "empty id" => [["id" => ""] + $dates, "'id'"],
            "array id" => [["id" => ["1"]] + $dates, "'id'"],
            "missing startDate" => [["id" => "1", "endDate" => "20230131"], "'startDate'"],
            "array startDate" => [["id" => "1", "startDate" => ["x"], "endDate" => "20230131"], "'startDate'"],
            "missing endDate" => [["id" => "1", "startDate" => "20230101"], "'endDate'"],
        ];
    }

    /**
     * @param array<string, string|list<string>> $query
     */
    #[Test]
    #[DataProvider("invalidCityQueries")]
    public function getCityDataRejectsInvalidQuery(array $query, string $expectedParam): void
    {
        $this->repository->expects($this->never())->method("getCityData");

        $response = $this->controller->getCityData(new HttpRequest($query));

        $this->assertSame(400, $response->getStatus());
        $body = self::decode($response);
        $this->assertIsArray($body);
        $this->assertArrayHasKey("error", $body);
        $this->assertStringContainsString($expectedParam, $body["error"]);
    }

    // ---- /region -----------------------------------------------------------

    #[Test]
    public function getRegionDataPassesParametersToRepository(): void
    {
        $rows = [["date" => "2023-01-01", "cityCount" => 3, "avgTemp" => 1.25]];
        $this->repository->expects($this->once())
            ->method("getRegionData")
            ->with("Dunántúl", "20230101", "20230131")
            ->willReturn($rows);

        $response = $this->controller->getRegionData(new HttpRequest([
            "name" => "Dunántúl",
            "startDate" => "20230101",
            "endDate" => "20230131",
        ]));

        $this->assertSame(200, $response->getStatus());
        $this->assertSame($rows, self::decode($response));
    }

    /**
     * @return array<string, array{array<string, string|list<string>>, string}>
     */
    public static function invalidRegionQueries(): array
    {
        $dates = ["startDate" => "20230101", "endDate" => "20230131"];
        return [
            "missing name" => [$dates, "'name'"],
            "empty name" => [["name" => ""] + $dates, "'name'"],
            "array name" => [["name" => ["Dunántúl"]] + $dates, "'name'"],
            "missing startDate" => [["name" => "Dunántúl", "endDate" => "20230131"], "'startDate'"],
            "missing endDate" => [["name" => "Dunántúl", "startDate" => "20230101"], "'endDate'"],
        ];
    }

    /**
     * @param array<string, string|list<string>> $query
     */
    #[Test]
    #[DataProvider("invalidRegionQueries")]
    public function getRegionDataRejectsInvalidQuery(array $query, string $expectedParam): void
    {
        $this->repository->expects($this->never())->method("getRegionData");

        $response = $this->controller->getRegionData(new HttpRequest($query));

        $this->assertSame(400, $response->getStatus());
        $body = self::decode($response);
        $this->assertIsArray($body);
        $this->assertArrayHasKey("error", $body);
        $this->assertStringContainsString($expectedParam, $body["error"]);
    }
}
