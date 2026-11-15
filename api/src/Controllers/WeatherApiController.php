<?php

declare(strict_types=1);

namespace ADS\TakeHome\Controllers;

use ADS\TakeHome\Framework\HttpRequest;
use ADS\TakeHome\Framework\HttpResponseInterface;
use ADS\TakeHome\Framework\JsonHttpResponse;
use ADS\TakeHome\Repositories\WeatherRepository;

class WeatherApiController
{
    public function __construct(
        private readonly WeatherRepository $weatherRepository,
    ) {
    }

    public function getCityData(HttpRequest $request): HttpResponseInterface
    {

        $id = $request->query["id"] ?? null;
        $startDate = $request->query["startDate"] ?? null;
        $endDate = $request->query["endDate"] ?? null;


        $id = is_string($id) ? filter_var($id, FILTER_VALIDATE_INT) : false;

        if ($id === false) {
            return new JsonHttpResponse(["error" => "'id' query paraméter kötelező, és egész számnak kell lennie"], 400);
        }

        if (!is_string($startDate)) {
            return new JsonHttpResponse(["error" => "'startDate' query paraméter kötelező"], 400);
        }

        if (!is_string($endDate)) {
            return new JsonHttpResponse(["error" => "'endDate' query paraméter kötelező"], 400);
        }

        return new JsonHttpResponse($this->weatherRepository->getCityData($id, $startDate, $endDate), 200);
    }

    public function getCities(): HttpResponseInterface
    {
        return new JsonHttpResponse($this->weatherRepository->getCities(), 200);
    }

    public function getRegionData(HttpRequest $request): HttpResponseInterface
    {
        $region = $request->query["name"] ?? null;
        $startDate = $request->query["startDate"] ?? null;
        $endDate = $request->query["endDate"] ?? null;


        if (!is_string($region) || $region === "") {
            return new JsonHttpResponse(["error" => "'name' query paraméter kötelező"], 400);
        }

        if (!is_string($startDate)) {
            return new JsonHttpResponse(["error" => "'startDate' query paraméter kötelező"], 400);
        }

        if (!is_string($endDate)) {
            return new JsonHttpResponse(["error" => "'endDate' query paraméter kötelező"], 400);
        }

        return new JsonHttpResponse($this->weatherRepository->getRegionData($region, $startDate, $endDate), 200);
    }
}
