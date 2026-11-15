<?php

namespace ADS\TakeHome;

include __DIR__ . "/../vendor/autoload.php";

use ADS\TakeHome\Controllers\ExampleController;
use ADS\TakeHome\Controllers\WeatherApiController;
use ADS\TakeHome\Framework\MySQL;
use ADS\TakeHome\Framework\Router;
use ADS\TakeHome\Repositories\WeatherRepository;

$router = new Router();

$mysql = new MySQL("db", "weather", "root", "root");
$helloController = new ExampleController(greeting: "Hello", db: $mysql);

$weatherRepository = new WeatherRepository(db: $mysql);
$weatherApiController = new WeatherApiController(weatherRepository: $weatherRepository);

$router->addRoute("GET", "/hello", $helloController->sayHello(...));
$router->addRoute("GET", "/budapest", $helloController->getBudapestMaxTempCount(...));

$router->addRoute("GET", "/cities", $weatherApiController->getCities(...));
$router->addRoute("GET", "/city", $weatherApiController->getCityData(...));
$router->addRoute("GET", "/region", $weatherApiController->getRegionData(...));

$router->handleRequest();
