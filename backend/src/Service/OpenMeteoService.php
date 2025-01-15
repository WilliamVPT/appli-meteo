<?php

namespace App\Service;

use GuzzleHttp\Client;

class OpenMeteoService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client(['base_uri' => 'https://api.open-meteo.com/']);
    }

    public function getWeather(string $city): array
    {
        //donne la météo de Reims actuelle
        $response = $this->client->get('v1/forecast', [
            'query' => [
                'latitude' => 49.2583,
                'longitude' => 4.0317,
                'hourly' => 'temperature_2m',
                'current_weather' => true
            ]
        ]);

        return json_decode($response->getBody(), true);
    }
}
